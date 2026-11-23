import { enableAutoUnmount } from '@vue/test-utils'
import { afterEach, beforeEach } from 'vitest'
import { limparAnuncios } from '@/composables/useAnunciador'
import { simularDialogo } from './ajuda/simular-dialogo'
import { simularMidia } from './ajuda/simular-midia'

enableAutoUnmount(afterEach)

window.scrollTo = () => {}
simularDialogo()

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