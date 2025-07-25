import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/tailwind.css'
import { bootBackend } from './services/api'

const app = createApp(App)

app.use(createPinia())
app.use(router)

bootBackend()

app.mount('#app')
