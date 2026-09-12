import asyncio
import os
import sys
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
from .models import Profile, Opportunity, AnalyzedOpportunity, AgentEvent, SearchResponse
from .services import browser_service, analysis_service
from .config import settings
from urllib.parse import urlparse

# Ensure ai_modle path is in sys.path
_ai_modle_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "ai_modle"))
if os.path.exists(_ai_modle_path) and _ai_modle_path not in sys.path:
    sys.path.insert(0, _ai_modle_path)

try:
    from ai_engine.query_generator import generate_search_queries
except Exception:
    generate_search_queries = None

app = FastAPI(title="OpportunityHunter AI - Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def normalize_url(u: str) -> str:
    try:
        p = urlparse(u)
        return f"{p.scheme}://{p.netloc}{p.path}".rstrip("/")
    except Exception:
        return u


@app.get("/api/health")
async def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.post("/api/search", response_model=SearchResponse)
async def search(profile: Profile):
    events: List[AgentEvent] = []

    # Basic validation
    if profile.year < 1 or profile.cgpa < 0:
        raise HTTPException(status_code=400, detail="Invalid profile")

    prof_dict = profile.model_dump() if hasattr(profile, "model_dump") else profile.dict()

    # 1. Generate queries using AI engine
    events.append(AgentEvent(type="search", message="Generating tailored search queries"))
    if generate_search_queries:
        try:
            queries = generate_search_queries(prof_dict)
        except Exception:
            queries = [f"{skill} internships {profile.branch}" for skill in profile.skills[:3]]
    else:
        queries = [f"{skill} internships {profile.branch} {profile.year}" for skill in profile.skills[:3]]
    
    if not queries:
        queries.append(f"{profile.branch} internships")

    found: List[Dict[str, Any]] = []
    # 2. Autonomous browser agent searches
    for q in queries:
        events.append(AgentEvent(type="search", message=f"Searching web: {q}"))
        try:
            results = await asyncio.wait_for(browser_service.search_opportunities(q), timeout=settings.BROWSER_TIMEOUT_SECONDS)
            for r in results:
                events.append(AgentEvent(type="open", message=f"Found: {r.get('title')} @ {r.get('company')}", url=r.get('url')))
            found.extend(results)
        except asyncio.TimeoutError:
            events.append(AgentEvent(type="error", message=f"Timeout searching: {q}"))
        except Exception as e:
            events.append(AgentEvent(type="error", message=f"Error searching {q}: {e}"))

    total_found = len(found)

    # 3. Deduplicate
    seen_urls = set()
    deduped: List[Dict[str, Any]] = []
    for op in found:
        nurl = normalize_url(op.get("url", ""))
        key = nurl or (op.get("title", "") + "|" + op.get("company", ""))
        if key in seen_urls:
            events.append(AgentEvent(type="reject", message=f"Duplicate skipped: {op.get('title')}"))
            continue
        seen_urls.add(key)
        deduped.append(op)

    # 4. Analyze each opportunity with AI matching engine
    analyzed: List[Dict[str, Any]] = []
    for op in deduped:
        try:
            events.append(AgentEvent(type="extract", message=f"Extracting details: {op.get('title')}", url=op.get('url')))
            res = await analysis_service.analyze_opportunity(prof_dict, op)
            analyzed.append(res)
            events.append(AgentEvent(type="success", message=f"AI Analyzed (Score: {res.get('match_score', 0)}%): {op.get('title')}", url=op.get('url')))
        except asyncio.TimeoutError:
            events.append(AgentEvent(type="error", message=f"Analysis timeout: {op.get('title')}", url=op.get('url')))
        except Exception as e:
            events.append(AgentEvent(type="error", message=f"Analysis error: {e}", url=op.get('url')))

    total_analyzed = len(analyzed)

    # 5. Convert to AnalyzedOpportunity and sort by match_score, eligible first
    converted: List[AnalyzedOpportunity] = []
    for a in analyzed:
        try:
            ao = AnalyzedOpportunity(**a)
            converted.append(ao)
        except Exception:
            # Skip malformed analysis
            events.append(AgentEvent(type="reject", message=f"Malformed analysis for {a.get('title', 'unknown')}"))

    converted.sort(key=lambda x: (0 if x.eligible else 1, -x.match_score))

    total_eligible = sum(1 for c in converted if c.eligible)

    # Return complete opportunity details for frontend modal and card rendering
    final_list = []
    for c in converted:
        item = c.model_dump() if hasattr(c, "model_dump") else c.dict()
        item["url"] = str(c.url) if c.url else ""
        final_list.append(item)

    return SearchResponse(
        success=True,
        total_found=total_found,
        total_analyzed=total_analyzed,
        total_eligible=total_eligible,
        opportunities=final_list,
        agent_events=events,
    )



@app.post("/api/analyze")
async def analyze_endpoint(profile: Profile, opportunity: Dict[str, Any]):
    try:
        res = await analysis_service.analyze_opportunity(profile.dict(), opportunity)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
