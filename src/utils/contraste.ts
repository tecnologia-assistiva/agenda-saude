export type TokensPorTema = Record<string, Record<string, string>>

export function hexParaRgb(hex: string): [number, number, number] {
  const limpo = hex.trim().replace(/^#/, '')
  const completo =
    limpo.length === 3
      ? limpo
          .split('')
          .map((c) => c + c)
          .join('')
      : limpo
  if (!/^[0-9a-f]{6}$/i.test(completo)) {
    throw new Error(`Cor inválida: "${hex}". Use hexadecimal com 3 ou 6 dígitos.`)
  }
  return [0, 2, 4].map((i) => parseInt(completo.slice(i, i + 2), 16)) as [number, number, number]
}

function canalLinear(valor: number): number {
  const c = valor / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

export function luminanciaRelativa(hex: string): number {
  const [r, g, b] = hexParaRgb(hex).map(canalLinear) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function razaoContraste(corA: string, corB: string): number {
  const [clara, escura] = [luminanciaRelativa(corA), luminanciaRelativa(corB)].sort((a, b) => b - a) as [
    number,
    number,
  ]
  return (clara + 0.05) / (escura + 0.05)
}

export function lerTokensDeCor(css: string): TokensPorTema {
  const semComentarios = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const temas: TokensPorTema = {}
  const bloco = /\[data-tema="([a-z-]+)"\]\s*\{([^}]*)\}/g
  for (const [, tema, corpo] of semComentarios.matchAll(bloco)) {
    const tokens: Record<string, string> = {}
    for (const [, nome, valor] of (corpo ?? '').matchAll(/--(cor-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
      tokens[nome as string] = (valor as string).trim()
    }
    temas[tema as string] = tokens
  }
  return temas
}