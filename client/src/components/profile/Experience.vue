<script setup lang="ts">
import {
  Accordion,
} from '@/components/ui/accordion'

import type { Experience } from '@/types/profile'

import ExperienceItem from './ExperienceItem.vue'

defineProps<{
  experiences: Experience[]
}>()
</script>

<template>
  <section v-if="experiences.length" class="section-block">
    <div class="section-heading">
      <span>01</span>
      <h2>Experience</h2>
    </div>

    <Accordion
      type="single"
      collapsible
      default-value="experience-0"
      class="timeline"
    >
      <ExperienceItem
        v-for="(experience, index) in experiences"
        :key="experience.id"
        :experience="experience"
        :index="index"
      />
    </Accordion>
  </section>
</template>
