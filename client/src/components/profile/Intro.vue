<script setup lang="ts">
import {
  ExternalLink,
  Mail,
  MapPin,
  Phone,
} from '@lucide/vue'

import type { Profile } from '@/types'

defineProps<{
  profile: Profile
}>()
</script>

<template>
  <section
    v-motion
    :initial="{ opacity: 0, y: 18 }"
    :enter="{
      opacity: 1,
      y: 0,
      transition: {
        delay: 180,
        duration: 600,
      },
    }"
    class="intro-grid"
  >
    <p class="summary">
      {{ profile.summary }}
    </p>

    <div class="contact-list">
      <a :href="`mailto:${profile.email}`">
        <Mail :size="16" />
        {{ profile.email }}
      </a>

      <a v-if="profile.phone" :href="`tel:${profile.phone}`">
        <Phone :size="16" />
        {{ profile.phone }}
      </a>

      <span v-if="profile.location">
        <MapPin :size="16" />
        {{ profile.location }}
      </span>

      <a
        v-if="profile.website"
        :href="profile.website"
        target="_blank"
        rel="noreferrer"
      >
        <ExternalLink :size="16" />
        {{ profile.website.replace(/^https?:\/\//, '') }}
      </a>
    </div>
  </section>
</template>
