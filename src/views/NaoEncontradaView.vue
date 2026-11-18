<script setup lang="ts">
import TituloPagina from '@/components/comum/TituloPagina.vue'
</script>

<template>
  <div>
    <TituloPagina>Página não encontrada</TituloPagina>
    <p>Não achamos esta página. O endereço pode estar errado, ou a página mudou de lugar.</p>
    <p>Você pode:</p>
    <ul>
      <li><RouterLink to="/">Ir para o início</RouterLink></li>
      <li><RouterLink to="/agendar">Agendar uma consulta</RouterLink></li>
      <li><RouterLink to="/minhas-consultas">Ver minhas consultas</RouterLink></li>
    </ul>
  </div>
</template>
