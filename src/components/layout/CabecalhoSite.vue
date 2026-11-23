<script setup lang="ts">
/*
 * Cabeçalho (banner): barra eMAG, faixa institucional com o nome do serviço, menu e a faixa de
 * demonstração. Não é fixo: rola com a página, então nunca cobre o elemento focado (WCAG 2.4.11)
 * e não ocupa a tela com zoom de 400%.
 * "Configurações" é um link com visual de botão, porque leva a outra página.
 * Quando não cabem lado a lado (tela estreita, texto grande), o nome fica em cima e o link embaixo;
 * se nem assim couber (320 px com texto em 200%), o texto do link quebra em vez de passar da tela.
 */
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
  /* Separa a faixa do menu; essencial no alto contraste, onde a faixa é preta como a página. */
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

/*
 * Recuo lateral: o normal (1rem) quando há espaço; menor só quando a tela é estreita para o tamanho do
 * texto. 7.5vw - 0.5rem dá 1rem em 320 px com texto 100% e 0.25rem com texto 200%; em 360 px ou mais,
 * quase sempre volta a 1rem. Assim "Configurações" cabe numa linha em 320 px com texto 200% (fontes como
 * Arial, Segoe UI e Roboto). Com espaçamento ampliado ou fontes largas, a palavra ainda pode quebrar.
 */
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

/* A cor branca acima venceria a regra global de foco: repetir aqui o texto escuro sobre amarelo. */
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
