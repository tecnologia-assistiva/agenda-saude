import { nextTick } from 'vue'
import { START_LOCATION, type Router } from 'vue-router'

export const NOME_SITE = 'Agenda Saúde'

export function montarTitulo(titulo: string, opcoes: { erro?: boolean } = {}): string {
  return `${opcoes.erro ? 'Erro: ' : ''}${titulo} – ${NOME_SITE}`
}

export function definirTituloDocumento(titulo: string, opcoes: { erro?: boolean } = {}): void {
  document.title = montarTitulo(titulo, opcoes)
}

export function focarTituloDaPagina(): void {
  const alvo = document.querySelector<HTMLElement>('main h1') ?? document.querySelector<HTMLElement>('main')
  alvo?.focus()
}

export function instalarFocoNaTrocaDeRota(router: Router): void {
  router.afterEach(async (para, de, falha) => {
    if (falha) return
    definirTituloDocumento(para.meta.titulo)
    if (de === START_LOCATION || para.path === de.path) return
    await nextTick()
    focarTituloDaPagina()
  })
}