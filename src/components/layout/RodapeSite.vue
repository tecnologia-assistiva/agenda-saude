<script setup lang="ts">
/*
 * Rodapé igual em todas as páginas: o bloco "Precisa de ajuda?" fica sempre no mesmo lugar
 * (WCAG 3.2.6). Destino do atalho "Ir para o rodapé [4]".
 */
import AvisoProjeto from '@/components/comum/AvisoProjeto.vue'
</script>

<template>
  <footer id="rodape" class="rodape" tabindex="-1">
    <div class="container rodape__conteudo">
      <div class="rodape__ajuda">
        <h2 class="rodape__titulo">Precisa de ajuda?</h2>
        <ul>
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
      </div>
      <AvisoProjeto />
      <p class="rodape__credito">Projeto final da disciplina Tecnologias Assistivas.</p>
    </div>
  </footer>
</template>

<style scoped>
.rodape {
  margin-top: auto;
  padding-block: var(--espaco-5);
  background-color: var(--cor-superficie);
  border-top: 0.0625rem solid var(--cor-borda);
}

.rodape__titulo {
  margin-top: 0;
  font-size: 1.25rem;
}

.rodape__ajuda ul {
  padding-inline-start: var(--espaco-5);
}

.rodape__credito {
  margin: 0;
  color: var(--cor-texto-suave);
}
</style>
