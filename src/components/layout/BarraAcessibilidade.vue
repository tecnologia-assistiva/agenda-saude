<script setup lang="ts">
/*
 * Barra de acessibilidade no padrão eMAG. É o primeiro conteúdo da página, então o primeiro Tab
 * cai em "Ir para o conteúdo". Numeração dos atalhos pela convenção do eMAG:
 * 1 conteúdo, 2 menu, 3 busca (reservado: este site não tem busca), 4 rodapé.
 * Os links de pulo são âncoras nativas; os destinos têm tabindex="-1" para receber o foco.
 */
import { computed } from 'vue'
import { useAnunciador } from '@/composables/useAnunciador'
import { NOMES_TEMA, useConfiguracoesStore } from '@/stores/configuracoes'
import Icone from '@/components/comum/Icone.vue'

const configuracoes = useConfiguracoesStore()
const { anunciar } = useAnunciador()

const altoContrasteAtivo = computed(() => configuracoes.tema === 'alto-contraste')

function alternarAltoContraste() {
  configuracoes.alternarAltoContraste()
  anunciar(
    altoContrasteAtivo.value
      ? 'Alto contraste ativado.'
      : `Alto contraste desativado. Tema ${NOMES_TEMA[configuracoes.tema]} aplicado.`,
  )
}
</script>

<template>
  <div class="barra-acessibilidade">
    <div class="container barra-acessibilidade__conteudo">
      <ul class="barra-acessibilidade__lista">
        <li>
          <!-- eslint-disable-next-line vuejs-accessibility/no-access-key -- atalhos da convenção do eMAG -->
          <a href="#conteudo" accesskey="1">Ir para o conteúdo [1]</a>
        </li>
        <li>
          <!-- eslint-disable-next-line vuejs-accessibility/no-access-key -- atalhos da convenção do eMAG -->
          <a href="#menu" accesskey="2">Ir para o menu [2]</a>
        </li>
        <li>
          <!-- eslint-disable-next-line vuejs-accessibility/no-access-key -- atalhos da convenção do eMAG -->
          <a href="#rodape" accesskey="4">Ir para o rodapé [4]</a>
        </li>
      </ul>
      <ul class="barra-acessibilidade__lista">
        <li>
          <RouterLink to="/acessibilidade">Acessibilidade</RouterLink>
        </li>
        <li>
          <button
            type="button"
            class="barra-acessibilidade__botao"
            :aria-pressed="altoContrasteAtivo ? 'true' : 'false'"
            @click="alternarAltoContraste"
          >
            <Icone nome="contraste" />
            Alto contraste
            <Icone v-if="altoContrasteAtivo" nome="check" />
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.barra-acessibilidade {
  /* Os controles da barra usam as cores dela, inclusive o contorno de foco. */
  --cor-foco: var(--cor-barra-foco);
  --cor-link: var(--cor-barra-texto);
  background-color: var(--cor-barra-fundo);
  color: var(--cor-barra-texto);
  border-bottom: 0.0625rem solid var(--cor-barra-texto);
}

.barra-acessibilidade__conteudo {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0 var(--espaco-4);
}

.barra-acessibilidade__lista {
  display: flex;
  flex-wrap: wrap;
  gap: 0 var(--espaco-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.barra-acessibilidade__lista li {
  margin: 0;
}

.barra-acessibilidade a,
.barra-acessibilidade__botao {
  display: inline-flex;
  align-items: center;
  gap: var(--espaco-2);
  min-height: var(--alvo-minimo);
  padding: var(--espaco-1) var(--espaco-2);
  color: var(--cor-barra-texto);
}

.barra-acessibilidade__botao {
  border: 0.125rem solid var(--cor-barra-texto);
  border-radius: var(--raio);
  background-color: transparent;
  font-weight: 700;
  cursor: pointer;
}

/* Ligado: cores invertidas + ícone de marcado (o estado não depende só de cor). */
.barra-acessibilidade__botao[aria-pressed="true"] {
  background-color: var(--cor-barra-texto);
  color: var(--cor-barra-fundo);
}
</style>
