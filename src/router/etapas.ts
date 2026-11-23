import type { LocationQuery, RouteLocationRaw, Router } from 'vue-router'
import { useAgendamentoStore } from '@/stores/agendamento'
import { useConsultasStore } from '@/stores/consultas'

export interface Etapa {
  numero: number
  nome: string
  caminho: string
}

export const ETAPAS: readonly Etapa[] = [
  { numero: 1, nome: 'Seus dados', caminho: '/agendar/seus-dados' },
  { numero: 2, nome: 'Tipo de atendimento', caminho: '/agendar/atendimento' },
  { numero: 3, nome: 'Data e horário', caminho: '/agendar/data-e-horario' },
  { numero: 4, nome: 'Revisão', caminho: '/agendar/revisao' },
  { numero: 5, nome: 'Confirmação', caminho: '/agendar/confirmacao' },
]

export const TOTAL_ETAPAS = ETAPAS.length

export const AVISO_ETAPA_INCOMPLETA = 'etapa-incompleta'

export function etapa(numero: number): Etapa {
  const encontrada = ETAPAS[numero - 1]
  if (!encontrada) throw new Error(`Etapa ${numero} não existe.`)
  return encontrada
}

export function legendaDaEtapa(numero: number): string {
  return `Etapa ${numero} de ${TOTAL_ETAPAS}`
}

export function tituloDaEtapa(numero: number): string {
  return `${legendaDaEtapa(numero)}: ${etapa(numero).nome}`
}

export const RETORNO_REVISAO = 'revisao'

export function destinoAoContinuar(numero: number, query: LocationQuery): RouteLocationRaw {
  if (query.retorno !== RETORNO_REVISAO) return etapa(numero + 1).caminho
  const falta = useAgendamentoStore().primeiraEtapaIncompleta
  return falta < 4 ? { path: etapa(falta).caminho, query: { retorno: RETORNO_REVISAO } } : etapa(4).caminho
}

export function caminhoDaPrimeiraEtapaIncompleta(): string {
  return etapa(useAgendamentoStore().primeiraEtapaIncompleta).caminho
}

export function instalarGuardasDoAgendamento(router: Router): void {
  router.beforeEach((para) => {
    const numero = para.meta.etapa
    if (!numero) return true
    if (numero === TOTAL_ETAPAS && useConsultasStore().confirmacaoAtual) return true
    const liberada = useAgendamentoStore().primeiraEtapaIncompleta
    if (numero <= liberada) return true
    return { path: etapa(liberada).caminho, query: { aviso: AVISO_ETAPA_INCOMPLETA } }
  })
}