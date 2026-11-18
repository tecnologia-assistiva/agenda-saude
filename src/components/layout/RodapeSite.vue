<script setup lang="ts">
/*
 * Rodapé igual em todas as páginas: o bloco "Precisa de ajuda?" fica sempre no mesmo lugar
 * (WCAG 3.2.6). Destino do atalho "Ir para o rodapé [4]".
 */
</script>

<template>
  <footer id="rodape" class="rodape" tabindex="-1">
    <div class="container">
      <h2 class="rodape__titulo">Precisa de ajuda?</h2>
      <ul class="rodape__ajuda">
        <li>
          Na página <RouterLink to="/acessibilidade">Acessibilidade</RouterLink> estão os atalhos de
          teclado e como relatar um problema.
        </li>
        <li>
          Em <RouterLink to="/configuracoes">Configurações</RouterLink> você muda as cores, aumenta o
          texto e liga dicas extras.
        </li>
        <li>Telefone da UBS (fictício): 0800 000 0000, de segunda a sexta, das 7h às 19h.</li>
      </ul>
      <p class="rodape__nota">
        Site de demonstração: projeto acadêmico da disciplina Tecnologias Assistivas, com dados fictícios.
      </p>
    </div>
  </footer>
</template>

<style scoped>
.rodape {
  margin-top: auto;
  padding-block: var(--espaco-6);
  background-color: var(--cor-superficie);
  border-top: 0.0625rem solid var(--cor-separador);
}

.rodape__titulo {
  margin-top: 0;
}

.rodape__ajuda {
  margin-bottom: var(--espaco-5);
}

.rodape__nota {
  margin: 0;
  padding-top: var(--espaco-4);
  border-top: 0.0625rem solid var(--cor-separador);
  color: var(--cor-texto-suave);
}
</style>
