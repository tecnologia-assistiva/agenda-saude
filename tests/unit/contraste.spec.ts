import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { hexParaRgb, lerTokensDeCor, razaoContraste } from '@/utils/contraste'

const TEXTO = 4.5
const NAO_TEXTO = 3

const PARES: [string, string, number][] = [
  ['cor-texto', 'cor-fundo', TEXTO],
  ['cor-texto', 'cor-superficie', TEXTO],
  ['cor-texto-suave', 'cor-fundo', TEXTO],
  ['cor-texto-suave', 'cor-superficie', TEXTO],
  ['cor-link', 'cor-fundo', TEXTO],
  ['cor-link', 'cor-superficie', TEXTO],
  ['cor-texto-institucional', 'cor-institucional', TEXTO],
  ['cor-botao-texto', 'cor-botao-fundo', TEXTO],
  ['cor-botao-texto', 'cor-botao-fundo-hover', TEXTO],
  ['cor-botao-borda', 'cor-fundo', NAO_TEXTO],
  ['cor-foco-texto', 'cor-foco-fundo', TEXTO],
  ['cor-erro', 'cor-fundo', TEXTO],
  ['cor-erro', 'cor-superficie', TEXTO],
  ['cor-sucesso', 'cor-fundo', TEXTO],
  ['cor-borda', 'cor-fundo', NAO_TEXTO],
  ['cor-borda', 'cor-superficie', NAO_TEXTO],
]

const FUNDOS_COM_FOCO = ['cor-fundo', 'cor-superficie', 'cor-institucional']
const TOKENS_DO_FOCO = ['cor-foco-fundo', 'cor-foco-barra']

const DECORATIVOS = ['cor-separador']

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

  it('todo token aparece em pelo menos um par conferido (ou é decorativo)', () => {
    const usados = new Set([
      ...PARES.flatMap(([frente, fundo]) => [frente, fundo]),
      ...FUNDOS_COM_FOCO,
      ...TOKENS_DO_FOCO,
      ...DECORATIVOS,
    ])
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

    it.each(FUNDOS_COM_FOCO)('o foco aparece sobre --%s (amarelo ou barra com 3:1)', (fundo) => {
      const tokens = temas[tema] ?? {}
      const corFundo = tokens[fundo] as string
      const [amarelo, barra] = TOKENS_DO_FOCO.map((t) => razaoContraste(tokens[t] as string, corFundo)) as [
        number,
        number,
      ]
      expect(
        Math.max(amarelo, barra),
        `amarelo ${amarelo.toFixed(2)}:1, barra ${barra.toFixed(2)}:1 sobre ${corFundo}`,
      ).toBeGreaterThanOrEqual(NAO_TEXTO)
    })
  })
})