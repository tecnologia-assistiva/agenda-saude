<script setup lang="ts">
</script>

<template>
  <footer id="rodape" class="rodape">
    <div class="container">
      <ul class="rodape__linha">
        <li><RouterLink to="/acessibilidade" class="rodape__link">Acessibilidade</RouterLink></li>
        <li><RouterLink to="/configuracoes" class="rodape__link">Configurações</RouterLink></li>
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

.rodape__nota {
  margin: 0;
  color: var(--cor-texto-suave);
}
</style>