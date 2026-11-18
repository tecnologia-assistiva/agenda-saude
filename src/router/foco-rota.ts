import { nextTick } from 'vue'
import { START_LOCATION, type Router } from 'vue-router'

/*
 * A cada troca de rota: atualiza o <title> e leva o foco ao h1 da página (tabindex="-1"),
 * para o leitor de tela anunciar onde a pessoa chegou e o próximo Tab seguir dali.
 * Exceções:
 * - primeira carga: o foco fica no início do documento, e o 1º Tab cai em "Ir para o conteúdo";
 * - mesmo caminho (só o # ou a query mudou, como nos links de pulo): o navegador já cuida do foco.
 */

export const NOME_SITE = 'Agenda Saúde'

export function montarTitulo(titulo: string, opcoes: { erro?: boolean } = {}): string {
  return `${opcoes.erro ? 'Erro: ' : ''}${titulo} – ${NOME_SITE}`
}

/** Também usada pelos formulários: com erro, o título começa com "Erro: ". */
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
