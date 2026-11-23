<script setup lang="ts">
/*
 * Rodapé igual em todas as páginas, com a ajuda sempre no mesmo lugar (WCAG 3.2.6).
 * Destino do atalho "Ir para o rodapé [4]".
 */
</script>

<template>
  <footer id="rodape" class="rodape" tabindex="-1">
    <div class="container">
      <ul class="rodape__linha">
        <li><RouterLink to="/acessibilidade" class="rodape__link">Acessibilidade</RouterLink></li>
        <li><RouterLink to="/configuracoes" class="rodape__link">Configurações</RouterLink></li>
        <li>Ajuda por telefone (fictício): <span class="rodape__telefone">0800 000 0000</span></li>
      </ul>
      <p class="rodape__nota">Projeto acadêmico da disciplina Tecnologias Assistivas.</p>
    </div>
  </footer>
</template>

<style scoped>
.rodape {
  margin-top: auto;
  padding-block: var(--espaco-4);
  background-color: var(--cor-superficie);
  border-top: 0.0625rem solid var(--cor-separador);
}

.rodape__linha {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0 var(--espaco-5);
  margin: 0;
  padding: 0;
  list-style: none;
}

.rodape__linha li {
  margin: 0;
}

.rodape__link {
  display: inline-flex;
  align-items: center;
  min-height: var(--alvo-minimo);
}

/* inline-block: o número fica inteiro numa linha quando cabe, e quebra só quando não cabe (texto em 200%). */
.rodape__telefone {
  display: inline-block;
}

.rodape__nota {
  margin: 0;
  color: var(--cor-texto-suave);
}
</style>
