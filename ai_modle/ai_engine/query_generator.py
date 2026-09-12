import os
from typing import Dict, List


def generate_search_queries(profile: Dict, max_queries: int = 4) -> List[str]:
    """
    Generate 2-4 useful search queries from the student profile.
    Deterministic fallback; if an LLM key is present we still use deterministic behavior
    for reliability during the hackathon.
    """
    skills = profile.get("skills") or []
    branch = profile.get("branch", "")
    location = profile.get("location", "")
    mode = profile.get("preferred_mode", "")

    parts = []
    # use up to first 3 skills for combinations
    for s in skills[:3]:
        q = f"{s} internship"
        if branch:
            q += f" {branch}"
        if mode:
            q += f" {mode}"
        if location:
            q += f" {location}"
        parts.append(q.strip())

    # Add a general branch-based query
    if branch:
        parts.append(f"{branch} internships {location}".strip())

    # Deduplicate and limit
    seen = set()
    out = []
    for p in parts:
        if p.lower() in seen:
            continue
        seen.add(p.lower())
        out.append(p)
        if len(out) >= max_queries:
            break

    # If nothing generated, add a generic query
    if not out:
        out = [f"internship {location}".strip()]

    return out
