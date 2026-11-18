import { enableAutoUnmount } from '@vue/test-utils'
import { afterEach, beforeEach } from 'vitest'
import { limparAnuncios } from '@/composables/useAnunciador'
import { simularMidia } from './ajuda/simular-midia'

enableAutoUnmount(afterEach)

// O jsdom não implementa a rolagem; o scrollBehavior do router chama window.scrollTo.
window.scrollTo = () => {}

beforeEach(() => {
  window.localStorage.clear()
  simularMidia([])
  const raiz = document.documentElement
  for (const atributo of ['data-tema', 'data-espacamento', 'data-fonte', 'data-movimento', 'style']) {
    raiz.removeAttribute(atributo)
  }
  document.title = ''
})

afterEach(() => {
  limparAnuncios()
  document.body.innerHTML = ''
})
