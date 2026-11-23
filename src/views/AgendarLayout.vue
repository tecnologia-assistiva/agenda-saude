<script setup lang="ts">
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