<script setup lang="ts">
import TituloPagina from '@/components/comum/TituloPagina.vue'
</script>

<template>
  <div class="coluna-leitura">
    <TituloPagina>Página não encontrada</TituloPagina>
    <p>Confira se o endereço está certo.</p>
    <p><RouterLink to="/">Ir para o início</RouterLink></p>
  </div>
</template>
