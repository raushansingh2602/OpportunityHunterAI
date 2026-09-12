import asyncio
import inspect
import os
import sys
from typing import Dict, Any
from ..config import settings

# Ensure ai_modle path is available in sys.path
_ai_modle_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "ai_modle"))
if os.path.exists(_ai_modle_path) and _ai_modle_path not in sys.path:
    sys.path.insert(0, _ai_modle_path)

try:
    from ai_engine.analyzer import analyze_opportunity as real_analyze
except Exception:
    try:
        from person2.analyzer import analyze_opportunity as real_analyze
    except Exception:
        real_analyze = None


async def analyze_opportunity(profile: Dict[str, Any], opportunity: Dict[str, Any]) -> Dict[str, Any]:
    """
    Adapter to AI analysis engine.
    Calls `ai_engine.analyzer.analyze_opportunity(profile, opportunity)`.
    """
    if real_analyze is not None:
        try:
            if inspect.iscoroutinefunction(real_analyze):
                coro = real_analyze(profile, opportunity)
                return await asyncio.wait_for(coro, timeout=10)
            else:
                return await asyncio.wait_for(asyncio.to_thread(real_analyze, profile, opportunity), timeout=10)
        except Exception:
            # If real analyzer fails unexpectedly, fall through to heuristic
            pass

    # Deterministic fallback analysis
    await asyncio.sleep(0.02)
    skills = set([str(s).lower() for s in profile.get("skills", [])])
    reqs = set([str(r).lower() for r in opportunity.get("requirements", [])])
    matched = list(skills & reqs)
    missing = list(reqs - skills)
    score = int(min(100, 50 + 10 * len(matched) - 5 * len(missing)))
    eligible = len(missing) <= 2
    return {
        **opportunity,
        "eligible": eligible,
        "match_score": max(0, score),
        "matched_skills": matched,
        "missing_skills": missing,
        "reasons": ["Evaluated with fallback rules"],
        "warnings": [],
        "explanation": "Opportunity evaluated based on skill overlap."
    }

