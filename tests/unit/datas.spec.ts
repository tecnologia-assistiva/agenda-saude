import { describe, expect, it } from 'vitest'
import {
  adicionarDias,
  adicionarMeses,
  diaDaSemana,
  formatarDataLonga,
  formatarMesAno,
  paraISO,
  semanasDoMes,
} from '@/utils/datas'

describe('datas', () => {
  it('converte para AAAA-MM-DD no horário local', () => {
    expect(paraISO(new Date(2026, 10, 5, 23, 59))).toBe('2026-11-05')
  })

  it('soma dias atravessando meses e anos', () => {
    expect(adicionarDias('2026-11-30', 1)).toBe('2026-12-01')
    expect(adicionarDias('2026-12-31', 1)).toBe('2027-01-01')
    expect(adicionarDias('2026-11-01', -1)).toBe('2026-10-31')
  })

  it('soma meses mantendo o dia, ou o último dia do mês mais curto', () => {
    expect(adicionarMeses('2026-11-19', 1)).toBe('2026-12-19')
    expect(adicionarMeses('2026-11-19', -1)).toBe('2026-10-19')
    expect(adicionarMeses('2027-01-31', 1)).toBe('2027-02-28')
  })

  it('dia da semana: 0 é domingo', () => {
    expect(diaDaSemana('2026-11-22')).toBe(0)
    expect(diaDaSemana('2026-11-25')).toBe(3)
  })

  it('semanas do mês começam no domingo, com vazios nas pontas', () => {
    const novembro = semanasDoMes({ ano: 2026, mes: 11 })
    expect(novembro[0]?.[0]).toBe('2026-11-01')
    expect(novembro).toHaveLength(5)
    const dezembro = semanasDoMes({ ano: 2026, mes: 12 })
    expect(dezembro[0]?.slice(0, 3)).toEqual([null, null, '2026-12-01'])
    expect(dezembro.every((semana) => semana.length === 7)).toBe(true)
  })

  it('formata em pt-BR', () => {
    expect(formatarDataLonga('2026-11-25')).toBe('quarta-feira, 25 de novembro')
    expect(formatarMesAno({ ano: 2026, mes: 11 })).toBe('novembro de 2026')
  })
})