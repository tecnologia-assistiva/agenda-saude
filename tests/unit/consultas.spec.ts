import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { horariosParaEscolha } from '@/servicos/horarios'
import { useAgendamentoStore } from '@/stores/agendamento'
import { gerarProtocolo, useConsultasStore, type NovaConsulta } from '@/stores/consultas'
import { consulta, lerConsultasSalvas, salvarConsultas, salvarDadosPessoais } from './ajuda/consultas'
import { DADOS_VALIDOS, salvarRascunho } from './ajuda/rascunho'

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'], shouldAdvanceTime: true })
  vi.setSystemTime(new Date(2026, 10, 18, 10, 0))
})
afterEach(() => vi.useRealTimers())

const NOVA: NovaConsulta = {
  dados: { ...DADOS_VALIDOS },
  especialidadeId: 'clinica-geral',
  profissionalEscolhido: 'qualquer',
  horario: { data: '2026-11-25', hora: '09:00', profissionalId: 'helena-duarte' },
}

function novaSessao() {
  setActivePinia(createPinia())
  return { consultas: useConsultasStore(), agendamento: useAgendamentoStore() }
}

describe('store de consultas', () => {
  it('agendar: cria com protocolo "0000-0000", salva, lembra os dados pessoais e libera a confirmação', () => {
    const { consultas } = novaSessao()
    const criada = consultas.agendar(NOVA)
    expect(criada.protocolo).toMatch(/^\d{4}-\d{4}$/)
    expect(criada.remarcacoes).toBe(0)
    expect(lerConsultasSalvas()).toEqual([criada])
    expect(consultas.dadosSalvos).toEqual(DADOS_VALIDOS)
    expect(consultas.confirmacaoAtual).toEqual({ consulta: criada, tipo: 'agendada' })
    const depois = novaSessao().consultas
    expect(depois.buscar(criada.protocolo)).toEqual(criada)
    expect(depois.dadosSalvos).toEqual(DADOS_VALIDOS)
    expect(depois.confirmacaoAtual?.consulta.protocolo).toBe(criada.protocolo)
  })

  it('o protocolo não repete um que já existe', () => {
    const sorteios = [1, 1, 2]
    expect(gerarProtocolo(new Set(['0000-0001']), () => sorteios.shift() ?? 0)).toBe('0000-0002')
  })

  it('cancelar: tira da lista e do localStorage; cancelar de novo não faz nada', () => {
    salvarConsultas([consulta({ protocolo: '1111-1111' }), consulta({ protocolo: '2222-2222' })])
    const { consultas } = novaSessao()
    expect(consultas.cancelar('1111-1111')?.protocolo).toBe('1111-1111')
    expect(lerConsultasSalvas().map((c) => c.protocolo)).toEqual(['2222-2222'])
    expect(consultas.cancelar('1111-1111')).toBeNull()
  })

  it('cancelar a consulta recém-confirmada fecha a tela de confirmação', () => {
    const { consultas } = novaSessao()
    const criada = consultas.agendar(NOVA)
    consultas.cancelar(criada.protocolo)
    expect(consultas.confirmacaoAtual).toBeNull()
  })

  it('remarcar: mesmo protocolo, novo horário, remarcações + 1', () => {
    salvarConsultas([consulta({ protocolo: '1234-5678' })])
    const { consultas } = novaSessao()
    const novoHorario = { data: '2026-11-30', hora: '14:00', profissionalId: 'marcos-ribeiro' }
    const remarcada = consultas.remarcar('1234-5678', { ...NOVA, horario: novoHorario })
    expect(remarcada?.protocolo).toBe('1234-5678')
    expect(consultas.lista).toHaveLength(1)
    expect(lerConsultasSalvas()[0]?.horario).toEqual(novoHorario)
    expect(lerConsultasSalvas()[0]?.remarcacoes).toBe(1)
    expect(consultas.confirmacaoAtual?.tipo).toBe('remarcada')
    expect(consultas.remarcar('9999-9999', NOVA)).toBeNull()
  })

  it('próximas: de hoje em diante, em ordem de data e hora', () => {
    salvarConsultas([
      consulta({ protocolo: '1111-1111', horario: { data: '2026-11-26', hora: '08:00', profissionalId: 'helena-duarte' } }),
      consulta({ protocolo: '2222-2222', horario: { data: '2026-11-10', hora: '09:00', profissionalId: 'helena-duarte' } }),
      consulta({ protocolo: '3333-3333', horario: { data: '2026-11-25', hora: '14:00', profissionalId: 'marcos-ribeiro' } }),
      consulta({ protocolo: '4444-4444', horario: { data: '2026-11-25', hora: '09:30', profissionalId: 'helena-duarte' } }),
    ])
    const { consultas } = novaSessao()
    expect(consultas.proximas.map((c) => c.protocolo)).toEqual(['4444-4444', '3333-3333', '1111-1111'])
  })

  it('ignora itens estragados no localStorage sem perder os bons', () => {
    window.localStorage.setItem(
      'agenda-saude:consultas',
      JSON.stringify({ versao: 1, dados: [consulta(), { protocolo: 'abc' }, null, consulta({ protocolo: '1', horario: null as never })] }),
    )
    const { consultas } = novaSessao()
    expect(consultas.lista.map((c) => c.protocolo)).toEqual(['1234-5678'])
  })
})

describe('rascunho + consultas', () => {
  it('confirmar um agendamento novo usa o rascunho e não o apaga sozinho', () => {
    const horario = horariosParaEscolha('2026-11-18', 'clinica-geral', 'qualquer')[0]
    salvarRascunho({ dados: DADOS_VALIDOS, especialidadeId: 'clinica-geral', profissionalId: 'qualquer', horario })
    const { agendamento, consultas } = novaSessao()
    const criada = agendamento.confirmar()
    expect(criada?.horario).toEqual(horario)
    expect(criada?.profissionalEscolhido).toBe('qualquer')
    expect(consultas.lista).toHaveLength(1)
    expect(agendamento.rascunho.horario).toEqual(horario)
  })

  it('confirmar com etapa incompleta não cria nada', () => {
    salvarRascunho({ dados: DADOS_VALIDOS, especialidadeId: 'clinica-geral', profissionalId: 'qualquer' })
    const { agendamento, consultas } = novaSessao()
    expect(agendamento.confirmar()).toBeNull()
    expect(consultas.lista).toHaveLength(0)
  })

  it('remarcar: a consulta vira o rascunho na etapa 3, e confirmar mantém o protocolo', () => {
    salvarConsultas([consulta({ protocolo: '1234-5678', profissionalEscolhido: 'helena-duarte' })])
    const { agendamento, consultas } = novaSessao()
    agendamento.carregarConsulta(consultas.buscar('1234-5678')!)
    expect(agendamento.primeiraEtapaIncompleta).toBe(3)
    expect(agendamento.rascunho.dados).toEqual(DADOS_VALIDOS)
    expect(agendamento.rascunho.remarcando).toBe('1234-5678')
    agendamento.rascunho.horario = horariosParaEscolha('2026-11-18', 'clinica-geral', 'helena-duarte')[0] ?? null
    expect(agendamento.confirmar()?.protocolo).toBe('1234-5678')
    expect(consultas.lista).toHaveLength(1)
    expect(consultas.lista[0]?.remarcacoes).toBe(1)
  })

  it('um horário já marcado não aparece livre nem completa a etapa 3 de outro agendamento', () => {
    const [primeiro, segundo] = horariosParaEscolha('2026-11-18', 'clinica-geral', 'helena-duarte')
    salvarConsultas([consulta({ protocolo: '1234-5678', horario: primeiro! })])
    salvarRascunho({ dados: DADOS_VALIDOS, especialidadeId: 'clinica-geral', profissionalId: 'helena-duarte', horario: primeiro })
    const { agendamento } = novaSessao()
    expect(agendamento.etapaCompleta(3)).toBe(false)
    expect(horariosParaEscolha('2026-11-18', 'clinica-geral', 'helena-duarte', agendamento.horariosOcupados)[0]).toEqual(segundo)
    agendamento.rascunho.remarcando = '1234-5678'
    expect(agendamento.etapaCompleta(3)).toBe(true)
  })

  it('dados do último agendamento: preenche só um rascunho em branco (e não ao remarcar)', () => {
    salvarDadosPessoais()
    const { agendamento } = novaSessao()
    expect(agendamento.preencherComDadosSalvos()).toBe(true)
    expect(agendamento.rascunho.dados).toEqual(DADOS_VALIDOS)
    expect(agendamento.rascunho.usouDadosSalvos).toBe(true)
    expect(agendamento.preencherComDadosSalvos()).toBe(false)

    salvarRascunho({ remarcando: '1234-5678' })
    expect(novaSessao().agendamento.preencherComDadosSalvos()).toBe(false)
  })

  it('apagar meus dados: esquece os dados salvos e deixa os campos em branco', () => {
    salvarDadosPessoais()
    const { agendamento, consultas } = novaSessao()
    agendamento.preencherComDadosSalvos()
    agendamento.apagarDadosPessoais()
    expect(agendamento.rascunho.dados.nome).toBe('')
    expect(agendamento.rascunho.usouDadosSalvos).toBe(false)
    expect(consultas.dadosSalvos).toBeNull()
    expect(window.localStorage.getItem('agenda-saude:dados-pessoais')).toBeNull()
  })
})