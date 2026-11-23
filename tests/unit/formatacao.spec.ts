import { describe, expect, it } from 'vitest'
import {
  formatarCartaoSus,
  formatarData,
  formatarNome,
  formatarTelefone,
  interpretarData,
  mascararCartaoSus,
  mascararData,
  mascararTelefone,
  normalizarTelefone,
} from '@/utils/formatacao'

describe('data colada em vários formatos', () => {
  it.each([
    ['15/03/1980', '15/03/1980'],
    ['15-03-1980', '15/03/1980'],
    ['15.03.1980', '15/03/1980'],
    ['15 03 1980', '15/03/1980'],
    ['15 / 03 / 1980', '15/03/1980'],
    ['15031980', '15/03/1980'],
    ['5/3/1980', '05/03/1980'],
    ['1980-03-15', '15/03/1980'],
    ['  15/03/1980  ', '15/03/1980'],
  ])('"%s" vira "%s"', (colado, esperado) => {
    expect(formatarData(colado)).toBe(esperado)
  })

  it.each(['31/02/1980', '15/03/80', 'quinze de março', ''])('"%s" não é interpretado e fica como está', (valor) => {
    expect(formatarData(valor)).toBe(valor.trim())
  })

  it('separa dia, mês e ano', () => {
    expect(interpretarData('1980-03-15')).toEqual({ dia: 15, mes: 3, ano: 1980 })
    expect(interpretarData('abc')).toBeNull()
  })
})

describe('telefone colado em vários formatos', () => {
  it.each([
    ['11987654321', '(11) 98765-4321'],
    ['(11) 98765-4321', '(11) 98765-4321'],
    ['11 98765 4321', '(11) 98765-4321'],
    ['+55 11 98765-4321', '(11) 98765-4321'],
    ['55 (11) 98765-4321', '(11) 98765-4321'],
    ['011 98765-4321', '(11) 98765-4321'],
    ['1134567890', '(11) 3456-7890'],
    ['+55 11 3456-7890', '(11) 3456-7890'],
    ['55987654321', '(55) 98765-4321'],
  ])('"%s" vira "%s"', (colado, esperado) => {
    expect(formatarTelefone(colado)).toBe(esperado)
  })

  it('número incompleto fica como foi digitado', () => {
    expect(formatarTelefone(' 98765-432 ')).toBe('98765-432')
  })

  it('normaliza para só os dígitos com DDD', () => {
    expect(normalizarTelefone('+55 (21) 99999-0000')).toBe('21999990000')
  })
})

describe('cartão SUS e nome', () => {
  it.each([
    ['123456789012345', '123 4567 8901 2345'],
    ['123.4567.8901.2345', '123 4567 8901 2345'],
    ['123 4567 8901 2345', '123 4567 8901 2345'],
  ])('cartão "%s" vira "%s"', (colado, esperado) => {
    expect(formatarCartaoSus(colado)).toBe(esperado)
  })

  it('cartão com quantidade errada de números fica como está', () => {
    expect(formatarCartaoSus('12345')).toBe('12345')
  })

  it('nome perde os espaços repetidos e das pontas', () => {
    expect(formatarNome('  Maria   da  Silva ')).toBe('Maria da Silva')
  })
})

describe('máscara enquanto digita: só números, com limite', () => {
  it.each([
    ['1', '1'],
    ['15', '15'],
    ['150', '15/0'],
    ['1503', '15/03'],
    ['15031', '15/03/1'],
    ['15031980', '15/03/1980'],
    ['150319801', '15/03/1980'],
    ['15/03/1980', '15/03/1980'],
    ['15a03b1980', '15/03/1980'],
    ['1980-03-15', '15/03/1980'],
    ['abc', ''],
  ])('data "%s" vira "%s"', (digitado, esperado) => {
    expect(mascararData(digitado)).toBe(esperado)
  })

  it.each([
    ['1', '(1'],
    ['11', '(11'],
    ['119', '(11) 9'],
    ['113456', '(11) 3456'],
    ['1134567', '(11) 3456-7'],
    ['1134567890', '(11) 3456-7890'],
    ['11987654321', '(11) 98765-4321'],
    ['119876543210', '(11) 98765-4321'],
    ['tel: 11 98765 4321', '(11) 98765-4321'],
    ['+55 11 98765-4321', '(11) 98765-4321'],
    ['+55 11 3456-7890', '(11) 3456-7890'],
    ['011 98765-4321', '(11) 98765-4321'],
    ['55987654321', '(55) 98765-4321'],
    ['abc', ''],
  ])('telefone "%s" vira "%s"', (digitado, esperado) => {
    expect(mascararTelefone(digitado)).toBe(esperado)
  })

  it.each([
    ['123', '123'],
    ['1234', '123 4'],
    ['12345678', '123 4567 8'],
    ['123456789012345', '123 4567 8901 2345'],
    ['1234567890123456789', '123 4567 8901 2345'],
    ['123.4567.8901.2345', '123 4567 8901 2345'],
    ['cartão 12a3', '123'],
  ])('cartão SUS "%s" vira "%s"', (digitado, esperado) => {
    expect(mascararCartaoSus(digitado)).toBe(esperado)
  })
})