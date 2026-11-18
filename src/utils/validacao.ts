/*
 * Validação dos dados pessoais (etapa 1). Roda só ao enviar o formulário.
 * Cada mensagem diz o que fazer para corrigir (WCAG 3.3.3), em frase curta.
 */
import {
  dataExiste,
  interpretarData,
  normalizarTelefone,
  somenteDigitos,
  formatarNome,
} from './formatacao'

export interface DadosPessoais {
  nome: string
  dataNascimento: string
  telefone: string
  cartaoSus: string
}

export type ErrosDe<T> = Partial<Record<keyof T, string>>

export const IDADE_MAXIMA = 130

export function validarNome(valor: string): string | null {
  const nome = formatarNome(valor)
  if (!nome) return 'Digite seu nome completo.'
  if (nome.length < 2) return 'Digite o nome completo, com pelo menos 2 letras.'
  if (nome.length > 120) return 'O nome pode ter até 120 letras. Abrevie o nome do meio, se precisar.'
  return null
}

export function validarDataNascimento(valor: string, hoje: Date = new Date()): string | null {
  if (!valor.trim()) return 'Digite sua data de nascimento.'
  if (/^\d{1,2}\D\d{1,2}\D\d{2}$/.test(valor.trim())) return 'Digite o ano com 4 números, por exemplo 15/03/1980.'
  const data = interpretarData(valor)
  if (!data) return 'Digite a data com dia, mês e ano, por exemplo 15/03/1980.'
  if (data.mes < 1 || data.mes > 12) return 'O mês vai de 1 a 12. Confira a data.'
  if (!dataExiste(data)) return 'Essa data não existe. Confira o dia e o mês.'
  const nascimento = new Date(data.ano, data.mes - 1, data.dia)
  const inicioDeHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
  if (nascimento > inicioDeHoje) return 'A data de nascimento não pode ser no futuro.'
  if (hoje.getFullYear() - data.ano > IDADE_MAXIMA) return 'Confira o ano de nascimento.'
  return null
}

export function validarTelefone(valor: string): string | null {
  if (!valor.trim()) return 'Digite um telefone com DDD.'
  const digitos = normalizarTelefone(valor)
  if (digitos.length < 10 || digitos.length > 11) {
    return 'Digite o telefone com DDD, por exemplo (11) 98765-4321.'
  }
  if (Number(digitos.slice(0, 2)) < 11) return 'Confira o DDD. Ele tem 2 números, de 11 a 99.'
  if (digitos.length === 11 && digitos[2] !== '9') return 'Celular com 11 números começa com 9 depois do DDD.'
  return null
}

/** Opcional: vazio é válido. */
export function validarCartaoSus(valor: string): string | null {
  if (!valor.trim()) return null
  if (somenteDigitos(valor).length !== 15) return 'O cartão SUS tem 15 números. Confira ou deixe em branco.'
  return null
}

export function validarDadosPessoais(dados: DadosPessoais, hoje: Date = new Date()): ErrosDe<DadosPessoais> {
  const erros: ErrosDe<DadosPessoais> = {}
  const nome = validarNome(dados.nome)
  const nascimento = validarDataNascimento(dados.dataNascimento, hoje)
  const telefone = validarTelefone(dados.telefone)
  const cartao = validarCartaoSus(dados.cartaoSus)
  if (nome) erros.nome = nome
  if (nascimento) erros.dataNascimento = nascimento
  if (telefone) erros.telefone = telefone
  if (cartao) erros.cartaoSus = cartao
  return erros
}
