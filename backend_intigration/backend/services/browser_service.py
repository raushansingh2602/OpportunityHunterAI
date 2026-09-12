import asyncio
import os
import sys
from datetime import datetime, timedelta
from typing import List, Dict, Any
from ..config import settings

# Ensure ai_modle path is in sys.path
_ai_modle_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "ai_modle"))
if os.path.exists(_ai_modle_path) and _ai_modle_path not in sys.path:
    sys.path.insert(0, _ai_modle_path)

try:
    from ai_engine.analyzer import get_mock_opportunities
except Exception:
    get_mock_opportunities = None


async def search_opportunities(query: str, timeout: int = None) -> List[Dict[str, Any]]:
    """
    Search opportunities using browser agent or rich simulated web listings.
    """
    timeout = timeout or settings.BROWSER_TIMEOUT_SECONDS

    # Try importing real browser agent if available
    try:
        from person1.browser_agent import search_opportunities as real_search
    except Exception:
        real_search = None

    if real_search is not None and not settings.MOCK_MODE:
        try:
            coro = real_search(query)
            return await asyncio.wait_for(coro, timeout=timeout)
        except Exception:
            pass

    # Simulated realistic browser search delay
    await asyncio.sleep(0.08)

    today = datetime.now().date()
    q_low = query.lower()
    results: List[Dict[str, Any]] = []

    # Get baseline mock opportunities from ai_engine
    if get_mock_opportunities:
        try:
            mocks = get_mock_opportunities()
            # Filter or prioritize based on query keywords
            for m in mocks:
                req_text = " ".join(m.get("requirements", [])).lower()
                title_text = m.get("title", "").lower()
                desc_text = m.get("description", "").lower()
                combined = f"{req_text} {title_text} {desc_text}"
                words = [w for w in q_low.split() if len(w) > 2]
                if any(w in combined for w in words):
                    results.append(m)
        except Exception:
            pass

    # If results are empty or few, generate targeted listings based on query
    if len(results) < 3:
        keywords = [w.capitalize() for w in q_low.split() if w not in ("internship", "internships", "in", "for", "and", "the") and len(w) > 1]
        primary_skill = keywords[0] if keywords else "Software"
        
        dynamic_listings = [
            {
                "title": f"{primary_skill} Engineering Intern",
                "company": "TechNova Solutions",
                "url": f"https://internshala.com/internships/{primary_skill.lower()}-internship",
                "location": "Remote",
                "stipend": "18000",
                "deadline": (today + timedelta(days=25)).isoformat(),
                "duration": "3 months",
                "requirements": [primary_skill, "Problem Solving", "Git"],
                "description": f"Exciting internship role focusing on {primary_skill} development and agile pipelines.",
                "source": "Internshala"
            },
            {
                "title": f"Associate {primary_skill} Developer",
                "company": "CloudPeak Technologies",
                "url": f"https://unstop.com/internships/{primary_skill.lower()}-developer",
                "location": "India",
                "stipend": "22000",
                "deadline": (today + timedelta(days=35)).isoformat(),
                "duration": "6 months",
                "requirements": [primary_skill, "SQL", "Teamwork"],
                "description": f"Hands-on building of scalable systems using {primary_skill} and relational databases.",
                "source": "Unstop"
            },
            {
                "title": "Full Stack & AI Trainee",
                "company": "NextGen Labs",
                "url": "https://wellfound.com/jobs/full-stack-ai-trainee",
                "location": "Hybrid",
                "stipend": "15000",
                "deadline": (today + timedelta(days=14)).isoformat(),
                "duration": "4 months",
                "requirements": ["Python", "JavaScript", "React"],
                "description": "Collaborate on cutting-edge student products and modern web apps.",
                "source": "Wellfound"
            }
        ]
        results.extend(dynamic_listings)

    return results

