import { describe, expect, it } from 'vitest'
import { profissionais, profissionaisDaEspecialidade } from '@/servicos/catalogo'
import {
  chaveDoHorario,
  contarPorDia,
  diasLotados,
  estaOcupado,
  gerarHorariosLivres,
  horarioAindaValido,
  horarioDaChave,
  horariosParaEscolha,
  janelaDeAgendamento,
} from '@/servicos/horarios'
import { diaDaSemana } from '@/utils/datas'

/* A data de hoje é fixa nos testes: quarta-feira, 18/11/2026 (20/11 é feriado). */
const HOJE = '2026-11-18'
const TODOS = profissionais.map((p) => p.id)

describe('gerador de horários', () => {
  const livres = gerarHorariosLivres(HOJE, TODOS)

  it('janela de 30 dias: de amanhã até hoje + 30', () => {
    expect(janelaDeAgendamento(HOJE)).toEqual({ inicio: '2026-11-19', fim: '2026-12-18' })
    expect(livres.every((h) => h.data >= '2026-11-19' && h.data <= '2026-12-18')).toBe(true)
    expect(livres.length).toBeGreaterThan(100)
  })

  it('sem atendimento em fins de semana e feriados', () => {
    expect(livres.some((h) => [0, 6].includes(diaDaSemana(h.data)))).toBe(false)
    expect(livres.some((h) => h.data === '2026-11-20')).toBe(false)
  })

  it('dias lotados: o 2º e o 7º dia útil depois de hoje não têm vaga (o feriado não conta)', () => {
    expect([...diasLotados(HOJE)]).toEqual(['2026-11-23', '2026-11-30'])
    expect(livres.some((h) => h.data === '2026-11-23' || h.data === '2026-11-30')).toBe(false)
  })

  it('em ordem de data e hora', () => {
    const chaves = livres.map((h) => `${h.data} ${h.hora}`)
    expect(chaves).toEqual([...chaves].sort())
  })

  it('segue a grade semanal: Beatriz Campos atende só terça e quinta de manhã', () => {
    const beatriz = gerarHorariosLivres(HOJE, ['beatriz-campos'])
    expect(beatriz.length).toBeGreaterThan(0)
    expect(beatriz.every((h) => [2, 4].includes(diaDaSemana(h.data)) && h.hora < '12:00')).toBe(true)
  })

  it('ocupação parcial determinística: mesma agenda em toda chamada e de um dia para o outro', () => {
    expect(gerarHorariosLivres(HOJE, TODOS)).toEqual(livres)
    const amanha = gerarHorariosLivres('2026-11-19', TODOS)
    const emComum = livres.filter((h) => h.data >= '2026-11-20' && h.data !== '2026-11-23' && h.data !== '2026-11-30')
    const chavesDeAmanha = new Set(amanha.map(chaveDoHorario))
    // Um dia útil a mais muda quais dias ficam lotados; os outros horários continuam iguais.
    const lotadosDeAmanha = diasLotados('2026-11-19')
    expect(
      emComum.filter((h) => !lotadosDeAmanha.has(h.data)).every((h) => chavesDeAmanha.has(chaveDoHorario(h))),
    ).toBe(true)
  })

  it('cerca de metade dos horários fica ocupada (taxa de 50% no modelo), e nenhum ocupado aparece como livre', () => {
    expect(livres.some(estaOcupado)).toBe(false)
    const amostra = []
    for (let d = 1; d <= 28; d++) {
      for (const hora of ['08:00', '09:30', '11:00', '13:30', '15:00', '16:30']) {
        for (const profissionalId of TODOS) amostra.push({ data: `2027-02-${String(d).padStart(2, '0')}`, hora, profissionalId })
      }
    }
    const fracao = amostra.filter(estaOcupado).length / amostra.length
    expect(fracao).toBeGreaterThan(0.4)
    expect(fracao).toBeLessThan(0.6)
  })
})

describe('horários para escolher na etapa 3', () => {
  it('"Qualquer profissional": todos da especialidade, uma vez cada hora', () => {
    const lista = horariosParaEscolha(HOJE, 'clinica-geral', 'qualquer')
    const daClinica = profissionaisDaEspecialidade('clinica-geral').map((p) => p.id)
    expect(lista.every((h) => daClinica.includes(h.profissionalId))).toBe(true)
    const chaves = lista.map((h) => `${h.data}|${h.hora}`)
    expect(new Set(chaves).size).toBe(chaves.length)
  })

  it('profissional escolhido: só os horários dele; profissional de outra especialidade: nenhum', () => {
    expect(horariosParaEscolha(HOJE, 'clinica-geral', 'marcos-ribeiro').every((h) => h.profissionalId === 'marcos-ribeiro')).toBe(true)
    expect(horariosParaEscolha(HOJE, 'pediatria', 'marcos-ribeiro')).toEqual([])
  })

  it('horário guardado continua válido só se ainda estiver livre, na janela e com a mesma escolha', () => {
    const [primeiro] = horariosParaEscolha(HOJE, 'clinica-geral', 'qualquer')
    if (!primeiro) throw new Error('sem horários')
    expect(horarioAindaValido(primeiro, HOJE, 'clinica-geral', 'qualquer')).toBe(true)
    expect(horarioAindaValido(primeiro, HOJE, 'clinica-geral', primeiro.profissionalId)).toBe(true)
    expect(horarioAindaValido(primeiro, primeiro.data, 'clinica-geral', 'qualquer')).toBe(false) // já passou
    expect(horarioAindaValido(primeiro, HOJE, 'pediatria', 'qualquer')).toBe(false)
    expect(horarioAindaValido({ ...primeiro, hora: '12:15' }, HOJE, 'clinica-geral', 'qualquer')).toBe(false)
  })

  it('conta horários por dia e converte a chave do horário', () => {
    const lista = horariosParaEscolha(HOJE, 'dentista', 'rafael-teixeira')
    const contagem = contarPorDia(lista)
    expect([...contagem.values()].reduce((a, b) => a + b, 0)).toBe(lista.length)
    const [h] = lista
    if (!h) throw new Error('sem horários')
    expect(horarioDaChave(chaveDoHorario(h))).toEqual(h)
    expect(horarioDaChave('quebrado')).toBeNull()
  })
})
