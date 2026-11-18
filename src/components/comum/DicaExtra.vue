<script setup lang="ts">
/*
 * Explicação que ajuda, mas não é essencial. Só aparece com "Mostrar dicas extras" ligado
 * em Configurações (começa desligado), para as telas ficarem enxutas por padrão.
 */
import { useConfiguracoesStore } from '@/stores/configuracoes'

const configuracoes = useConfiguracoesStore()
</script>

<template>
  <p v-if="configuracoes.dicasExtras" class="dica-extra"><strong>Dica:</strong> <slot /></p>
</template>
