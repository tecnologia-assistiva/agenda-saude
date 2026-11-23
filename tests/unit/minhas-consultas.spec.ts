import { flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { horariosParaEscolha } from '@/servicos/horarios'
import { montarApp, navegar } from './ajuda/montar-app'
import { consulta, lerConsultasSalvas, salvarConsultas } from './ajuda/consultas'
import { DADOS_VALIDOS, lerRascunhoSalvo } from './ajuda/rascunho'

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'], shouldAdvanceTime: true })
  vi.setSystemTime(new Date(2026, 10, 18, 10, 0))
})
afterEach(() => vi.useRealTimers())

const PRIMEIRA = consulta({
  protocolo: '1111-1111',
  horario: { data: '2026-11-25', hora: '09:00', profissionalId: 'helena-duarte' },
})
const SEGUNDA = consulta({
  protocolo: '2222-2222',
  especialidadeId: 'dentista',
  profissionalEscolhido: 'qualquer',
  horario: { data: '2026-11-30', hora: '14:00', profissionalId: 'camila-rocha' },
})

const texto = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, ' ').trim()
const dialogo = () => document.querySelector('dialog') as HTMLDialogElement
const porTexto = <T extends Element>(seletor: string, inicio: string) =>
  [...document.querySelectorAll<T>(seletor)].find((el) => texto(el)?.startsWith(inicio))

async function abrirLista(lista = [PRIMEIRA, SEGUNDA]) {
  salvarConsultas(lista)
  const app = await montarApp('/')
  await navegar(app.router, '/minhas-consultas')
  return app
}

async function pedirCancelamento(quando: string) {
  const botao = porTexto<HTMLButtonElement>('main li button', `Cancelar a consulta de ${quando}`) as HTMLButtonElement
  botao.click()
  await flushPromises()
  return botao
}

describe('Minhas consultas', () => {
  it('lista vazia: uma frase e o link "Agendar consulta"', async () => {
    await abrirLista([])
    expect(texto(document.querySelector('main h1'))).toBe('Minhas consultas')
    expect(document.querySelector('main ul')).toBeNull()
    expect(texto(document.querySelector('main h1 + p'))).toBe('Você não tem consultas marcadas.')
    expect(porTexto('main a', 'Agendar consulta')?.getAttribute('href')).toBe('/agendar')
  })

  it('lista as próximas em ordem, com o h1 como título da lista; consultas passadas não aparecem', async () => {
    const passada = consulta({ protocolo: '3333-3333', horario: { data: '2026-11-10', hora: '09:00', profissionalId: 'helena-duarte' } })
    await abrirLista([SEGUNDA, passada, PRIMEIRA])
    const lista = document.querySelector('main ul')
    expect(lista?.getAttribute('aria-labelledby')).toBe('titulo-pagina')
    expect([...document.querySelectorAll('main li h2')].map(texto)).toEqual([
      'quarta-feira, 25 de novembro, às 09:00',
      'segunda-feira, 30 de novembro, às 14:00',
    ])
    expect(texto(document.querySelector('main li p'))).toBe('Clínica geral, com Helena Duarte. Protocolo 1111-1111.')
  })

  it('"Remarcar" (link) e "Cancelar" (botão) dizem de qual consulta são no nome acessível', async () => {
    await abrirLista()
    const remarcar = porTexto<HTMLAnchorElement>('main li a', 'Remarcar')
    expect(texto(remarcar)).toBe('Remarcar a consulta de quarta-feira, 25 de novembro, às 09:00')
    expect(remarcar?.getAttribute('href')).toBe('/minhas-consultas/remarcar/1111-1111')
    const cancelar = porTexto<HTMLButtonElement>('main li button', 'Cancelar')
    expect(texto(cancelar)).toBe('Cancelar a consulta de quarta-feira, 25 de novembro, às 09:00')
    expect(cancelar?.type).toBe('button')
    expect(lerRascunhoSalvo()).toBeNull()
  })

  it('"Cancelar" abre o diálogo com a consulta, foco em "Não, manter consulta"; Esc devolve o foco', async () => {
    await abrirLista()
    const botao = await pedirCancelamento('quarta-feira, 25 de novembro')
    expect(dialogo().open).toBe(true)
    expect(texto(dialogo().querySelector('h2'))).toBe('Cancelar esta consulta?')
    expect(texto(dialogo().querySelector('p'))).toBe(
      'Clínica geral, com Helena Duarte, quarta-feira, 25 de novembro, às 09:00. Não dá para desfazer.',
    )
    expect(texto(document.activeElement)).toBe('Não, manter consulta')
    document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await flushPromises()
    expect(dialogo().open).toBe(false)
    expect(document.activeElement).toBe(botao)
    expect(lerConsultasSalvas()).toHaveLength(2)
  })

  it('"Sim, cancelar consulta": a consulta sai da lista, aparece a mensagem e o foco vai para o h1', async () => {
    const { wrapper } = await abrirLista()
    await pedirCancelamento('quarta-feira, 25 de novembro')
    porTexto<HTMLButtonElement>('dialog button', 'Sim, cancelar consulta')?.click()
    await flushPromises()
    expect(lerConsultasSalvas().map((c) => c.protocolo)).toEqual(['2222-2222'])
    expect(document.querySelectorAll('main li')).toHaveLength(1)
    expect(document.activeElement).toBe(document.querySelector('main h1'))
    const mensagem = 'Consulta de quarta-feira, 25 de novembro, às 09:00 cancelada.'
    expect(texto(document.querySelector('main .texto-atencao'))).toBe(mensagem)
    await expect.poll(() => wrapper.get('[data-testid="regiao-status"]').text()).toBe(mensagem)
  })

  it('cancelar a última consulta deixa a lista vazia, com o foco no h1', async () => {
    await abrirLista([PRIMEIRA])
    await pedirCancelamento('quarta-feira, 25 de novembro')
    porTexto<HTMLButtonElement>('dialog button', 'Sim, cancelar consulta')?.click()
    await flushPromises()
    expect(document.querySelector('main ul')).toBeNull()
    expect(porTexto('main a', 'Agendar consulta')).toBeDefined()
    expect(document.activeElement).toBe(document.querySelector('main h1'))
  })
})

describe('remarcar', () => {
  it('abre a etapa 3 com as etapas 1 e 2 concluídas, sem pedir os dados de novo', async () => {
    const { router } = await abrirLista()
    porTexto<HTMLAnchorElement>('main li a', 'Remarcar')?.click()
    await expect.poll(() => router.currentRoute.value.path).toBe('/agendar/data-e-horario')
    await flushPromises()
    expect(document.activeElement).toBe(document.querySelector('main h1'))
    const estados = [...document.querySelectorAll('ol.etapas > li')].map((li) => li.querySelector('.etapas__estado') !== null)
    expect(estados).toEqual([true, true, false, false, false])
    expect(texto(document.querySelector('main h1 ~ p'))).toBe(
      'Você está remarcando a consulta de quarta-feira, 25 de novembro, às 09:00.',
    )
    const rascunho = lerRascunhoSalvo()
    expect(rascunho?.dados).toEqual(DADOS_VALIDOS)
    expect(rascunho?.remarcando).toBe('1111-1111')
    expect(rascunho?.horario).toBeNull()
  })

  it('confirmar a remarcação mantém o protocolo e troca o horário', async () => {
    const { router } = await abrirLista()
    await navegar(router, '/minhas-consultas/remarcar/1111-1111')
    const novo = horariosParaEscolha('2026-11-18', 'clinica-geral', 'helena-duarte')[0]!
    const radio = document.querySelector<HTMLInputElement>(`input[name="horario"][value="${novo.data}|${novo.hora}|${novo.profissionalId}"]`)
    radio!.checked = true
    radio!.dispatchEvent(new Event('change'))
    document.querySelector('main form')?.dispatchEvent(new Event('submit', { cancelable: true }))
    await expect.poll(() => router.currentRoute.value.path).toBe('/agendar/revisao')
    await flushPromises()
    expect(texto(document.querySelector('main button[type="submit"]'))).toBe('Confirmar remarcação')
    document.querySelector('main form')?.dispatchEvent(new Event('submit', { cancelable: true }))
    await expect.poll(() => router.currentRoute.value.path).toBe('/agendar/confirmacao')
    await flushPromises()
    expect(texto(document.querySelector('main h1'))).toBe('Etapa 5 de 5: Consulta remarcada')
    expect(texto(document.querySelector('main .texto-destaque'))).toBe('Protocolo: 1111-1111 (continua o mesmo)')
    const salvas = lerConsultasSalvas()
    expect(salvas.map((c) => c.protocolo)).toEqual(['1111-1111', '2222-2222'])
    expect(salvas[0]?.horario).toEqual(novo)
  })

  it('protocolo que não existe volta para a lista', async () => {
    const { router } = await abrirLista()
    await navegar(router, '/minhas-consultas/remarcar/9999-9999')
    expect(router.currentRoute.value.path).toBe('/minhas-consultas')
    expect(lerRascunhoSalvo()).toBeNull()
  })
})