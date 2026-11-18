import { readonly, ref } from 'vue'

/*
 * Mensagens para o leitor de tela. Existe uma só região role="status" e uma role="alert",
 * as duas no App.vue. Use `anunciar` para confirmações (salvo, cancelado, tema alterado) e
 * `alertar` só para erro crítico (por exemplo, falha ao salvar). Avisos que já aparecem na tela
 * não precisam ser anunciados.
 */

/** Pausa entre limpar e escrever: faz o leitor anunciar de novo uma mensagem repetida. */
export const ATRASO_ANUNCIO_MS = 100
/** Depois disso a mensagem sai da região, para não ser lida de novo ao navegar pela página. */
export const DURACAO_ANUNCIO_MS = 10_000

const mensagemStatus = ref('')
const mensagemAlerta = ref('')
const temporizadores = new Map<'status' | 'alerta', ReturnType<typeof setTimeout>[]>()

function publicar(destino: typeof mensagemStatus, tipo: 'status' | 'alerta', texto: string): void {
  for (const t of temporizadores.get(tipo) ?? []) clearTimeout(t)
  destino.value = ''
  const escrever = setTimeout(() => {
    destino.value = texto
  }, ATRASO_ANUNCIO_MS)
  const limpar = setTimeout(() => {
    destino.value = ''
  }, ATRASO_ANUNCIO_MS + DURACAO_ANUNCIO_MS)
  temporizadores.set(tipo, [escrever, limpar])
}

/** Apaga as mensagens e os temporizadores pendentes (usado entre os testes). */
export function limparAnuncios(): void {
  for (const lista of temporizadores.values()) for (const t of lista) clearTimeout(t)
  temporizadores.clear()
  mensagemStatus.value = ''
  mensagemAlerta.value = ''
}

export function useAnunciador() {
  return {
    mensagemStatus: readonly(mensagemStatus),
    mensagemAlerta: readonly(mensagemAlerta),
    anunciar: (texto: string) => publicar(mensagemStatus, 'status', texto),
    alertar: (texto: string) => publicar(mensagemAlerta, 'alerta', texto),
  }
}
