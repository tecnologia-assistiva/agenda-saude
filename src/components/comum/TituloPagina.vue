<script setup lang="ts">
/*
 * O h1 de cada página. Tem tabindex="-1" para receber o foco na troca de rota
 * (router/foco-rota.ts) sem entrar na ordem do Tab.
 * `legenda` ("Etapa 2 de 5") fica dentro do h1: ao receber o foco, o leitor anuncia a etapa junto
 * com o título. Na tela larga ela some da tela (o indicador de etapas já mostra), mas fica no h1.
 */
defineProps<{ legenda?: string }>()
</script>

<template>
  <h1 id="titulo-pagina" class="titulo-pagina" tabindex="-1">
    <span v-if="legenda" class="legenda-etapa">{{ legenda }}<span class="visualmente-oculto">: </span></span>
    <slot />
  </h1>
</template>

<style scoped>
.titulo-pagina {
  scroll-margin-top: var(--espaco-6);
}
</style>
