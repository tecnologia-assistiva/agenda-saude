import { expect, test, type Locator, type Page } from '@playwright/test'
import { RASCUNHO_ETAPA_3, TEMAS, abrir, corDoToken, preparar, teclarAte } from './ajuda'

/*
 * Foco visível (WCAG 2.4.7) pelo estilo calculado, nos 3 temas: link, botão, radio e dia do
 * calendário, todos alcançados com Tab (para valer o :focus-visible de teclado).
 * O padrão do site é o fundo amarelo (--cor-foco-fundo) com a barra escura; o contraste desses
 * tokens já é conferido em tests/unit/contraste.spec.ts.
 */

async function estilo(alvo: Locator, propriedade: 'backgroundColor' | 'boxShadow') {
  return alvo.evaluate((el, p) => getComputedStyle(el)[p], propriedade)
}

async function conferirFoco(page: Page, alvo: Locator, pintado: Locator = alvo) {
  await expect(alvo).toBeFocused()
  expect(await alvo.evaluate((el) => el.matches(':focus-visible'))).toBe(true)
  expect(await estilo(pintado, 'backgroundColor')).toBe(await corDoToken(page, 'cor-foco-fundo'))
  expect(await estilo(pintado, 'boxShadow')).toContain(await corDoToken(page, 'cor-foco-barra'))
}

for (const tema of TEMAS) {
  test(`foco visível em links, botões, radios e dias do calendário (tema ${tema})`, async ({ page }) => {
    await preparar(page, { rascunho: RASCUNHO_ETAPA_3, configuracoes: { tema } })

    // Link (o primeiro da página) e botão ("Alto contraste", na barra eMAG)
    await abrir(page, './')
    const pular = page.getByRole('link', { name: 'Ir para o conteúdo [1]' })
    await teclarAte(page, pular)
    await conferirFoco(page, pular)
    const altoContraste = page.getByRole('button', { name: 'Alto contraste' })
    await teclarAte(page, altoContraste)
    await conferirFoco(page, altoContraste)

    // Link com visual de botão (o principal da tela inicial)
    const comecar = page.getByRole('link', { name: 'Continuar agendamento' })
    await teclarAte(page, comecar)
    await conferirFoco(page, comecar)

    // Radio: a linha inteira (o <label>) fica amarela
    await abrir(page, 'agendar/atendimento')
    const radio = page.getByRole('radio', { name: /^Clínica geral/ })
    await teclarAte(page, radio)
    await conferirFoco(page, radio, radio.locator('xpath=ancestor::label[1]'))

    // Dia do calendário (a grade tem um só ponto de Tab)
    await abrir(page, 'agendar/data-e-horario')
    await page.getByLabel('Escolher no calendário').check()
    const diaTabulavel = page.locator('.calendario__dia[tabindex="0"]')
    await teclarAte(page, diaTabulavel)
    await conferirFoco(page, diaTabulavel)
  })
}
