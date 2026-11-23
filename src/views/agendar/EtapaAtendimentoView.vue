<script setup lang="ts">
/*
 * Etapa 2: especialidade e profissional, em grupos de radio.
 * Trocar a especialidade ou o profissional apaga só o horário já escolhido: a tela avisa antes
 * (texto fixo) e depois (texto na tela + anúncio na região de status).
 */
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAnunciador } from '@/composables/useAnunciador'
import { useFormulario } from '@/composables/useFormulario'
import { destinoAoContinuar, etapa, legendaDaEtapa } from '@/router/etapas'
import {
  QUALQUER_PROFISSIONAL,
  buscarEspecialidade,
  especialidades,
  profissionaisDaEspecialidade,
  profissionalValido,
} from '@/servicos/catalogo'
import { useAgendamentoStore } from '@/stores/agendamento'
import TituloPagina from '@/components/comum/TituloPagina.vue'
import GrupoOpcoes, { type Opcao } from '@/components/formulario/GrupoOpcoes.vue'
import ResumoErros from '@/components/formulario/ResumoErros.vue'
import AvisoEtapaIncompleta from '@/components/agendamento/AvisoEtapaIncompleta.vue'
import AvisoRemarcacao from '@/components/agendamento/AvisoRemarcacao.vue'
import NavegacaoEtapa from '@/components/agendamento/NavegacaoEtapa.vue'

const MENSAGEM_HORARIO_APAGADO = 'O horário escolhido foi apagado. Escolha outro na próxima etapa.'

const route = useRoute()
const router = useRouter()
const agendamento = useAgendamentoStore()
const { anunciar } = useAnunciador()

const horarioApagado = ref(false)
const temHorario = computed(() => agendamento.rascunho.horario !== null)

function avisarHorarioApagado() {
  horarioApagado.value = true
  anunciar(MENSAGEM_HORARIO_APAGADO)
}

const especialidade = computed<string | null>({
  get: () => agendamento.rascunho.especialidadeId,
  set: (id) => {
    if (agendamento.escolherEspecialidade(id)) avisarHorarioApagado()
  },
})

const profissional = computed<string | null>({
  get: () => agendamento.rascunho.profissionalId,
  set: (id) => {
    if (agendamento.escolherProfissional(id)) avisarHorarioApagado()
  },
})

const opcoesEspecialidade: Opcao<string>[] = especialidades.map((e) => ({
  valor: e.id,
  rotulo: e.nome,
  descricao: e.descricao,
}))

const opcoesProfissional = computed<Opcao<string>[]>(() => [
  { valor: QUALQUER_PROFISSIONAL, rotulo: 'Qualquer profissional', descricao: 'Mostra mais horários livres.' },
  ...profissionaisDaEspecialidade(especialidade.value).map((p) => ({ valor: p.id, rotulo: p.nome })),
])

const { erros, listaErros, tentativa, validarAoEnviar } = useFormulario({
  campos: [
    { chave: 'especialidade', id: 'especialidade' },
    { chave: 'profissional', id: 'profissional' },
  ],
  validar: () => {
    const r = agendamento.rascunho
    if (!buscarEspecialidade(r.especialidadeId)) return { especialidade: 'Escolha uma especialidade.' }
    if (!profissionalValido(r.especialidadeId, r.profissionalId)) {
      return { profissional: 'Escolha um profissional ou "Qualquer profissional".' }
    }
    return {}
  },
  titulo: () => route.meta.titulo,
})

function continuar() {
  if (validarAoEnviar()) router.push(destinoAoContinuar(2, route.query))
}
</script>

<template>
  <TituloPagina :legenda="legendaDaEtapa(2)">Tipo de atendimento</TituloPagina>
  <AvisoEtapaIncompleta />
  <AvisoRemarcacao />
  <form novalidate @submit.prevent="continuar">
    <ResumoErros :erros="listaErros" :tentativa="tentativa" />
    <p v-if="horarioApagado" class="texto-atencao">{{ MENSAGEM_HORARIO_APAGADO }}</p>
    <p v-else-if="temHorario">Se mudar a especialidade ou o profissional, o horário escolhido será apagado.</p>

    <GrupoOpcoes
      id="especialidade"
      v-model="especialidade"
      legenda="Especialidade"
      nome="especialidade"
      :nivel-titulo="2"
      :opcoes="opcoesEspecialidade"
      :erro="erros.especialidade"
    />
    <GrupoOpcoes
      v-if="especialidade"
      id="profissional"
      v-model="profissional"
      legenda="Profissional"
      nome="profissional"
      :nivel-titulo="2"
      :opcoes="opcoesProfissional"
      :erro="erros.profissional"
    />
    <NavegacaoEtapa :voltar-para="etapa(1).caminho" />
  </form>
</template>
