import { DURACAO_CONSULTA_MIN } from './horarios'
import { nomeDaEspecialidade, nomeDoProfissional } from './catalogo'
import { deISO } from '@/utils/datas'
import type { Consulta } from '@/stores/consultas'

export const NOME_UNIDADE = 'UBS Ponta Grossa'

const LIMITE_BYTES = 75
const codificador = new TextEncoder()
const doisDigitos = (n: number) => String(n).padStart(2, '0')

export function escaparTexto(texto: string): string {
  return texto.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
}

export function dobrarLinha(linha: string): string {
  const partes: string[] = []
  let atual = ''
  let bytes = 0
  for (const caractere of linha) {
    const tamanho = codificador.encode(caractere).length
    const limite = partes.length === 0 ? LIMITE_BYTES : LIMITE_BYTES - 1
    if (bytes + tamanho > limite) {
      partes.push(atual)
      atual = ''
      bytes = 0
    }
    atual += caractere
    bytes += tamanho
  }
  partes.push(atual)
  return partes.join('\r\n ')
}

function dataHoraLocal(data: Date): string {
  return (
    `${data.getFullYear()}${doisDigitos(data.getMonth() + 1)}${doisDigitos(data.getDate())}` +
    `T${doisDigitos(data.getHours())}${doisDigitos(data.getMinutes())}00`
  )
}

function dataHoraUtc(data: Date): string {
  return data.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function inicioDaConsulta(consulta: Consulta): Date {
  const inicio = deISO(consulta.horario.data)
  const [hora, minuto] = consulta.horario.hora.split(':').map(Number) as [number, number]
  inicio.setHours(hora, minuto, 0, 0)
  return inicio
}

export function gerarIcs(consulta: Consulta, agora: Date = new Date()): string {
  const inicio = inicioDaConsulta(consulta)
  const fim = new Date(inicio.getTime() + DURACAO_CONSULTA_MIN * 60_000)
  const especialidade = nomeDaEspecialidade(consulta.especialidadeId)
  const profissional = nomeDoProfissional(consulta.horario.profissionalId)
  const linhas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Agenda Saude//Projeto academico//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:consulta-${consulta.protocolo}@agenda-saude.invalid`,
    `SEQUENCE:${consulta.remarcacoes}`,
    `DTSTAMP:${dataHoraUtc(agora)}`,
    `DTSTART:${dataHoraLocal(inicio)}`,
    `DTEND:${dataHoraLocal(fim)}`,
    `SUMMARY:${escaparTexto(`Consulta de ${especialidade.toLowerCase()}`)}`,
    `LOCATION:${escaparTexto(`${NOME_UNIDADE} (fictícia)`)}`,
    `DESCRIPTION:${escaparTexto(
      `Com ${profissional}. Protocolo ${consulta.protocolo}. Chegue 15 minutos antes, com um documento com foto.`,
    )}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escaparTexto(`Amanhã: consulta de ${especialidade.toLowerCase()} às ${consulta.horario.hora}`)}`,
    'TRIGGER:-P1D',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return linhas.map(dobrarLinha).join('\r\n') + '\r\n'
}

export function enderecoDoIcs(consulta: Consulta, agora?: Date): string {
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(gerarIcs(consulta, agora))}`
}

export function nomeDoArquivoIcs(consulta: Consulta): string {
  return `consulta-${consulta.protocolo}.ics`
}