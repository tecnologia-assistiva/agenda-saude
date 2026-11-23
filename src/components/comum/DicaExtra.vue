<script setup lang="ts">
import { useConfiguracoesStore } from '@/stores/configuracoes'

defineProps<{ id?: string }>()
const configuracoes = useConfiguracoesStore()
</script>

<template>
  <p v-if="configuracoes.dicasExtras" :id="id" class="dica-extra"><strong>Dica:</strong> <slot /></p>
</template>