/*
 * Formatação dos campos ao sair deles (blur), nunca durante a digitação: assim o leitor de tela
 * não ouve o texto mudando, e colar funciona em qualquer formato.
 * Se não der para interpretar o valor, ele volta como foi digitado (só sem espaços nas pontas);
 * a validação ao enviar explica o que corrigir.
 */

export function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, '')
}

/** Tira espaços repetidos e das pontas. */
export function formatarNome(valor: string): string {
  return valor.replace(/\s+/g, ' ').trim()
}

export interface DataSimples {
  dia: number
  mes: number
  ano: number
}

/**
 * Entende datas como 15/03/1980, 15-3-1980, 15.03.1980, 15 03 1980, 15031980 e 1980-03-15
 * (formato que o preenchimento automático do navegador às vezes usa).
 * Só confere o formato; se a data existe é com `dataExiste`.
 */
export function interpretarData(valor: string): DataSimples | null {
  const texto = valor.trim()
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(texto)
  if (iso) return { ano: Number(iso[1]), mes: Number(iso[2]), dia: Number(iso[3]) }
  const separada = /^(\d{1,2})\s*[/.\-\s]\s*(\d{1,2})\s*[/.\-\s]\s*(\d{4})$/.exec(texto)
  if (separada) return { dia: Number(separada[1]), mes: Number(separada[2]), ano: Number(separada[3]) }
  const corrida = /^(\d{2})(\d{2})(\d{4})$/.exec(texto)
  if (corrida) return { dia: Number(corrida[1]), mes: Number(corrida[2]), ano: Number(corrida[3]) }
  return null
}

export function dataExiste({ dia, mes, ano }: DataSimples): boolean {
  const data = new Date(ano, mes - 1, dia)
  return data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia
}

const doisDigitos = (n: number) => String(n).padStart(2, '0')

export function formatarData(valor: string): string {
  const data = interpretarData(valor)
  if (!data || !dataExiste(data)) return valor.trim()
  return `${doisDigitos(data.dia)}/${doisDigitos(data.mes)}/${data.ano}`
}

/** Só os dígitos com DDD; tira o +55 (ou 0 de operadora) se vier junto. */
export function normalizarTelefone(valor: string): string {
  let digitos = somenteDigitos(valor)
  if ((digitos.length === 12 || digitos.length === 13) && digitos.startsWith('55')) digitos = digitos.slice(2)
  if ((digitos.length === 11 || digitos.length === 12) && digitos.startsWith('0')) digitos = digitos.slice(1)
  return digitos
}

export function formatarTelefone(valor: string): string {
  const digitos = normalizarTelefone(valor)
  if (digitos.length === 11) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`
  if (digitos.length === 10) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`
  return valor.trim()
}

/** Cartão SUS: 15 números, mostrados em grupos de 3, 4, 4 e 4. */
export function formatarCartaoSus(valor: string): string {
  const digitos = somenteDigitos(valor)
  if (digitos.length !== 15) return valor.trim()
  return `${digitos.slice(0, 3)} ${digitos.slice(3, 7)} ${digitos.slice(7, 11)} ${digitos.slice(11)}`
}
