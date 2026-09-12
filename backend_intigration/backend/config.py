import os
from typing import Optional


class Settings:
    LLM_API_KEY: Optional[str]
    FRONTEND_URL: str
    MOCK_MODE: bool
    BROWSER_TIMEOUT_SECONDS: int

    def __init__(self):
        self.LLM_API_KEY = os.getenv("LLM_API_KEY")
        self.FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
        self.MOCK_MODE = os.getenv("MOCK_MODE", "true").lower() in ("1", "true", "yes")
        try:
            self.BROWSER_TIMEOUT_SECONDS = int(os.getenv("BROWSER_TIMEOUT_SECONDS", "15"))
        except Exception:
            self.BROWSER_TIMEOUT_SECONDS = 15


settings = Settings()
