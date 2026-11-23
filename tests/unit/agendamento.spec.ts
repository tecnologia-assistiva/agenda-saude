import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it } from 'vitest'
import { useAgendamentoStore } from '@/stores/agendamento'
import { DADOS_VALIDOS, lerRascunhoSalvo, salvarRascunho } from './ajuda/rascunho'

const HORARIO = { data: '2026-11-25', hora: '09:00', profissionalId: 'helena-duarte' }

function novaSessao() {
  setActivePinia(createPinia())
  return useAgendamentoStore()
}

describe('rascunho do agendamento', () => {
  it('começa vazio, na etapa 1', () => {
    const agendamento = novaSessao()
    expect(agendamento.iniciado).toBe(false)
    expect(agendamento.primeiraEtapaIncompleta).toBe(1)
  })

  it('salva cada mudança e recupera numa nova sessão (recarregar não perde nada)', () => {
    const agendamento = novaSessao()
    agendamento.rascunho.dados.nome = 'Maria'
    expect(lerRascunhoSalvo()?.dados.nome).toBe('Maria')
    expect(novaSessao().rascunho.dados.nome).toBe('Maria')
  })

  it('ignora rascunho corrompido e troca campos com tipo errado por vazio', () => {
    window.localStorage.setItem('agenda-saude:rascunho', '{quebrado')
    expect(novaSessao().rascunho.dados.nome).toBe('')
    salvarRascunho({ dados: { ...DADOS_VALIDOS, nome: 42 as unknown as string }, horario: { data: 'ontem' } as never })
    const agendamento = novaSessao()
    expect(agendamento.rascunho.dados.nome).toBe('')
    expect(agendamento.rascunho.dados.telefone).toBe(DADOS_VALIDOS.telefone)
    expect(agendamento.rascunho.horario).toBeNull()
  })

  it('etapa 1 completa com dados válidos; etapa 2 com especialidade e profissional compatíveis', () => {
    salvarRascunho({ dados: DADOS_VALIDOS })
    const agendamento = novaSessao()
    expect(agendamento.etapaCompleta(1)).toBe(true)
    expect(agendamento.primeiraEtapaIncompleta).toBe(2)

    agendamento.escolherEspecialidade('pediatria')
    agendamento.escolherProfissional('helena-duarte')
    expect(agendamento.etapaCompleta(2)).toBe(false)
    agendamento.escolherProfissional('qualquer')
    expect(agendamento.etapaCompleta(2)).toBe(true)
    agendamento.escolherProfissional('lucia-fernandes')
    expect(agendamento.primeiraEtapaIncompleta).toBe(3)
  })

  it('trocar a especialidade apaga o profissional e o horário, e avisa se havia horário', () => {
    salvarRascunho({ dados: DADOS_VALIDOS, especialidadeId: 'clinica-geral', profissionalId: 'helena-duarte', horario: HORARIO })
    const agendamento = novaSessao()
    expect(agendamento.escolherEspecialidade('clinica-geral')).toBe(false)
    expect(agendamento.rascunho.horario).toEqual(HORARIO)
    expect(agendamento.escolherEspecialidade('pediatria')).toBe(true)
    expect(agendamento.rascunho.profissionalId).toBeNull()
    expect(agendamento.rascunho.horario).toBeNull()
    expect(agendamento.rascunho.dados).toEqual(DADOS_VALIDOS)
  })

  it('trocar o profissional apaga só o horário', () => {
    salvarRascunho({ dados: DADOS_VALIDOS, especialidadeId: 'clinica-geral', profissionalId: 'helena-duarte', horario: HORARIO })
    const agendamento = novaSessao()
    expect(agendamento.escolherProfissional('marcos-ribeiro')).toBe(true)
    expect(agendamento.rascunho.especialidadeId).toBe('clinica-geral')
    expect(agendamento.rascunho.horario).toBeNull()
    expect(agendamento.escolherProfissional('qualquer')).toBe(false)
  })

  it('limpar o rascunho apaga tudo, mantendo o mesmo objeto de dados', () => {
    salvarRascunho({ dados: DADOS_VALIDOS, especialidadeId: 'dentista' })
    const agendamento = novaSessao()
    const dados = agendamento.rascunho.dados
    agendamento.limparRascunho()
    expect(dados.nome).toBe('')
    expect(agendamento.rascunho.especialidadeId).toBeNull()
    expect(agendamento.iniciado).toBe(false)
  })
})