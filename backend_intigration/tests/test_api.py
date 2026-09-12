import os
from fastapi.testclient import TestClient


os.environ.setdefault("MOCK_MODE", "true")


def test_health():
    from backend.main import app
    client = TestClient(app)
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_search_mock():
    from backend.main import app
    payload = {
        "name": "Deepak",
        "branch": "CSE",
        "year": 2,
        "cgpa": 8.5,
        "skills": ["Python", "SQL", "Machine Learning"],
        "location": "India",
        "preferred_mode": "Remote",
        "minimum_stipend": 10000
    }
    client = TestClient(app)
    r = client.post("/api/search", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["success"] is True
    assert "opportunities" in data
