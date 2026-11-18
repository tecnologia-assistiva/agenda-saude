<script setup lang="ts">
/*
 * Provisória: ocupa as etapas 3, 4 e 5 até elas ganharem a tela própria (etapas 3 e 4 do projeto).
 * Já segue as regras das outras: legenda no h1, aviso de etapa incompleta e "Voltar".
 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { etapa, legendaDaEtapa } from '@/router/etapas'
import TituloPagina from '@/components/comum/TituloPagina.vue'
import AvisoEtapaIncompleta from '@/components/agendamento/AvisoEtapaIncompleta.vue'

const route = useRoute()
const numero = computed(() => route.meta.etapa ?? 3)
</script>

<template>
  <TituloPagina :legenda="legendaDaEtapa(numero)">{{ etapa(numero).nome }}</TituloPagina>
  <AvisoEtapaIncompleta />
  <p>Esta etapa fica pronta na próxima versão do projeto.</p>
  <p>
    <RouterLink :to="etapa(numero - 1).caminho">Voltar</RouterLink>
  </p>
</template>
