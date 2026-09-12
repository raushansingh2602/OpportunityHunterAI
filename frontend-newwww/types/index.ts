export type Profile = {
  name: string
  branch: string
  year: number
  cgpa: number
  skills: string[]
  location: string
  preferred_mode: string
  minimum_stipend: number
}

export type Opportunity = {
  title: string
  company: string
  url?: string
  location?: string
  stipend?: string | number
  deadline?: string
  duration?: string
  requirements?: string[]
  description?: string
  source?: string
  eligible?: boolean
  match_score?: number
  matched_skills?: string[]
  missing_skills?: string[]
  reasons?: string[]
  warnings?: string[]
  explanation?: string
}

export type AgentEvent = { type?: string; message: string; url?: string }
