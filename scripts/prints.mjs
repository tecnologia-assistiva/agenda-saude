/*
 * Capturas das telas principais nos 3 temas, para o README e o vídeo. É um script, não um teste.
 * Uso: `npm run prints` (gera o build e salva os PNG em docs/prints/, substituindo os anteriores).
 * - Computador (1280 px de largura, página inteira) nos 3 temas; celular (390 px) no tema claro.
 * - Mesma data fixa dos testes (18/11/2026): as capturas não mudam de um dia para o outro.
 */
import { mkdir } from 'node:fs/promises'
import { chromium } from '@playwright/test'
import { preview } from 'vite'

const PASTA = 'docs/prints'
const HOJE = new Date('2026-11-18T10:00:00-03:00')
const TEMAS = ['claro', 'escuro', 'alto-contraste']
const TAMANHOS = [
  { sufixo: '', viewport: { width: 1280, height: 800 }, temas: TEMAS },
  { sufixo: '-celular', viewport: { width: 390, height: 844 }, temas: ['claro'] },
]

const DADOS = { nome: 'Maria da Silva', dataNascimento: '15/03/1980', telefone: '(11) 98765-4321', cartaoSus: '' }
const rascunho = (parcial) => ({
  dados: { nome: '', dataNascimento: '', telefone: '', cartaoSus: '' },
  especialidadeId: null,
  profissionalId: null,
  horario: null,
  remarcando: null,
  usouDadosSalvos: false,
  ...parcial,
})
const ETAPA_3 = rascunho({ dados: DADOS, especialidadeId: 'clinica-geral', profissionalId: 'qualquer' })
const consulta = (protocolo, data, hora, especialidadeId, profissionalId) => ({
  protocolo,
  dados: DADOS,
  especialidadeId,
  profissionalEscolhido: profissionalId,
  horario: { data, hora, profissionalId },
  remarcacoes: 0,
})
const CONSULTAS = [
  consulta('1234-5678', '2026-11-25', '09:00', 'clinica-geral', 'helena-duarte'),
  consulta('2345-6789', '2026-12-02', '14:00', 'dentista', 'camila-rocha'),
]

async function escolherHorarioNoCalendario(page) {
  await page.getByLabel('Escolher no calendário').check()
  await page.locator('.calendario__dia--livre').first().click()
  await page.locator('#horario-do-dia input[type="radio"]').first().check()
}

async function irParaRevisao(page) {
  await page.locator('#horario-proximos input[type="radio"]').first().check()
  await page.getByRole('button', { name: 'Continuar' }).click()
  await page.waitForURL(/revisao$/)
}

/** `paginaInteira: false` = só a parte visível (o diálogo fica no meio da tela). */
const TELAS = [
  { nome: '01-inicio', rota: '' },
  { nome: '02-seus-dados', rota: 'agendar/seus-dados', estado: { rascunho: rascunho({ dados: DADOS }) } },
  {
    nome: '03-erros',
    rota: 'agendar/seus-dados',
    preparar: (page) => page.getByRole('button', { name: 'Continuar' }).click(),
  },
  { nome: '04-atendimento', rota: 'agendar/atendimento', estado: { rascunho: ETAPA_3 } },
  { nome: '05-calendario', rota: 'agendar/data-e-horario', estado: { rascunho: ETAPA_3 }, preparar: escolherHorarioNoCalendario },
  { nome: '06-revisao', rota: 'agendar/data-e-horario', estado: { rascunho: ETAPA_3 }, preparar: irParaRevisao },
  {
    nome: '07-confirmacao',
    rota: 'agendar/data-e-horario',
    estado: { rascunho: ETAPA_3 },
    preparar: async (page) => {
      await irParaRevisao(page)
      await page.getByRole('button', { name: 'Confirmar agendamento' }).click()
      await page.waitForURL(/confirmacao$/)
    },
  },
  { nome: '08-minhas-consultas', rota: 'minhas-consultas', estado: { consultas: CONSULTAS } },
  {
    nome: '09-cancelar-consulta',
    rota: 'minhas-consultas',
    estado: { consultas: CONSULTAS },
    paginaInteira: false,
    preparar: (page) => page.getByRole('button', { name: /^Cancelar a consulta/ }).first().click(),
  },
  { nome: '10-configuracoes', rota: 'configuracoes' },
]

async function capturar(navegador, endereco, tela, tema, tamanho) {
  const contexto = await navegador.newContext({ viewport: tamanho.viewport, locale: 'pt-BR', timezoneId: 'America/Sao_Paulo' })
  const page = await contexto.newPage()
  await page.clock.setFixedTime(HOJE)
  const chaves = { configuracoes: { tema }, ...tela.estado }
  await page.addInitScript((dados) => {
    if (sessionStorage.getItem('prints')) return
    sessionStorage.setItem('prints', '1')
    for (const [chave, valor] of Object.entries(dados)) {
      localStorage.setItem(`agenda-saude:${chave}`, JSON.stringify({ versao: 1, dados: valor }))
    }
  }, chaves)
  await page.goto(endereco + tela.rota)
  await page.locator('main h1').waitFor()
  if (tela.preparar) await tela.preparar(page)
  await page.waitForTimeout(150)
  const arquivo = `${PASTA}/${tela.nome}-${tema}${tamanho.sufixo}.png`
  await page.screenshot({ path: arquivo, fullPage: tela.paginaInteira !== false, animations: 'disabled' })
  await contexto.close()
  return arquivo
}

await mkdir(PASTA, { recursive: true })
const servidor = await preview({ preview: { port: 4174, strictPort: true }, logLevel: 'warn' })
const navegador = await chromium.launch()
try {
  const endereco = servidor.resolvedUrls.local[0]
  let total = 0
  for (const tamanho of TAMANHOS) {
    for (const tema of tamanho.temas) {
      for (const tela of TELAS) {
        await capturar(navegador, endereco, tela, tema, tamanho)
        total += 1
      }
    }
  }
  console.log(`${total} capturas em ${PASTA}/`)
} finally {
  await navegador.close()
  await servidor.close()
}
