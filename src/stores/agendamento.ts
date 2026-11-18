import { defineStore } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import { lerDados, removerDados, salvarDados } from '@/servicos/armazenamento'
import { profissionalValido } from '@/servicos/catalogo'
import { validarDadosPessoais, type DadosPessoais } from '@/utils/validacao'

/*
 * Rascunho do agendamento em andamento. Os campos das etapas editam o rascunho direto, e ele é
 * salvo no localStorage a cada mudança: voltar uma etapa, recarregar ou fechar a página não
 * apaga nada. Uma etapa está completa quando os dados dela são válidos.
 */

export interface HorarioEscolhido {
  /** AAAA-MM-DD */
  data: string
  /** HH:MM */
  hora: string
  /** Profissional que vai atender (útil quando a escolha foi "Qualquer profissional"). */
  profissionalId: string
}

export interface Rascunho {
  dados: DadosPessoais
  especialidadeId: string | null
  profissionalId: string | null
  horario: HorarioEscolhido | null
}

export const CHAVE_RASCUNHO = 'rascunho'

export function rascunhoVazio(): Rascunho {
  return {
    dados: { nome: '', dataNascimento: '', telefone: '', cartaoSus: '' },
    especialidadeId: null,
    profissionalId: null,
    horario: null,
  }
}

const texto = (valor: unknown) => (typeof valor === 'string' ? valor : '')
const textoOuNulo = (valor: unknown) => (typeof valor === 'string' && valor ? valor : null)

function validarHorario(valor: unknown): HorarioEscolhido | null {
  if (typeof valor !== 'object' || valor === null) return null
  const h = valor as Record<string, unknown>
  if (typeof h.data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(h.data)) return null
  if (typeof h.hora !== 'string' || !/^\d{2}:\d{2}$/.test(h.hora)) return null
  if (typeof h.profissionalId !== 'string') return null
  return { data: h.data, hora: h.hora, profissionalId: h.profissionalId }
}

/** Aceita o que estava salvo, trocando por vazio o que não tiver o tipo certo. */
export function validarRascunho(dados: unknown): Rascunho | null {
  if (typeof dados !== 'object' || dados === null) return null
  const r = dados as Record<string, unknown>
  const pessoais = (typeof r.dados === 'object' && r.dados !== null ? r.dados : {}) as Record<string, unknown>
  return {
    dados: {
      nome: texto(pessoais.nome),
      dataNascimento: texto(pessoais.dataNascimento),
      telefone: texto(pessoais.telefone),
      cartaoSus: texto(pessoais.cartaoSus),
    },
    especialidadeId: textoOuNulo(r.especialidadeId),
    profissionalId: textoOuNulo(r.profissionalId),
    horario: validarHorario(r.horario),
  }
}

export const useAgendamentoStore = defineStore('agendamento', () => {
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

  const etapasCompletas = computed<Record<number, boolean>>(() => ({
    1: Object.keys(validarDadosPessoais(rascunho.dados)).length === 0,
    2: profissionalValido(rascunho.especialidadeId, rascunho.profissionalId),
    3: rascunho.horario !== null,
    // A revisão só se completa ao confirmar a consulta (etapa 4 do projeto).
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
    () =>
      Object.values(rascunho.dados).some((valor) => valor.trim() !== '') ||
      rascunho.especialidadeId !== null ||
      rascunho.horario !== null,
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
    removerDados(CHAVE_RASCUNHO)
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
  }
})
