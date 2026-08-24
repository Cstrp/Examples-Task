<script setup lang="ts">
import { ExternalLink, Mail, MapPin, Phone, Quote, RefreshCw } from '@lucide/vue'
import { computed, onMounted } from 'vue'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './components/ui/accordion'
import { useProfileStore } from './stores/profile.store'

const profileStore = useProfileStore()
const profile = computed(() => profileStore.profile)

const formatDate = (value?: string) => value
  ? new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(new Date(value))
  : 'Present'

const formatYearRange = (start?: number, end?: number) => `${start ?? 'Unknown'} — ${end ?? 'Present'}`

const formatCategory = (value: string) => value.replace('_', ' ').toLowerCase()

onMounted(() => profileStore.fetchProfiles())
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
        <RefreshCw :size="16" /> Try again
      </button>
    </div>

    <template v-else-if="profile">
      <header
        v-motion
        :initial="{ opacity: 0, y: 24 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 650 } }"
        class="hero"
      >
        <div>
          <p class="eyebrow">Portfolio / {{ new Date().getFullYear() }}</p>
          <h1>
            {{ profile.firstName }} <span>{{ profile.lastName }}</span>
          </h1>
          <p class="role">{{ profile.title }}</p>
        </div>
        <div class="hero-mark" aria-hidden="true">CV<span>.</span></div>
      </header>

      <section
        v-motion
        :initial="{ opacity: 0, y: 18 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 180, duration: 600 } }"
        class="intro-grid"
      >
        <p class="summary">{{ profile.summary }}</p>
        <div class="contact-list">
          <a :href="`mailto:${profile.email}`"
            ><Mail :size="16" /> {{ profile.email }}</a
          >
          <a v-if="profile.phone" :href="`tel:${profile.phone}`"
            ><Phone :size="16" /> {{ profile.phone }}</a
          >
          <span v-if="profile.location"
            ><MapPin :size="16" /> {{ profile.location }}</span
          >
          <a
            v-if="profile.website"
            :href="
              'https://github.com/' +
              profile.website.replace(/^https?:\/\//, '').replace('.', '-')
            "
            target="_blank"
            rel="noreferrer"
            ><ExternalLink :size="16" />
            {{ profile.website.replace(/^https?:\/\//, '') }}</a
          >
        </div>
      </section>

      <div class="content-grid">
        <div class="primary-column">
          <section
            v-motion
            :initial="{ opacity: 0, y: 18 }"
            :enter="{
              opacity: 1,
              y: 0,
              transition: { delay: 280, duration: 600 },
            }"
            class="section-block"
          >
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
              <article
                v-for="(experience, index) in profile.experiences"
                :key="experience.id"
                v-motion
                :initial="{ opacity: 0, x: -10 }"
                :enter="{
                  opacity: 1,
                  x: 0,
                  transition: { delay: 360 + index * 80, duration: 450 },
                }"
                class="timeline-item"
              >
                <AccordionItem :value="`experience-${index}`">
                  <AccordionTrigger class="experience-trigger">
                    <div>
                      <div class="timeline-meta">
                        <span
                          >{{ formatDate(experience.startDate) }} —
                          {{ formatDate(experience.endDate) }}</span
                        >
                        <span v-if="experience.location">{{
                          experience.location
                        }}</span>
                      </div>
                      <h3>{{ experience.position }}</h3>
                      <p class="company">{{ experience.company }}</p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p v-if="experience.description" class="muted-copy">
                      {{ experience.description }}
                    </p>
                    <ul v-if="experience.highlights.length">
                      <li
                        v-for="highlight in experience.highlights"
                        :key="highlight"
                      >
                        {{ highlight }}
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </article>
            </Accordion>
          </section>

          <section
            v-if="profile.recommendations.length"
            class="section-block recommendations-block"
          >
            <div class="section-heading">
              <span>02</span>
              <h2>Words from others</h2>
            </div>
            <article
              v-for="recommendation in profile.recommendations"
              :key="recommendation.id"
              class="recommendation"
            >
              <Quote :size="22" />
              <p>{{ recommendation.content }}</p>
              <footer>
                {{ recommendation.authorName
                }}<span
                  >{{ recommendation.authorRole
                  }}{{
                    recommendation.authorOrg
                      ? `, ${recommendation.authorOrg}`
                      : ''
                  }}</span
                >
              </footer>
            </article>
          </section>
        </div>

        <aside class="side-column">
          <section v-if="profileStore.skillGroups.length" class="section-block">
            <div class="section-heading">
              <span>03</span>
              <h2>Toolkit</h2>
            </div>
            <div
              v-for="[category, skills] in profileStore.skillGroups"
              :key="category"
              class="skill-group"
            >
              <p class="group-label">{{ formatCategory(category) }}</p>
              <div class="skill-list">
                <span
                  v-for="item in skills"
                  :key="item.skill.id"
                  class="skill-chip"
                  >{{ item.skill.name }}</span
                >
              </div>
            </div>
          </section>
          <section
            v-if="profile.education.length"
            class="section-block education-block"
          >
            <div class="section-heading">
              <span>04</span>
              <h2>Education</h2>
            </div>
            <article
              v-for="education in profile.education"
              :key="education.id"
              class="education-item"
            >
              <h3>{{ education.degree }}</h3>
              <p>{{ education.institution }}</p>
              <span
                >{{ education.faculty }} ·
                {{
                  formatYearRange(education.startYear, education.endYear)
                }}</span
              >
            </article>
          </section>
          <section
            v-if="profile.languages.length"
            class="section-block language-block"
          >
            <div class="section-heading">
              <span>05</span>
              <h2>Languages</h2>
            </div>
            <div
              v-for="language in profile.languages"
              :key="language.id"
              class="language-row"
            >
              <span>{{ language.name }}</span
              ><small>{{ language.level }}</small>
            </div>
          </section>
        </aside>
      </div>
    </template>
  </main>
</template>
