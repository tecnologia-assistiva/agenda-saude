import especialidadesJson from '@/dados/especialidades.json'
import profissionaisJson from '@/dados/profissionais.json'

export interface Especialidade {
  id: string
  nome: string
  descricao?: string
}

export interface Profissional {
  id: string
  nome: string
  especialidadeId: string
}

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

export function profissionalValido(especialidadeId: string | null, profissionalId: string | null): boolean {
  if (!buscarEspecialidade(especialidadeId) || !profissionalId) return false
  if (profissionalId === QUALQUER_PROFISSIONAL) return true
  return buscarProfissional(profissionalId)?.especialidadeId === especialidadeId
}

export function nomeDaEspecialidade(id: string | null): string {
  return buscarEspecialidade(id)?.nome ?? ''
}

export function nomeDoProfissional(id: string | null): string {
  if (id === QUALQUER_PROFISSIONAL) return 'Qualquer profissional'
  return buscarProfissional(id)?.nome ?? ''
}