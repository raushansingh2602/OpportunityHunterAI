import { useState } from 'react'
import type { Opportunity } from '../types'

type Props = { opportunities: Opportunity[] }

function Badge({ score, eligible }: { score: number | undefined; eligible?: boolean }) {
  const s = score || 0
  const color = s >= 80 ? 'bg-emerald-600' : s >= 60 ? 'bg-amber-500' : 'bg-rose-600'
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded text-white ${color}`}>
        {s}% Match
      </span>
      {eligible !== undefined && (
        <span
          className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
            eligible ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-rose-950 text-rose-300 border border-rose-700'
          }`}
        >
          {eligible ? '✓ Eligible' : '⚠️ Review Req.'}
        </span>
      )}
    </div>
  )
}

export default function Results({ opportunities }: Props) {
  const [open, setOpen] = useState<Opportunity | null>(null)

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <h2 className="text-xl font-semibold text-white">
          {opportunities.length > 0 ? `${opportunities.length} Opportunities Found` : 'No Opportunities Found'}
        </h2>
        {opportunities.length > 0 && (
          <span className="text-xs text-purple-300 bg-purple-900/40 px-2.5 py-1 rounded border border-purple-500/30">
            Sorted by AI Match Score
          </span>
        )}
      </div>

      {opportunities.length === 0 && (
        <div className="text-gray-400 text-sm py-8 text-center">
          Enter your profile and click &quot;Find Opportunities&quot; to let the autonomous agent search the web for matching internships.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {opportunities.map((op, i) => (
          <div key={i} className="card p-4 flex flex-col justify-between border border-white/10 hover:border-purple-500/50 transition-all bg-white/[0.03]">
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-white leading-snug">{op.title}</h3>
                  <div className="text-sm text-purple-300 font-medium">{op.company}</div>
                </div>
                <Badge score={op.match_score} eligible={op.eligible} />
              </div>

              <div className="mt-2 text-xs text-gray-300 flex flex-wrap gap-x-3 gap-y-1">
                {op.stipend ? <span>💰 ₹{op.stipend}/mo</span> : <span>💰 Disclosed on apply</span>}
                {op.location && <span>📍 {op.location}</span>}
                {op.deadline && <span>⏳ Deadline: {op.deadline}</span>}
                {op.source && <span>🌐 {op.source}</span>}
              </div>

              {op.matched_skills && op.matched_skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {op.matched_skills.map((s, idx) => (
                    <span key={idx} className="text-xs px-2 py-0.5 bg-emerald-900/40 text-emerald-300 border border-emerald-700/40 rounded">
                      ✓ {s}
                    </span>
                  ))}
                  {op.missing_skills?.slice(0, 2).map((s, idx) => (
                    <span key={idx} className="text-xs px-2 py-0.5 bg-amber-900/30 text-amber-300/80 border border-amber-700/30 rounded">
                      • Needs {s}
                    </span>
                  ))}
                </div>
              )}

              {op.explanation && (
                <p className="mt-2.5 text-xs text-gray-400 line-clamp-2 bg-black/20 p-2 rounded">
                  💡 <span className="text-gray-300 font-medium">AI Insight:</span> {op.explanation}
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex gap-2 justify-end">
              <button
                onClick={() => setOpen(op)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-medium transition"
              >
                View Details
              </button>
              <a
                href={op.url || '#'}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-semibold transition"
              >
                Apply Now ↗
              </a>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-white/20 text-gray-100 rounded-xl p-6 w-full max-w-2xl max-h-[88vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start border-b border-white/10 pb-3">
              <div>
                <h3 className="text-2xl font-bold text-white">{open.title}</h3>
                <div className="text-purple-300 font-medium">{open.company} • {open.location}</div>
              </div>
              <button
                onClick={() => setOpen(null)}
                className="text-gray-400 hover:text-white text-lg font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Match Score:</span>
                <Badge score={open.match_score} eligible={open.eligible} />
              </div>

              {open.explanation && (
                <div className="p-3 bg-purple-950/40 border border-purple-800/50 rounded-lg text-purple-200">
                  <strong>🤖 AI Match Analysis:</strong>
                  <p className="mt-1 text-xs text-purple-100 leading-relaxed">{open.explanation}</p>
                </div>
              )}

              {open.description && (
                <div>
                  <h4 className="font-semibold text-gray-200">Role Description:</h4>
                  <p className="text-gray-300 text-xs mt-1 leading-relaxed">{open.description}</p>
                </div>
              )}

              {open.requirements && open.requirements.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-200">Requirements:</h4>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {open.requirements.map((r, i) => (
                      <span key={i} className="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-300">{r}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs bg-white/5 p-3 rounded">
                <div><strong>Stipend:</strong> {open.stipend ? `₹${open.stipend}/month` : 'Disclosed during interview'}</div>
                <div><strong>Duration:</strong> {open.duration || 'Not specified'}</div>
                <div><strong>Deadline:</strong> {open.deadline || 'Rolling basis'}</div>
                <div><strong>Source:</strong> {open.source || 'Direct web listing'}</div>
              </div>

              {open.matched_skills && open.matched_skills.length > 0 && (
                <div>
                  <h4 className="font-semibold text-emerald-400 text-xs">Matched Skills:</h4>
                  <p className="text-xs text-emerald-200 mt-0.5">{open.matched_skills.join(', ')}</p>
                </div>
              )}

              {open.missing_skills && open.missing_skills.length > 0 && (
                <div>
                  <h4 className="font-semibold text-amber-400 text-xs">Missing / Recommended Skills:</h4>
                  <p className="text-xs text-amber-200 mt-0.5">{open.missing_skills.join(', ')}</p>
                </div>
              )}

              {open.reasons && open.reasons.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-300 text-xs">Eligibility Verification:</h4>
                  <ul className="list-disc list-inside text-xs text-gray-400 mt-1 space-y-0.5">
                    {open.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  onClick={() => setOpen(null)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs font-semibold"
                >
                  Close
                </button>
                <a
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-semibold transition"
                  href={open.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Go to Application ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

