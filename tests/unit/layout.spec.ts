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

  it('o aviso de projeto acadêmico aparece no rodapé e no início', async () => {
    await montarApp('/')
    expect(document.querySelector('footer')?.textContent).toContain('Projeto acadêmico com dados fictícios')
    expect(document.querySelector('main')?.textContent).toContain('Projeto acadêmico com dados fictícios')
  })
})

describe('barra de acessibilidade (eMAG)', () => {
  it('o primeiro elemento do Tab é "Ir para o conteúdo [1]"', async () => {
    await montarApp('/')
    const primeiro = document.querySelector<HTMLElement>(SELETOR_FOCAVEL)
    expect(primeiro?.textContent?.trim()).toBe('Ir para o conteúdo [1]')
    expect(primeiro?.getAttribute('href')).toBe('#conteudo')
  })

  it('atalhos 1, 2 e 4 levam a main, nav e footer, que podem receber foco', async () => {
    await montarApp('/')
    const esperado: Record<string, string> = { '1': 'MAIN', '2': 'NAV', '4': 'FOOTER' }
    const atalhos = [...document.querySelectorAll<HTMLAnchorElement>('a[accesskey]')]
    expect(atalhos.map((a) => a.accessKey)).toEqual(['1', '2', '4'])
    for (const atalho of atalhos) {
      const destino = document.querySelector<HTMLElement>(atalho.getAttribute('href') ?? '')
      expect(destino?.tagName).toBe(esperado[atalho.accessKey])
      expect(destino?.getAttribute('tabindex')).toBe('-1')
    }
  })

  it('o 3 fica reservado para a busca', async () => {
    await montarApp('/')
    expect(document.querySelector('[accesskey="3"]')).toBeNull()
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

  it('ícones são decorativos', async () => {
    await montarApp('/')
    for (const svg of document.querySelectorAll('svg')) {
      expect(svg.getAttribute('aria-hidden')).toBe('true')
      expect(svg.getAttribute('focusable')).toBe('false')
    }
  })
})
