export interface MesAno {
  ano: number
  mes: number
}

const doisDigitos = (n: number) => String(n).padStart(2, '0')

export const DIAS_DA_SEMANA = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado']
export const DIAS_DA_SEMANA_CURTOS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

export function paraISO(data: Date): string {
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`
}

export function deISO(iso: string): Date {
  const [ano, mes, dia] = iso.split('-').map(Number) as [number, number, number]
  return new Date(ano, mes - 1, dia)
}

export function hojeISO(agora: Date = new Date()): string {
  return paraISO(agora)
}

export function adicionarDias(iso: string, dias: number): string {
  const data = deISO(iso)
  data.setDate(data.getDate() + dias)
  return paraISO(data)
}

export function diasNoMes({ ano, mes }: MesAno): number {
  return new Date(ano, mes, 0).getDate()
}

export function mesDe(iso: string): MesAno {
  const data = deISO(iso)
  return { ano: data.getFullYear(), mes: data.getMonth() + 1 }
}

export function compararMeses(a: MesAno, b: MesAno): number {
  return a.ano * 12 + a.mes - (b.ano * 12 + b.mes)
}

export function somarMeses({ ano, mes }: MesAno, meses: number): MesAno {
  const total = ano * 12 + (mes - 1) + meses
  return { ano: Math.floor(total / 12), mes: (total % 12) + 1 }
}

export function adicionarMeses(iso: string, meses: number): string {
  const data = deISO(iso)
  const destino = somarMeses(mesDe(iso), meses)
  const dia = Math.min(data.getDate(), diasNoMes(destino))
  return paraISO(new Date(destino.ano, destino.mes - 1, dia))
}

export function diaDaSemana(iso: string): number {
  return deISO(iso).getDay()
}

export function ehFimDeSemana(iso: string): boolean {
  const dia = diaDaSemana(iso)
  return dia === 0 || dia === 6
}

export function semanasDoMes(mesAno: MesAno): (string | null)[][] {
  const primeiro = new Date(mesAno.ano, mesAno.mes - 1, 1)
  const total = diasNoMes(mesAno)
  const celulas: (string | null)[] = Array.from({ length: primeiro.getDay() }, () => null)
  for (let dia = 1; dia <= total; dia++) celulas.push(paraISO(new Date(mesAno.ano, mesAno.mes - 1, dia)))
  while (celulas.length % 7 !== 0) celulas.push(null)
  const semanas: (string | null)[][] = []
  for (let i = 0; i < celulas.length; i += 7) semanas.push(celulas.slice(i, i + 7))
  return semanas
}

const formatoLongo = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
const formatoCompleto = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const formatoDiaMes = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long' })
const formatoMesAno = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })

export function formatarDataLonga(iso: string): string {
  return formatoLongo.format(deISO(iso))
}

export function formatarDataCompleta(iso: string): string {
  return formatoCompleto.format(deISO(iso))
}

export function formatarDiaMes(iso: string): string {
  return formatoDiaMes.format(deISO(iso))
}

export function formatarMesAno({ ano, mes }: MesAno): string {
  return formatoMesAno.format(new Date(ano, mes - 1, 1))
}