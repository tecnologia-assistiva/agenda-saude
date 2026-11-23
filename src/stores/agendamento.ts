import { defineStore } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import { lerDados, removerDados, salvarDados } from '@/servicos/armazenamento'
import { profissionalValido } from '@/servicos/catalogo'
import { horarioAindaValido, horarioDe, type Horario } from '@/servicos/horarios'
import { useConsultasStore, type Consulta } from '@/stores/consultas'
import { hojeISO } from '@/utils/datas'
import { dadosPessoaisDe, validarDadosPessoais, type DadosPessoais } from '@/utils/validacao'

export type HorarioEscolhido = Horario

export interface Rascunho {
  dados: DadosPessoais
  especialidadeId: string | null
  profissionalId: string | null
  horario: HorarioEscolhido | null
  remarcando: string | null
  usouDadosSalvos: boolean
}

export const CHAVE_RASCUNHO = 'rascunho'

export function rascunhoVazio(): Rascunho {
  return {
    dados: { nome: '', dataNascimento: '', telefone: '', cartaoSus: '' },
    especialidadeId: null,
    profissionalId: null,
    horario: null,
    remarcando: null,
    usouDadosSalvos: false,
  }
}

const textoOuNulo = (valor: unknown) => (typeof valor === 'string' && valor ? valor : null)

export function validarRascunho(dados: unknown): Rascunho | null {
  if (typeof dados !== 'object' || dados === null) return null
  const r = dados as Record<string, unknown>
  return {
    dados: dadosPessoaisDe(r.dados),
    especialidadeId: textoOuNulo(r.especialidadeId),
    profissionalId: textoOuNulo(r.profissionalId),
    horario: horarioDe(r.horario),
    remarcando: textoOuNulo(r.remarcando),
    usouDadosSalvos: r.usouDadosSalvos === true,
  }
}

const temAlgumTexto = (dados: DadosPessoais) => Object.values(dados).some((valor) => valor.trim() !== '')

export const useAgendamentoStore = defineStore('agendamento', () => {
  const consultas = useConsultasStore()
  const rascunho = reactive<Rascunho>(lerDados(CHAVE_RASCUNHO, validarRascunho) ?? rascunhoVazio())
  const salvamentoFalhou = ref(false)

  watch(
    rascunho,
    (atual) => {
      salvamentoFalhou.value = !salvarDados(CHAVE_RASCUNHO, atual)
    },
    { deep: true, flush: 'sync' },
  )

  const horariosOcupados = computed(() => consultas.horariosMarcados(rascunho.remarcando))

  const etapasCompletas = computed<Record<number, boolean>>(() => ({
    1: Object.keys(validarDadosPessoais(rascunho.dados)).length === 0,
    2: profissionalValido(rascunho.especialidadeId, rascunho.profissionalId),
    3:
      rascunho.horario !== null &&
      horarioAindaValido(
        rascunho.horario,
        hojeISO(),
        rascunho.especialidadeId,
        rascunho.profissionalId,
        horariosOcupados.value,
      ),
    4: false,
    5: false,
  }))

  function etapaCompleta(numero: number): boolean {
    return etapasCompletas.value[numero] === true
  }

  const primeiraEtapaIncompleta = computed(() => [1, 2, 3, 4].find((n) => !etapaCompleta(n)) ?? 5)

  const iniciado = computed(
    () => temAlgumTexto(rascunho.dados) || rascunho.especialidadeId !== null || rascunho.horario !== null,
  )

  function escolherEspecialidade(id: string | null): boolean {
    if (id === rascunho.especialidadeId) return false
    const tinhaHorario = rascunho.horario !== null
    rascunho.especialidadeId = id
    rascunho.profissionalId = null
    rascunho.horario = null
    return tinhaHorario
  }

  function escolherProfissional(id: string | null): boolean {
    if (id === rascunho.profissionalId) return false
    const tinhaHorario = rascunho.horario !== null
    rascunho.profissionalId = id
    rascunho.horario = null
    return tinhaHorario
  }

  function limparRascunho(): void {
    const vazio = rascunhoVazio()
    Object.assign(rascunho.dados, vazio.dados)
    rascunho.especialidadeId = null
    rascunho.profissionalId = null
    rascunho.horario = null
    rascunho.remarcando = null
    rascunho.usouDadosSalvos = false
    removerDados(CHAVE_RASCUNHO)
  }

  function preencherComDadosSalvos(): boolean {
    const salvos = consultas.dadosSalvos
    if (!salvos || !temAlgumTexto(salvos) || rascunho.remarcando || temAlgumTexto(rascunho.dados)) return false
    Object.assign(rascunho.dados, salvos)
    rascunho.usouDadosSalvos = true
    return true
  }

  function apagarDadosPessoais(): void {
    consultas.apagarDadosSalvos()
    Object.assign(rascunho.dados, rascunhoVazio().dados)
    rascunho.usouDadosSalvos = false
  }

  function carregarConsulta(consulta: Consulta): void {
    Object.assign(rascunho.dados, consulta.dados)
    rascunho.especialidadeId = consulta.especialidadeId
    rascunho.profissionalId = consulta.profissionalEscolhido
    rascunho.horario = null
    rascunho.remarcando = consulta.protocolo
    rascunho.usouDadosSalvos = false
  }

  function confirmar(): Consulta | null {
    const { especialidadeId, profissionalId, horario } = rascunho
    if (primeiraEtapaIncompleta.value < 4 || !especialidadeId || !profissionalId || !horario) return null
    const nova = { dados: { ...rascunho.dados }, especialidadeId, profissionalEscolhido: profissionalId, horario }
    const remarcada = rascunho.remarcando ? consultas.remarcar(rascunho.remarcando, nova) : null
    return remarcada ?? consultas.agendar(nova)
  }

  return {
    rascunho,
    salvamentoFalhou,
    etapaCompleta,
    primeiraEtapaIncompleta,
    iniciado,
    escolherEspecialidade,
    escolherProfissional,
    limparRascunho,
    preencherComDadosSalvos,
    apagarDadosPessoais,
    carregarConsulta,
    confirmar,
    horariosOcupados,
  }
})