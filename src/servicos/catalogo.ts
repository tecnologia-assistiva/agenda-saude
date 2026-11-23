/*
 * Especialidades e profissionais da UBS fictícia (dados em src/dados/*.json).
 * Os nomes dos profissionais vão sem "Dr." ou "Dra.": abreviação é lida de jeitos diferentes
 * pelos leitores de tela, e a especialidade já diz o papel de cada um.
 */
import especialidadesJson from '@/dados/especialidades.json'
import profissionaisJson from '@/dados/profissionais.json'

export interface Especialidade {
  id: string
  nome: string
  /** Só quando o nome sozinho não basta (regra de tela enxuta). */
  descricao?: string
}

export interface Profissional {
  id: string
  nome: string
  especialidadeId: string
}

/** Valor da opção "Qualquer profissional". */
export const QUALQUER_PROFISSIONAL = 'qualquer'

export const especialidades: readonly Especialidade[] = especialidadesJson
export const profissionais: readonly Profissional[] = profissionaisJson

export function buscarEspecialidade(id: string | null): Especialidade | undefined {
  return especialidades.find((e) => e.id === id)
}

export function buscarProfissional(id: string | null): Profissional | undefined {
  return profissionais.find((p) => p.id === id)
}

export function profissionaisDaEspecialidade(especialidadeId: string | null): Profissional[] {
  return profissionais.filter((p) => p.especialidadeId === especialidadeId)
}

/** O profissional escolhido vale para a especialidade? ("Qualquer profissional" vale para todas.) */
export function profissionalValido(especialidadeId: string | null, profissionalId: string | null): boolean {
  if (!buscarEspecialidade(especialidadeId) || !profissionalId) return false
  if (profissionalId === QUALQUER_PROFISSIONAL) return true
  return buscarProfissional(profissionalId)?.especialidadeId === especialidadeId
}

export function nomeDaEspecialidade(id: string | null): string {
  return buscarEspecialidade(id)?.nome ?? ''
}

/** Nome do profissional, ou "Qualquer profissional" para essa escolha da etapa 2. */
export function nomeDoProfissional(id: string | null): string {
  if (id === QUALQUER_PROFISSIONAL) return 'Qualquer profissional'
  return buscarProfissional(id)?.nome ?? ''
}
