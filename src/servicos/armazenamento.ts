/**
 * Acesso ao localStorage com prefixo, versão e try/catch.
 * O localStorage pode falhar (modo privado, cota cheia, bloqueado pelo navegador): nesse caso
 * a leitura devolve null e a gravação devolve false, e quem chamou decide como avisar.
 */

const PREFIXO = 'agenda-saude:'
export const VERSAO_DADOS = 1

interface Envelope {
  versao: number
  dados: unknown
}

function ehEnvelope(valor: unknown): valor is Envelope {
  return typeof valor === 'object' && valor !== null && 'versao' in valor && 'dados' in valor
}

/** Lê e valida um valor salvo. `validar` devolve null quando os dados não servem. */
export function lerDados<T>(chave: string, validar: (dados: unknown) => T | null): T | null {
  try {
    const bruto = window.localStorage.getItem(PREFIXO + chave)
    if (bruto === null) return null
    const envelope: unknown = JSON.parse(bruto)
    if (!ehEnvelope(envelope) || envelope.versao !== VERSAO_DADOS) return null
    return validar(envelope.dados)
  } catch {
    return null
  }
}

/** Salva um valor. Devolve false se o navegador não deixou salvar. */
export function salvarDados(chave: string, dados: unknown): boolean {
  try {
    const envelope: Envelope = { versao: VERSAO_DADOS, dados }
    window.localStorage.setItem(PREFIXO + chave, JSON.stringify(envelope))
    return true
  } catch {
    return false
  }
}

export function removerDados(chave: string): boolean {
  try {
    window.localStorage.removeItem(PREFIXO + chave)
    return true
  } catch {
    return false
  }
}
