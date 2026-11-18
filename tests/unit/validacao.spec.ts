import { describe, expect, it } from 'vitest'
import {
  validarCartaoSus,
  validarDadosPessoais,
  validarDataNascimento,
  validarNome,
  validarTelefone,
} from '@/utils/validacao'

const HOJE = new Date(2026, 10, 18) // 18/11/2026

describe('validação dos dados pessoais: cada mensagem diz como corrigir', () => {
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
    ['31/04/1980', 'Essa data não existe. Confira o dia e o mês.'],
    ['19/11/2026', 'A data de nascimento não pode ser no futuro.'],
    ['01/01/1890', 'Confira o ano de nascimento.'],
  ])('data "%s" → "%s"', (valor, mensagem) => {
    expect(validarDataNascimento(valor, HOJE)).toBe(mensagem)
  })

  it.each(['15/03/1980', '15031980', '1980-03-15', '18/11/2026', '29/02/2024'])('data "%s" é válida', (valor) => {
    expect(validarDataNascimento(valor, HOJE)).toBeNull()
  })

  it.each([
    ['', 'Digite um telefone com DDD.'],
    ['98765-4321', 'Digite o telefone com DDD, por exemplo (11) 98765-4321.'],
    ['0198765432', 'Confira o DDD. Ele tem 2 números, de 11 a 99.'],
    ['11887654321', 'Celular com 11 números começa com 9 depois do DDD.'],
  ])('telefone "%s" → "%s"', (valor, mensagem) => {
    expect(validarTelefone(valor)).toBe(mensagem)
  })

  it.each(['(11) 98765-4321', '+55 11 98765-4321', '1134567890'])('telefone "%s" é válido', (valor) => {
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
      telefone: 'Digite um telefone com DDD.',
    })
    expect(
      validarDadosPessoais(
        { nome: 'Maria da Silva', dataNascimento: '15/03/1980', telefone: '(11) 98765-4321', cartaoSus: '' },
        HOJE,
      ),
    ).toEqual({})
  })
})
