import { defineStore } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import { lerDados, removerDados, salvarDados } from '@/servicos/armazenamento'
import { profissionalValido } from '@/servicos/catalogo'
import { horarioAindaValido, horarioDe, type Horario } from '@/servicos/horarios'
import { useConsultasStore, type Consulta } from '@/stores/consultas'
import { hojeISO } from '@/utils/datas'
import { dadosPessoaisDe, validarDadosPessoais, type DadosPessoais } from '@/utils/validacao'

/*
 * Rascunho do agendamento em andamento. Os campos das etapas editam o rascunho direto, e ele é
 * salvo no localStorage a cada mudança: voltar uma etapa, recarregar ou fechar a página não
 * apaga nada. Uma etapa está completa quando os dados dela são válidos.
 * Remarcar usa o mesmo rascunho: `remarcando` guarda o protocolo da consulta que vai mudar.
 */

/** O profissional do horário é quem vai atender (importa quando a escolha foi "Qualquer profissional"). */
export type HorarioEscolhido = Horario

export interface Rascunho {
  dados: DadosPessoais
  especialidadeId: string | null
  profissionalId: string | null
  horario: HorarioEscolhido | null
  /** Protocolo da consulta que está sendo remarcada (null num agendamento novo). */
  remarcando: string | null
  /** Os dados pessoais vieram do último agendamento (a etapa 1 avisa e oferece "Apagar meus dados"). */
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

/** Aceita o que estava salvo, trocando por vazio o que não tiver o tipo certo. */
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
  /** true quando o navegador não deixou salvar o rascunho. */
  const salvamentoFalhou = ref(false)

  watch(
    rascunho,
    (atual) => {
      salvamentoFalhou.value = !salvarDados(CHAVE_RASCUNHO, atual)
    },
    { deep: true, flush: 'sync' },
  )

  /** Horários já marcados em "Minhas consultas" (o da consulta remarcada fica livre para ela). */
  const horariosOcupados = computed(() => consultas.horariosMarcados(rascunho.remarcando))

  const etapasCompletas = computed<Record<number, boolean>>(() => ({
    1: Object.keys(validarDadosPessoais(rascunho.dados)).length === 0,
    2: profissionalValido(rascunho.especialidadeId, rascunho.profissionalId),
    // Um horário antigo (que já passou ou deixou de combinar com a etapa 2) não completa a etapa 3.
    3:
      rascunho.horario !== null &&
      horarioAindaValido(
        rascunho.horario,
        hojeISO(),
        rascunho.especialidadeId,
        rascunho.profissionalId,
        horariosOcupados.value,
      ),
    // A revisão não fica "completa": ao confirmar, o rascunho é apagado (ver `confirmar`).
    4: false,
    5: false,
  }))

  function etapaCompleta(numero: number): boolean {
    return etapasCompletas.value[numero] === true
  }

  /** A etapa mais adiantada que a pessoa pode abrir: todas as anteriores estão completas. */
  const primeiraEtapaIncompleta = computed(() => [1, 2, 3, 4].find((n) => !etapaCompleta(n)) ?? 5)

  /** Já tem alguma coisa preenchida? (Na tela Início, o botão vira "Continuar agendamento".) */
  const iniciado = computed(
    () => temAlgumTexto(rascunho.dados) || rascunho.especialidadeId !== null || rascunho.horario !== null,
  )

  /** Trocar a especialidade apaga o profissional e o horário. Devolve true se havia horário. */
  function escolherEspecialidade(id: string | null): boolean {
    if (id === rascunho.especialidadeId) return false
    const tinhaHorario = rascunho.horario !== null
    rascunho.especialidadeId = id
    rascunho.profissionalId = null
    rascunho.horario = null
    return tinhaHorario
  }

  /** Trocar o profissional apaga só o horário. Devolve true se havia horário. */
  function escolherProfissional(id: string | null): boolean {
    if (id === rascunho.profissionalId) return false
    const tinhaHorario = rascunho.horario !== null
    rascunho.profissionalId = id
    rascunho.horario = null
    return tinhaHorario
  }

  function limparRascunho(): void {
    // Campo a campo: quem guardou uma referência a `rascunho.dados` continua vendo o objeto certo.
    const vazio = rascunhoVazio()
    Object.assign(rascunho.dados, vazio.dados)
    rascunho.especialidadeId = null
    rascunho.profissionalId = null
    rascunho.horario = null
    rascunho.remarcando = null
    rascunho.usouDadosSalvos = false
    removerDados(CHAVE_RASCUNHO)
  }

  /**
   * Agendamento novo com os campos em branco: usa os dados pessoais do último agendamento (3.3.7).
   * Devolve true se preencheu.
   */
  function preencherComDadosSalvos(): boolean {
    const salvos = consultas.dadosSalvos
    if (!salvos || !temAlgumTexto(salvos) || rascunho.remarcando || temAlgumTexto(rascunho.dados)) return false
    Object.assign(rascunho.dados, salvos)
    rascunho.usouDadosSalvos = true
    return true
  }

  /** "Apagar meus dados": esquece os dados salvos e deixa os campos em branco. */
  function apagarDadosPessoais(): void {
    consultas.apagarDadosSalvos()
    Object.assign(rascunho.dados, rascunhoVazio().dados)
    rascunho.usouDadosSalvos = false
  }

  /** Remarcar: a consulta vira o rascunho, com as etapas 1 e 2 prontas e o horário por escolher. */
  function carregarConsulta(consulta: Consulta): void {
    Object.assign(rascunho.dados, consulta.dados)
    rascunho.especialidadeId = consulta.especialidadeId
    rascunho.profissionalId = consulta.profissionalEscolhido
    rascunho.horario = null
    rascunho.remarcando = consulta.protocolo
    rascunho.usouDadosSalvos = false
  }

  /**
   * "Confirmar agendamento" (revisão): cria a consulta, ou atualiza a remarcada (mesmo protocolo).
   * Não apaga o rascunho: a revisão faz isso depois de abrir a confirmação, para a tela não piscar vazia.
   * Devolve null se alguma etapa ficou incompleta (por exemplo, o horário deixou de estar livre).
   */
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
