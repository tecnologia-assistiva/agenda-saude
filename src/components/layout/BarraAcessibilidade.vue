<script setup lang="ts">
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
          <RouterLink to="/acessibilidade">Acessibilidade</RouterLink>
        </li>
        <li>
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
.barra-acessibilidade {
  border-bottom: 0.0625rem solid var(--cor-separador);
  font-size: 1rem;
}

.barra-acessibilidade__conteudo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
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

@media (max-width: 39.9375em) {
  .barra-acessibilidade__conteudo {
    flex-direction: column;
    align-items: flex-start;
  }
}

.barra-acessibilidade__botao {
  gap: var(--espaco-2);
  padding-inline: var(--espaco-3);
  font-weight: 400;
}
</style>