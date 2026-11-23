<script setup lang="ts">
import { computed } from 'vue'
import { descreverHorario } from '@/servicos/horarios'
import { useAgendamentoStore } from '@/stores/agendamento'
import { useConsultasStore } from '@/stores/consultas'

const agendamento = useAgendamentoStore()
const consultas = useConsultasStore()
const consulta = computed(() => consultas.buscar(agendamento.rascunho.remarcando))
</script>

<template>
  <p v-if="consulta">Você está remarcando a consulta de {{ descreverHorario(consulta.horario) }}.</p>
</template>