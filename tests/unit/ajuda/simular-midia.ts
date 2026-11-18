import { vi } from 'vitest'

/**
 * O jsdom não tem matchMedia. Simula as preferências do sistema que estiverem em `ativas`,
 * por exemplo ['prefers-color-scheme: dark', 'prefers-reduced-motion: reduce'].
 */
export function simularMidia(ativas: string[]) {
  const matchMedia = vi.fn((consulta: string) => ({
    matches: ativas.some((ativa) => consulta.includes(ativa)),
    media: consulta,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
  Object.defineProperty(window, 'matchMedia', { configurable: true, writable: true, value: matchMedia })
  return matchMedia
}
