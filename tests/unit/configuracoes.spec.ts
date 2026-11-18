import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CHAVE_CONFIGURACOES, useConfiguracoesStore } from '@/stores/configuracoes'
import { simularMidia } from './ajuda/simular-midia'

const CHAVE_LOCAL = `agenda-saude:${CHAVE_CONFIGURACOES}`
const raiz = document.documentElement

function novaSessao() {
  setActivePinia(createPinia())
  return useConfiguracoesStore()
}

function salvarNoNavegador(dados: unknown, versao = 1) {
  window.localStorage.setItem(CHAVE_LOCAL, JSON.stringify({ versao, dados }))
}

describe('configurações: valores da primeira visita', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('sem preferência do sistema: tema claro, texto 100% e animações normais', () => {
    const config = useConfiguracoesStore()
    expect(config.preferencias).toEqual({
      tema: 'claro',
      tamanhoTexto: 100,
      espacamentoAmpliado: false,
      fonteLegivel: false,
      reduzirMovimento: false,
      dicasExtras: false,
    })
  })

  it('prefers-color-scheme: dark → tema escuro', () => {
    simularMidia(['prefers-color-scheme: dark'])
    expect(useConfiguracoesStore().tema).toBe('escuro')
  })

  it('prefers-contrast: more → alto contraste, mesmo com tema escuro no sistema', () => {
    simularMidia(['prefers-contrast: more', 'prefers-color-scheme: dark'])
    expect(useConfiguracoesStore().tema).toBe('alto-contraste')
  })

  it('prefers-reduced-motion: reduce → reduzir animações ligado', () => {
    simularMidia(['prefers-reduced-motion: reduce'])
    expect(useConfiguracoesStore().reduzirMovimento).toBe(true)
  })

  it('funciona mesmo sem matchMedia', () => {
    Object.defineProperty(window, 'matchMedia', { configurable: true, writable: true, value: undefined })
    expect(useConfiguracoesStore().tema).toBe('claro')
  })

  it('não salva nada enquanto a pessoa não muda alguma opção', () => {
    useConfiguracoesStore()
    expect(window.localStorage.getItem(CHAVE_LOCAL)).toBeNull()
  })
})

describe('configurações: atributos no <html>', () => {
  it('aplica tudo já ao criar a store', () => {
    salvarNoNavegador({
      tema: 'escuro',
      tamanhoTexto: 150,
      espacamentoAmpliado: true,
      fonteLegivel: true,
      reduzirMovimento: true,
      dicasExtras: true,
    })
    novaSessao()
    expect(raiz.dataset.tema).toBe('escuro')
    expect(raiz.dataset.espacamento).toBe('ampliado')
    expect(raiz.dataset.fonte).toBe('legivel')
    expect(raiz.dataset.movimento).toBe('reduzido')
    expect(raiz.style.fontSize).toBe('150%')
  })

  it('muda na hora quando a opção muda', () => {
    const config = novaSessao()
    config.tema = 'alto-contraste'
    config.tamanhoTexto = 200
    config.espacamentoAmpliado = true
    expect(raiz.dataset.tema).toBe('alto-contraste')
    expect(raiz.style.fontSize).toBe('200%')
    expect(raiz.dataset.espacamento).toBe('ampliado')
    config.tamanhoTexto = 100
    expect(raiz.style.fontSize).toBe('')
  })
})

describe('configurações: persistência', () => {
  it('salva ao mudar e recupera numa nova sessão', () => {
    const config = novaSessao()
    config.tema = 'escuro'
    config.tamanhoTexto = 175
    config.dicasExtras = true

    const salvo = JSON.parse(window.localStorage.getItem(CHAVE_LOCAL) ?? 'null')
    expect(salvo).toMatchObject({ versao: 1, dados: { tema: 'escuro', tamanhoTexto: 175, dicasExtras: true } })

    const outraSessao = novaSessao()
    expect(outraSessao.tema).toBe('escuro')
    expect(outraSessao.tamanhoTexto).toBe(175)
    expect(outraSessao.dicasExtras).toBe(true)
  })

  it('o que foi salvo vale mais que a preferência do sistema', () => {
    salvarNoNavegador({ tema: 'claro' })
    simularMidia(['prefers-color-scheme: dark'])
    expect(novaSessao().tema).toBe('claro')
  })

  it('ignora dados de outra versão ou corrompidos', () => {
    salvarNoNavegador({ tema: 'escuro' }, 99)
    expect(novaSessao().tema).toBe('claro')
    window.localStorage.setItem(CHAVE_LOCAL, '{isso não é json')
    expect(novaSessao().tema).toBe('claro')
  })

  it('um campo inválido volta ao padrão sem perder os outros', () => {
    salvarNoNavegador({ tema: 'roxo', tamanhoTexto: 300, fonteLegivel: true })
    const config = novaSessao()
    expect(config.tema).toBe('claro')
    expect(config.tamanhoTexto).toBe(100)
    expect(config.fonteLegivel).toBe(true)
  })

  it('se o navegador não deixar salvar, a opção vale mesmo assim e a falha fica registrada', () => {
    const config = novaSessao()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Cota excedida', 'QuotaExceededError')
    })
    config.tema = 'escuro'
    expect(raiz.dataset.tema).toBe('escuro')
    expect(config.salvamentoFalhou).toBe(true)
  })
})

describe('configurações: ações', () => {
  it('alto contraste liga e, ao desligar, volta ao tema anterior', () => {
    const config = novaSessao()
    config.tema = 'escuro'
    config.alternarAltoContraste()
    expect(config.tema).toBe('alto-contraste')
    config.alternarAltoContraste()
    expect(config.tema).toBe('escuro')
  })

  it('ao desligar um alto contraste que veio do sistema, usa o tema claro ou escuro do sistema', () => {
    simularMidia(['prefers-contrast: more', 'prefers-color-scheme: dark'])
    const config = novaSessao()
    expect(config.tema).toBe('alto-contraste')
    config.alternarAltoContraste()
    expect(config.tema).toBe('escuro')
  })

  it('restaurar volta aos valores do sistema', () => {
    simularMidia(['prefers-reduced-motion: reduce'])
    const config = novaSessao()
    config.tema = 'alto-contraste'
    config.tamanhoTexto = 200
    config.reduzirMovimento = false
    config.restaurarPadrao()
    expect(config.preferencias).toMatchObject({ tema: 'claro', tamanhoTexto: 100, reduzirMovimento: true })
    expect(raiz.dataset.movimento).toBe('reduzido')
  })
})
