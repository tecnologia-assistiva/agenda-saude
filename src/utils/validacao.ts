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

/** Lê dados pessoais salvos (localStorage), trocando por vazio o que não for texto. */
export function dadosPessoaisDe(valor: unknown): DadosPessoais {
  const d = (typeof valor === 'object' && valor !== null ? valor : {}) as Record<string, unknown>
  const texto = (v: unknown) => (typeof v === 'string' ? v : '')
  return { nome: texto(d.nome), dataNascimento: texto(d.dataNascimento), telefone: texto(d.telefone), cartaoSus: texto(d.cartaoSus) }
}

export const IDADE_MAXIMA = 130

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

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
  if (!dataExiste(data)) {
    const diasNoMes = new Date(data.ano, data.mes, 0).getDate()
    return `${MESES[data.mes - 1]} de ${data.ano} tem ${diasNoMes} dias. Confira o dia.`
  }
  const nascimento = new Date(data.ano, data.mes - 1, data.dia)
  const inicioDeHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
  if (nascimento > inicioDeHoje) return 'A data de nascimento não pode ser depois de hoje. Confira o dia, o mês e o ano.'
  if (hoje.getFullYear() - data.ano > IDADE_MAXIMA) return 'Confira o ano de nascimento.'
  return null
}

/**
 * Celular: DDD + 9 números começando com 9. Fixo: DDD + 8 números começando com 2, 3, 4 ou 5.
 */
export function validarTelefone(valor: string): string | null {
  if (!valor.trim()) return 'Digite um telefone com DDD. Pode ser celular ou fixo.'
  const digitos = normalizarTelefone(valor)
  if (digitos.length < 10 || digitos.length > 11) {
    return 'Digite o DDD e o número, por exemplo (11) 98765-4321 ou (11) 3456-7890.'
  }
  if (Number(digitos.slice(0, 2)) < 11) return 'Confira o DDD. Ele tem 2 números, de 11 a 99.'
  const numero = digitos.slice(2)
  const celularValido = numero.length === 9 && numero.startsWith('9')
  const fixoValido = numero.length === 8 && /^[2-5]/.test(numero)
  if (!celularValido && !fixoValido) {
    return 'Confira o número: celular tem 9 números e começa com 9; fixo tem 8 e começa com 2, 3, 4 ou 5.'
  }
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
