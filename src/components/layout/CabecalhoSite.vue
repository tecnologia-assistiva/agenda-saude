<script setup lang="ts">
/*
 * Cabeçalho não fixo: rola com a página, então nunca cobre o elemento focado (WCAG 2.4.11)
 * e não ocupa a tela com zoom de 400%.
 * "Configurações" é um link com visual de botão, porque leva a outra página.
 */
import BarraAcessibilidade from './BarraAcessibilidade.vue'
import Icone from '@/components/comum/Icone.vue'
</script>

<template>
  <header class="cabecalho">
    <BarraAcessibilidade />
    <div class="container cabecalho__principal">
      <div class="cabecalho__marca">
        <RouterLink to="/" class="cabecalho__nome">
          <Icone nome="saude" class="cabecalho__logo" />
          Agenda Saúde
        </RouterLink>
        <p class="cabecalho__unidade">UBS Vila Esperança (unidade fictícia)</p>
      </div>
      <RouterLink to="/configuracoes" class="botao botao--secundario">
        <Icone nome="ajustes" />
        Configurações
      </RouterLink>
    </div>
  </header>
</template>

<style scoped>
.cabecalho {
  border-bottom: 0.25rem solid var(--cor-primaria);
}

.cabecalho__principal {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--espaco-3) var(--espaco-4);
  padding-block: var(--espaco-4);
}

.cabecalho__nome {
  display: inline-flex;
  align-items: center;
  gap: var(--espaco-2);
  min-height: var(--alvo-minimo);
  color: var(--cor-texto);
  font-size: 1.5rem;
  font-weight: 700;
  text-decoration: none;
}

.cabecalho__nome:hover {
  text-decoration: underline;
}

.cabecalho__logo {
  width: 1.5em;
  height: 1.5em;
  color: var(--cor-primaria);
}

.cabecalho__unidade {
  margin: 0;
  color: var(--cor-texto-suave);
}
</style>
