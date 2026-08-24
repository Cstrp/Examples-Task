import { DefaultApolloClient} from '@vue/apollo-composable'
import { MotionPlugin } from '@vueuse/motion'
import { apolloClient } from './apollo.ts'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import VWave from 'v-wave'
import App from './App.vue'
import './style.css'

const pinia = createPinia()
const app = createApp(App)

app.provide(DefaultApolloClient, apolloClient)

app.use(VWave, { color: '#FFFFFF', initialOpacity: 0.5, easing: 'ease-in-out', duration: 0.5 })
app.use(MotionPlugin)
app.use(pinia)

app.mount('#app')
