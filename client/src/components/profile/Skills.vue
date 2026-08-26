<script setup lang="ts">
import type { ProfileSkill } from '@/types';


defineProps<{
  skillGroups: [string, ProfileSkill[]][]
}>()

const formatCategory = (value: string) =>
  value
    .replaceAll('_', ' ')
    .toLowerCase()
</script>

<template>
  <section v-if="skillGroups.length" class="section-block">
    <div class="section-heading">
      <span>03</span>
      <h2>Toolkit</h2>
    </div>

    <div
      v-for="[category, skills] in skillGroups"
      :key="category"
      class="skill-group"
    >
      <p class="group-label">
        {{ formatCategory(category) }}
      </p>

      <div class="skill-list">
        <span v-for="item in skills" :key="item.skill.id" class="skill-chip">
          {{ item.skill.name }}
        </span>
      </div>
    </div>
  </section>
</template>
