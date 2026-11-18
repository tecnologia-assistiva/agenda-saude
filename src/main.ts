import '@fontsource/atkinson-hyperlegible-next/400.css'
import '@fontsource/atkinson-hyperlegible-next/700.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/preferencias.css'

import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { criarRouter } from './router'
import { useConfiguracoesStore } from './stores/configuracoes'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
// Cria a store já na carga: ela aplica as preferências no <html>.
useConfiguracoesStore(pinia)
app.use(criarRouter())
app.mount('#app')
