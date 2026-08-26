<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RefreshCw } from '@lucide/vue'
import { useProfileStore } from '@/stores/profile.store'
import Hero from '@/components/profile/Hero.vue'
import Intro from '@/components/profile/Intro.vue'
import Experience from '@/components/profile/Experience.vue'
import Recommendations from '@/components/profile/Recommendations.vue'
import Skills from '@/components/profile/Skills.vue'
import Education from '@/components/profile/Education.vue'
import Languages from '@/components/profile/Languages.vue'


const profileStore = useProfileStore()

const profile = computed(() => profileStore.profile)

onMounted(() => {
  profileStore.fetchProfiles()
})
</script>

<template>
  <main class="shell">
    <div v-if="profileStore.loading" class="state-panel">
      <div class="loader" aria-hidden="true"></div>
      <p>Loading profile</p>
    </div>

    <div v-else-if="profileStore.error" class="state-panel error-panel">
      <p>{{ profileStore.error }}</p>

      <button
        class="retry-button"
        type="button"
        @click="profileStore.fetchProfiles"
      >
        <RefreshCw :size="16" />
        Try again
      </button>
    </div>

    <template v-else-if="profile">
      <Hero :profile="profile" />

      <Intro :profile="profile" />

      <div class="content-grid">
        <div class="primary-column">
          <Experience :experiences="profile.experiences" />

          <Recommendations :recommendations="profile.recommendations" />
        </div>

        <aside class="side-column">
          <Skills :skill-groups="profileStore.skillGroups" />

          <Education :education="profile.education" />

          <Languages :languages="profile.languages" />
        </aside>
      </div>
    </template>
  </main>
</template>
