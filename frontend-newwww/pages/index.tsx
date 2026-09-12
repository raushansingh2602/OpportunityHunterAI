import { useState } from 'react'
import Header from '../components/Header'
import ProfileForm from '../components/ProfileForm'
import AgentActivity from '../components/AgentActivity'
import Results from '../components/Results'
import { search } from '../lib/api'
import type { Profile, Opportunity, AgentEvent } from '../types'

export default function Home() {
  const [working, setWorking] = useState(false)
  const [events, setEvents] = useState<AgentEvent[]>([])
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [error, setError] = useState<string | null>(null)

  async function handleSearch(profile: Profile) {
    setError(null)
    setWorking(true)
    setEvents([{ type: 'search', message: '🤖 Autonomous agent initialized' }])
    try {
      const res = await search(profile)
      const agentEvents = res.agent_events && res.agent_events.length > 0
        ? res.agent_events
        : [
            { type: 'search', message: `🔎 Searching portals for ${profile.skills.slice(0, 2).join(', ')}` },
            { type: 'open', message: '🌐 Parsing opportunities from job boards' },
            { type: 'extract', message: '📄 Extracting candidate requirements' },
            { type: 'success', message: '⭐ AI match evaluation completed' }
          ]

      setEvents(agentEvents)

      const displayDelay = Math.min(2500, Math.max(600, agentEvents.length * 150))
      setTimeout(() => {
        setOpportunities(res.opportunities || [])
        setWorking(false)
      }, displayDelay)
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'Agent encountered an issue. Please try again.')
      setWorking(false)
    }
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <Header />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-4">
          <ProfileForm onSubmit={handleSearch} working={working} />
          {events.length > 0 && <AgentActivity events={events} />}
        </div>
        <div className="lg:col-span-7">
          <div className="card p-5 border border-white/10 bg-white/[0.02]">
            {error && (
              <div className="text-red-400 mb-4 p-3 bg-red-950/40 rounded border border-red-800/40 text-sm">
                {error}
              </div>
            )}
            <Results opportunities={opportunities} />
          </div>
        </div>
      </div>
    </div>
  )
}

