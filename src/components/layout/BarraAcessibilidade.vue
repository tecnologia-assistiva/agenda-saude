<script setup lang="ts">
/*
 * Barra de acessibilidade no padrão eMAG. É o primeiro conteúdo focável da página, então o
 * primeiro Tab cai em "Ir para o conteúdo". Numeração dos atalhos pela convenção do eMAG:
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
          <!-- Ligado: o ✓ mostra o estado na tela; o leitor de tela recebe o aria-pressed. -->
          <button
            type="button"
            class="botao botao--secundario barra-acessibilidade__botao"
            :aria-pressed="altoContrasteAtivo ? 'true' : 'false'"
            @click="alternarAltoContraste"
          >
            Alto contraste
            <Icone v-if="altoContrasteAtivo" nome="check" />
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
/* Faixa fina: texto em 1rem (16 px no padrão), mesmo quando o corpo cresce no desktop. */
.barra-acessibilidade {
  border-bottom: 0.0625rem solid var(--cor-separador);
  font-size: 1rem;
}

.barra-acessibilidade__conteudo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0 var(--espaco-4);
  padding-block: var(--espaco-1);
}

.barra-acessibilidade__lista {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0 var(--espaco-4);
  margin: 0;
  padding: 0;
  list-style: none;
}

.barra-acessibilidade__lista li {
  margin: 0;
}

.barra-acessibilidade a {
  display: inline-flex;
  align-items: center;
  min-height: var(--alvo-minimo);
}

.barra-acessibilidade__botao {
  gap: var(--espaco-2);
  padding-inline: var(--espaco-3);
  font-weight: 400;
}
</style>
