import { describe, expect, it } from 'vitest'
import { montarApp, navegar } from './ajuda/montar-app'
import { DADOS_VALIDOS, salvarRascunho } from './ajuda/rascunho'

function itensDoIndicador() {
  return [...document.querySelectorAll('ol.etapas > li')]
}

function texto(el: Element | null | undefined) {
  return el?.textContent?.replace(/\s+/g, ' ').trim()
}

describe('fluxo em etapas: guardas', () => {
  it('"/agendar" leva à primeira etapa que falta', async () => {
    const { router } = await montarApp('/agendar')
    expect(router.currentRoute.value.path).toBe('/agendar/seus-dados')
  })

  it('com os dados completos, "/agendar" leva à etapa 2', async () => {
    salvarRascunho({ dados: DADOS_VALIDOS })
    const { router } = await montarApp('/agendar')
    expect(router.currentRoute.value.path).toBe('/agendar/atendimento')
  })

  it('abrir uma etapa fora de ordem leva à primeira incompleta, com aviso logo depois do h1', async () => {
    const { router } = await montarApp('/agendar/data-e-horario')
    expect(router.currentRoute.value.path).toBe('/agendar/seus-dados')
    const aviso = document.querySelector('main h1 + .texto-atencao')
    expect(aviso?.textContent).toBe('Complete esta etapa antes de seguir.')
  })

  it('sem aviso quando a pessoa entra pelo caminho normal', async () => {
    await montarApp('/agendar')
    expect(document.querySelector('main .texto-atencao')).toBeNull()
  })

  it('confirmação não abre sem uma consulta confirmada', async () => {
    salvarRascunho({ dados: DADOS_VALIDOS, especialidadeId: 'dentista', profissionalId: 'qualquer' })
    const { router } = await montarApp('/agendar/confirmacao')
    expect(router.currentRoute.value.path).toBe('/agendar/data-e-horario')
  })
})

describe('indicador de etapas', () => {
  it('lista ordenada com "Etapa X de 5" em cada item e aria-current="step" só na atual', async () => {
    await montarApp('/agendar/seus-dados')
    const lista = document.querySelector('ol.etapas')
    expect(lista?.getAttribute('aria-label')).toBe('Etapas do agendamento')
    const itens = itensDoIndicador()
    expect(itens).toHaveLength(5)
    expect(itens.map((li) => texto(li.querySelector('.etapas__numero')))).toEqual([
      'Etapa 1 de 5:',
      'Etapa 2 de 5:',
      'Etapa 3 de 5:',
      'Etapa 4 de 5:',
      'Etapa 5 de 5:',
    ])
    expect(itens.map((li) => li.getAttribute('aria-current'))).toEqual(['step', null, null, null, null])
  })

  it('etapas concluídas dizem "concluída" em texto e viram link; as futuras não são link', async () => {
    salvarRascunho({ dados: DADOS_VALIDOS })
    await montarApp('/agendar/atendimento')
    const [primeira, segunda, terceira] = itensDoIndicador()
    const link = primeira?.querySelector('a')
    expect(link?.getAttribute('href')).toBe('/agendar/seus-dados')
    // O nome acessível começa pelo texto visível (2.5.3).
    expect(texto(link)).toBe('Etapa 1 de 5: Seus dados, concluída')
    expect(segunda?.getAttribute('aria-current')).toBe('step')
    expect(segunda?.querySelector('a')).toBeNull()
    expect(terceira?.querySelector('a')).toBeNull()
    expect(texto(terceira)).toBe('Etapa 3 de 5: Data e horário')
  })

  it('o h1 traz a legenda da etapa, então o foco na troca de rota anuncia "Etapa 2 de 5"', async () => {
    salvarRascunho({ dados: DADOS_VALIDOS })
    const { router } = await montarApp('/')
    await navegar(router, '/agendar')
    const h1 = document.querySelector('main h1')
    expect(document.activeElement).toBe(h1)
    expect(texto(h1)).toBe('Etapa 2 de 5: Tipo de atendimento')
    expect(h1?.querySelector('.legenda-etapa')?.textContent).toContain('Etapa 2 de 5')
  })

  it('cada etapa tem o título "Etapa X de 5: Nome – Agenda Saúde"', async () => {
    salvarRascunho({ dados: DADOS_VALIDOS, especialidadeId: 'dentista', profissionalId: 'qualquer' })
    const { router } = await montarApp('/agendar/seus-dados')
    expect(document.title).toBe('Etapa 1 de 5: Seus dados – Agenda Saúde')
    await navegar(router, '/agendar/atendimento')
    expect(document.title).toBe('Etapa 2 de 5: Tipo de atendimento – Agenda Saúde')
    await navegar(router, '/agendar/data-e-horario')
    expect(document.title).toBe('Etapa 3 de 5: Data e horário – Agenda Saúde')
  })
})

describe('menu e início durante o agendamento', () => {
  it('"Agendar consulta" fica marcado como seção atual (aria-current="true") em qualquer etapa', async () => {
    await montarApp('/agendar/seus-dados')
    const link = [...document.querySelectorAll('#menu a')].find((a) => texto(a) === 'Agendar consulta')
    expect(link?.getAttribute('aria-current')).toBe('true')
    const inicio = [...document.querySelectorAll('#menu a')].find((a) => texto(a) === 'Início')
    expect(inicio?.getAttribute('aria-current')).toBeNull()
  })

  it('na página inicial, "Início" tem aria-current="page"', async () => {
    await montarApp('/')
    const inicio = [...document.querySelectorAll('#menu a')].find((a) => texto(a) === 'Início')
    expect(inicio?.getAttribute('aria-current')).toBe('page')
  })

  it('com um agendamento pela metade, o botão do início vira "Continuar agendamento"', async () => {
    salvarRascunho({ dados: { ...DADOS_VALIDOS, telefone: '' } })
    await montarApp('/')
    expect(texto(document.querySelector('main .botao'))).toBe('Continuar agendamento')
  })
})
