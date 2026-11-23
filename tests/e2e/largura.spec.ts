import { expect, test, type Page } from '@playwright/test'
import {
  CONSULTAS,
  RASCUNHO_ETAPA_3,
  abrir,
  confirmar,
  escolherDiaNoCalendario,
  escolherPrimeiroHorario,
  preparar,
  rolagemHorizontal,
} from './ajuda'

/*
 * WCAG 1.4.10 (reflow): em 320 px de largura nenhuma tela rola na horizontal, nem com texto em 200%
 * e espaçamento ampliado ligados pela tela de Configurações (mais exigente que o critério).
 */

test.use({ viewport: { width: 320, height: 640 } })

async function semRolagem(page: Page, tela: string) {
  const { excesso, culpados } = await rolagemHorizontal(page)
  expect(excesso, `${tela}: passa ${excesso}px da largura. Culpados: ${culpados.join(' || ')}`).toBeLessThanOrEqual(0)
}

/** Visita todas as rotas (e os estados que mudam a largura) conferindo a rolagem. */
async function visitarTudo(page: Page) {
  for (const [rota, tela] of [
    ['./', 'início'],
    ['configuracoes', 'configurações'],
    ['acessibilidade', 'acessibilidade'],
    ['pagina-que-nao-existe', 'página não encontrada'],
    ['agendar/seus-dados', 'etapa 1'],
    ['agendar/atendimento', 'etapa 2'],
    ['agendar/data-e-horario', 'etapa 3'],
  ]) {
    await abrir(page, rota as string)
    await semRolagem(page, tela as string)
  }
  await escolherDiaNoCalendario(page)
  await semRolagem(page, 'etapa 3 com calendário')
  await escolherPrimeiroHorario(page)
  await semRolagem(page, 'revisão')
  await confirmar(page)
  await semRolagem(page, 'confirmação')
  await abrir(page, 'minhas-consultas')
  await semRolagem(page, 'Minhas consultas')
  await page.getByRole('button', { name: /^Cancelar a consulta/ }).first().click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await semRolagem(page, 'diálogo de cancelar')
  await page.keyboard.press('Escape')
  await abrir(page, 'agendar')
  await expect(page.getByRole('button', { name: 'Apagar meus dados' })).toBeVisible()
  await semRolagem(page, 'etapa 1 com dados salvos')
}

test('320 px: nenhuma rota rola na horizontal', async ({ page }) => {
  test.slow()
  await preparar(page, { rascunho: RASCUNHO_ETAPA_3, consultas: CONSULTAS })
  await visitarTudo(page)
})

test('320 px com texto em 200% e espaçamento ampliado (ligados nas Configurações)', async ({ page }) => {
  test.slow()
  await preparar(page, { rascunho: RASCUNHO_ETAPA_3, consultas: CONSULTAS })
  await abrir(page, 'configuracoes')
  await page.getByRole('radio', { name: '200%' }).check()
  await page.getByRole('checkbox', { name: 'Mais espaço entre linhas e letras' }).check()
  await expect(page.locator('html')).toHaveAttribute('style', /font-size: 200%/)
  await expect(page.locator('html')).toHaveAttribute('data-espacamento', 'ampliado')
  await visitarTudo(page)
})
