import { gql } from '@apollo/client/core'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { apolloClient } from '../apollo'

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

export interface ProfileSkill {
  note?: string
  skill: {
    id: string
    name: string
    category?: string
    proficiency?: string
  }
}

export interface Language {
  id: string
  name: string
  level: string
}

export interface Recommendation {
  id: string
  authorName: string
  authorOrg?: string
  authorRole?: string
  content: string
}

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

const PROFILE_FIELDS = gql`
  fragment ProfileFields on ProfileModel {
    id
    firstName
    lastName
    middleName
    title
    summary
    email
    phone
    location
    website
    experiences {
      id
      company
      position
      startDate
      endDate
      location
      description
      highlights
    }
    education {
      id
      institution
      faculty
      degree
      startYear
      endYear
      description
    }
    skills {
      note
      skill {
        id
        name
        category
        proficiency
      }
    }
    languages {
      id
      name
      level
    }
    recommendations {
      id
      authorName
      authorOrg
      authorRole
      content
    }
  }
`

const PROFILES_QUERY = gql`
  ${PROFILE_FIELDS}
  query Profiles {
    profiles {
      ...ProfileFields
    }
  }
`

export const useProfileStore = defineStore('profile', () => {
  const profiles = ref<Profile[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const profile = computed(() => profiles.value.find(p => p.firstName === 'Валерий'))
  const skillGroups = computed(() => {
    const groups = new Map<string, ProfileSkill[]>()
    profile.value?.skills.forEach((item) => {
      const category = item.skill.category ?? 'OTHER'
      groups.set(category, [...(groups.get(category) ?? []), item])
    })
    return Array.from(groups.entries())
  })

  async function fetchProfiles() {
    loading.value = true
    error.value = null

    try {
      const result = await apolloClient.query<{ profiles: Profile[] }>({
        query: PROFILES_QUERY,
        fetchPolicy: 'cache-first',
      })
      profiles.value = result.data?.profiles ?? []
    } catch (requestError) {
      error.value = requestError instanceof Error ? requestError.message : 'Unable to load profile.'
    } finally {
      loading.value = false
    }
  }

  return { profiles, profile, skillGroups, loading, error, fetchProfiles }
})
