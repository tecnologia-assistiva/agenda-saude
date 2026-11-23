<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { AVISO_ETAPA_INCOMPLETA } from '@/router/etapas'

const route = useRoute()
const visivel = computed(() => route.query.aviso === AVISO_ETAPA_INCOMPLETA)
</script>

<template>
  <p v-if="visivel" class="texto-atencao">Complete esta etapa antes de seguir.</p>
</template>