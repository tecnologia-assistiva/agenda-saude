import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import DialogoModal from '@/components/comum/DialogoModal.vue'

function montar(opcoes: { somePeloConfirmar?: boolean } = {}) {
  const confirmacoes = ref(0)
  const mostrarBotao = ref(true)
  const Pagina = defineComponent({
    setup() {
      const dialogo = ref<InstanceType<typeof DialogoModal> | null>(null)
      return () =>
        h('main', [
          h('h1', { tabindex: -1 }, 'Minhas consultas'),
          mostrarBotao.value
            ? h('button', { id: 'abrir', type: 'button', onClick: (e: MouseEvent) => dialogo.value?.abrir(e.currentTarget) }, 'Cancelar')
            : null,
          h(
            DialogoModal,
            {
              ref: dialogo,
              titulo: 'Cancelar esta consulta?',
              confirmar: 'Sim, cancelar consulta',
              manter: 'Não, manter consulta',
              onConfirmar: () => {
                confirmacoes.value += 1
                if (opcoes.somePeloConfirmar) mostrarBotao.value = false
              },
            },
            () => h('p', 'Clínica geral, quinta-feira, 19 de novembro, às 09:00.'),
          ),
        ])
    },
  })
  mount(Pagina, { attachTo: document.body })
  return { confirmacoes }
}

const dialogo = () => document.querySelector('dialog') as HTMLDialogElement
const botao = (texto: string) =>
  [...document.querySelectorAll<HTMLButtonElement>('button')].find((b) => b.textContent?.trim() === texto) as HTMLButtonElement

async function abrir() {
  const origem = document.getElementById('abrir') as HTMLButtonElement
  origem.click()
  await flushPromises()
  return origem
}

async function apertarEsc() {
  document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  await flushPromises()
}

describe('DialogoModal', () => {
  it('abre com showModal(): nome pelo título, texto no aria-describedby e foco em "Não, manter consulta"', async () => {
    const showModal = vi.spyOn(HTMLDialogElement.prototype, 'showModal')
    montar()
    expect(dialogo().open).toBe(false)
    await abrir()
    expect(showModal).toHaveBeenCalledOnce()
    expect(dialogo().open).toBe(true)
    const titulo = document.getElementById(dialogo().getAttribute('aria-labelledby') as string)
    expect(titulo?.tagName).toBe('H2')
    expect(titulo?.textContent).toBe('Cancelar esta consulta?')
    expect(document.getElementById(dialogo().getAttribute('aria-describedby') as string)?.textContent).toContain(
      'quinta-feira, 19 de novembro',
    )
    expect(document.activeElement).toBe(botao('Não, manter consulta'))
  })

  it('a opção segura vem primeiro e é o botão principal; os dois são <button type="button">', async () => {
    montar()
    const botoes = [...dialogo().querySelectorAll('button')]
    expect(botoes.map((b) => [b.textContent?.trim(), b.type, b.className])).toEqual([
      ['Não, manter consulta', 'button', 'botao'],
      ['Sim, cancelar consulta', 'button', 'botao botao--secundario'],
    ])
  })

  it('Esc fecha sem fazer a ação e o foco volta para o botão que abriu', async () => {
    const { confirmacoes } = montar()
    const origem = await abrir()
    await apertarEsc()
    expect(dialogo().open).toBe(false)
    expect(confirmacoes.value).toBe(0)
    expect(document.activeElement).toBe(origem)
  })

  it('"Não, manter consulta" fecha sem fazer a ação e devolve o foco', async () => {
    const { confirmacoes } = montar()
    const origem = await abrir()
    botao('Não, manter consulta').click()
    await flushPromises()
    expect(dialogo().open).toBe(false)
    expect(confirmacoes.value).toBe(0)
    expect(document.activeElement).toBe(origem)
  })

  it('"Sim" faz a ação; se o botão que abriu continua na tela, o foco volta para ele', async () => {
    const { confirmacoes } = montar()
    const origem = await abrir()
    botao('Sim, cancelar consulta').click()
    await flushPromises()
    expect(confirmacoes.value).toBe(1)
    expect(document.activeElement).toBe(origem)
  })

  it('se o botão que abriu sumiu com a ação, o foco vai para o h1 (título da lista)', async () => {
    montar({ somePeloConfirmar: true })
    await abrir()
    botao('Sim, cancelar consulta').click()
    await flushPromises()
    expect(document.getElementById('abrir')).toBeNull()
    expect(document.activeElement).toBe(document.querySelector('h1'))
  })

  it('reabrir depois de confirmar e sair com Esc não repete a ação', async () => {
    const { confirmacoes } = montar()
    await abrir()
    botao('Sim, cancelar consulta').click()
    await flushPromises()
    await abrir()
    await apertarEsc()
    expect(confirmacoes.value).toBe(1)
  })
})