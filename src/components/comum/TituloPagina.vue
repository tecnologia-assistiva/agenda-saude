<script setup lang="ts">
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