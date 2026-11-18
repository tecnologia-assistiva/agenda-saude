<script setup lang="ts">
/*
 * Barra de acessibilidade no padrão eMAG. É o primeiro conteúdo focável da página, então o
 * primeiro Tab cai em "Ir para o conteúdo". Numeração dos atalhos pela convenção do eMAG:
 * 1 conteúdo, 2 menu, 3 busca (reservado: este site não tem busca), 4 rodapé.
 * Os links de pulo são âncoras nativas; os destinos têm tabindex="-1" para receber o foco.
 * Em tela estreita a barra fica compacta e sempre visível: o texto visível vira "Conteúdo", "Menu" e
 * "Rodapé", e "Ir para o" continua no nome acessível (escondido só na tela), atendendo o 2.5.3.
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
          <a href="#conteudo" accesskey="1" class="atalho"><span><span class="atalho__prefixo">Ir para o </span><span class="atalho__alvo">conteúdo</span><span class="atalho__numero"> [1]</span></span></a>
        </li>
        <li>
          <!-- eslint-disable-next-line vuejs-accessibility/no-access-key -- atalhos da convenção do eMAG -->
          <a href="#menu" accesskey="2" class="atalho"><span><span class="atalho__prefixo">Ir para o </span><span class="atalho__alvo">menu</span><span class="atalho__numero"> [2]</span></span></a>
        </li>
        <li>
          <!-- eslint-disable-next-line vuejs-accessibility/no-access-key -- atalhos da convenção do eMAG -->
          <a href="#rodape" accesskey="4" class="atalho"><span><span class="atalho__prefixo">Ir para o </span><span class="atalho__alvo">rodapé</span><span class="atalho__numero"> [4]</span></span></a>
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
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--alvo-minimo);
  min-width: var(--alvo-minimo);
}

/* As partes do texto ficam num único <span>: num link flex, cada parte viraria um item e perderia
   os espaços entre as palavras. */

/* Tela estreita: os três atalhos numa linha; "Acessibilidade" e "Alto contraste" na de baixo. */
@media (max-width: 39.9375em) {
  .barra-acessibilidade__conteudo {
    flex-direction: column;
    align-items: flex-start;
  }

  .atalho__prefixo {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .atalho__alvo {
    text-transform: capitalize;
  }

  /* Sem teclado físico no celular, o número do atalho não ajuda: sai da tela e do nome. */
  .atalho__numero {
    display: none;
  }
}

.barra-acessibilidade__botao {
  gap: var(--espaco-2);
  padding-inline: var(--espaco-3);
  font-weight: 400;
}
</style>
