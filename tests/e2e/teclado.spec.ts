import { expect, test, type Page } from '@playwright/test'
import { abrir, preparar, teclarAte } from './ajuda'

/*
 * Só teclado (Tab, Shift+Tab, setas, Espaço, Enter e Esc), sem nenhum clique: agendar, ver em
 * Minhas consultas, remarcar, cancelar e apagar os dados salvos. A cada troca de página, o foco
 * tem de estar no h1.
 */

const h1 = (page: Page) => page.locator('main h1')

/** Enter no elemento focado, que leva a outra página: confere o endereço e o foco no h1. */
async function enterLevaPara(page: Page, rota: RegExp, titulo: string | RegExp) {
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(rota)
  await expect(h1(page)).toBeFocused()
  await expect(h1(page)).toContainText(titulo)
}

test('o primeiro Tab da página cai em "Ir para o conteúdo"', async ({ page }) => {
  await preparar(page)
  await abrir(page, './')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Ir para o conteúdo [1]' })).toBeFocused()
  // E ele leva o foco ao conteúdo principal.
  await page.keyboard.press('Enter')
  await expect(page.locator('main')).toBeFocused()
})

test('fluxo inteiro só com teclado: agendar, ver, remarcar, cancelar e apagar os dados', async ({ page }) => {
  test.slow()
  await preparar(page)
  await abrir(page, './')

  // Início → etapa 1
  await teclarAte(page, page.getByRole('link', { name: 'Começar agendamento' }))
  await enterLevaPara(page, /agendar\/seus-dados$/, 'Seus dados')

  // Etapa 1: digita os dados (a data e o telefone só com números)
  await teclarAte(page, page.getByLabel(/^Nome completo/))
  await page.keyboard.type('Maria da Silva')
  await teclarAte(page, page.getByLabel(/^Data de nascimento/))
  await page.keyboard.type('15031980')
  await teclarAte(page, page.getByLabel(/^Telefone/))
  await page.keyboard.type('11987654321')
  await teclarAte(page, page.getByRole('button', { name: 'Continuar' }))
  await enterLevaPara(page, /agendar\/atendimento$/, 'Tipo de atendimento')

  // Etapa 2: Espaço marca a opção focada (Clínica geral, depois "Qualquer profissional")
  await teclarAte(page, page.getByRole('radio', { name: /^Clínica geral/ }))
  await page.keyboard.press('Space')
  await teclarAte(page, page.getByRole('radio', { name: /^Qualquer profissional/ }))
  await page.keyboard.press('Space')
  await teclarAte(page, page.getByRole('button', { name: 'Continuar' }))
  await enterLevaPara(page, /agendar\/data-e-horario$/, 'Data e horário')

  // Etapa 3: primeiro dos próximos horários
  const horarios = page.locator('#horario-proximos input[type="radio"]')
  await teclarAte(page, horarios.first())
  await page.keyboard.press('Space')
  await expect(horarios.first()).toBeChecked()
  await teclarAte(page, page.getByRole('button', { name: 'Continuar' }))
  await enterLevaPara(page, /agendar\/revisao$/, 'Revise e confirme')

  // Revisão → confirmação
  await teclarAte(page, page.getByRole('button', { name: 'Confirmar agendamento' }))
  await enterLevaPara(page, /agendar\/confirmacao$/, 'Consulta agendada')
  const protocolo = (await page.locator('main .texto-destaque strong').textContent())?.trim()
  expect(protocolo).toMatch(/^\d{4}-\d{4}$/)

  // Minhas consultas
  await teclarAte(page, page.getByRole('link', { name: 'Ver minhas consultas' }))
  await enterLevaPara(page, /minhas-consultas$/, 'Minhas consultas')
  await expect(page.locator('main li')).toHaveCount(1)
  const quandoAntes = await page.locator('main li h2').textContent()

  // Remarcar: etapa 3 direto (dados e atendimento já prontos); seta para baixo escolhe o 2º horário
  await teclarAte(page, page.getByRole('link', { name: /^Remarcar a consulta/ }))
  await enterLevaPara(page, /agendar\/data-e-horario$/, 'Data e horário')
  await expect(page.getByText(/^Você está remarcando a consulta de/)).toBeVisible()
  await teclarAte(page, horarios.first())
  await page.keyboard.press('Space')
  await page.keyboard.press('ArrowDown')
  await expect(horarios.nth(1)).toBeChecked()
  await teclarAte(page, page.getByRole('button', { name: 'Continuar' }))
  await enterLevaPara(page, /agendar\/revisao$/, 'Revise e confirme')
  await teclarAte(page, page.getByRole('button', { name: 'Confirmar remarcação' }))
  await enterLevaPara(page, /agendar\/confirmacao$/, 'Consulta remarcada')
  await expect(page.locator('main .texto-destaque')).toContainText(`${protocolo} (continua o mesmo)`)

  await teclarAte(page, page.getByRole('link', { name: 'Ver minhas consultas' }))
  await enterLevaPara(page, /minhas-consultas$/, 'Minhas consultas')
  await expect(page.locator('main li h2')).not.toHaveText(quandoAntes ?? '')

  // Cancelar: foco em "Não, manter consulta"; Esc fecha e devolve o foco ao botão
  const cancelar = page.getByRole('button', { name: /^Cancelar a consulta/ })
  const dialogo = page.getByRole('dialog', { name: 'Cancelar esta consulta?' })
  await teclarAte(page, cancelar)
  await page.keyboard.press('Enter')
  await expect(dialogo).toBeVisible()
  await expect(page.getByRole('button', { name: 'Não, manter consulta' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialogo).toBeHidden()
  await expect(cancelar).toBeFocused()

  // De novo, agora confirmando: a consulta some e o foco vai para o h1 (título da lista)
  await page.keyboard.press('Enter')
  await expect(dialogo).toBeVisible()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Sim, cancelar consulta' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(dialogo).toBeHidden()
  await expect(h1(page)).toBeFocused()
  await expect(page.getByText('Você não tem consultas marcadas.')).toBeVisible()
  await expect(page.getByRole('status')).toContainText('cancelada')

  // Novo agendamento: os dados vêm preenchidos; "Apagar meus dados" pede confirmação
  await teclarAte(page, page.locator('main').getByRole('link', { name: 'Agendar consulta' }))
  await enterLevaPara(page, /agendar\/seus-dados$/, 'Seus dados')
  await expect(page.getByLabel(/^Nome completo/)).toHaveValue('Maria da Silva')
  await teclarAte(page, page.getByRole('button', { name: 'Apagar meus dados' }))
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: 'Não, manter meus dados' })).toBeFocused()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(h1(page)).toBeFocused()
  await expect(page.getByLabel(/^Nome completo/)).toHaveValue('')
  await expect(page.getByText('Seus dados foram apagados.', { exact: true }).first()).toBeVisible()
})
