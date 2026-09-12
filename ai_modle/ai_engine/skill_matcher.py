from typing import Dict, List


_NORMALIZE = {
    "ml": "machine learning",
    "machine-learning": "machine learning",
    "js": "javascript",
    "py": "python",
}


def _normalize_skill(s: str) -> str:
    if not s:
        return s
    s2 = s.strip().lower()
    return _NORMALIZE.get(s2, s2)


def calculate_skill_match(profile: Dict, opportunity: Dict) -> Dict:
    student_skills = profile.get("skills") or []
    opp_reqs = opportunity.get("requirements") or []

    student_norm = {_normalize_skill(s): s for s in student_skills}
    opp_norm = {_normalize_skill(s): s for s in opp_reqs}

    matched = []
    missing = []

    for key, orig in opp_norm.items():
        if key in student_norm:
            matched.append(student_norm[key])
        else:
            missing.append(orig)

    # Score: percentage of required skills covered (if no requirements, neutral 50)
    if not opp_reqs:
        score = 50
    else:
        total = len(opp_reqs)
        score = int((len(matched) / total) * 100)

    return {
        "score": score,
        "matched_skills": matched,
        "missing_skills": missing,
    }
