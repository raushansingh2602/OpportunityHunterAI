# OpportunityHunter AI — Frontend (Next.js)

This is the frontend (Person 3) for the OpportunityHunter AI hackathon demo.

Run locally:

1. Install dependencies

```bash
cd "C:\Users\keert\OneDrive\Desktop\frontend-newwww"
npm install
```

2. Start dev server (port 3001)

```bash
npm run dev
```

3. Build for production

```bash
npm run build
npm run start
```

Environment:
- `NEXT_PUBLIC_API_URL` — backend URL (default: `http://localhost:8000`)
- `NEXT_PUBLIC_MOCK` — set `false` to call real backend. Default currently uses mock data.

Notes:
- UI shows three states: Profile form, Agent Activity, Results.
- To connect to your backend, run the backend and set `NEXT_PUBLIC_MOCK=false`.
