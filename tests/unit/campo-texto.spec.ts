import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { useConfiguracoesStore } from '@/stores/configuracoes'
import { formatarData, mascararData } from '@/utils/formatacao'
import CampoTexto from '@/components/formulario/CampoTexto.vue'

type Props = Record<string, unknown>

function montarCampo(props: Props = {}, valorInicial = '') {
  const valor = ref(valorInicial)
  const Pai = defineComponent({
    setup: () => () =>
      h(CampoTexto, {
        id: 'data-nascimento',
        rotulo: 'Data de nascimento',
        modelValue: valor.value,
        'onUpdate:modelValue': (v: string) => (valor.value = v),
        ...props,
      }),
  })
  const wrapper = mount(Pai, { attachTo: document.body })
  return { wrapper, valor, entrada: () => wrapper.get('input') }
}

describe('CampoTexto', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('rótulo visível ligado ao campo, com "(obrigatório)" em texto e required nativo', () => {
    const { wrapper, entrada } = montarCampo()
    const rotulo = wrapper.get('label')
    expect(rotulo.attributes('for')).toBe('data-nascimento')
    expect(entrada().attributes('id')).toBe('data-nascimento')
    expect(rotulo.text()).toBe('Data de nascimento (obrigatório)')
    expect(entrada().attributes('required')).toBeDefined()
  })

  it('campo opcional diz "(opcional)" e não tem required', () => {
    const { wrapper, entrada } = montarCampo({ opcional: true })
    expect(wrapper.get('label').text()).toBe('Data de nascimento (opcional)')
    expect(entrada().attributes('required')).toBeUndefined()
  })

  it('ordem: rótulo → instrução → erro → campo', () => {
    const { wrapper } = montarCampo({ instrucao: 'Por exemplo: 15/03/1980.', erro: 'Digite sua data de nascimento.' })
    const ordem = [...wrapper.element.children].map((el) => el.className || el.tagName)
    expect(ordem).toEqual(['campo__rotulo', 'campo__instrucao', 'campo__erro', 'campo__entrada campo__entrada--longa'])
  })

  it('sem erro: aria-describedby só com a instrução e sem aria-invalid', () => {
    const { entrada } = montarCampo({ instrucao: 'Por exemplo: 15/03/1980.' })
    expect(entrada().attributes('aria-describedby')).toBe('data-nascimento-instrucao')
    expect(entrada().attributes('aria-invalid')).toBeUndefined()
  })

  it('com erro: aria-invalid e aria-describedby com instrução e erro; o erro começa com "Erro:" para o leitor', () => {
    const { wrapper, entrada } = montarCampo({ instrucao: 'Por exemplo: 15/03/1980.', erro: 'Essa data não existe.' })
    expect(entrada().attributes('aria-invalid')).toBe('true')
    expect(entrada().attributes('aria-describedby')).toBe('data-nascimento-instrucao data-nascimento-erro')
    expect(wrapper.get('#data-nascimento-erro').text()).toBe('Erro: Essa data não existe.')
    expect(wrapper.get('#data-nascimento-erro .visualmente-oculto').text()).toBe('Erro:')
  })

  it('a dica extra só aparece (e entra no aria-describedby) com "Mostrar dicas extras" ligado', async () => {
    const { wrapper, entrada } = montarCampo({ dica: 'Pode digitar só os números.' })
    expect(wrapper.find('.dica-extra').exists()).toBe(false)
    expect(entrada().attributes('aria-describedby')).toBeUndefined()
    useConfiguracoesStore().dicasExtras = true
    await wrapper.vm.$nextTick()
    expect(wrapper.get('#data-nascimento-dica').text()).toBe('Dica: Pode digitar só os números.')
    expect(entrada().attributes('aria-describedby')).toBe('data-nascimento-dica')
  })

  it('sem máscara (como no nome): o texto não muda enquanto digita; formata só ao sair do campo', async () => {
    const { entrada, valor } = montarCampo({ formatar: formatarData })
    await entrada().setValue('15031980')
    expect(valor.value).toBe('15031980')
    expect((entrada().element as HTMLInputElement).value).toBe('15031980')
    await entrada().trigger('blur')
    expect(valor.value).toBe('15/03/1980')
    expect((entrada().element as HTMLInputElement).value).toBe('15/03/1980')
  })

  it('sem máscara: aceita colar qualquer texto e formata ao sair do campo', async () => {
    const { entrada, valor } = montarCampo({ formatar: formatarData })
    await entrada().setValue('1980-03-15')
    expect(valor.value).toBe('1980-03-15')
    await entrada().trigger('blur')
    expect(valor.value).toBe('15/03/1980')
  })

  it('com máscara: tira o que não é número, limita o tamanho e formata enquanto digita', async () => {
    const { entrada, valor } = montarCampo({ mascarar: mascararData })
    await entrada().setValue('15a03b1980999')
    expect(valor.value).toBe('15/03/1980')
    expect((entrada().element as HTMLInputElement).value).toBe('15/03/1980')
  })

  it('com máscara: digitar no meio deixa o cursor logo depois do número digitado', async () => {
    const { entrada, valor } = montarCampo({ mascarar: mascararData }, '15/03')
    const campo = entrada().element as HTMLInputElement
    campo.focus()
    campo.value = '151/03'
    campo.setSelectionRange(3, 3)
    await entrada().trigger('input')
    expect(campo.value).toBe('15/10/3')
    expect(valor.value).toBe('15/10/3')
    expect(campo.selectionStart).toBe(4)
  })

  it('repassa autocomplete, inputmode e tipo', () => {
    const { entrada } = montarCampo({ autocomplete: 'bday', inputmode: 'numeric', tipo: 'text' })
    expect(entrada().attributes('autocomplete')).toBe('bday')
    expect(entrada().attributes('inputmode')).toBe('numeric')
    expect(entrada().attributes('type')).toBe('text')
  })
})