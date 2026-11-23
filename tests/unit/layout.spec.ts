import { describe, expect, it } from 'vitest'
import { montarApp } from './ajuda/montar-app'

const SELETOR_FOCAVEL =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function niveisDosTitulos(): number[] {
  return [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].map((t) => Number(t.tagName[1]))
}

describe('layout: estrutura', () => {
  it('tem uma região de cada: header, nav, main e footer', async () => {
    await montarApp('/')
    expect(document.querySelectorAll('header')).toHaveLength(1)
    expect(document.querySelectorAll('nav')).toHaveLength(1)
    expect(document.querySelectorAll('main')).toHaveLength(1)
    expect(document.querySelectorAll('footer')).toHaveLength(1)
    expect(document.querySelector('nav')?.getAttribute('aria-label')).toBe('Menu principal')
  })

  it.each(['/', '/configuracoes', '/acessibilidade', '/nao-existe'])(
    '%s: um único h1, o primeiro título, e níveis sem saltos',
    async (caminho) => {
      await montarApp(caminho)
      const niveis = niveisDosTitulos()
      expect(niveis.filter((n) => n === 1)).toHaveLength(1)
      expect(niveis[0]).toBe(1)
      niveis.forEach((nivel, i) => {
        if (i > 0) expect(nivel, `título ${i + 1} (h${nivel})`).toBeLessThanOrEqual((niveis[i - 1] ?? 1) + 1)
      })
    },
  )

  it('as regiões de anúncio existem desde a carga', async () => {
    await montarApp('/')
    expect(document.querySelectorAll('[role="status"]')).toHaveLength(1)
    expect(document.querySelectorAll('[role="alert"]')).toHaveLength(1)
  })

  it('o aviso acadêmico fica só numa linha no rodapé, fora do conteúdo', async () => {
    await montarApp('/')
    expect(document.querySelector('header')?.textContent).not.toContain('demonstração')
    expect(document.querySelector('footer')?.textContent).toContain('Projeto acadêmico')
    expect(document.querySelector('main')?.textContent).not.toContain('demonstração')
  })

  it('o menu fica logo abaixo da faixa institucional, dentro do cabeçalho', async () => {
    await montarApp('/')
    expect(document.querySelector('header nav#menu')).not.toBeNull()
  })

  it('rodapé enxuto: dois links e a linha do projeto acadêmico, sem telefone nem títulos', async () => {
    await montarApp('/')
    const rodape = document.querySelector('footer')
    const links = [...(rodape?.querySelectorAll('a') ?? [])].map((a) => a.textContent?.trim())
    expect(links).toEqual(['Acessibilidade', 'Configurações'])
    expect(rodape?.textContent).not.toMatch(/telefone|0800/i)
    expect(rodape?.querySelectorAll('h1, h2, h3')).toHaveLength(0)
  })

  it('o rodapé é igual em todas as páginas', async () => {
    const conteudos = []
    for (const caminho of ['/', '/configuracoes', '/acessibilidade', '/nao-existe']) {
      await montarApp(caminho)
      conteudos.push(document.querySelector('footer')?.textContent?.replace(/\s+/g, ' ').trim())
      document.body.innerHTML = ''
    }
    expect(new Set(conteudos).size).toBe(1)
  })

  it('Início é enxuto: h1, uma frase, a ação principal, um link e uma linha', async () => {
    await montarApp('/')
    const main = document.querySelector('main .coluna-leitura')
    expect(main?.querySelector('h1')?.textContent?.trim()).toBe('Agendar consulta')
    expect(main?.querySelectorAll('h2')).toHaveLength(0)
    expect(main?.textContent).toContain('Você vai precisar do nome, data de nascimento e telefone. Não há tempo limite.')
    expect(main?.querySelector('.dica-extra')).toBeNull()
  })

  it('a tela Início tem um único botão principal; o resto são links', async () => {
    await montarApp('/')
    const principais = document.querySelectorAll('main .botao:not(.botao--secundario)')
    expect([...principais].map((b) => b.textContent?.trim())).toEqual(['Começar agendamento'])
    const link = [...document.querySelectorAll('main a')].find((a) => a.textContent?.trim() === 'Ver minhas consultas')
    expect(link?.classList.contains('botao')).toBe(false)
  })
})

describe('barra de acessibilidade', () => {
  it('sem links de pulo nem accesskey: o primeiro elemento do Tab é o link "Acessibilidade"', async () => {
    await montarApp('/')
    const primeiro = document.querySelector<HTMLElement>(SELETOR_FOCAVEL)
    expect(primeiro?.textContent?.trim()).toBe('Acessibilidade')
    expect(primeiro?.closest('.barra-acessibilidade')).not.toBeNull()
    expect(document.querySelector('[accesskey]')).toBeNull()
    expect(document.querySelector('a[href^="#"]')).toBeNull()
  })

  it('tem link para a página de acessibilidade', async () => {
    await montarApp('/')
    const link = document.querySelector('.barra-acessibilidade a[href="/acessibilidade"]')
    expect(link?.textContent?.trim()).toBe('Acessibilidade')
  })

  it('o botão "Alto contraste" alterna o tema, o aria-pressed e anuncia a mudança', async () => {
    const { wrapper } = await montarApp('/')
    const botao = wrapper.get('button[aria-pressed]')
    const status = wrapper.get('[data-testid="regiao-status"]')
    expect(botao.text()).toBe('Alto contraste')
    expect(botao.attributes('aria-pressed')).toBe('false')

    await botao.trigger('click')
    expect(botao.attributes('aria-pressed')).toBe('true')
    expect(document.documentElement.dataset.tema).toBe('alto-contraste')
    await expect.poll(() => status.text()).toBe('Alto contraste ativado.')

    await botao.trigger('click')
    expect(botao.attributes('aria-pressed')).toBe('false')
    expect(document.documentElement.dataset.tema).toBe('claro')
    await expect.poll(() => status.text()).toBe('Alto contraste desativado. Tema claro aplicado.')
  })
})

describe('cabeçalho', () => {
  it('"Configurações" é um link (navega), acessível de qualquer página', async () => {
    await montarApp('/acessibilidade')
    const link = document.querySelector('header a[href="/configuracoes"]')
    expect(link?.tagName).toBe('A')
    expect(link?.textContent?.trim()).toBe('Configurações')
  })

  it('sem ícones decorativos; o único ícone (✓ do alto contraste) fica escondido do leitor', async () => {
    const { wrapper } = await montarApp('/')
    expect(document.querySelectorAll('svg')).toHaveLength(0)
    await wrapper.get('button[aria-pressed]').trigger('click')
    const icones = document.querySelectorAll('svg')
    expect(icones).toHaveLength(1)
    expect(icones[0]?.closest('button[aria-pressed="true"]')).not.toBeNull()
    expect(icones[0]?.getAttribute('aria-hidden')).toBe('true')
    expect(icones[0]?.getAttribute('focusable')).toBe('false')
  })
})