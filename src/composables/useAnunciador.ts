import { readonly, ref } from 'vue'

export const ATRASO_ANUNCIO_MS = 100
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