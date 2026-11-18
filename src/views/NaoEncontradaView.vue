<script setup lang="ts">
import TituloPagina from '@/components/comum/TituloPagina.vue'
</script>

<template>
  <div class="coluna-leitura">
    <TituloPagina>Página não encontrada</TituloPagina>
    <p>Se você digitou o endereço, confira se ele está certo.</p>
    <p>Se você colou o endereço, confira se copiou o endereço inteiro.</p>
    <p>
      Você pode <RouterLink to="/">ir para o início</RouterLink> ou
      <RouterLink to="/agendar">começar um agendamento</RouterLink>.
    </p>
  </div>
</template>
