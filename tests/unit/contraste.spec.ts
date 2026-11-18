import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { hexParaRgb, lerTokensDeCor, razaoContraste } from '@/utils/contraste'

/*
 * Confere o contraste dos tokens de cor de cada tema (WCAG 1.4.3 e 1.4.11).
 * Cada par é [frente, fundo, mínimo]. Ao criar um token novo, inclua os pares em que ele é usado:
 * o último teste falha se algum token ficar sem par.
 */
const TEXTO = 4.5
const NAO_TEXTO = 3

const PARES: [string, string, number][] = [
  // Texto comum
  ['cor-texto', 'cor-fundo', TEXTO],
  ['cor-texto', 'cor-superficie', TEXTO],
  ['cor-texto', 'cor-destaque-fundo', TEXTO],
  ['cor-texto', 'cor-aviso-fundo', TEXTO],
  ['cor-texto', 'cor-erro-fundo', TEXTO],
  ['cor-texto', 'cor-sucesso-fundo', TEXTO],
  ['cor-texto-suave', 'cor-fundo', TEXTO],
  ['cor-texto-suave', 'cor-superficie', TEXTO],
  ['cor-texto-suave', 'cor-destaque-fundo', TEXTO],
  // Links e botões
  ['cor-link', 'cor-fundo', TEXTO],
  ['cor-link', 'cor-superficie', TEXTO],
  ['cor-link', 'cor-destaque-fundo', TEXTO],
  ['cor-link', 'cor-aviso-fundo', TEXTO],
  ['cor-texto-sobre-primaria', 'cor-primaria', TEXTO],
  ['cor-texto-sobre-primaria', 'cor-primaria-forte', TEXTO],
  // Mensagens
  ['cor-erro', 'cor-fundo', TEXTO],
  ['cor-erro', 'cor-superficie', TEXTO],
  ['cor-erro', 'cor-erro-fundo', TEXTO],
  ['cor-sucesso', 'cor-fundo', TEXTO],
  ['cor-sucesso', 'cor-sucesso-fundo', TEXTO],
  // Barra de acessibilidade
  ['cor-barra-texto', 'cor-barra-fundo', TEXTO],
  ['cor-barra-foco', 'cor-barra-fundo', NAO_TEXTO],
  // Bordas de campos, botões e opções marcadas
  ['cor-borda', 'cor-fundo', NAO_TEXTO],
  ['cor-borda', 'cor-superficie', NAO_TEXTO],
  ['cor-borda', 'cor-destaque-fundo', NAO_TEXTO],
  ['cor-primaria', 'cor-fundo', NAO_TEXTO],
  ['cor-primaria', 'cor-superficie', NAO_TEXTO],
  ['cor-aviso-borda', 'cor-aviso-fundo', NAO_TEXTO],
  ['cor-aviso-borda', 'cor-fundo', NAO_TEXTO],
  // Contorno de foco: fica afastado do elemento (outline-offset), sobre o fundo onde ele está
  ['cor-foco', 'cor-fundo', NAO_TEXTO],
  ['cor-foco', 'cor-superficie', NAO_TEXTO],
  ['cor-foco', 'cor-destaque-fundo', NAO_TEXTO],
  ['cor-foco', 'cor-aviso-fundo', NAO_TEXTO],
  ['cor-foco', 'cor-erro-fundo', NAO_TEXTO],
]

// Lido do disco: no Vitest, arquivos .css importados (mesmo com ?raw) viram texto vazio.
const tokensCss = readFileSync(resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8')
const temas = lerTokensDeCor(tokensCss)
const nomesTemas = Object.keys(temas)

describe('cálculo de contraste', () => {
  it('converte hexadecimal de 3 e 6 dígitos', () => {
    expect(hexParaRgb('#fff')).toEqual([255, 255, 255])
    expect(hexParaRgb('#0a4f96')).toEqual([10, 79, 150])
    expect(() => hexParaRgb('azul')).toThrow()
  })

  it('confere com valores conhecidos da WCAG', () => {
    expect(razaoContraste('#000000', '#ffffff')).toBeCloseTo(21, 5)
    expect(razaoContraste('#ffffff', '#ffffff')).toBeCloseTo(1, 5)
    // #767676 sobre branco é o cinza mais claro que ainda passa em 4,5:1
    expect(razaoContraste('#767676', '#ffffff')).toBeGreaterThanOrEqual(4.5)
    expect(razaoContraste('#777777', '#ffffff')).toBeLessThan(4.5)
  })
})

describe('tokens de cor (styles/tokens.css)', () => {
  it('define os três temas', () => {
    expect(nomesTemas.sort()).toEqual(['alto-contraste', 'claro', 'escuro'])
  })

  it('todos os temas definem os mesmos tokens', () => {
    const referencia = Object.keys(temas.claro ?? {}).sort()
    for (const tema of nomesTemas) {
      expect(Object.keys(temas[tema] ?? {}).sort(), `tema ${tema}`).toEqual(referencia)
    }
  })

  it('todos os valores são hexadecimais', () => {
    for (const [tema, tokens] of Object.entries(temas)) {
      for (const [nome, valor] of Object.entries(tokens)) {
        expect(valor, `${tema}: --${nome}`).toMatch(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
      }
    }
  })

  it('todo token aparece em pelo menos um par conferido', () => {
    const usados = new Set(PARES.flatMap(([frente, fundo]) => [frente, fundo]))
    const semPar = Object.keys(temas.claro ?? {}).filter((nome) => !usados.has(nome))
    expect(semPar).toEqual([])
  })

  describe.each(nomesTemas)('tema %s', (tema) => {
    it.each(PARES)('--%s sobre --%s tem pelo menos %s:1', (frente, fundo, minimo) => {
      const tokens = temas[tema] ?? {}
      const corFrente = tokens[frente]
      const corFundo = tokens[fundo]
      expect(corFrente, `--${frente} não existe`).toBeDefined()
      expect(corFundo, `--${fundo} não existe`).toBeDefined()
      const razao = razaoContraste(corFrente as string, corFundo as string)
      expect(razao, `${corFrente} sobre ${corFundo} = ${razao.toFixed(2)}:1`).toBeGreaterThanOrEqual(minimo)
    })
  })
})
