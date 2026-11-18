<script setup lang="ts">
/*
 * Explicação que ajuda, mas não é essencial. Só aparece com "Mostrar dicas extras" ligado
 * em Configurações (começa desligado), para as telas ficarem enxutas por padrão.
 * Com `id`, um campo pode apontar para a dica no aria-describedby (ver CampoTexto).
 */
import { useConfiguracoesStore } from '@/stores/configuracoes'

defineProps<{ id?: string }>()
const configuracoes = useConfiguracoesStore()
</script>

<template>
  <p v-if="configuracoes.dicasExtras" :id="id" class="dica-extra"><strong>Dica:</strong> <slot /></p>
</template>
