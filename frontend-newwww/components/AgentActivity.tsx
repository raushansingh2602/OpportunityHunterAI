import { useEffect, useState } from 'react'
import type { AgentEvent } from '../types'

type Props = { events: AgentEvent[] }

export default function AgentActivity({ events }: Props) {
  const [visible, setVisible] = useState<AgentEvent[]>([])

  useEffect(() => {
    setVisible([])
    if (!events || events.length === 0) return
    let i = 0
    const id = setInterval(() => {
      if (i >= events.length) {
        clearInterval(id)
        return
      }
      const item = events[i]
      if (item) {
        setVisible(v => [...v, item])
      }
      i++
    }, 200)
    return () => clearInterval(id)
  }, [events])

  return (
    <div className="card mt-4 border border-white/10 bg-white/[0.03]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-white text-sm">🤖 Live Agent Activity</h3>
        <span className="text-xs text-purple-300 animate-pulse">Running autonomous workflow</span>
      </div>
      <div className="text-xs text-gray-400 mb-3">Live events from search, browser extraction & AI analysis</div>
      <ul className="space-y-2 max-h-52 overflow-y-auto pr-1">
        {visible.map((e, idx) => (
          <li key={idx} className="p-2.5 bg-black/30 border border-white/5 rounded-lg flex items-start gap-2.5 text-xs">
            <span className="text-base leading-none mt-0.5">
              {e.type === 'success' ? '⭐' : e.type === 'open' ? '🌐' : e.type === 'extract' ? '📄' : e.type === 'reject' ? '❌' : '🔎'}
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-200">{e.message}</div>
              {e.url && (
                <div className="text-[11px] text-purple-400/80 truncate mt-0.5 underline">
                  {e.url}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

