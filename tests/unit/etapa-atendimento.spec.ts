import { flushPromises } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { montarApp } from './ajuda/montar-app'
import { DADOS_VALIDOS, lerRascunhoSalvo, salvarRascunho } from './ajuda/rascunho'

const HORARIO = { data: '2026-11-25', hora: '09:00', profissionalId: 'helena-duarte' }

async function abrirEtapa2(parcial: Parameters<typeof salvarRascunho>[0] = {}) {
  salvarRascunho({ dados: DADOS_VALIDOS, ...parcial })
  return montarApp('/agendar/atendimento')
}

async function marcar(nome: string, valor: string) {
  const radio = document.querySelector<HTMLInputElement>(`input[name="${nome}"][value="${valor}"]`)
  if (!radio) throw new Error(`Opção ${nome}=${valor} não existe`)
  radio.checked = true
  radio.dispatchEvent(new Event('change'))
  await flushPromises()
}

async function enviar() {
  document.querySelector('main form')?.dispatchEvent(new Event('submit', { cancelable: true }))
  await flushPromises()
}

function rotulos(nome: string) {
  return [...document.querySelectorAll(`input[name="${nome}"]`)].map(
    (r) => r.closest('label')?.querySelector('.opcao__rotulo')?.textContent,
  )
}

describe('etapa 2: tipo de atendimento', () => {
  it('especialidades em fieldset com legend; o profissional só aparece depois de escolher a especialidade', async () => {
    await abrirEtapa2()
    const grupo = document.getElementById('especialidade')
    expect(grupo?.tagName).toBe('FIELDSET')
    expect(grupo?.querySelector('legend')?.textContent?.trim()).toBe('Especialidade')
    expect(rotulos('especialidade')).toEqual(['Clínica geral', 'Pediatria', 'Ginecologia', 'Dentista', 'Enfermagem'])
    expect(document.getElementById('profissional')).toBeNull()
  })

  it('"Qualquer profissional" vem primeiro, seguido dos profissionais da especialidade', async () => {
    await abrirEtapa2()
    await marcar('especialidade', 'pediatria')
    expect(document.getElementById('profissional')?.querySelector('legend')?.textContent?.trim()).toBe('Profissional')
    expect(rotulos('profissional')).toEqual(['Qualquer profissional', 'Lúcia Fernandes', 'Paulo Nogueira'])
  })

  it('enviar sem escolher: erro no grupo (aria-describedby no fieldset, aria-invalid nos radios) e resumo com foco', async () => {
    await abrirEtapa2()
    await enviar()
    const grupo = document.getElementById('especialidade')
    expect(grupo?.getAttribute('aria-describedby')).toBe('especialidade-erro')
    expect(document.getElementById('especialidade-erro')?.textContent).toBe('Erro: Escolha uma especialidade.')
    for (const radio of grupo?.querySelectorAll('input') ?? []) {
      expect(radio.getAttribute('aria-invalid')).toBe('true')
    }
    expect(document.activeElement?.classList.contains('resumo-erros')).toBe(true)
    expect(document.querySelector('.resumo-erros h2')?.textContent).toBe('Corrija 1 problema para continuar')
  })

  it('o link do resumo leva o foco à primeira opção do grupo', async () => {
    await abrirEtapa2()
    await enviar()
    document.querySelector<HTMLAnchorElement>('.resumo-erros a')?.click()
    expect(document.activeElement).toBe(document.querySelector('input[name="especialidade"]'))
  })

  it('com especialidade e sem profissional, o erro vai para o grupo do profissional', async () => {
    await abrirEtapa2()
    await marcar('especialidade', 'dentista')
    await enviar()
    expect(document.querySelector('.resumo-erros a')?.getAttribute('href')).toBe('#profissional')
    expect(document.getElementById('profissional-erro')?.textContent).toContain('Escolha um profissional')
  })

  it('com tudo escolhido, segue para a etapa 3', async () => {
    const { router } = await abrirEtapa2()
    await marcar('especialidade', 'clinica-geral')
    await marcar('profissional', 'qualquer')
    await enviar()
    await expect.poll(() => router.currentRoute.value.path).toBe('/agendar/data-e-horario')
    expect(lerRascunhoSalvo()).toMatchObject({ especialidadeId: 'clinica-geral', profissionalId: 'qualquer' })
  })

  it('com horário escolhido, avisa antes que trocar apaga o horário', async () => {
    await abrirEtapa2({ especialidadeId: 'clinica-geral', profissionalId: 'helena-duarte', horario: HORARIO })
    expect(document.querySelector('main form')?.textContent).toContain(
      'Se mudar a especialidade ou o profissional, o horário escolhido será apagado.',
    )
  })

  it('trocar a especialidade apaga só o horário e avisa na tela e na região de status', async () => {
    const { wrapper } = await abrirEtapa2({
      especialidadeId: 'clinica-geral',
      profissionalId: 'helena-duarte',
      horario: HORARIO,
    })
    await marcar('especialidade', 'pediatria')
    const aviso = 'O horário escolhido foi apagado. Escolha outro na próxima etapa.'
    expect(document.querySelector('main form .texto-atencao')?.textContent).toBe(aviso)
    await expect.poll(() => wrapper.get('[data-testid="regiao-status"]').text()).toBe(aviso)
    expect(lerRascunhoSalvo()).toMatchObject({ dados: DADOS_VALIDOS, horario: null, profissionalId: null })
  })

  it('voltar para a etapa 1 e vir de novo mantém a escolha', async () => {
    const { router } = await abrirEtapa2()
    await marcar('especialidade', 'enfermagem')
    await marcar('profissional', 'tiago-alves')
    await router.push('/agendar/seus-dados')
    await router.push('/agendar/atendimento')
    await flushPromises()
    expect(document.querySelector<HTMLInputElement>('input[value="enfermagem"]')?.checked).toBe(true)
    expect(document.querySelector<HTMLInputElement>('input[value="tiago-alves"]')?.checked).toBe(true)
  })
})