import { describe, expect, it, vi } from 'vitest'
import { montarApp } from './ajuda/montar-app'

const raiz = document.documentElement

async function abrirConfiguracoes() {
  const app = await montarApp('/configuracoes')
  const status = app.wrapper.get('[data-testid="regiao-status"]')
  const alerta = app.wrapper.get('[data-testid="regiao-alerta"]')
  return { ...app, status, alerta }
}

function grupo(legenda: string): HTMLFieldSetElement {
  const fieldsets = [...document.querySelectorAll('fieldset')]
  const achado = fieldsets.find((f) => f.querySelector('legend')?.textContent?.trim() === legenda)
  if (!achado) throw new Error(`Grupo "${legenda}" não encontrado`)
  return achado
}

describe('tela de configurações', () => {
  it('agrupa as opções em fieldset com legend, e a legenda também é um h2', async () => {
    await abrirConfiguracoes()
    for (const legenda of ['Cores', 'Tamanho do texto', 'Leitura', 'Movimento']) {
      expect(grupo(legenda).querySelector('legend > h2')?.textContent?.trim()).toBe(legenda)
    }
  })

  it('cada opção tem rótulo visível envolvendo o campo', async () => {
    await abrirConfiguracoes()
    for (const campo of document.querySelectorAll('main input')) {
      expect(campo.closest('label')?.textContent?.trim().length).toBeGreaterThan(0)
    }
  })

  it('trocar o tema aplica na hora, salva e anuncia', async () => {
    const { wrapper, status } = await abrirConfiguracoes()
    const escuro = wrapper.get('input[name="tema"][value="escuro"]')
    await escuro.setValue(true)
    expect(raiz.dataset.tema).toBe('escuro')
    expect(window.localStorage.getItem('agenda-saude:configuracoes')).toContain('"tema":"escuro"')
    await expect.poll(() => status.text()).toBe('Tema escuro aplicado.')
  })

  it('trocar o tamanho do texto aplica na hora e anuncia', async () => {
    const { wrapper, status } = await abrirConfiguracoes()
    const opcoes = wrapper.findAll('input[name="tamanho-texto"]')
    expect(opcoes.map((o) => (o.element as HTMLInputElement).value)).toEqual(['100', '125', '150', '175', '200'])
    await wrapper.get('input[name="tamanho-texto"][value="150"]').setValue(true)
    expect(raiz.style.fontSize).toBe('150%')
    await expect.poll(() => status.text()).toBe('Texto em 150%.')
  })

  it('as caixas de seleção ligam espaçamento, fonte, movimento e dicas', async () => {
    const { wrapper } = await abrirConfiguracoes()
    const caixas = wrapper.findAll('input[type="checkbox"]')
    expect(caixas).toHaveLength(4)
    for (const caixa of caixas) await caixa.setValue(true)
    expect(raiz.dataset.espacamento).toBe('ampliado')
    expect(raiz.dataset.fonte).toBe('legivel')
    expect(raiz.dataset.movimento).toBe('reduzido')
    expect(window.localStorage.getItem('agenda-saude:configuracoes')).toContain('"dicasExtras":true')
  })

  it('"Mostrar dicas extras" começa desligado e, ao ligar, mostra as dicas na hora', async () => {
    const { wrapper } = await abrirConfiguracoes()
    expect(document.querySelector('.dica-extra')).toBeNull()
    const caixa = wrapper.findAll('input[type="checkbox"]').find((c) => c.element.closest('label')?.textContent?.includes('Mostrar dicas extras'))
    await caixa?.setValue(true)
    expect(document.querySelector('.dica-extra')?.textContent).toContain('Dica:')
  })

  it('o radio marcado reflete o que estava salvo', async () => {
    window.localStorage.setItem(
      'agenda-saude:configuracoes',
      JSON.stringify({ versao: 1, dados: { tema: 'alto-contraste', tamanhoTexto: 125 } }),
    )
    const { wrapper } = await abrirConfiguracoes()
    expect((wrapper.get('input[value="alto-contraste"]').element as HTMLInputElement).checked).toBe(true)
    expect((wrapper.get('input[name="tamanho-texto"][value="125"]').element as HTMLInputElement).checked).toBe(true)
  })

  it('"Restaurar configurações iniciais" volta ao padrão e anuncia', async () => {
    const { wrapper, status } = await abrirConfiguracoes()
    await wrapper.get('input[name="tema"][value="escuro"]').setValue(true)
    const botao = wrapper.findAll('button').find((b) => b.text() === 'Restaurar configurações iniciais')
    await botao?.trigger('click')
    expect(raiz.dataset.tema).toBe('claro')
    await expect.poll(() => status.text()).toBe('Configurações iniciais restauradas.')
  })

  it('se não der para salvar, mostra o aviso e usa a região de alerta', async () => {
    const { wrapper, alerta } = await abrirConfiguracoes()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Bloqueado', 'SecurityError')
    })
    await wrapper.get('input[name="tema"][value="escuro"]').setValue(true)
    expect(raiz.dataset.tema).toBe('escuro')
    expect(wrapper.text()).toContain('Atenção: seu navegador não deixou salvar as configurações.')
    await expect.poll(() => alerta.text()).toContain('Não foi possível salvar as configurações')
  })
})
