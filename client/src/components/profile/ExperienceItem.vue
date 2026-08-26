<script setup lang="ts">
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

import type { Experience } from '@/types/profile'

defineProps<{
  experience: Experience
  index: number
}>()

const formatDate = (value?: string) => {
  if (!value) {
    return 'Present'
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}
</script>

<template>
  <article
    v-motion
    :initial="{ opacity: 0, x: -10 }"
    :enter="{
      opacity: 1,
      x: 0,
      transition: {
        delay: 360 + index * 80,
        duration: 450,
      },
    }"
    class="timeline-item"
  >
    <AccordionItem :value="`experience-${index}`">
      <AccordionTrigger class="experience-trigger">
        <div>
          <div class="timeline-meta">
            <span>
              {{ formatDate(experience.startDate) }}
              —
              {{ formatDate(experience.endDate) }}
            </span>

            <span v-if="experience.location">
              {{ experience.location }}
            </span>
          </div>

          <h3>
            {{ experience.position }}
          </h3>

          <p class="company">
            {{ experience.company }}
          </p>
        </div>
      </AccordionTrigger>

      <AccordionContent>
        <p v-if="experience.description" class="muted-copy">
          {{ experience.description }}
        </p>

        <ul v-if="experience.highlights.length">
          <li v-for="highlight in experience.highlights" :key="highlight">
            {{ highlight }}
          </li>
        </ul>
      </AccordionContent>
    </AccordionItem>
  </article>
</template>
