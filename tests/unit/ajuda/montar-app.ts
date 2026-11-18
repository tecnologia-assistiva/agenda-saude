import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory } from 'vue-router'
import App from '@/App.vue'
import { criarRouter } from '@/router'

/** Monta o app inteiro (layout + rotas) no document.body, já na rota pedida. */
export async function montarApp(caminhoInicial = '/') {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = criarRouter(createMemoryHistory())
  await router.push(caminhoInicial)
  await router.isReady()
  const wrapper = mount(App, { global: { plugins: [pinia, router] }, attachTo: document.body })
  await flushPromises()
  return { wrapper, router, pinia }
}

/** Navega e espera a troca de foco (que acontece depois do próximo tick). */
export async function navegar(router: Awaited<ReturnType<typeof montarApp>>['router'], caminho: string) {
  await router.push(caminho)
  await flushPromises()
}
