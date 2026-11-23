import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { useAnunciador } from '@/composables/useAnunciador'
import CalendarioDatas from '@/components/agendamento/CalendarioDatas.vue'

const LIVRES = new Map([
  ['2026-11-19', 4],
  ['2026-11-25', 1],
  ['2026-12-02', 3],
])

function montarCalendario(valorInicial: string | null = null) {
  const escolhido = ref<string | null>(valorInicial)
  const Pai = defineComponent({
    setup: () => () =>
      h(CalendarioDatas, {
        hoje: '2026-11-18',
        fim: '2026-12-18',
        livresPorDia: LIVRES,
        modelValue: escolhido.value,
        'onUpdate:modelValue': (v: string | null) => (escolhido.value = v),
      }),
  })
  const wrapper = mount(Pai, { attachTo: document.body })
  return { wrapper, escolhido }
}

const dia = (data: string) => document.querySelector<HTMLButtonElement>(`[data-data="${data}"]`)
const titulo = () => document.querySelector('.calendario__mes')?.textContent?.trim()
const tabulaveis = () => [...document.querySelectorAll('table button[tabindex="0"]')]

async function teclar(tecla: string) {
  const evento = new KeyboardEvent('keydown', { key: tecla, bubbles: true, cancelable: true })
  document.activeElement?.dispatchEvent(evento)
  await flushPromises()
  return evento
}

describe('calendário: estrutura e nomes', () => {
  it('grade (role="grid") com nome vindo do título do mês, que é região live', () => {
    montarCalendario()
    const tabela = document.querySelector('table')
    expect(tabela?.getAttribute('role')).toBe('grid')
    const titulo = document.getElementById(tabela?.getAttribute('aria-labelledby') ?? '')
    expect(titulo?.textContent).toBe('novembro de 2026')
    expect(titulo?.getAttribute('aria-live')).toBe('polite')
  })

  it('cabeçalhos com o nome completo do dia para o leitor, semana começando no domingo', () => {
    montarCalendario()
    const nomes = [...document.querySelectorAll('thead th .visualmente-oculto')].map((el) => el.textContent)
    expect(nomes).toEqual(['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'])
    expect([...document.querySelectorAll('thead th')].every((th) => th.getAttribute('scope') === 'col')).toBe(true)
  })

  it('nome acessível completo de cada dia, com o número visível dentro dele (2.5.3)', () => {
    montarCalendario()
    expect(dia('2026-11-19')?.textContent).toBe('quinta-feira, 19 de novembro, 4 horários livres')
    expect(dia('2026-11-25')?.textContent).toBe('quarta-feira, 25 de novembro, 1 horário livre')
    expect(dia('2026-11-20')?.textContent).toBe('sexta-feira, 20 de novembro, sem horários')
  })

  it('dia sem vaga: aria-disabled e "sem horários"; dia com vaga não tem aria-disabled', () => {
    montarCalendario()
    expect(dia('2026-11-20')?.getAttribute('aria-disabled')).toBe('true')
    expect(dia('2026-11-19')?.hasAttribute('aria-disabled')).toBe(false)
  })

  it('hoje tem aria-current="date" e "hoje" no nome', () => {
    montarCalendario()
    expect(dia('2026-11-18')?.getAttribute('aria-current')).toBe('date')
    expect(dia('2026-11-18')?.textContent).toBe('quarta-feira, 18 de novembro, hoje, sem horários')
    expect(document.querySelectorAll('[aria-current="date"]')).toHaveLength(1)
  })

  it('a grade é descrita pela legenda "Dias riscados não têm horários livres."', () => {
    montarCalendario()
    const ids = document.querySelector('table')?.getAttribute('aria-describedby')?.split(' ') ?? []
    expect(ids.map((id) => document.getElementById(id)?.textContent)).toContain('Dias riscados não têm horários livres.')
  })

  it('com erro, a mensagem também descreve a grade', async () => {
    const { wrapper } = montarCalendario()
    await wrapper.setProps({})
    const comErro = mount(CalendarioDatas, {
      props: { hoje: '2026-11-18', fim: '2026-12-18', livresPorDia: LIVRES, modelValue: null, erro: 'Escolha um dia no calendário.' },
    })
    const ids = comErro.get('table').attributes('aria-describedby')?.split(' ')
    expect(ids).toContain('calendario-erro')
    expect(comErro.get('#calendario-erro').text()).toBe('Erro: Escolha um dia no calendário.')
    comErro.unmount()
  })
})

describe('calendário: teclado e tabindex móvel', () => {
  it('um único ponto de Tab: o primeiro dia com horário', () => {
    montarCalendario()
    expect(tabulaveis()).toEqual([dia('2026-11-19')])
  })

  it('setas mudam o dia; o foco e o tabindex="0" vão junto', async () => {
    montarCalendario()
    dia('2026-11-19')?.focus()
    await teclar('ArrowRight')
    expect(document.activeElement).toBe(dia('2026-11-20'))
    expect(tabulaveis()).toEqual([dia('2026-11-20')])
    await teclar('ArrowLeft')
    expect(document.activeElement).toBe(dia('2026-11-19'))
    await teclar('ArrowDown')
    expect(document.activeElement).toBe(dia('2026-11-26'))
    await teclar('ArrowUp')
    expect(document.activeElement).toBe(dia('2026-11-19'))
  })

  it('Home e End vão para o domingo e o sábado da semana', async () => {
    montarCalendario()
    dia('2026-11-19')?.focus()
    await teclar('Home')
    expect(document.activeElement).toBe(dia('2026-11-15'))
    await teclar('End')
    expect(document.activeElement).toBe(dia('2026-11-21'))
  })

  it('PageDown e PageUp trocam de mês, e o título (região live) muda', async () => {
    montarCalendario()
    dia('2026-11-19')?.focus()
    const evento = await teclar('PageDown')
    expect(evento.defaultPrevented).toBe(true)
    expect(titulo()).toBe('dezembro de 2026')
    expect(document.activeElement).toBe(dia('2026-12-19'))
    await teclar('PageUp')
    expect(titulo()).toBe('novembro de 2026')
    expect(document.activeElement).toBe(dia('2026-11-19'))
  })

  it('seta no fim do mês passa para o mês seguinte', async () => {
    montarCalendario()
    dia('2026-11-19')?.focus()
    await teclar('End')
    for (let i = 0; i < 9; i++) await teclar('ArrowRight')
    expect(document.activeElement).toBe(dia('2026-11-30'))
    await teclar('ArrowRight')
    expect(titulo()).toBe('dezembro de 2026')
    expect(document.activeElement).toBe(dia('2026-12-01'))
  })

  it('não vai para meses sem horários possíveis (antes de hoje ou depois da janela)', async () => {
    montarCalendario()
    dia('2026-11-19')?.focus()
    await teclar('PageUp')
    expect(titulo()).toBe('novembro de 2026')
    expect(document.activeElement).toBe(dia('2026-11-01'))
    await teclar('PageDown')
    await teclar('PageDown')
    expect(titulo()).toBe('dezembro de 2026')
  })

  it('Enter e Espaço ficam com o comportamento nativo do botão (o calendário não os bloqueia)', async () => {
    montarCalendario()
    dia('2026-11-19')?.focus()
    expect((await teclar('Enter')).defaultPrevented).toBe(false)
    expect((await teclar(' ')).defaultPrevented).toBe(false)
  })
})

describe('calendário: escolher o dia', () => {
  it('escolher um dia com vaga: aria-selected na célula, "selecionado" no nome e o foco fica no dia', async () => {
    const { escolhido } = montarCalendario()
    const botao = dia('2026-11-25')
    botao?.focus()
    botao?.click()
    await flushPromises()
    expect(escolhido.value).toBe('2026-11-25')
    expect(dia('2026-11-25')?.closest('td')?.getAttribute('aria-selected')).toBe('true')
    expect(document.querySelectorAll('[aria-selected="true"]')).toHaveLength(1)
    expect(dia('2026-11-25')?.textContent).toBe('quarta-feira, 25 de novembro, selecionado, 1 horário livre')
    expect(document.activeElement).toBe(dia('2026-11-25'))
    expect(tabulaveis()).toEqual([dia('2026-11-25')])
  })

  it('dia sem vaga não é escolhido; a região de status explica', async () => {
    const { escolhido } = montarCalendario()
    dia('2026-11-20')?.click()
    await flushPromises()
    expect(escolhido.value).toBeNull()
    await expect.poll(() => useAnunciador().mensagemStatus.value).toBe(
      'sexta-feira, 20 de novembro: sem horários livres. Escolha outro dia.',
    )
  })

  it('com um dia já escolhido em outro mês, abre nesse mês com o dia tabulável', () => {
    montarCalendario('2026-12-02')
    expect(titulo()).toBe('dezembro de 2026')
    expect(tabulaveis()).toEqual([dia('2026-12-02')])
  })
})

describe('calendário: botões de mês', () => {
  it('rótulos claros; "Mês anterior" desativado no primeiro mês, sem tirar o botão do Tab', () => {
    montarCalendario()
    const [anterior, proximo] = [...document.querySelectorAll('.calendario__navegacao button')]
    expect(anterior?.textContent?.trim()).toBe('Mês anterior')
    expect(proximo?.textContent?.trim()).toBe('Próximo mês')
    expect(anterior?.getAttribute('aria-disabled')).toBe('true')
    expect(anterior?.hasAttribute('disabled')).toBe(false)
    expect(proximo?.hasAttribute('aria-disabled')).toBe(false)
  })

  it('"Próximo mês" troca o mês, mantém o foco no botão e leva o ponto de Tab ao primeiro dia livre', async () => {
    montarCalendario()
    const proximo = [...document.querySelectorAll<HTMLButtonElement>('.calendario__navegacao button')][1]
    proximo?.focus()
    proximo?.click()
    await flushPromises()
    expect(titulo()).toBe('dezembro de 2026')
    expect(document.activeElement).toBe(proximo)
    expect(tabulaveis()).toEqual([dia('2026-12-02')])
    expect(proximo?.getAttribute('aria-disabled')).toBe('true')
    proximo?.click()
    await flushPromises()
    expect(titulo()).toBe('dezembro de 2026')
  })
})