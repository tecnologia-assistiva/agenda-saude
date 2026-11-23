import { flushPromises } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { montarApp, navegar } from './ajuda/montar-app'
import { lerRascunhoSalvo } from './ajuda/rascunho'

function campo(id: string) {
  return document.getElementById(id) as HTMLInputElement
}

async function digitar(id: string, valor: string) {
  const entrada = campo(id)
  entrada.value = valor
  entrada.dispatchEvent(new Event('input'))
  await flushPromises()
}

async function sair(id: string) {
  campo(id).dispatchEvent(new Event('blur'))
  await flushPromises()
}

async function enviar() {
  document.querySelector('main form')?.dispatchEvent(new Event('submit', { cancelable: true }))
  await flushPromises()
}

describe('etapa 1: seus dados', () => {
  it('abre com o h1 "Etapa 1 de 5: Seus dados" e o título da página', async () => {
    await montarApp('/agendar/seus-dados')
    expect(document.querySelector('main h1')?.textContent?.replace(/\s+/g, ' ').trim()).toBe('Etapa 1 de 5: Seus dados')
    expect(document.title).toBe('Etapa 1 de 5: Seus dados – Agenda Saúde')
  })

  it('campos com autocomplete correto (WCAG 1.3.5) e form com novalidate', async () => {
    await montarApp('/agendar/seus-dados')
    expect(campo('nome').autocomplete).toBe('name')
    expect(campo('data-nascimento').autocomplete).toBe('bday')
    expect(campo('telefone').autocomplete).toBe('tel')
    expect(campo('telefone').type).toBe('tel')
    expect(document.querySelector('main form')?.hasAttribute('novalidate')).toBe(true)
    expect(campo('cartao-sus').required).toBe(false)
  })

  it('não valida enquanto digita', async () => {
    await montarApp('/agendar/seus-dados')
    await digitar('telefone', '123')
    await sair('telefone')
    expect(document.querySelector('.resumo-erros')).toBeNull()
    expect(campo('telefone').getAttribute('aria-invalid')).toBeNull()
  })

  it('ao enviar vazio: resumo no topo com foco, links na ordem dos campos e "Erro:" no título', async () => {
    await montarApp('/agendar/seus-dados')
    await enviar()
    const resumo = document.querySelector<HTMLElement>('.resumo-erros')
    expect(resumo).not.toBeNull()
    expect(document.activeElement).toBe(resumo)
    expect(resumo?.querySelector('h2')?.textContent).toBe('Corrija 3 problemas para continuar')
    const links = [...(resumo?.querySelectorAll('a') ?? [])]
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['#nome', '#data-nascimento', '#telefone'])
    expect(links.map((a) => a.textContent)).toEqual([
      'Digite seu nome completo.',
      'Digite sua data de nascimento.',
      'Digite um telefone com DDD. Pode ser celular ou fixo.',
    ])
    expect(document.title).toBe('Erro: Etapa 1 de 5: Seus dados – Agenda Saúde')
  })

  it('cada campo com erro fica com aria-invalid e a mensagem ligada por aria-describedby', async () => {
    await montarApp('/agendar/seus-dados')
    await enviar()
    for (const id of ['nome', 'data-nascimento', 'telefone']) {
      const entrada = campo(id)
      expect(entrada.getAttribute('aria-invalid')).toBe('true')
      const ids = entrada.getAttribute('aria-describedby')?.split(' ') ?? []
      expect(ids).toContain(`${id}-erro`)
      expect(document.getElementById(`${id}-erro`)?.textContent).toContain('Erro:')
    }
    expect(campo('cartao-sus').getAttribute('aria-invalid')).toBeNull()
  })

  it('o link do resumo leva o foco ao campo', async () => {
    await montarApp('/agendar/seus-dados')
    await enviar()
    document.querySelector<HTMLAnchorElement>('.resumo-erros a[href="#telefone"]')?.click()
    expect(document.activeElement).toBe(campo('telefone'))
  })

  it('cada nova tentativa com erro devolve o foco ao resumo, que mostra só o que falta', async () => {
    await montarApp('/agendar/seus-dados')
    await enviar()
    await digitar('nome', 'Maria da Silva')
    campo('nome').focus()
    await enviar()
    expect(document.activeElement?.classList.contains('resumo-erros')).toBe(true)
    expect(document.querySelector('.resumo-erros h2')?.textContent).toBe('Corrija 2 problemas para continuar')
  })

  it('instrução do telefone diz que vale celular ou fixo', async () => {
    await montarApp('/agendar/seus-dados')
    expect(document.getElementById('telefone-instrucao')?.textContent).toBe(
      'Celular ou fixo, com DDD. Por exemplo: (11) 98765-4321.',
    )
  })

  it('data impossível ou futura: mensagem diz como corrigir; nome com acento, hífen e apóstrofo passa', async () => {
    await montarApp('/agendar/seus-dados')
    await digitar('nome', "Ana-Lúcia D'Ávila")
    await digitar('data-nascimento', '31/02/1990')
    await digitar('telefone', '(11) 3456-7890')
    await enviar()
    expect([...document.querySelectorAll('.resumo-erros a')].map((a) => a.textContent)).toEqual([
      'Fevereiro de 1990 tem 28 dias. Confira o dia.',
    ])
    await digitar('data-nascimento', '01/01/2999')
    await enviar()
    expect(document.getElementById('data-nascimento-erro')?.textContent).toBe(
      'Erro: A data de nascimento não pode ser depois de hoje. Confira o dia, o mês e o ano.',
    )
    expect(campo('nome').getAttribute('aria-invalid')).toBeNull()
    expect(campo('telefone').getAttribute('aria-invalid')).toBeNull()
  })

  it('dados colados em outros formatos são formatados e a etapa segue para a 2', async () => {
    const { router } = await montarApp('/agendar/seus-dados')
    await digitar('nome', '  Maria   da Silva ')
    await digitar('data-nascimento', '15031980')
    await digitar('telefone', '+55 11 98765 4321')
    await digitar('cartao-sus', '123.4567.8901.2345')
    await enviar()
    // A tela da etapa 2 é carregada sob demanda: espera a navegação terminar.
    await expect.poll(() => router.currentRoute.value.path).toBe('/agendar/atendimento')
    await flushPromises()
    expect(lerRascunhoSalvo()?.dados).toEqual({
      nome: 'Maria da Silva',
      dataNascimento: '15/03/1980',
      telefone: '(11) 98765-4321',
      cartaoSus: '123 4567 8901 2345',
    })
    expect(document.activeElement?.tagName).toBe('H1')
    expect(document.title).toBe('Etapa 2 de 5: Tipo de atendimento – Agenda Saúde')
  })

  it('voltar não apaga nada: os dados continuam ao voltar da etapa 2', async () => {
    const { router } = await montarApp('/agendar/seus-dados')
    await digitar('nome', 'Maria da Silva')
    await digitar('data-nascimento', '15/03/1980')
    await digitar('telefone', '(11) 98765-4321')
    await enviar()
    await expect.poll(() => router.currentRoute.value.path).toBe('/agendar/atendimento')
    document.querySelector<HTMLAnchorElement>('.navegacao-etapa a')?.click()
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/agendar/seus-dados')
    expect(campo('nome').value).toBe('Maria da Silva')
    expect(campo('telefone').value).toBe('(11) 98765-4321')
  })

  it('"Voltar" da etapa 1 é um link para o início; o envio é o único botão', async () => {
    await montarApp('/agendar/seus-dados')
    const voltar = document.querySelector('.navegacao-etapa a')
    expect(voltar?.textContent?.trim()).toBe('Voltar')
    expect(voltar?.getAttribute('href')).toBe('/')
    const botoes = [...document.querySelectorAll('main button')]
    expect(botoes.map((b) => [b.textContent?.trim(), b.getAttribute('type')])).toEqual([['Continuar', 'submit']])
  })

  it('vindo da revisão (?retorno=revisao), o botão vira "Salvar e voltar para a revisão"', async () => {
    const { router } = await montarApp('/')
    await navegar(router, '/agendar/seus-dados?retorno=revisao')
    expect(document.querySelector('main button[type="submit"]')?.textContent?.trim()).toBe('Salvar e voltar para a revisão')
  })
})
