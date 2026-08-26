<script setup lang="ts">
import type { Education } from '@/types'

defineProps<{
  education: Education[]
}>()

const formatYearRange = (
  start?: number,
  end?: number,
) =>
  `${start ?? 'Unknown'} — ${end ?? 'Present'}`
</script>

<template>
  <section v-if="education.length" class="section-block education-block">
    <div class="section-heading">
      <span>04</span>
      <h2>Education</h2>
    </div>

    <article v-for="item in education" :key="item.id" class="education-item">
      <h3>
        {{ item.degree }}
      </h3>

      <p>
        {{ item.institution }}
      </p>

      <span>
        {{ item.faculty }}
        ·
        {{ formatYearRange(item.startYear, item.endYear) }}
      </span>
    </article>
  </section>
</template>
