<script setup lang="ts">
/*
 * Aparece logo depois do h1 quando a guarda trouxe a pessoa para cá porque ela tentou abrir uma
 * etapa mais adiante (router/etapas.ts). Fica depois do h1 para o leitor de tela ler em seguida.
 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { AVISO_ETAPA_INCOMPLETA } from '@/router/etapas'

const route = useRoute()
const visivel = computed(() => route.query.aviso === AVISO_ETAPA_INCOMPLETA)
</script>

<template>
  <p v-if="visivel" class="texto-atencao">Complete esta etapa antes de seguir.</p>
</template>
