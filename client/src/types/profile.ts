export interface Profile {
  id: string

  firstName: string
  lastName: string
  middleName?: string

  title?: string
  summary?: string

  email: string
  phone?: string
  location?: string
  website?: string

  experiences: Experience[]
  education: Education[]
  skills: ProfileSkill[]
  languages: Language[]
  recommendations: Recommendation[]
}

export interface Experience {
  id: string

  company: string
  position: string

  startDate: string
  endDate?: string

  location?: string
  description?: string

  highlights: string[]
}

export interface Education {
  id: string

  institution: string
  faculty?: string
  degree?: string

  startYear?: number
  endYear?: number

  description?: string
}

export interface Skill {
  id: string
  name: string
  category?: string
  proficiency?: string
}

export interface ProfileSkill {
  skill: Skill
  note?: string
}

export interface Language {
  id: string
  name: string
  level: string
}

export interface Recommendation {
  id: string

  authorName: string
  authorRole?: string
  authorOrg?: string

  content: string
  contact?: string
}