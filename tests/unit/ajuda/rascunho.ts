import { rascunhoVazio, type Rascunho } from '@/stores/agendamento'

export const DADOS_VALIDOS = {
  nome: 'Maria da Silva',
  dataNascimento: '15/03/1980',
  telefone: '(11) 98765-4321',
  cartaoSus: '',
}

/** Grava um rascunho no localStorage antes de montar o app (as guardas leem dele). */
export function salvarRascunho(parcial: Partial<Rascunho>) {
  const rascunho: Rascunho = { ...rascunhoVazio(), ...parcial }
  window.localStorage.setItem('agenda-saude:rascunho', JSON.stringify({ versao: 1, dados: rascunho }))
}

export function lerRascunhoSalvo(): Rascunho | null {
  const bruto = window.localStorage.getItem('agenda-saude:rascunho')
  return bruto ? (JSON.parse(bruto).dados as Rascunho) : null
}
