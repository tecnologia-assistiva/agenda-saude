import AxeBuilder from '@axe-core/playwright'
import { expect, type Locator, type Page } from '@playwright/test'

export const HOJE = new Date('2026-11-18T10:00:00-03:00')

export const TEMAS = ['claro', 'escuro', 'alto-contraste'] as const
export type Tema = (typeof TEMAS)[number]

export const DADOS = { nome: 'Maria da Silva', dataNascimento: '15/03/1980', telefone: '(11) 98765-4321', cartaoSus: '' }

export function rascunho(parcial: Record<string, unknown> = {}) {
  return {
    dados: { nome: '', dataNascimento: '', telefone: '', cartaoSus: '' },
    especialidadeId: null,
    profissionalId: null,
    horario: null,
    remarcando: null,
    usouDadosSalvos: false,
    ...parcial,
  }
}

export const RASCUNHO_ETAPA_3 = rascunho({ dados: DADOS, especialidadeId: 'clinica-geral', profissionalId: 'qualquer' })

export function consulta(protocolo: string, data: string, hora: string) {
  return {
    protocolo,
    dados: DADOS,
    especialidadeId: 'clinica-geral',
    profissionalEscolhido: 'helena-duarte',
    horario: { data, hora, profissionalId: 'helena-duarte' },
    remarcacoes: 0,
  }
}

export const CONSULTAS = [consulta('1234-5678', '2026-11-25', '09:00'), consulta('2345-6789', '2026-12-02', '14:00')]

export interface Estado {
  configuracoes?: Record<string, unknown>
  rascunho?: unknown
  consultas?: unknown[]
  dadosPessoais?: unknown
}

export async function preparar(page: Page, estado: Estado = {}): Promise<void> {
  await page.clock.setFixedTime(HOJE)
  const chaves: Record<string, unknown> = {
    configuracoes: estado.configuracoes,
    rascunho: estado.rascunho,
    consultas: estado.consultas,
    'dados-pessoais': estado.dadosPessoais,
  }
  await page.addInitScript((dados) => {
    if (sessionStorage.getItem('e2e:preparado')) return
    sessionStorage.setItem('e2e:preparado', '1')
    for (const [chave, valor] of Object.entries(dados)) {
      if (valor !== undefined) localStorage.setItem(`agenda-saude:${chave}`, JSON.stringify({ versao: 1, dados: valor }))
    }
  }, chaves)
}

export async function abrir(page: Page, rota: string): Promise<void> {
  await page.goto(rota)
  await expect(page.locator('main h1')).toBeVisible()
}

export async function verificarAxe(page: Page, contexto: string): Promise<void> {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze()
  const resumo = violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)
  expect(resumo, `axe em "${contexto}"`).toEqual([])
}

export async function teclarAte(page: Page, alvo: Locator, tecla = 'Tab', maximo = 60): Promise<void> {
  for (let i = 0; i < maximo; i++) {
    await page.keyboard.press(tecla)
    if (await alvo.evaluate((el) => el === document.activeElement).catch(() => false)) return
  }
  throw new Error(`"${tecla}" não chegou em ${alvo}`)
}

export async function escolherPrimeiroHorario(page: Page): Promise<void> {
  await abrir(page, 'agendar/data-e-horario')
  await page.locator('#horario-proximos input[type="radio"]').first().check()
  await page.getByRole('button', { name: 'Continuar' }).click()
  await expect(page).toHaveURL(/agendar\/revisao$/)
}

export async function confirmar(page: Page): Promise<void> {
  await page.getByRole('button', { name: /^Confirmar/ }).click()
  await expect(page).toHaveURL(/agendar\/confirmacao$/)
  await expect(page.locator('main h1')).toContainText('Consulta')
}

export async function escolherDiaNoCalendario(page: Page): Promise<void> {
  await page.getByLabel('Escolher no calendário').check()
  await page.locator('.calendario__dia--livre').first().click()
  await expect(page.locator('#horario-do-dia')).toBeVisible()
}

export async function rolagemHorizontal(page: Page): Promise<{ excesso: number; culpados: string[] }> {
  return page.evaluate(() => {
    const raiz = document.documentElement
    const limite = raiz.clientWidth
    const culpados = [...document.querySelectorAll<HTMLElement>('body *')]
      .filter((el) => el.getClientRects().length > 0 && el.getBoundingClientRect().right > limite + 0.5)
      .filter((el) => ![...el.children].some((filho) => filho.getBoundingClientRect().right > limite + 0.5))
      .slice(0, 5)
      .map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')} "${(el.textContent ?? '').trim().slice(0, 30)}"`)
    return { excesso: raiz.scrollWidth - raiz.clientWidth, culpados }
  })
}

export async function corDoToken(page: Page, token: string): Promise<string> {
  return page.evaluate((nome) => {
    const amostra = document.createElement('span')
    amostra.style.color = `var(--${nome})`
    document.body.append(amostra)
    const cor = getComputedStyle(amostra).color
    amostra.remove()
    return cor
  }, token)
}