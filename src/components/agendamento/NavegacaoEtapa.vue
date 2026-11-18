<script setup lang="ts">
/*
 * Ações no fim de cada etapa: o botão principal (envia o formulário) e "Voltar" como link,
 * porque só navega. Quem veio da revisão por "Alterar" (?retorno=revisao) volta para ela.
 */
import { computed } from 'vue'
import { useRoute, type RouteLocationRaw } from 'vue-router'
import { etapa } from '@/router/etapas'

const props = defineProps<{ voltarPara: RouteLocationRaw }>()
const route = useRoute()

const vindoDaRevisao = computed(() => route.query.retorno === 'revisao')
</script>

<template>
  <div class="navegacao-etapa">
    <button type="submit" class="botao">
      {{ vindoDaRevisao ? 'Salvar e voltar para a revisão' : 'Continuar' }}
    </button>
    <RouterLink :to="vindoDaRevisao ? etapa(4).caminho : props.voltarPara" class="navegacao-etapa__voltar">
      Voltar
    </RouterLink>
  </div>
</template>

<style scoped>
.navegacao-etapa {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--espaco-3) var(--espaco-6);
  margin-top: var(--espaco-6);
}

.navegacao-etapa__voltar {
  display: inline-flex;
  align-items: center;
  min-height: var(--alvo-minimo);
}
</style>
