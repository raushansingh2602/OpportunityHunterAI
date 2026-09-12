import os
import sys
import pytest

# Ensure package import works when running tests from repository root
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from ai_engine.analyzer import analyze_opportunity, get_mock_opportunities


def make_profile():
    return {
        "name": "Deepak",
        "branch": "CSE",
        "year": 2,
        "cgpa": 8.5,
        "skills": ["Python", "SQL", "Machine Learning"],
        "location": "India",
        "preferred_mode": "Remote",
        "minimum_stipend": 10000,
    }


def test_mock_opportunities_analysis():
    profile = make_profile()
    mocks = get_mock_opportunities()
    assert len(mocks) == 5

    results = [analyze_opportunity(profile, m) for m in mocks]

    # Strong match should be eligible and high score
    strong = results[0]
    assert strong["eligible"] is True
    assert strong["match_score"] >= 50

    # Wrong CGPA: should mark not eligible or show reason
    wrong_cgpa = results[1]
    assert any("CGPA" in r for r in wrong_cgpa.get("reasons", []))

    # Wrong year: reasons should indicate needs verification or not satisfied
    wrong_year = results[2]
    assert isinstance(wrong_year.get("reasons"), list)

    # Partial skill match should have matched_skills and missing_skills
    partial = results[3]
    assert isinstance(partial.get("matched_skills"), list)
    assert isinstance(partial.get("missing_skills"), list)

    # Expired opportunity should be not eligible
    expired = results[4]
    assert any("Deadline passed" in r for r in expired.get("reasons", []))
