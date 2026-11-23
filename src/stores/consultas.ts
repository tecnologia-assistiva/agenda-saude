import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { lerDados, removerDados, salvarDados } from '@/servicos/armazenamento'
import { chaveDoHorario, horarioDe, type Horario } from '@/servicos/horarios'
import { hojeISO } from '@/utils/datas'
import { dadosPessoaisDe, type DadosPessoais } from '@/utils/validacao'

export interface Consulta {
  protocolo: string
  dados: DadosPessoais
  especialidadeId: string
  profissionalEscolhido: string
  horario: Horario
  remarcacoes: number
}

export type NovaConsulta = Omit<Consulta, 'protocolo' | 'remarcacoes'>

export interface Confirmacao {
  protocolo: string
  tipo: 'agendada' | 'remarcada'
}

export const CHAVE_CONSULTAS = 'consultas'
export const CHAVE_DADOS_SALVOS = 'dados-pessoais'
export const CHAVE_CONFIRMACAO = 'confirmacao'

const FORMATO_PROTOCOLO = /^\d{4}-\d{4}$/

function numeroAleatorio(maximo: number): number {
  if (globalThis.crypto?.getRandomValues) return globalThis.crypto.getRandomValues(new Uint32Array(1))[0]! % maximo
  return Math.floor(Math.random() * maximo)
}

export function gerarProtocolo(existentes: ReadonlySet<string>, sortear = numeroAleatorio): string {
  for (;;) {
    const numero = String(sortear(100_000_000)).padStart(8, '0')
    const protocolo = `${numero.slice(0, 4)}-${numero.slice(4)}`
    if (!existentes.has(protocolo)) return protocolo
  }
}

function consultaDe(valor: unknown): Consulta | null {
  if (typeof valor !== 'object' || valor === null) return null
  const c = valor as Record<string, unknown>
  const horario = horarioDe(c.horario)
  if (typeof c.protocolo !== 'string' || !FORMATO_PROTOCOLO.test(c.protocolo) || !horario) return null
  if (typeof c.especialidadeId !== 'string' || typeof c.profissionalEscolhido !== 'string') return null
  return {
    protocolo: c.protocolo,
    dados: dadosPessoaisDe(c.dados),
    especialidadeId: c.especialidadeId,
    profissionalEscolhido: c.profissionalEscolhido,
    horario,
    remarcacoes: typeof c.remarcacoes === 'number' && c.remarcacoes >= 0 ? Math.floor(c.remarcacoes) : 0,
  }
}

export function validarConsultas(dados: unknown): Consulta[] | null {
  if (!Array.isArray(dados)) return null
  return dados.map(consultaDe).filter((c): c is Consulta => c !== null)
}

function validarConfirmacao(dados: unknown): Confirmacao | null {
  if (typeof dados !== 'object' || dados === null) return null
  const c = dados as Record<string, unknown>
  if (typeof c.protocolo !== 'string' || (c.tipo !== 'agendada' && c.tipo !== 'remarcada')) return null
  return { protocolo: c.protocolo, tipo: c.tipo }
}

function copiar(nova: NovaConsulta): NovaConsulta {
  return {
    dados: { ...nova.dados },
    especialidadeId: nova.especialidadeId,
    profissionalEscolhido: nova.profissionalEscolhido,
    horario: { ...nova.horario },
  }
}

const porDataEHora = (a: Consulta, b: Consulta) =>
  `${a.horario.data} ${a.horario.hora}`.localeCompare(`${b.horario.data} ${b.horario.hora}`)

export const useConsultasStore = defineStore('consultas', () => {
  const lista = ref<Consulta[]>(lerDados(CHAVE_CONSULTAS, validarConsultas) ?? [])
  const dadosSalvos = ref<DadosPessoais | null>(lerDados(CHAVE_DADOS_SALVOS, dadosPessoaisDe))
  const ultimaConfirmacao = ref<Confirmacao | null>(lerDados(CHAVE_CONFIRMACAO, validarConfirmacao))
  const salvamentoFalhou = ref(false)

  watch(
    lista,
    (atual) => {
      salvamentoFalhou.value = !salvarDados(CHAVE_CONSULTAS, atual)
    },
    { deep: true, flush: 'sync' },
  )

  function buscar(protocolo: string | null | undefined): Consulta | undefined {
    return lista.value.find((c) => c.protocolo === protocolo)
  }

  const proximas = computed(() => {
    const hoje = hojeISO()
    return lista.value.filter((c) => c.horario.data >= hoje).sort(porDataEHora)
  })

  function horariosMarcados(exceto: string | null = null): Set<string> {
    return new Set(lista.value.filter((c) => c.protocolo !== exceto).map((c) => chaveDoHorario(c.horario)))
  }

  const confirmacaoAtual = computed(() => {
    const confirmacao = ultimaConfirmacao.value
    const consulta = buscar(confirmacao?.protocolo)
    return confirmacao && consulta ? { consulta, tipo: confirmacao.tipo } : null
  })

  function registrar(consulta: Consulta, tipo: Confirmacao['tipo']): void {
    dadosSalvos.value = { ...consulta.dados }
    salvarDados(CHAVE_DADOS_SALVOS, dadosSalvos.value)
    ultimaConfirmacao.value = { protocolo: consulta.protocolo, tipo }
    salvarDados(CHAVE_CONFIRMACAO, ultimaConfirmacao.value)
  }

  function agendar(nova: NovaConsulta): Consulta {
    const protocolo = gerarProtocolo(new Set(lista.value.map((c) => c.protocolo)))
    lista.value.push({ ...copiar(nova), protocolo, remarcacoes: 0 })
    const consulta = buscar(protocolo) as Consulta
    registrar(consulta, 'agendada')
    return consulta
  }

  function remarcar(protocolo: string, nova: NovaConsulta): Consulta | null {
    const consulta = buscar(protocolo)
    if (!consulta) return null
    Object.assign(consulta, copiar(nova), { remarcacoes: consulta.remarcacoes + 1 })
    registrar(consulta, 'remarcada')
    return consulta
  }

  function cancelar(protocolo: string): Consulta | null {
    const indice = lista.value.findIndex((c) => c.protocolo === protocolo)
    if (indice < 0) return null
    return lista.value.splice(indice, 1)[0] ?? null
  }

  function apagarDadosSalvos(): void {
    dadosSalvos.value = null
    removerDados(CHAVE_DADOS_SALVOS)
  }

  return {
    lista,
    proximas,
    dadosSalvos,
    confirmacaoAtual,
    salvamentoFalhou,
    buscar,
    horariosMarcados,
    agendar,
    remarcar,
    cancelar,
    apagarDadosSalvos,
  }
})