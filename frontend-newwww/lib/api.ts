import type { Profile, Opportunity, AgentEvent } from '../types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const MOCK = process.env.NEXT_PUBLIC_MOCK === 'true'

export async function search(profile: Profile): Promise<{
  success: boolean
  total_found?: number
  total_analyzed?: number
  total_eligible?: number
  opportunities: Opportunity[]
  agent_events?: AgentEvent[]
}> {
  if (MOCK) {
    // lightweight fallback mock data if explicitly requested
    await new Promise(r => setTimeout(r, 600))
    return {
      success: true,
      total_found: 2,
      total_analyzed: 2,
      total_eligible: 2,
      agent_events: [
        { type: 'search', message: '🤖 Agent started' },
        { type: 'search', message: '✓ Reading student profile' },
        { type: 'search', message: `🔎 Searching: "${profile.skills.slice(0, 2).join(' ')} internship ${profile.location}"` },
        { type: 'open', message: '🌐 Opening internship website' },
        { type: 'extract', message: '📄 Extracted opportunity details' },
        { type: 'success', message: '⭐ Match score calculated 94%' }
      ],
      opportunities: [
        {
          title: 'Python Developer Intern',
          company: 'ABC Technologies',
          url: 'https://example.com/apply/1',
          location: 'Remote',
          stipend: '15000',
          deadline: '2026-10-20',
          duration: '3 months',
          requirements: ['Python', 'SQL', 'CSE'],
          description: 'Work on backend systems and ML pipelines.',
          source: 'example',
          eligible: true,
          match_score: 94,
          matched_skills: ['Python', 'SQL'],
          missing_skills: [],
          reasons: ['CGPA satisfied', 'Skills matched'],
          warnings: [],
          explanation: 'Good fit based on skills and location.'
        }
      ]
    }
  }

  const res = await fetch(`${API_URL}/api/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`Server returned ${res.status}: ${errText || res.statusText}`)
  }

  return res.json()
}

