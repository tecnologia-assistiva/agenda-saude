import { describe, expect, it } from 'vitest'
import { montarTitulo } from '@/router/foco-rota'
import { montarApp, navegar } from './ajuda/montar-app'

function h1() {
  return document.querySelector('main h1')
}

describe('troca de rota: título e foco', () => {
  it('na primeira carga atualiza o título e não move o foco', async () => {
    await montarApp('/acessibilidade')
    expect(document.title).toBe('Sobre a acessibilidade – Agenda Saúde')
    expect(document.activeElement).toBe(document.body)
  })

  it('ao trocar de página, atualiza o título e leva o foco ao h1', async () => {
    const { router } = await montarApp('/')
    await navegar(router, '/configuracoes')
    expect(document.title).toBe('Configurações de acessibilidade – Agenda Saúde')
    expect(h1()?.textContent?.trim()).toBe('Configurações de acessibilidade')
    expect(document.activeElement).toBe(h1())
  })

  it('o h1 recebe foco por script, mas fica fora da ordem do Tab', async () => {
    await montarApp('/')
    expect(h1()?.getAttribute('tabindex')).toBe('-1')
  })

  it('quando só o # muda (links de pulo), não mexe no foco', async () => {
    const { router } = await montarApp('/')
    await navegar(router, '/acessibilidade')
    const link = document.querySelector<HTMLAnchorElement>('a[href="#rodape"]')
    link?.focus()
    await navegar(router, '/acessibilidade#rodape')
    expect(document.activeElement).toBe(link)
  })

  it('rota desconhecida mostra "Página não encontrada"', async () => {
    const { router } = await montarApp('/')
    await navegar(router, '/pagina-que-nao-existe')
    expect(document.title).toBe('Página não encontrada – Agenda Saúde')
    expect(document.activeElement).toBe(h1())
    expect(h1()?.textContent?.trim()).toBe('Página não encontrada')
  })

  it('com erro no formulário, o título começa com "Erro: "', () => {
    expect(montarTitulo('Etapa 1 de 5: Seus dados', { erro: true })).toBe(
      'Erro: Etapa 1 de 5: Seus dados – Agenda Saúde',
    )
  })
})