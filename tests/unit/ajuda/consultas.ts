import type { Consulta } from '@/stores/consultas'
import { DADOS_VALIDOS } from './rascunho'

/** Consulta pronta para os testes (data fixa: os testes fixam hoje em 18/11/2026). */
export function consulta(parcial: Partial<Consulta> = {}): Consulta {
  return {
    protocolo: '1234-5678',
    dados: { ...DADOS_VALIDOS },
    especialidadeId: 'clinica-geral',
    profissionalEscolhido: 'helena-duarte',
    horario: { data: '2026-11-25', hora: '09:00', profissionalId: 'helena-duarte' },
    remarcacoes: 0,
    ...parcial,
  }
}

/** Grava as consultas no localStorage antes de montar o app. */
export function salvarConsultas(lista: Consulta[]) {
  window.localStorage.setItem('agenda-saude:consultas', JSON.stringify({ versao: 1, dados: lista }))
}

export function lerConsultasSalvas(): Consulta[] {
  const bruto = window.localStorage.getItem('agenda-saude:consultas')
  return bruto ? (JSON.parse(bruto).dados as Consulta[]) : []
}

export function salvarDadosPessoais(dados = DADOS_VALIDOS) {
  window.localStorage.setItem('agenda-saude:dados-pessoais', JSON.stringify({ versao: 1, dados }))
}
