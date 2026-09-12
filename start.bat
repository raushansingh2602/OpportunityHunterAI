@echo off
echo Starting Backend...
cd backend_intigration
start cmd /k "python -m uvicorn backend.main:app --reload --port 8000"

echo Starting Frontend...
cd ../frontend-newwww
start cmd /k "npm run dev"

echo All services started!
