import { flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { horariosParaEscolha } from '@/servicos/horarios'
import { montarApp } from './ajuda/montar-app'
import { consulta, salvarConsultas } from './ajuda/consultas'
import { DADOS_VALIDOS, lerRascunhoSalvo, salvarRascunho } from './ajuda/rascunho'

/* Data fixa: quarta-feira, 18/11/2026, 10h (o relógio continua andando a partir daí). */
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'], shouldAdvanceTime: true })
  vi.setSystemTime(new Date(2026, 10, 18, 10, 0))
})
afterEach(() => vi.useRealTimers())

async function abrirEtapa3(parcial: Parameters<typeof salvarRascunho>[0] = {}) {
  salvarRascunho({ dados: DADOS_VALIDOS, especialidadeId: 'clinica-geral', profissionalId: 'qualquer', ...parcial })
  return montarApp('/agendar/data-e-horario')
}

async function marcar(nome: string, valor: string) {
  const radio = document.querySelector<HTMLInputElement>(`input[name="${nome}"][value="${valor}"]`)
  if (!radio) throw new Error(`Opção ${nome}=${valor} não existe`)
  radio.checked = true
  radio.dispatchEvent(new Event('change'))
  await flushPromises()
}

async function enviar() {
  document.querySelector('main form')?.dispatchEvent(new Event('submit', { cancelable: true }))
  await flushPromises()
}

const opcoes = (nome: string) => [...document.querySelectorAll<HTMLInputElement>(`input[name="${nome}"]`)]
const rotulo = (radio: HTMLInputElement) => radio.closest('label')?.querySelector('.opcao__rotulo')?.textContent
const legenda = (id: string) => document.getElementById(id)?.querySelector('legend')?.textContent?.trim()

describe('etapa 3: data e horário', () => {
  it('começa em "Ver próximos horários disponíveis", com os 10 próximos horários livres', async () => {
    await abrirEtapa3()
    expect(document.querySelector('main fieldset legend')?.textContent?.trim()).toBe('Como você prefere escolher?')
    expect(opcoes('modo').map(rotulo)).toEqual(['Ver próximos horários disponíveis', 'Escolher no calendário'])
    expect(opcoes('modo')[0]?.checked).toBe(true)
    expect(legenda('horario-proximos')).toBe('Próximos horários livres')
    const lista = opcoes('horario')
    expect(lista).toHaveLength(10)
    const esperado = horariosParaEscolha('2026-11-18', 'clinica-geral', 'qualquer')[0]
    expect(rotulo(lista[0] as HTMLInputElement)).toBe(`quinta-feira, 19 de novembro, às ${esperado?.hora}`)
    expect(document.querySelector('table[role="grid"]')).toBeNull()
  })

  it('com "Qualquer profissional", cada horário diz com quem é', async () => {
    await abrirEtapa3()
    const descricao = opcoes('horario')[0]?.closest('label')?.querySelector('.opcao__descricao')?.textContent
    expect(descricao).toMatch(/^Com (Helena Duarte|Marcos Ribeiro)$/)
  })

  it('com um profissional escolhido, não repete o nome em cada horário', async () => {
    await abrirEtapa3({ profissionalId: 'helena-duarte' })
    expect(document.querySelector('#horario-proximos .opcao__descricao')).toBeNull()
  })

  it('escolher um dos próximos e continuar leva à revisão com o horário guardado', async () => {
    const { router } = await abrirEtapa3()
    const primeiro = opcoes('horario')[0] as HTMLInputElement
    await marcar('horario', primeiro.value)
    await enviar()
    await expect.poll(() => router.currentRoute.value.path).toBe('/agendar/revisao')
    expect(lerRascunhoSalvo()?.horario?.data).toBe('2026-11-19')
  })

  it('enviar sem escolher: resumo com link para a lista', async () => {
    await abrirEtapa3()
    await enviar()
    const link = document.querySelector<HTMLAnchorElement>('.resumo-erros a')
    expect(link?.textContent).toBe('Escolha um dos horários.')
    expect(link?.getAttribute('href')).toBe('#horario-proximos')
  })

  it('no calendário, enviar sem dia: o link do resumo leva o foco ao dia tabulável da grade', async () => {
    await abrirEtapa3()
    await marcar('modo', 'calendario')
    expect(document.querySelector('table[role="grid"]')).not.toBeNull()
    await enviar()
    const link = document.querySelector<HTMLAnchorElement>('.resumo-erros a')
    expect(link?.textContent).toBe('Escolha um dia no calendário.')
    link?.click()
    expect(document.activeElement).toBe(document.querySelector('table button[tabindex="0"]'))
  })

  it('escolher um dia mostra os horários dele, anuncia quantos são e não tira o foco do dia', async () => {
    const { wrapper } = await abrirEtapa3()
    await marcar('modo', 'calendario')
    const botao = document.querySelector<HTMLButtonElement>('[data-data="2026-11-19"]')
    botao?.focus()
    botao?.click()
    await flushPromises()
    expect(document.activeElement).toBe(botao)
    expect(legenda('horario-do-dia')).toBe('Horários de quinta-feira, 19 de novembro')
    const quantidade = horariosParaEscolha('2026-11-18', 'clinica-geral', 'qualquer').filter((h) => h.data === '2026-11-19').length
    expect(opcoes('horario')).toHaveLength(quantidade)
    await expect.poll(() => wrapper.get('[data-testid="regiao-status"]').text()).toBe(
      `quinta-feira, 19 de novembro escolhido. ${quantidade} horários livres logo abaixo do calendário.`,
    )
  })

  it('trocar de dia apaga o horário do dia anterior: avisa antes (texto) e depois (texto + status)', async () => {
    const { wrapper } = await abrirEtapa3()
    await marcar('modo', 'calendario')
    const aviso = () => document.querySelector('main form .calendario')?.previousElementSibling
    document.querySelector<HTMLButtonElement>('[data-data="2026-11-19"]')?.click()
    await flushPromises()
    expect(aviso()?.tagName).not.toBe('P')
    await marcar('horario', (opcoes('horario')[0] as HTMLInputElement).value)
    expect(lerRascunhoSalvo()?.horario?.data).toBe('2026-11-19')
    expect(aviso()?.textContent).toBe('Se escolher outro dia, o horário escolhido será apagado.')

    document.querySelector<HTMLButtonElement>('[data-data="2026-11-24"]')?.click()
    await flushPromises()
    expect(lerRascunhoSalvo()?.horario).toBeNull()
    expect(aviso()?.className).toBe('texto-atencao')
    expect(aviso()?.textContent).toBe('O horário escolhido antes foi apagado. Escolha um horário do novo dia.')
    const quantidade = horariosParaEscolha('2026-11-18', 'clinica-geral', 'qualquer').filter((h) => h.data === '2026-11-24').length
    await expect.poll(() => wrapper.get('[data-testid="regiao-status"]').text()).toBe(
      `terça-feira, 24 de novembro escolhido. O horário escolhido antes foi apagado. ${quantidade} horários livres logo abaixo do calendário.`,
    )
  })

  it('voltar ao mesmo dia não apaga nada nem avisa', async () => {
    await abrirEtapa3()
    await marcar('modo', 'calendario')
    document.querySelector<HTMLButtonElement>('[data-data="2026-11-19"]')?.click()
    await flushPromises()
    await marcar('horario', (opcoes('horario')[0] as HTMLInputElement).value)
    document.querySelector<HTMLButtonElement>('[data-data="2026-11-19"]')?.click()
    await flushPromises()
    expect(lerRascunhoSalvo()?.horario?.data).toBe('2026-11-19')
    expect(document.querySelector('main form .texto-atencao')).toBeNull()
  })

  it('horário escolhido na lista: ao mudar para o calendário, o dia e o horário aparecem marcados', async () => {
    await abrirEtapa3()
    const primeiro = opcoes('horario')[0] as HTMLInputElement
    await marcar('horario', primeiro.value)
    await marcar('modo', 'calendario')
    expect(document.querySelector('[data-data="2026-11-19"]')?.closest('td')?.getAttribute('aria-selected')).toBe('true')
    expect(opcoes('horario').find((r) => r.checked)?.value).toBe(primeiro.value)
  })

  it('horário já marcado em "Minhas consultas" não aparece livre', async () => {
    const [primeiro, segundo] = horariosParaEscolha('2026-11-18', 'clinica-geral', 'helena-duarte')
    salvarConsultas([consulta({ horario: primeiro! })])
    await abrirEtapa3({ profissionalId: 'helena-duarte' })
    expect(opcoes('horario')[0]?.value).toBe(`${segundo?.data}|${segundo?.hora}|${segundo?.profissionalId}`)
  })

  it('dia escolhido sem horário marcado: o erro vai para a lista de horários do dia', async () => {
    await abrirEtapa3()
    await marcar('modo', 'calendario')
    document.querySelector<HTMLButtonElement>('[data-data="2026-11-19"]')?.click()
    await flushPromises()
    await enviar()
    expect(document.querySelector('.resumo-erros a')?.getAttribute('href')).toBe('#horario-do-dia')
    expect(document.getElementById('horario-do-dia-erro')?.textContent).toBe('Erro: Escolha um horário.')
  })

  it('horário guardado fora dos 10 próximos: abre no calendário, com o dia e o horário marcados', async () => {
    const todos = horariosParaEscolha('2026-11-18', 'clinica-geral', 'qualquer')
    const distante = todos[todos.length - 1]
    await abrirEtapa3({ horario: distante })
    expect(opcoes('modo')[1]?.checked).toBe(true)
    expect(document.querySelector(`[data-data="${distante?.data}"]`)?.closest('td')?.getAttribute('aria-selected')).toBe('true')
    expect(opcoes('horario').find((r) => r.checked)?.value).toBe(`${distante?.data}|${distante?.hora}|${distante?.profissionalId}`)
  })

  it('horário guardado que já passou é apagado, com aviso, e a revisão não abre', async () => {
    const horarioAntigo = { data: '2026-11-10', hora: '09:00', profissionalId: 'helena-duarte' }
    salvarRascunho({ dados: DADOS_VALIDOS, especialidadeId: 'clinica-geral', profissionalId: 'qualquer', horario: horarioAntigo })
    const { router } = await montarApp('/agendar/revisao')
    expect(router.currentRoute.value.path).toBe('/agendar/data-e-horario')
    expect(document.querySelector('main form .texto-atencao')?.textContent).toBe(
      'O horário escolhido antes não está mais livre. Escolha outro.',
    )
    expect(lerRascunhoSalvo()?.horario).toBeNull()
  })
})
