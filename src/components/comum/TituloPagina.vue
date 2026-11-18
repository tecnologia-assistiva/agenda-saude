<script setup lang="ts">
/*
 * O h1 de cada página. Tem tabindex="-1" para receber o foco na troca de rota
 * (router/foco-rota.ts) sem entrar na ordem do Tab.
 */
</script>

<template>
  <h1 id="titulo-pagina" class="titulo-pagina" tabindex="-1">
    <slot />
  </h1>
</template>

<style scoped>
.titulo-pagina {
  scroll-margin-top: var(--espaco-6);
}
</style>
