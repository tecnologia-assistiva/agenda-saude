<script setup lang="ts">
import BarraAcessibilidade from './BarraAcessibilidade.vue'
import MenuPrincipal from './MenuPrincipal.vue'
</script>

<template>
  <header class="cabecalho">
    <BarraAcessibilidade />
    <div class="cabecalho__faixa">
      <div class="container cabecalho__conteudo">
        <p class="cabecalho__servico">
          <RouterLink to="/" class="cabecalho__nome">Agenda Saúde</RouterLink>
          <span class="cabecalho__unidade">UBS Vila Esperança</span>
        </p>
        <RouterLink to="/configuracoes" class="cabecalho__configuracoes">Configurações</RouterLink>
      </div>
    </div>
    <MenuPrincipal />
    <div class="faixa-demonstracao">
      <p class="container faixa-demonstracao__texto">
        <strong>Site de demonstração:</strong> projeto acadêmico com dados fictícios.
      </p>
    </div>
  </header>
</template>

<style scoped>
.cabecalho__faixa {
  background-color: var(--cor-institucional);
  color: var(--cor-texto-institucional);
  border-bottom: 0.0625rem solid var(--cor-separador);
}

.cabecalho__conteudo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--espaco-2) var(--espaco-5);
  padding-block: var(--espaco-3);
}

.cabecalho__servico {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0 var(--espaco-4);
  min-width: 0;
  margin: 0;
}

.cabecalho__nome {
  display: inline-flex;
  align-items: center;
  min-height: var(--alvo-minimo);
  color: var(--cor-texto-institucional);
  font-size: 1.5rem;
  font-weight: 700;
  text-decoration: none;
}

.cabecalho__nome:hover {
  text-decoration: underline;
}

.cabecalho__unidade {
  font-size: 1.125rem;
}

.cabecalho__configuracoes {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  min-height: var(--alvo-minimo);
  padding: var(--espaco-2) clamp(var(--espaco-1), 7.5vw - 0.5rem, var(--espaco-4));
  border: 0.125rem solid var(--cor-texto-institucional);
  color: var(--cor-texto-institucional);
  font-weight: 700;
  text-decoration: none;
}

.cabecalho__configuracoes:hover {
  text-decoration: underline;
}

.cabecalho__nome:focus-visible,
.cabecalho__configuracoes:focus-visible {
  border-color: var(--cor-foco-fundo);
  color: var(--cor-foco-texto);
  text-decoration: none;
}

.faixa-demonstracao {
  border-bottom: 0.0625rem solid var(--cor-separador);
}

.faixa-demonstracao__texto {
  margin-block: 0;
  padding-block: var(--espaco-2);
}
</style>