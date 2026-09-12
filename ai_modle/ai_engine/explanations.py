from typing import Dict


def generate_explanation(profile: Dict, opportunity: Dict, eligibility_result: Dict, skill_result: Dict, scoring_result: Dict) -> str:
    parts = []

    # Eligibility reasons (only include positive or concerning reasons)
    for r in eligibility_result.get("reasons", []):
        if "not satisfied" in r.lower() or "passed" in r.lower():
            parts.append(r)
        elif "satisfied" in r.lower() or "matched" in r.lower():
            parts.append(r)

    # Skill summary
    matched = skill_result.get("matched_skills", [])
    missing = skill_result.get("missing_skills", [])
    if matched:
        parts.append(f"Matched skills: {', '.join(matched)}.")
    if missing:
        parts.append(f"Missing skills: {', '.join(missing)}.")

    # Score summary
    score = scoring_result.get("score")
    if score is not None:
        parts.append(f"Overall match score: {score}.")

    if not parts:
        return "No sufficient information to generate explanation."

    return " ".join(parts)
