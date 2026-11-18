<script setup lang="ts">
/*
 * Menu principal: links simples logo abaixo da faixa institucional.
 * Destino do atalho "Ir para o menu [2]" (id="menu", tabindex="-1").
 * Sem menu escondido: os itens quebram linha em telas estreitas.
 * O RouterLink já coloca aria-current="page" no item da página atual.
 */
</script>

<template>
  <nav id="menu" class="menu" aria-label="Menu principal" tabindex="-1">
    <ul class="container menu__lista">
      <li><RouterLink to="/" class="menu__link">Início</RouterLink></li>
      <li><RouterLink to="/agendar" class="menu__link">Agendar consulta</RouterLink></li>
      <li><RouterLink to="/minhas-consultas" class="menu__link">Minhas consultas</RouterLink></li>
    </ul>
  </nav>
</template>

<style scoped>
.menu {
  border-bottom: 0.0625rem solid var(--cor-separador);
}

.menu__lista {
  display: flex;
  flex-wrap: wrap;
  gap: 0 var(--espaco-5);
  margin: 0 auto;
  list-style: none;
}

.menu__lista li {
  margin: 0;
}

.menu__link {
  display: inline-flex;
  align-items: center;
  min-height: var(--alvo-minimo);
  padding-block: var(--espaco-2) var(--espaco-1);
  border-bottom: 0.25rem solid transparent;
}

/* Página atual: negrito e barra embaixo (forma, não só cor). */
.menu__link[aria-current="page"] {
  border-bottom-color: var(--cor-link);
  font-weight: 700;
  text-decoration: none;
}
</style>
