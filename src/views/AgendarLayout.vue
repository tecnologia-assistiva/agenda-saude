<script setup lang="ts">
/* Moldura das 5 etapas: o indicador de etapas em cima e a etapa atual (rota filha) embaixo. */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import IndicadorEtapas from '@/components/agendamento/IndicadorEtapas.vue'

const route = useRoute()
const etapaAtual = computed(() => route.meta.etapa ?? 1)
</script>

<template>
  <div class="agendar">
    <IndicadorEtapas :atual="etapaAtual" />
    <div class="coluna-leitura">
      <RouterView />
    </div>
  </div>
</template>
