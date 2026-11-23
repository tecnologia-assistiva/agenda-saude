import { expect, test } from '@playwright/test'
import { RASCUNHO_ETAPA_3, abrir, confirmar, escolherDiaNoCalendario, escolherPrimeiroHorario, preparar, teclarAte } from './ajuda'

test.describe('impressão do comprovante', () => {
  test('a confirmação imprime só o conteúdo: sem cabeçalho, menu, barra eMAG, rodapé nem botões', async ({ page }) => {
    await preparar(page, { rascunho: RASCUNHO_ETAPA_3, configuracoes: { tema: 'alto-contraste' } })
    await escolherPrimeiroHorario(page)
    await confirmar(page)
    await page.emulateMedia({ media: 'print' })

    for (const parte of ['header', '#menu', '.barra-acessibilidade', 'footer', 'ol.etapas', '.nao-imprimir']) {
      await expect(page.locator(parte).first(), parte).toBeHidden()
    }
    await expect(page.locator('main h1')).toBeVisible()
    await expect(page.locator('main h1')).toHaveText('Consulta agendada', { useInnerText: true })
    await expect(page.locator('main dl')).toBeVisible()
    await expect(page.locator('.so-impressao')).toContainText('Comprovante de demonstração')
    expect(await page.locator('main h1').evaluate((el) => getComputedStyle(el).color)).toBe('rgb(27, 27, 27)')

    await page.emulateMedia({ media: 'screen' })
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('.so-impressao')).toBeHidden()
  })
})

test.describe('modo de contraste do Windows (forced-colors)', () => {
  test('o dia escolhido continua diferente dos outros, e o foco continua visível', async ({ page }) => {
    await preparar(page, { rascunho: RASCUNHO_ETAPA_3 })
    await page.emulateMedia({ forcedColors: 'active' })
    await abrir(page, 'agendar/data-e-horario')
    await escolherDiaNoCalendario(page)

    const selecionado = page.locator('.calendario__dia--selecionado')
    const outroLivre = page.locator('.calendario__dia--livre:not(.calendario__dia--selecionado)').first()
    const cores = (el: typeof selecionado) =>
      el.evaluate((b) => ({ fundo: getComputedStyle(b).backgroundColor, texto: getComputedStyle(b).color }))
    const doSelecionado = await cores(selecionado)
    const doOutro = await cores(outroLivre)
    expect(doSelecionado.fundo, 'fundo do dia escolhido').not.toBe(doOutro.fundo)
    expect(doSelecionado.texto, 'texto do dia escolhido').not.toBe(doOutro.texto)

    const radio = page.locator('#horario-do-dia input[type="radio"]').first()
    await teclarAte(page, radio)
    const linha = radio.locator('xpath=ancestor::label[1]')
    const contornoRadio = await linha.evaluate((l) => ({ estilo: getComputedStyle(l).outlineStyle, cor: getComputedStyle(l).outlineColor }))
    expect(contornoRadio.estilo).toBe('solid')
    expect(contornoRadio.cor).not.toMatch(/rgba\(.*, 0\)|transparent/)

    await teclarAte(page, selecionado, 'Shift+Tab')
    expect(await selecionado.evaluate((b) => b.matches(':focus-visible'))).toBe(true)
    const contorno = await selecionado.evaluate((b) => {
      const s = getComputedStyle(b)
      return { estilo: s.outlineStyle, largura: parseFloat(s.outlineWidth), cor: s.outlineColor, fundo: s.backgroundColor }
    })
    expect(contorno.estilo).toBe('solid')
    expect(contorno.largura).toBeGreaterThanOrEqual(2)
    expect(contorno.cor).not.toMatch(/rgba\(.*, 0\)|transparent/)
    expect(contorno.cor).not.toBe(contorno.fundo)
    expect(await selecionado.evaluate((b) => getComputedStyle(b).backgroundColor)).not.toBe(doOutro.fundo)
  })
})