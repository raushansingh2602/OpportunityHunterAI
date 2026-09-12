from datetime import datetime
from typing import Dict, Any, List


def _parse_date(s: str):
    if not s:
        return None
    try:
        # Attempt ISO format first
        return datetime.fromisoformat(s)
    except Exception:
        # Try common formats
        for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y"):
            try:
                return datetime.strptime(s, fmt)
            except Exception:
                continue
    return None


def check_eligibility(profile: Dict, opportunity: Dict) -> Dict:
    reasons: List[str] = []
    warnings: List[str] = []
    eligible = True

    # CGPA check
    profile_cgpa = profile.get("cgpa")
    # Attempt to read cgpa requirement from opportunity description/requirements
    req_cgpa = None
    for field in ("requirements", "description"):
        text = opportunity.get(field) if field in opportunity else None
        if isinstance(text, list):
            for t in text:
                if isinstance(t, str) and "cgpa" in t.lower():
                    # crude parse: look for a number
                    import re

                    m = re.search(r"(\d\.?\d?)", t)
                    if m:
                        try:
                            req_cgpa = float(m.group(1))
                        except Exception:
                            pass
        elif isinstance(text, str) and "cgpa" in text.lower():
            import re

            m = re.search(r"(\d\.?\d?)", text)
            if m:
                try:
                    req_cgpa = float(m.group(1))
                except Exception:
                    pass

    if req_cgpa is not None:
        if profile_cgpa is None:
            warnings.append("Student CGPA missing; cannot verify CGPA requirement")
        elif profile_cgpa >= req_cgpa:
            reasons.append("CGPA requirement satisfied")
        else:
            reasons.append("CGPA requirement not satisfied")
            eligible = False
    else:
        reasons.append("CGPA: Unknown / needs verification")

    # Year/Branch
    # If opportunity mentions year or branch in requirements, check
    req_branch = None
    req_year = None
    reqs = opportunity.get("requirements") or []
    for r in reqs:
        if isinstance(r, str):
            low = r.lower()
            if "cse" in low or "computer" in low:
                req_branch = "CSE"
            if "year" in low and any(d in low for d in ["1st", "2nd", "3rd", "4th", "first", "second", "third", "fourth"]):
                req_year = r

    profile_branch = profile.get("branch")
    if req_branch:
        if profile_branch and req_branch.lower() in profile_branch.lower():
            reasons.append("Branch requirement satisfied")
        else:
            reasons.append("Branch requirement not satisfied")
            eligible = False
    else:
        reasons.append("Branch: Unknown / needs verification")

    # Skills
    student_skills = {s.lower() for s in profile.get("skills") or []}
    req_skills = {s.lower() for s in (opportunity.get("requirements") or []) if isinstance(s, str)}
    if req_skills:
        matched = student_skills & req_skills
        if matched:
            reasons.append(f"Skills matched: {', '.join(sorted(matched))}")
        else:
            reasons.append("Required skills not satisfied")
            eligible = False
    else:
        reasons.append("Skills: Unknown / needs verification")

    # Location / mode
    pref_mode = (profile.get("preferred_mode") or "").lower()
    opp_loc = (opportunity.get("location") or "").lower()
    if pref_mode:
        if pref_mode in opp_loc or (pref_mode == "remote" and ("remote" in opp_loc or opp_loc == "")):
            reasons.append("Location/mode satisfied")
        else:
            # Don't automatically reject if location unclear
            reasons.append("Location/mode may not match")
    else:
        reasons.append("Preferred mode: Unknown / needs verification")

    # Deadline
    deadline = opportunity.get("deadline")
    if deadline:
        d = _parse_date(deadline)
        if d:
            if d < datetime.now():
                reasons.append("Deadline passed")
                eligible = False
            else:
                reasons.append("Deadline open")
        else:
            reasons.append("Deadline: Unknown / needs verification")
    else:
        reasons.append("Deadline: Unknown / needs verification")

    return {"eligible": eligible, "reasons": reasons, "warnings": warnings}
