<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAnunciador } from '@/composables/useAnunciador'
import { useFormulario } from '@/composables/useFormulario'
import { destinoAoContinuar, etapa, legendaDaEtapa } from '@/router/etapas'
import { QUALQUER_PROFISSIONAL, buscarProfissional } from '@/servicos/catalogo'
import {
  chaveDoHorario,
  contarPorDia,
  horarioAindaValido,
  horarioDaChave,
  horariosParaEscolha,
  janelaDeAgendamento,
  type Horario,
} from '@/servicos/horarios'
import { useAgendamentoStore } from '@/stores/agendamento'
import { formatarDataLonga, hojeISO } from '@/utils/datas'
import TituloPagina from '@/components/comum/TituloPagina.vue'
import GrupoOpcoes, { type Opcao } from '@/components/formulario/GrupoOpcoes.vue'
import ResumoErros from '@/components/formulario/ResumoErros.vue'
import AvisoEtapaIncompleta from '@/components/agendamento/AvisoEtapaIncompleta.vue'
import AvisoRemarcacao from '@/components/agendamento/AvisoRemarcacao.vue'
import CalendarioDatas from '@/components/agendamento/CalendarioDatas.vue'
import NavegacaoEtapa from '@/components/agendamento/NavegacaoEtapa.vue'

type Modo = 'proximos' | 'calendario'

const QUANTIDADE_PROXIMOS = 10
const HORARIO_APAGADO = 'O horário escolhido antes foi apagado.'
const MENSAGEM_HORARIO_APAGADO = `${HORARIO_APAGADO} Escolha um horário do novo dia.`

const route = useRoute()
const router = useRouter()
const { anunciar } = useAnunciador()
const agendamento = useAgendamentoStore()
const rascunho = agendamento.rascunho

const hoje = hojeISO()
const { fim } = janelaDeAgendamento(hoje)

const horarios = computed(() =>
  horariosParaEscolha(hoje, rascunho.especialidadeId, rascunho.profissionalId, agendamento.horariosOcupados),
)
const livresPorDia = computed(() => contarPorDia(horarios.value))
const proximos = computed(() => horarios.value.slice(0, QUANTIDADE_PROXIMOS))
const comQualquerProfissional = computed(() => rascunho.profissionalId === QUALQUER_PROFISSIONAL)

const horarioVencido = ref(false)
if (
  rascunho.horario &&
  !horarioAindaValido(rascunho.horario, hoje, rascunho.especialidadeId, rascunho.profissionalId, agendamento.horariosOcupados)
) {
  rascunho.horario = null
  horarioVencido.value = true
}

const opcoesModo: Opcao<Modo>[] = [
  { valor: 'proximos', rotulo: 'Ver próximos horários disponíveis' },
  { valor: 'calendario', rotulo: 'Escolher no calendário' },
]

const horarioGuardado = rascunho.horario
const estaNosProximos = (h: Horario) => proximos.value.some((p) => chaveDoHorario(p) === chaveDoHorario(h))
const modo = ref<Modo>(horarioGuardado && !estaNosProximos(horarioGuardado) ? 'calendario' : 'proximos')
const diaEscolhido = ref<string | null>(horarioGuardado?.data ?? null)
const horarioApagado = ref(false)
const temHorario = computed(() => rascunho.horario !== null)

const chaveSelecionada = computed<string | null>({
  get: () => (rascunho.horario ? chaveDoHorario(rascunho.horario) : null),
  set: (chave) => {
    rascunho.horario = chave ? horarioDaChave(chave) : null
  },
})

const diaDoCalendario = computed<string | null>({
  get: () => diaEscolhido.value,
  set: (data) => {
    if (!data) return
    const apagou = rascunho.horario !== null && rascunho.horario.data !== data
    if (apagou) {
      rascunho.horario = null
      horarioApagado.value = true
    }
    diaEscolhido.value = data
    const quantidade = livresPorDia.value.get(data) ?? 0
    const texto = quantidade === 1 ? '1 horário livre' : `${quantidade} horários livres`
    const partes = [`${formatarDataLonga(data)} escolhido.`, apagou ? HORARIO_APAGADO : null, `${texto} logo abaixo do calendário.`]
    anunciar(partes.filter(Boolean).join(' '))
  },
})

function opcaoDoHorario(h: Horario, comData: boolean): Opcao<string> {
  return {
    valor: chaveDoHorario(h),
    rotulo: comData ? `${formatarDataLonga(h.data)}, às ${h.hora}` : h.hora,
    descricao: comQualquerProfissional.value ? `Com ${buscarProfissional(h.profissionalId)?.nome}` : undefined,
  }
}

const opcoesProximos = computed(() => proximos.value.map((h) => opcaoDoHorario(h, true)))
const opcoesDoDia = computed(() =>
  horarios.value.filter((h) => h.data === diaEscolhido.value).map((h) => opcaoDoHorario(h, false)),
)

const { erros, listaErros, tentativa, validarAoEnviar } = useFormulario({
  campos: [
    { chave: 'horarioProximos', id: 'horario-proximos' },
    { chave: 'dia', id: 'calendario' },
    { chave: 'horarioDoDia', id: 'horario-do-dia' },
  ],
  validar: () => {
    if (rascunho.horario) return {}
    if (modo.value === 'proximos') return { horarioProximos: 'Escolha um dos horários.' }
    if (!diaEscolhido.value) return { dia: 'Escolha um dia no calendário.' }
    return { horarioDoDia: 'Escolha um horário.' }
  },
  titulo: () => route.meta.titulo,
})

watch(modo, (novo) => {
  erros.value = {}
  if (novo === 'calendario' && rascunho.horario) diaEscolhido.value = rascunho.horario.data
})

function continuar() {
  if (validarAoEnviar()) router.push(destinoAoContinuar(3, route.query))
}
</script>

<template>
  <TituloPagina :legenda="legendaDaEtapa(3)">Data e horário</TituloPagina>
  <AvisoEtapaIncompleta />
  <AvisoRemarcacao />
  <form novalidate @submit.prevent="continuar">
    <ResumoErros :erros="listaErros" :tentativa="tentativa" />
    <p v-if="horarioVencido" class="texto-atencao">O horário escolhido antes não está mais livre. Escolha outro.</p>

    <GrupoOpcoes v-model="modo" legenda="Como você prefere escolher?" nome="modo" :opcoes="opcoesModo" />

    <GrupoOpcoes
      v-if="modo === 'proximos'"
      id="horario-proximos"
      v-model="chaveSelecionada"
      legenda="Próximos horários livres"
      nome="horario"
      :nivel-titulo="2"
      :opcoes="opcoesProximos"
      :erro="erros.horarioProximos"
    />

    <template v-else>
      <p v-if="horarioApagado" class="texto-atencao">{{ MENSAGEM_HORARIO_APAGADO }}</p>
      <p v-else-if="temHorario">Se escolher outro dia, o horário escolhido será apagado.</p>
      <CalendarioDatas
        id="calendario"
        v-model="diaDoCalendario"
        :hoje="hoje"
        :fim="fim"
        :livres-por-dia="livresPorDia"
        :erro="erros.dia"
      />
      <GrupoOpcoes
        v-if="diaEscolhido"
        id="horario-do-dia"
        v-model="chaveSelecionada"
        :legenda="`Horários de ${formatarDataLonga(diaEscolhido)}`"
        nome="horario"
        :nivel-titulo="2"
        :opcoes="opcoesDoDia"
        :erro="erros.horarioDoDia"
        :em-linha="!comQualquerProfissional"
      />
    </template>

    <NavegacaoEtapa :voltar-para="etapa(2).caminho" />
  </form>
</template>