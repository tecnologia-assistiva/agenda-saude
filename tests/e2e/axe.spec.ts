import { expect, test, type Page } from '@playwright/test'
import {
  CONSULTAS,
  DADOS,
  RASCUNHO_ETAPA_3,
  TEMAS,
  abrir,
  confirmar,
  escolherDiaNoCalendario,
  escolherPrimeiroHorario,
  preparar,
  rascunho,
  verificarAxe,
  type Estado,
} from './ajuda'

interface Cenario {
  nome: string
  estado?: Estado
  ir: (page: Page) => Promise<void>
}

const enviar = (page: Page) => page.locator('main form button[type="submit"]').click()

const CENARIOS: Cenario[] = [
  { nome: 'início', ir: (page) => abrir(page, './') },
  { nome: 'configurações', ir: (page) => abrir(page, 'configuracoes') },
  { nome: 'acessibilidade', ir: (page) => abrir(page, 'acessibilidade') },
  { nome: 'página não encontrada', ir: (page) => abrir(page, 'pagina-que-nao-existe') },
  {
    nome: 'etapa 1 com erros',
    ir: async (page) => {
      await abrir(page, 'agendar/seus-dados')
      await enviar(page)
      await expect(page.locator('.resumo-erros')).toBeFocused()
    },
  },
  {
    nome: 'etapa 1 preenchida',
    estado: { rascunho: rascunho({ dados: DADOS }) },
    ir: (page) => abrir(page, 'agendar/seus-dados'),
  },
  {
    nome: 'etapa 1 com dados salvos',
    estado: { dadosPessoais: DADOS },
    ir: async (page) => {
      await abrir(page, 'agendar')
      await expect(page.getByText('Usamos os dados do seu último agendamento.')).toBeVisible()
    },
  },
  {
    nome: 'diálogo "Apagar meus dados"',
    estado: { dadosPessoais: DADOS },
    ir: async (page) => {
      await abrir(page, 'agendar')
      await page.getByRole('button', { name: 'Apagar meus dados' }).click()
      await expect(page.getByRole('dialog', { name: 'Apagar seus dados?' })).toBeVisible()
    },
  },
  {
    nome: 'etapa 2 com erros',
    estado: { rascunho: rascunho({ dados: DADOS }) },
    ir: async (page) => {
      await abrir(page, 'agendar/atendimento')
      await enviar(page)
      await expect(page.locator('.resumo-erros')).toBeFocused()
    },
  },
  {
    nome: 'etapa 2 preenchida',
    estado: { rascunho: RASCUNHO_ETAPA_3 },
    ir: (page) => abrir(page, 'agendar/atendimento'),
  },
  {
    nome: 'etapa 3 com erros',
    estado: { rascunho: RASCUNHO_ETAPA_3 },
    ir: async (page) => {
      await abrir(page, 'agendar/data-e-horario')
      await enviar(page)
      await expect(page.locator('.resumo-erros')).toBeFocused()
    },
  },
  {
    nome: 'etapa 3: calendário com dia escolhido',
    estado: { rascunho: RASCUNHO_ETAPA_3 },
    ir: async (page) => {
      await abrir(page, 'agendar/data-e-horario')
      await escolherDiaNoCalendario(page)
    },
  },
  {
    nome: 'revisão',
    estado: { rascunho: RASCUNHO_ETAPA_3 },
    ir: (page) => escolherPrimeiroHorario(page),
  },
  {
    nome: 'confirmação',
    estado: { rascunho: RASCUNHO_ETAPA_3 },
    ir: async (page) => {
      await escolherPrimeiroHorario(page)
      await confirmar(page)
    },
  },
  {
    nome: 'Minhas consultas sem consultas',
    ir: async (page) => {
      await abrir(page, 'minhas-consultas')
      await expect(page.getByText('Você não tem consultas marcadas.')).toBeVisible()
    },
  },
  {
    nome: 'Minhas consultas com consultas',
    estado: { consultas: CONSULTAS },
    ir: async (page) => {
      await abrir(page, 'minhas-consultas')
      await expect(page.locator('main li')).toHaveCount(2)
    },
  },
  {
    nome: 'diálogo "Cancelar esta consulta?"',
    estado: { consultas: CONSULTAS },
    ir: async (page) => {
      await abrir(page, 'minhas-consultas')
      await page.getByRole('button', { name: /^Cancelar a consulta/ }).first().click()
      await expect(page.getByRole('dialog', { name: 'Cancelar esta consulta?' })).toBeVisible()
    },
  },
]

for (const tema of TEMAS) {
  test.describe(`axe no tema ${tema}`, () => {
    for (const cenario of CENARIOS) {
      test(cenario.nome, async ({ page }) => {
        await preparar(page, { ...cenario.estado, configuracoes: { tema } })
        await cenario.ir(page)
        await expect(page.locator('html')).toHaveAttribute('data-tema', tema)
        await verificarAxe(page, `${cenario.nome} (${tema})`)
      })
    }
  })
}