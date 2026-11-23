import { describe, expect, it } from 'vitest'
import {
  validarCartaoSus,
  validarDadosPessoais,
  validarDataNascimento,
  validarNome,
  validarTelefone,
} from '@/utils/validacao'

const HOJE = new Date(2026, 10, 18) // 18/11/2026
const NUMERO_ERRADO =
  'Confira o número: celular tem 9 números e começa com 9; fixo tem 8 e começa com 2, 3, 4 ou 5.'

describe('validação dos dados pessoais: cada mensagem diz como corrigir', () => {
  it.each(["Ana-Lúcia D'Ávila", 'Ana-Lúcia D’Ávila', 'José Conceição', 'Mãe Joana', 'Ñandu Øresund Çelik'])(
    'nome "%s" com acento, hífen ou apóstrofo é aceito',
    (nome) => {
      expect(validarNome(nome)).toBeNull()
    },
  )

  it('nome', () => {
    expect(validarNome('')).toBe('Digite seu nome completo.')
    expect(validarNome('   ')).toBe('Digite seu nome completo.')
    expect(validarNome('A')).toContain('pelo menos 2 letras')
    expect(validarNome('x'.repeat(121))).toContain('até 120 letras')
    expect(validarNome('Maria da Silva')).toBeNull()
  })

  it.each([
    ['', 'Digite sua data de nascimento.'],
    ['15/03/80', 'Digite o ano com 4 números, por exemplo 15/03/1980.'],
    ['março de 1980', 'Digite a data com dia, mês e ano, por exemplo 15/03/1980.'],
    ['15/13/1980', 'O mês vai de 1 a 12. Confira a data.'],
    ['31/04/1980', 'Abril de 1980 tem 30 dias. Confira o dia.'],
    ['31/02/1990', 'Fevereiro de 1990 tem 28 dias. Confira o dia.'],
    ['30/02/2024', 'Fevereiro de 2024 tem 29 dias. Confira o dia.'],
    ['00/03/1980', 'Março de 1980 tem 31 dias. Confira o dia.'],
    ['19/11/2026', 'A data de nascimento não pode ser depois de hoje. Confira o dia, o mês e o ano.'],
    ['15/03/2030', 'A data de nascimento não pode ser depois de hoje. Confira o dia, o mês e o ano.'],
    ['01/01/1890', 'Confira o ano de nascimento.'],
  ])('data "%s" → "%s"', (valor, mensagem) => {
    expect(validarDataNascimento(valor, HOJE)).toBe(mensagem)
  })

  it.each(['15/03/1980', '15031980', '1980-03-15', '18/11/2026', '29/02/2024'])('data "%s" é válida', (valor) => {
    expect(validarDataNascimento(valor, HOJE)).toBeNull()
  })

  it.each([
    ['', 'Digite um telefone com DDD. Pode ser celular ou fixo.'],
    ['98765-4321', 'Digite o DDD e o número, por exemplo (11) 98765-4321 ou (11) 3456-7890.'],
    ['0198765432', 'Confira o DDD. Ele tem 2 números, de 11 a 99.'],
    ['11887654321', NUMERO_ERRADO],
    ['1167654321', NUMERO_ERRADO],
    ['1112345678', NUMERO_ERRADO],
    ['1198765432', NUMERO_ERRADO],
  ])('telefone "%s" → "%s"', (valor, mensagem) => {
    expect(validarTelefone(valor)).toBe(mensagem)
  })

  it.each([
    ['celular', '(11) 98765-4321'],
    ['celular com +55', '+55 11 98765-4321'],
    ['fixo começando com 2', '(21) 2345-6789'],
    ['fixo começando com 3', '1134567890'],
    ['fixo começando com 4', '(51) 4567-8901'],
    ['fixo começando com 5', '+55 61 5678-9012'],
  ])('telefone %s "%s" é válido', (_tipo, valor) => {
    expect(validarTelefone(valor)).toBeNull()
  })

  it('cartão SUS é opcional, mas se vier precisa ter 15 números', () => {
    expect(validarCartaoSus('')).toBeNull()
    expect(validarCartaoSus('123 4567 8901 2345')).toBeNull()
    expect(validarCartaoSus('1234')).toBe('O cartão SUS tem 15 números. Confira ou deixe em branco.')
  })

  it('junta os erros de todos os campos', () => {
    expect(validarDadosPessoais({ nome: '', dataNascimento: '', telefone: '', cartaoSus: '' }, HOJE)).toEqual({
      nome: 'Digite seu nome completo.',
      dataNascimento: 'Digite sua data de nascimento.',
      telefone: 'Digite um telefone com DDD. Pode ser celular ou fixo.',
    })
    expect(
      validarDadosPessoais(
        { nome: 'Maria da Silva', dataNascimento: '15/03/1980', telefone: '(11) 98765-4321', cartaoSus: '' },
        HOJE,
      ),
    ).toEqual({})
  })
})
