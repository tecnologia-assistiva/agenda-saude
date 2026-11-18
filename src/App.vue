<script setup lang="ts">
/*
 * Estrutura de todas as páginas: header (barra eMAG + marca), nav, main e footer.
 * As regiões de anúncio ficam aqui, uma vez só, e existem desde a carga
 * (o leitor de tela só anuncia mudanças em regiões que já estavam na página).
 */
import CabecalhoSite from '@/components/layout/CabecalhoSite.vue'
import MenuPrincipal from '@/components/layout/MenuPrincipal.vue'
import RodapeSite from '@/components/layout/RodapeSite.vue'
import { useAnunciador } from '@/composables/useAnunciador'

const { mensagemStatus, mensagemAlerta } = useAnunciador()
</script>

<template>
  <CabecalhoSite />
  <MenuPrincipal />
  <main id="conteudo" class="principal" tabindex="-1">
    <div class="container">
      <RouterView />
    </div>
    <div role="status" class="visualmente-oculto" data-testid="regiao-status">{{ mensagemStatus }}</div>
    <div role="alert" class="visualmente-oculto" data-testid="regiao-alerta">{{ mensagemAlerta }}</div>
  </main>
  <RodapeSite />
</template>

<style scoped>
.principal {
  padding-block: var(--espaco-5) var(--espaco-7);
}
</style>
