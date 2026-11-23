import { flushPromises } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { montarApp, navegar } from './ajuda/montar-app'
import { salvarDadosPessoais } from './ajuda/consultas'
import { DADOS_VALIDOS, lerRascunhoSalvo, salvarRascunho } from './ajuda/rascunho'

/* Novo agendamento com os dados pessoais do último (WCAG 3.3.7) e "Apagar meus dados". */

const texto = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, ' ').trim()
const valor = (id: string) => (document.getElementById(id) as HTMLInputElement).value
const botao = (inicio: string) =>
  [...document.querySelectorAll<HTMLButtonElement>('button')].find((b) => texto(b)?.startsWith(inicio)) as HTMLButtonElement

async function abrirEtapa1() {
  const app = await montarApp('/')
  await navegar(app.router, '/agendar')
  return app
}

describe('dados do último agendamento', () => {
  it('num agendamento novo, os campos já vêm preenchidos, com aviso e "Apagar meus dados"', async () => {
    salvarDadosPessoais()
    const { router } = await abrirEtapa1()
    expect(router.currentRoute.value.path).toBe('/agendar/seus-dados')
    expect(valor('nome')).toBe(DADOS_VALIDOS.nome)
    expect(valor('telefone')).toBe(DADOS_VALIDOS.telefone)
    expect(texto(document.querySelector('.dados-salvos p'))).toBe('Usamos os dados do seu último agendamento.')
    expect(botao('Apagar meus dados').type).toBe('button')
    // Dá para seguir direto.
    document.querySelector('main form')?.dispatchEvent(new Event('submit', { cancelable: true }))
    await expect.poll(() => router.currentRoute.value.path).toBe('/agendar/atendimento')
  })

  it('sem dados salvos, nada de aviso nem de diálogo', async () => {
    await abrirEtapa1()
    expect(valor('nome')).toBe('')
    expect(document.querySelector('.dados-salvos')).toBeNull()
    expect(document.querySelector('dialog')).toBeNull()
  })

  it('não troca o que a pessoa já digitou', async () => {
    salvarDadosPessoais()
    salvarRascunho({ dados: { ...DADOS_VALIDOS, nome: 'Outra Pessoa', telefone: '' } })
    await abrirEtapa1()
    expect(valor('nome')).toBe('Outra Pessoa')
    expect(document.querySelector('.dados-salvos')).toBeNull()
  })

  it('"Apagar meus dados" pede confirmação; "Não, manter" deixa tudo como estava', async () => {
    salvarDadosPessoais()
    await abrirEtapa1()
    const origem = botao('Apagar meus dados')
    origem.click()
    await flushPromises()
    const dialogo = document.querySelector('dialog') as HTMLDialogElement
    expect(dialogo.open).toBe(true)
    expect(texto(dialogo.querySelector('h2'))).toBe('Apagar seus dados?')
    expect(texto(document.activeElement)).toBe('Não, manter meus dados')
    botao('Não, manter meus dados').click()
    await flushPromises()
    expect(document.activeElement).toBe(origem)
    expect(valor('nome')).toBe(DADOS_VALIDOS.nome)
  })

  it('confirmar apaga os dados salvos e os campos; a mensagem aparece e o foco vai para o h1', async () => {
    salvarDadosPessoais()
    const { wrapper } = await abrirEtapa1()
    botao('Apagar meus dados').click()
    await flushPromises()
    botao('Sim, apagar meus dados').click()
    await flushPromises()
    expect(valor('nome')).toBe('')
    expect(valor('telefone')).toBe('')
    expect(window.localStorage.getItem('agenda-saude:dados-pessoais')).toBeNull()
    expect(lerRascunhoSalvo()?.dados.nome).toBe('')
    expect(document.querySelector('.dados-salvos')).toBeNull()
    expect(texto(document.querySelector('main h1 ~ .texto-atencao'))).toBe('Seus dados foram apagados.')
    expect(document.activeElement).toBe(document.querySelector('main h1'))
    await expect.poll(() => wrapper.get('[data-testid="regiao-status"]').text()).toBe('Seus dados foram apagados.')
  })
})
