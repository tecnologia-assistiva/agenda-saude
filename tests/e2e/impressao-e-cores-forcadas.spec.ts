import { expect, test } from '@playwright/test'
import { RASCUNHO_ETAPA_3, abrir, confirmar, escolherDiaNoCalendario, escolherPrimeiroHorario, preparar, teclarAte } from './ajuda'

test.describe('impressão do comprovante', () => {
  test('a confirmação imprime só o conteúdo: sem cabeçalho, menu, barra eMAG, rodapé nem botões', async ({ page }) => {
    // Alto contraste na tela; no papel, texto escuro (o amarelo sumiria no branco).
    await preparar(page, { rascunho: RASCUNHO_ETAPA_3, configuracoes: { tema: 'alto-contraste' } })
    await escolherPrimeiroHorario(page)
    await confirmar(page)
    await page.emulateMedia({ media: 'print' })

    for (const parte of ['header', '#menu', '.barra-acessibilidade', 'footer', 'ol.etapas', '.nao-imprimir']) {
      await expect(page.locator(parte).first(), parte).toBeHidden()
    }
    await expect(page.locator('main h1')).toBeVisible()
    // innerText: a legenda "Etapa 5 de 5" fica fora do papel.
    await expect(page.locator('main h1')).toHaveText('Consulta agendada', { useInnerText: true })
    await expect(page.locator('main dl')).toBeVisible()
    await expect(page.locator('.so-impressao')).toContainText('Comprovante de demonstração')
    expect(await page.locator('main h1').evaluate((el) => getComputedStyle(el).color)).toBe('rgb(27, 27, 27)')

    // Na tela, tudo volta.
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

    // Foco num radio (Tab) e depois no dia (Shift+Tab volta para a grade): contorno sólido e visível.
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
    // O escolhido com foco continua diferente de um dia comum.
    expect(await selecionado.evaluate((b) => getComputedStyle(b).backgroundColor)).not.toBe(doOutro.fundo)
  })
})
