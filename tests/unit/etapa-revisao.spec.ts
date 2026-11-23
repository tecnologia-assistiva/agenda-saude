import { flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { horariosParaEscolha } from '@/servicos/horarios'
import { montarApp, navegar } from './ajuda/montar-app'
import { lerConsultasSalvas } from './ajuda/consultas'
import { DADOS_VALIDOS, lerRascunhoSalvo, salvarRascunho } from './ajuda/rascunho'

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'], shouldAdvanceTime: true })
  vi.setSystemTime(new Date(2026, 10, 18, 10, 0))
})
afterEach(() => vi.useRealTimers())

const HORARIO = horariosParaEscolha('2026-11-18', 'clinica-geral', 'qualquer')[0]!

async function abrirRevisao() {
  salvarRascunho({ dados: DADOS_VALIDOS, especialidadeId: 'clinica-geral', profissionalId: 'qualquer', horario: HORARIO })
  const app = await montarApp('/')
  await navegar(app.router, '/agendar/revisao')
  return app
}

const texto = (el: Element | null | undefined) => el?.textContent?.replace(/\s+/g, ' ').trim()
const valores = () => [...document.querySelectorAll('main dd')].map(texto)
const linkAlterar = (bloco: string) =>
  [...document.querySelectorAll<HTMLAnchorElement>('main a')].find((a) => texto(a) === `Alterar ${bloco}`)

async function enviar() {
  document.querySelector('main form')?.dispatchEvent(new Event('submit', { cancelable: true }))
  await flushPromises()
}

describe('etapa 4: revisão', () => {
  it('h1 "Etapa 4 de 5: Revise e confirme" com o foco, e um bloco (h2) por etapa', async () => {
    await abrirRevisao()
    const h1 = document.querySelector('main h1')
    expect(texto(h1)).toBe('Etapa 4 de 5: Revise e confirme')
    expect(document.activeElement).toBe(h1)
    expect([...document.querySelectorAll('main h2')].map(texto)).toEqual(['Seus dados', 'Tipo de atendimento', 'Data e horário'])
  })

  it('o resumo mostra os dados, o atendimento e o horário (com quem atende, em "Qualquer profissional")', async () => {
    await abrirRevisao()
    const quem = HORARIO.profissionalId === 'helena-duarte' ? 'Helena Duarte' : 'Marcos Ribeiro'
    expect(valores()).toEqual([
      'Maria da Silva',
      '15/03/1980',
      '(11) 98765-4321',
      'Não informado',
      'Clínica geral',
      'Qualquer profissional',
      'quinta-feira, 19 de novembro de 2026',
      `${HORARIO.hora}, com ${quem}`,
    ])
  })

  it('cada bloco tem "Alterar" com ?retorno=revisao; o nome acessível começa pelo texto visível', async () => {
    await abrirRevisao()
    expect(linkAlterar('seus dados')?.getAttribute('href')).toBe('/agendar/seus-dados?retorno=revisao')
    expect(linkAlterar('tipo de atendimento')?.getAttribute('href')).toBe('/agendar/atendimento?retorno=revisao')
    expect(linkAlterar('data e horário')?.getAttribute('href')).toBe('/agendar/data-e-horario?retorno=revisao')
    expect(linkAlterar('seus dados')?.querySelector('.visualmente-oculto')?.textContent).toBe(' seus dados')
  })

  it('"Alterar" → etapa com "Salvar e voltar para a revisão" → de volta à revisão, com a mudança', async () => {
    const { router } = await abrirRevisao()
    linkAlterar('seus dados')?.click()
    await expect.poll(() => router.currentRoute.value.fullPath).toBe('/agendar/seus-dados?retorno=revisao')
    await flushPromises()
    expect(texto(document.querySelector('main button[type="submit"]'))).toBe('Salvar e voltar para a revisão')
    expect(document.querySelector('.navegacao-etapa a')?.getAttribute('href')).toBe('/agendar/revisao')
    const nome = document.getElementById('nome') as HTMLInputElement
    nome.value = 'Maria Souza'
    nome.dispatchEvent(new Event('input'))
    await enviar()
    await expect.poll(() => router.currentRoute.value.path).toBe('/agendar/revisao')
    expect(valores()[0]).toBe('Maria Souza')
    expect(document.activeElement).toBe(document.querySelector('main h1'))
  })

  it('trocar a especialidade vindo da revisão passa pela etapa 3 (o horário foi apagado), ainda com retorno', async () => {
    const { router } = await abrirRevisao()
    await navegar(router, '/agendar/atendimento?retorno=revisao')
    for (const [nome, valor] of [['especialidade', 'pediatria'], ['profissional', 'qualquer']]) {
      const radio = document.querySelector<HTMLInputElement>(`input[name="${nome}"][value="${valor}"]`) as HTMLInputElement
      radio.checked = true
      radio.dispatchEvent(new Event('change'))
      await flushPromises()
    }
    await enviar()
    await expect.poll(() => router.currentRoute.value.fullPath).toBe('/agendar/data-e-horario?retorno=revisao')
    expect(texto(document.querySelector('main button[type="submit"]'))).toBe('Salvar e voltar para a revisão')
  })

  it('o botão principal é "Confirmar agendamento" e "Voltar" leva à etapa 3', async () => {
    await abrirRevisao()
    expect([...document.querySelectorAll('main .botao')].map(texto)).toEqual(['Confirmar agendamento'])
    expect(document.querySelector('.navegacao-etapa a')?.getAttribute('href')).toBe('/agendar/data-e-horario')
  })
})

describe('etapa 5: confirmação', () => {
  async function confirmar() {
    const app = await abrirRevisao()
    await enviar()
    await expect.poll(() => app.router.currentRoute.value.path).toBe('/agendar/confirmacao')
    await flushPromises()
    return app
  }

  it('confirmar cria a consulta, apaga o rascunho e leva o foco ao h1, que diz que deu certo', async () => {
    await confirmar()
    const h1 = document.querySelector('main h1')
    expect(texto(h1)).toBe('Etapa 5 de 5: Consulta agendada')
    expect(document.activeElement).toBe(h1)
    expect(document.title).toBe('Etapa 5 de 5: Consulta agendada – Agenda Saúde')
    const [salva] = lerConsultasSalvas()
    expect(salva?.horario).toEqual(HORARIO)
    expect(texto(document.querySelector('main .texto-destaque'))).toBe(`Protocolo: ${salva?.protocolo}`)
    expect(lerRascunhoSalvo()).toBeNull()
  })

  it('resumo com data completa e local; indicador com as 4 etapas concluídas, sem links', async () => {
    await confirmar()
    expect(valores()).toContain('quinta-feira, 19 de novembro de 2026')
    expect(valores()).toContain('UBS Ponta Grossa')
    const itens = [...document.querySelectorAll('ol.etapas > li')]
    expect(itens.map((li) => li.querySelector('.etapas__estado') !== null)).toEqual([true, true, true, true, false])
    expect(document.querySelector('ol.etapas a')).toBeNull()
    expect(itens[4]?.getAttribute('aria-current')).toBe('step')
  })

  it('"Imprimir comprovante" chama a impressão; "Adicionar à agenda" baixa o .ics', async () => {
    const imprimir = vi.spyOn(window, 'print').mockImplementation(() => {})
    await confirmar()
    const botao = [...document.querySelectorAll<HTMLButtonElement>('main button')].find((b) => texto(b) === 'Imprimir comprovante')
    botao?.click()
    expect(imprimir).toHaveBeenCalledOnce()
    const protocolo = lerConsultasSalvas()[0]?.protocolo
    const link = [...document.querySelectorAll<HTMLAnchorElement>('main a')].find((a) => texto(a) === 'Adicionar à agenda')
    expect(link?.getAttribute('download')).toBe(`consulta-${protocolo}.ics`)
    expect(link?.getAttribute('href')).toMatch(/^data:text\/calendar;charset=utf-8,BEGIN%3AVCALENDAR/)
    expect(botao?.closest('.nao-imprimir')).not.toBeNull()
    expect(texto(document.querySelector('main .so-impressao'))).toContain('Comprovante de demonstração')
  })

  it('recarregar a confirmação continua mostrando a consulta; sem consulta confirmada, não abre', async () => {
    await confirmar()
    const { router } = await montarApp('/agendar/confirmacao')
    expect(router.currentRoute.value.path).toBe('/agendar/confirmacao')
    window.localStorage.clear()
    const outra = await montarApp('/agendar/confirmacao')
    expect(outra.router.currentRoute.value.path).toBe('/agendar/seus-dados')
  })
})