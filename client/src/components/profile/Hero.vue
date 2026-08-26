<script setup lang="ts">
import type { Profile } from '@/types'

defineProps<{
  profile: Profile
}>()
</script>

<template>
  <header
    v-motion
    :initial="{ opacity: 0, y: 24 }"
    :enter="{
      opacity: 1,
      y: 0,
      transition: { duration: 650 },
    }"
    class="hero"
  >
    <div>
      <p class="eyebrow">Portfolio / {{ new Date().getFullYear() }}</p>

      <h1>
        {{ profile.firstName }}
        <span>{{ profile.lastName }}</span>
      </h1>

      <p class="role">
        {{ profile.title }}
      </p>
    </div>

    <div class="hero-mark" aria-hidden="true">CV<span>.</span></div>
  </header>
</template>
