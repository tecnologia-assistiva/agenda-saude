import { describe, expect, it } from 'vitest'
import { dobrarLinha, enderecoDoIcs, escaparTexto, gerarIcs, nomeDoArquivoIcs } from '@/servicos/calendario-ics'
import { consulta } from './ajuda/consultas'

const AGORA = new Date(Date.UTC(2026, 10, 18, 13, 0, 0))
const CONSULTA = consulta({
  protocolo: '1234-5678',
  especialidadeId: 'clinica-geral',
  profissionalEscolhido: 'qualquer',
  horario: { data: '2026-11-19', hora: '09:00', profissionalId: 'marcos-ribeiro' },
  remarcacoes: 1,
})

const bytes = (texto: string) => new TextEncoder().encode(texto).length

function linhas(ics: string): string[] {
  return ics.replace(/\r\n /g, '').split('\r\n').filter(Boolean)
}

function propriedade(ics: string, nome: string): string | undefined {
  return linhas(ics).find((l) => l.startsWith(`${nome}:`))?.slice(nome.length + 1)
}

describe('arquivo .ics da consulta', () => {
  const ics = gerarIcs(CONSULTA, AGORA)

  it('é um VCALENDAR 2.0 com um VEVENT e um lembrete, nessa ordem', () => {
    const estrutura = linhas(ics).filter((l) => /^(BEGIN|END):/.test(l))
    expect(estrutura).toEqual([
      'BEGIN:VCALENDAR',
      'BEGIN:VEVENT',
      'BEGIN:VALARM',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ])
    expect(propriedade(ics, 'VERSION')).toBe('2.0')
    expect(propriedade(ics, 'PRODID')).toBeTruthy()
  })

  it('todas as linhas terminam em CRLF (sem \\n solto), inclusive a última', () => {
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true)
    expect(ics.replace(/\r\n/g, '')).not.toMatch(/[\r\n]/)
  })

  it('nenhuma linha passa de 75 bytes', () => {
    for (const linha of ics.split('\r\n')) expect(bytes(linha)).toBeLessThanOrEqual(75)
  })

  it('início e fim em hora local (30 minutos), DTSTAMP em UTC', () => {
    expect(propriedade(ics, 'DTSTART')).toBe('20261119T090000')
    expect(propriedade(ics, 'DTEND')).toBe('20261119T093000')
    expect(propriedade(ics, 'DTSTAMP')).toBe('20261118T130000Z')
  })

  it('UID fixo pelo protocolo e SEQUENCE = remarcações (a agenda atualiza o mesmo evento)', () => {
    expect(propriedade(ics, 'UID')).toBe('consulta-1234-5678@agenda-saude.invalid')
    expect(propriedade(ics, 'SEQUENCE')).toBe('1')
  })

  it('resumo, local e descrição com quem atende e o protocolo, com vírgulas escapadas', () => {
    expect(propriedade(ics, 'SUMMARY')).toBe('Consulta de clínica geral')
    expect(propriedade(ics, 'LOCATION')).toBe('UBS Ponta Grossa (fictícia)')
    expect(propriedade(ics, 'DESCRIPTION')).toBe(
      'Com Marcos Ribeiro. Protocolo 1234-5678. Chegue 15 minutos antes\\, com um documento com foto.',
    )
  })

  it('lembrete um dia antes', () => {
    expect(propriedade(ics, 'TRIGGER')).toBe('-P1D')
    expect(propriedade(ics, 'ACTION')).toBe('DISPLAY')
  })

  it('link de download: data: URL de text/calendar e nome com o protocolo', () => {
    const endereco = enderecoDoIcs(CONSULTA, AGORA)
    expect(endereco.startsWith('data:text/calendar;charset=utf-8,')).toBe(true)
    expect(decodeURIComponent(endereco.split(',').slice(1).join(','))).toBe(ics)
    expect(nomeDoArquivoIcs(CONSULTA)).toBe('consulta-1234-5678.ics')
  })
})

describe('escape e dobra de linhas', () => {
  it('escapa barra invertida, ponto e vírgula, vírgula e quebra de linha', () => {
    expect(escaparTexto('a, b; c\\d\ne')).toBe('a\\, b\\; c\\\\d\\ne')
  })

  it('dobra em 75 bytes sem partir letras acentuadas, e a dobra desfeita devolve o texto', () => {
    const longa = `DESCRIPTION:${'ção '.repeat(40)}`
    const dobrada = dobrarLinha(longa)
    const partes = dobrada.split('\r\n')
    expect(partes.length).toBeGreaterThan(2)
    for (const parte of partes) expect(bytes(parte)).toBeLessThanOrEqual(75)
    for (const parte of partes.slice(1)) expect(parte.startsWith(' ')).toBe(true)
    expect(dobrada.replace(/\r\n /g, '')).toBe(longa)
    expect(dobrada).not.toContain('�')
  })

  it('linha curta fica como está', () => {
    expect(dobrarLinha('VERSION:2.0')).toBe('VERSION:2.0')
  })
})