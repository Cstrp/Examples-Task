<script setup lang="ts">
import { Quote } from '@lucide/vue'

import type { Recommendation } from '@/types'

defineProps<{
  recommendations: Recommendation[]
}>()
</script>

<template>
  <section
    v-if="recommendations.length"
    class="section-block recommendations-block"
  >
    <div class="section-heading">
      <span>02</span>
      <h2>Words from others</h2>
    </div>

    <article
      v-for="recommendation in recommendations"
      :key="recommendation.id"
      class="recommendation"
    >
      <Quote :size="22" />

      <p>
        {{ recommendation.content }}
      </p>

      <footer>
        {{ recommendation.authorName }}

        <span>
          {{ recommendation.authorRole }}

          {{ recommendation.authorOrg ? `, ${recommendation.authorOrg}` : '' }}
        </span>
      </footer>
    </article>
  </section>
</template>
