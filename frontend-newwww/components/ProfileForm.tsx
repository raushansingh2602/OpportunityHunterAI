import React, { useState } from 'react'
import type { Profile } from '../types'

type Props = { onSubmit: (p: Profile) => void; working: boolean }

export default function ProfileForm({ onSubmit, working }: Props) {
  const [name, setName] = useState('Keerthi')
  const [branch, setBranch] = useState('CSE')
  const [year, setYear] = useState('2')
  const [cgpa, setCgpa] = useState('8.5')
  const [skills, setSkills] = useState('Python, SQL, Machine Learning')
  const [location, setLocation] = useState('India')
  const [preferredMode, setPreferredMode] = useState('Remote')
  const [minStipend, setMinStipend] = useState('10000')
  const [err, setErr] = useState<string | null>(null)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    if (!name.trim() || !branch.trim()) return setErr('Name & Branch are required')
    const skillList = skills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
    if (skillList.length === 0) return setErr('Enter at least one skill')

    const profile: Profile = {
      name: name.trim(),
      branch: branch.trim(),
      year: Number(year) || 1,
      cgpa: Number(cgpa) || 0,
      skills: skillList,
      location: location.trim() || 'India',
      preferred_mode: preferredMode || 'Remote',
      minimum_stipend: Number(minStipend) || 0
    }
    onSubmit(profile)
  }

  return (
    <form className="card" onSubmit={submit}>
      <h2 className="text-xl font-semibold mb-3 text-white">Student Profile</h2>
      {err && <div className="text-red-400 mb-3 text-sm p-2 bg-red-950/40 rounded border border-red-800/40">{err}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 block mb-1">Full Name</label>
          <input
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full p-2.5 bg-black/30 border border-white/10 rounded text-sm text-white focus:outline-none focus:border-purple-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Academic Branch</label>
          <input
            placeholder="Branch"
            value={branch}
            onChange={e => setBranch(e.target.value)}
            className="w-full p-2.5 bg-black/30 border border-white/10 rounded text-sm text-white focus:outline-none focus:border-purple-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Current Year</label>
          <input
            placeholder="Year"
            type="number"
            min="1"
            max="8"
            value={year}
            onChange={e => setYear(e.target.value)}
            className="w-full p-2.5 bg-black/30 border border-white/10 rounded text-sm text-white focus:outline-none focus:border-purple-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">CGPA (0 - 10)</label>
          <input
            placeholder="CGPA"
            type="number"
            step="0.01"
            min="0"
            max="10"
            value={cgpa}
            onChange={e => setCgpa(e.target.value)}
            className="w-full p-2.5 bg-black/30 border border-white/10 rounded text-sm text-white focus:outline-none focus:border-purple-500"
          />
        </div>
        <div className="col-span-1 md:col-span-2">
          <label className="text-xs text-gray-400 block mb-1">Skills (comma separated)</label>
          <input
            placeholder="Python, SQL, Machine Learning"
            value={skills}
            onChange={e => setSkills(e.target.value)}
            className="w-full p-2.5 bg-black/30 border border-white/10 rounded text-sm text-white focus:outline-none focus:border-purple-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Location</label>
          <input
            placeholder="Location"
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="w-full p-2.5 bg-black/30 border border-white/10 rounded text-sm text-white focus:outline-none focus:border-purple-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Preferred Mode</label>
          <select
            value={preferredMode}
            onChange={e => setPreferredMode(e.target.value)}
            className="w-full p-2.5 bg-[#0f172a] border border-white/10 rounded text-sm text-white focus:outline-none focus:border-purple-500"
          >
            <option value="Remote">Remote</option>
            <option value="Onsite">Onsite</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>
        <div className="col-span-1 md:col-span-2">
          <label className="text-xs text-gray-400 block mb-1">Minimum Stipend (₹/month)</label>
          <input
            placeholder="Minimum Stipend"
            type="number"
            min="0"
            value={minStipend}
            onChange={e => setMinStipend(e.target.value)}
            className="w-full p-2.5 bg-black/30 border border-white/10 rounded text-sm text-white focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>
      <div className="mt-5 flex items-center gap-3">
        <button
          type="submit"
          disabled={working}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition flex items-center gap-2"
        >
          {working ? 'Agent is searching...' : '🚀 Find Opportunities'}
        </button>
        <span className="text-xs text-gray-400">
          {working ? 'Autonomous agent exploring web portals...' : 'Ready to search opportunities'}
        </span>
      </div>
    </form>
  )
}

