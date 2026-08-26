<script setup lang="ts">
import type { Language } from '@/types'

defineProps<{
  languages: Language[]
}>()
</script>

<template>
  <section v-if="languages.length" class="section-block language-block">
    <div class="section-heading">
      <span>05</span>
      <h2>Languages</h2>
    </div>

    <div v-for="language in languages" :key="language.id" class="language-row">
      <span>
        {{ language.name }}
      </span>

      <small>
        {{ language.level }}
      </small>
    </div>
  </section>
</template>
