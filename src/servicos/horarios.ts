/*
 * Horários livres gerados na hora a partir de dados/agenda-modelo.json, sempre para os próximos
 * 30 dias contados de hoje (datas fixas num JSON "venceriam" antes da apresentação).
 * - Sem atendimento em fins de semana e feriados.
 * - "Dias lotados": o 2º e o 7º dia útil depois de hoje não têm nenhuma vaga.
 * - Ocupação parcial por sorteio com semente fixa: cada horário tem sempre o mesmo resultado,
 *   então a agenda é a mesma em todo acesso e nos testes (que fixam a data de hoje).
 */
import modelo from '@/dados/agenda-modelo.json'
import { QUALQUER_PROFISSIONAL, buscarProfissional, profissionaisDaEspecialidade } from './catalogo'
import { adicionarDias, diaDaSemana, ehFimDeSemana } from '@/utils/datas'

export interface Horario {
  /** AAAA-MM-DD */
  data: string
  /** HH:MM */
  hora: string
  profissionalId: string
}

interface ModeloAgenda {
  janelaDias: number
  taxaOcupacao: number
  turnos: Record<string, string[]>
  grade: Record<string, Partial<Record<string, string[]>>>
  diasLotados: number[]
  feriados: string[]
}

const agenda: ModeloAgenda = modelo
const feriados = new Set(agenda.feriados)

/** Número entre 0 e 1 sempre igual para o mesmo texto (FNV-1a de 32 bits). */
function sorteioFixo(texto: string): number {
  let hash = 0x811c9dc5
  for (const caractere of texto) {
    hash ^= caractere.codePointAt(0) ?? 0
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash / 0x100000000
}

export function estaOcupado(h: Horario): boolean {
  return sorteioFixo(`${h.data}|${h.hora}|${h.profissionalId}`) < agenda.taxaOcupacao
}

export function ehDiaUtil(iso: string): boolean {
  return !ehFimDeSemana(iso) && !feriados.has(iso)
}

/** De amanhã até hoje + 30 dias. */
export function janelaDeAgendamento(hoje: string): { inicio: string; fim: string } {
  return { inicio: adicionarDias(hoje, 1), fim: adicionarDias(hoje, agenda.janelaDias) }
}

/** Dias úteis sem nenhuma vaga, contados a partir de hoje (1 = primeiro dia útil depois de hoje). */
export function diasLotados(hoje: string): Set<string> {
  const { inicio, fim } = janelaDeAgendamento(hoje)
  const lotados = new Set<string>()
  let contador = 0
  for (let dia = inicio; dia <= fim; dia = adicionarDias(dia, 1)) {
    if (!ehDiaUtil(dia)) continue
    contador += 1
    if (agenda.diasLotados.includes(contador)) lotados.add(dia)
  }
  return lotados
}

function horasDoProfissional(profissionalId: string, data: string): string[] {
  const turnos = agenda.grade[profissionalId]?.[String(diaDaSemana(data))] ?? []
  return turnos.flatMap((turno) => agenda.turnos[turno] ?? [])
}

/** Todos os horários livres dos profissionais, na janela, em ordem de data, hora e profissional. */
export function gerarHorariosLivres(hoje: string, profissionalIds: string[]): Horario[] {
  const { inicio, fim } = janelaDeAgendamento(hoje)
  const lotados = diasLotados(hoje)
  const livres: Horario[] = []
  for (let data = inicio; data <= fim; data = adicionarDias(data, 1)) {
    if (!ehDiaUtil(data) || lotados.has(data)) continue
    const doDia: Horario[] = []
    for (const profissionalId of profissionalIds) {
      for (const hora of horasDoProfissional(profissionalId, data)) {
        const horario = { data, hora, profissionalId }
        if (!estaOcupado(horario)) doDia.push(horario)
      }
    }
    doDia.sort((a, b) => a.hora.localeCompare(b.hora))
    livres.push(...doDia)
  }
  return livres
}

function profissionaisDaEscolha(especialidadeId: string | null, profissionalId: string | null): string[] {
  if (profissionalId === QUALQUER_PROFISSIONAL) return profissionaisDaEspecialidade(especialidadeId).map((p) => p.id)
  const profissional = buscarProfissional(profissionalId)
  return profissional && profissional.especialidadeId === especialidadeId ? [profissional.id] : []
}

/**
 * Horários que a pessoa pode escolher na etapa 3. Com "Qualquer profissional", cada hora aparece
 * uma vez só, com o primeiro profissional livre naquela hora (na ordem do catálogo).
 */
export function horariosParaEscolha(
  hoje: string,
  especialidadeId: string | null,
  profissionalId: string | null,
): Horario[] {
  const livres = gerarHorariosLivres(hoje, profissionaisDaEscolha(especialidadeId, profissionalId))
  if (profissionalId !== QUALQUER_PROFISSIONAL) return livres
  const vistos = new Set<string>()
  return livres.filter((h) => {
    const chave = `${h.data}|${h.hora}`
    if (vistos.has(chave)) return false
    vistos.add(chave)
    return true
  })
}

/** O horário guardado ainda serve? (Está na janela, livre e combina com a escolha da etapa 2.) */
export function horarioAindaValido(
  horario: Horario,
  hoje: string,
  especialidadeId: string | null,
  profissionalId: string | null,
): boolean {
  const { inicio, fim } = janelaDeAgendamento(hoje)
  if (horario.data < inicio || horario.data > fim) return false
  if (!ehDiaUtil(horario.data) || diasLotados(hoje).has(horario.data)) return false
  if (!profissionaisDaEscolha(especialidadeId, profissionalId).includes(horario.profissionalId)) return false
  return horasDoProfissional(horario.profissionalId, horario.data).includes(horario.hora) && !estaOcupado(horario)
}

export function contarPorDia(horarios: Horario[]): Map<string, number> {
  const contagem = new Map<string, number>()
  for (const h of horarios) contagem.set(h.data, (contagem.get(h.data) ?? 0) + 1)
  return contagem
}

export function chaveDoHorario(h: Horario): string {
  return `${h.data}|${h.hora}|${h.profissionalId}`
}

export function horarioDaChave(chave: string): Horario | null {
  const [data, hora, profissionalId] = chave.split('|')
  return data && hora && profissionalId ? { data, hora, profissionalId } : null
}
