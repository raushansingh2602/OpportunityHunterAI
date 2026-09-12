from typing import Dict


def calculate_match_score(profile: Dict, opportunity: Dict, eligibility_result: Dict, skill_result: Dict) -> Dict:
    # Weights
    weights = {
        "skill": 0.40,
        "eligibility": 0.30,
        "location": 0.15,
        "stipend": 0.15,
    }

    # Skill match part: use skill_result['score'] (0-100)
    skill_score = skill_result.get("score", 0)
    skill_points = int(round(skill_score * weights["skill"]))

    # Eligibility: binary for simplicity; if eligible full points, else 0.
    eligible = bool(eligibility_result.get("eligible", False))
    eligibility_points = int(round(100 * weights["eligibility"])) if eligible else 0

    # Location: if reasons mention 'Location/mode satisfied' give full points
    loc_points = int(round(100 * weights["location"])) if any("Location/mode satisfied" in r for r in eligibility_result.get("reasons", [])) else 0

    # Stipend: compare numeric stipend if possible vs minimum_stipend in profile
    stipend_points = 0
    profile_min = profile.get("minimum_stipend") or 0
    stipend = opportunity.get("stipend") or ""
    try:
        # try to extract digits
        import re

        m = re.search(r"(\d+)", str(stipend))
        if m:
            s_val = int(m.group(1))
            if s_val >= int(profile_min or 0):
                stipend_points = int(round(100 * weights["stipend"]))
            else:
                stipend_points = int(round(100 * weights["stipend"]) * (s_val / (int(profile_min) if profile_min else 1)))
    except Exception:
        stipend_points = 0

    total = skill_points + eligibility_points + loc_points + stipend_points
    # Ensure in 0-100
    total = max(0, min(100, total))

    breakdown = {
        "skill_match": skill_points,
        "eligibility": eligibility_points,
        "location": loc_points,
        "stipend": stipend_points,
    }

    return {"score": total, "breakdown": breakdown}
