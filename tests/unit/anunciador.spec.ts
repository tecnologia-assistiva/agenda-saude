import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ATRASO_ANUNCIO_MS, DURACAO_ANUNCIO_MS, useAnunciador } from '@/composables/useAnunciador'

describe('useAnunciador', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('limpa a região e escreve a mensagem depois de uma pausa curta', () => {
    const { anunciar, mensagemStatus } = useAnunciador()
    anunciar('Tema escuro aplicado.')
    expect(mensagemStatus.value).toBe('')
    vi.advanceTimersByTime(ATRASO_ANUNCIO_MS)
    expect(mensagemStatus.value).toBe('Tema escuro aplicado.')
  })

  it('a mesma mensagem duas vezes passa por vazio, para o leitor anunciar de novo', () => {
    const { anunciar, mensagemStatus } = useAnunciador()
    anunciar('Texto em 150%.')
    vi.advanceTimersByTime(ATRASO_ANUNCIO_MS)
    anunciar('Texto em 150%.')
    expect(mensagemStatus.value).toBe('')
    vi.advanceTimersByTime(ATRASO_ANUNCIO_MS)
    expect(mensagemStatus.value).toBe('Texto em 150%.')
  })

  it('só a última de várias mensagens seguidas fica na região', () => {
    const { anunciar, mensagemStatus } = useAnunciador()
    anunciar('Texto em 125%.')
    anunciar('Texto em 150%.')
    anunciar('Texto em 175%.')
    vi.advanceTimersByTime(ATRASO_ANUNCIO_MS)
    expect(mensagemStatus.value).toBe('Texto em 175%.')
  })

  it('a mensagem sai da região depois de um tempo', () => {
    const { anunciar, mensagemStatus } = useAnunciador()
    anunciar('Consulta cancelada.')
    vi.advanceTimersByTime(ATRASO_ANUNCIO_MS + DURACAO_ANUNCIO_MS)
    expect(mensagemStatus.value).toBe('')
  })

  it('alerta e status são regiões separadas', () => {
    const { anunciar, alertar, mensagemStatus, mensagemAlerta } = useAnunciador()
    anunciar('Salvo.')
    alertar('Não foi possível salvar.')
    vi.advanceTimersByTime(ATRASO_ANUNCIO_MS)
    expect(mensagemStatus.value).toBe('Salvo.')
    expect(mensagemAlerta.value).toBe('Não foi possível salvar.')
  })
})
