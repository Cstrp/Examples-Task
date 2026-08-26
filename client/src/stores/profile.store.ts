import { gql } from '@apollo/client/core'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { apolloClient } from '../apollo'
import type { Profile, ProfileSkill } from '@/types'
import { MOCK_PROFILES } from '@/data/mock-profile'

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

  const profile = computed(
    () => profiles.value[profiles.value.length - 1] ?? null,
  )

  const skillGroups = computed(() => {
    const groups = new Map<string, ProfileSkill[]>()

    profile.value?.skills.forEach((item) => {
      const category =
        item.skill.category ?? 'OTHER'

      const group = groups.get(category) ?? []

      group.push(item)

      groups.set(category, group)
    })

    return Array.from(groups.entries())
  })

  async function fetchProfiles() {
    loading.value = true
    error.value = null

    try {
      const result =
        await apolloClient.query<{
          profiles: Profile[]
        }>({
          query: PROFILES_QUERY,
          fetchPolicy: 'network-only',
        })

      profiles.value =
        result.data?.profiles?.length
          ? result.data.profiles
          : MOCK_PROFILES
    } catch {
      profiles.value = MOCK_PROFILES
    } finally {
      loading.value = false
    }
  }

  return {
    profiles,
    profile,
    skillGroups,
    loading,
    error,
    fetchProfiles,
  }
})