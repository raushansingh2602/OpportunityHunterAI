from typing import Dict, Any, List
from .query_generator import generate_search_queries
from .eligibility import check_eligibility
from .skill_matcher import calculate_skill_match
from .scoring import calculate_match_score
from .explanations import generate_explanation
from datetime import datetime, timedelta


def analyze_opportunity(profile: Dict[str, Any], opportunity: Dict[str, Any]) -> Dict[str, Any]:
    """
    Perform full analysis for a single opportunity and return the analyzed structure.
    """
    # Step 1: eligibility
    eligibility = check_eligibility(profile, opportunity)

    # Step 2: skill matching
    skill = calculate_skill_match(profile, opportunity)

    # Step 3: scoring
    scoring = calculate_match_score(profile, opportunity, eligibility, skill)

    # Step 4: explanation
    explanation = generate_explanation(profile, opportunity, eligibility, skill, scoring)

    analyzed = {
        **opportunity,
        "eligible": eligibility.get("eligible", False),
        "match_score": scoring.get("score", 0),
        "matched_skills": skill.get("matched_skills", []),
        "missing_skills": skill.get("missing_skills", []),
        "reasons": eligibility.get("reasons", []),
        "warnings": eligibility.get("warnings", []),
        "explanation": explanation,
    }

    return analyzed


def get_mock_opportunities() -> List[Dict[str, Any]]:
    """Return 5 mock opportunities covering specified test cases."""
    today = datetime.now().date()
    return [
        # 1. Strong match
        {
            "title": "Python Developer Intern",
            "company": "AlphaTech",
            "url": "https://example.com/alpha-python",
            "location": "Remote",
            "stipend": "15000",
            "deadline": (today + timedelta(days=30)).isoformat(),
            "duration": "3 months",
            "requirements": ["Python", "SQL"],
            "description": "Looking for Python and SQL skills",
            "source": "mock"
        },
        # 2. Wrong CGPA
        {
            "title": "Data Science Intern",
            "company": "BetaData",
            "url": "https://example.com/beta-ds",
            "location": "India",
            "stipend": "20000",
            "deadline": (today + timedelta(days=20)).isoformat(),
            "duration": "6 months",
            "requirements": ["Machine Learning", "CGPA 9"],
            "description": "Requires CGPA 9",
            "source": "mock"
        },
        # 3. Wrong year
        {
            "title": "Senior Research Intern",
            "company": "GammaLab",
            "url": "https://example.com/gamma-research",
            "location": "Onsite",
            "stipend": "0",
            "deadline": (today + timedelta(days=40)).isoformat(),
            "duration": "12 months",
            "requirements": ["PhD or final year"],
            "description": "Requires final year or PhD",
            "source": "mock"
        },
        # 4. Partial skill match
        {
            "title": "Frontend Intern",
            "company": "DeltaUI",
            "url": "https://example.com/delta-ui",
            "location": "Remote",
            "stipend": "10000",
            "deadline": (today + timedelta(days=15)).isoformat(),
            "duration": "2 months",
            "requirements": ["React", "JavaScript"],
            "description": "Frontend work with React",
            "source": "mock"
        },
        # 5. Expired opportunity
        {
            "title": "Old Internship",
            "company": "Epsilon",
            "url": "https://example.com/eps-old",
            "location": "Remote",
            "stipend": "5000",
            "deadline": (today - timedelta(days=5)).isoformat(),
            "duration": "1 month",
            "requirements": ["Python"],
            "description": "Expired listing",
            "source": "mock"
        },
    ]
