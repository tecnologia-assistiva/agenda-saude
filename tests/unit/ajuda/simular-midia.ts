import { vi } from 'vitest'

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