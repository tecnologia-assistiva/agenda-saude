<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, type RouteLocationRaw } from 'vue-router'
import { RETORNO_REVISAO, etapa } from '@/router/etapas'

const props = defineProps<{ voltarPara: RouteLocationRaw; textoBotao?: string }>()
const route = useRoute()

const vindoDaRevisao = computed(() => route.query.retorno === RETORNO_REVISAO)
const texto = computed(() => (vindoDaRevisao.value ? 'Salvar e voltar para a revisão' : (props.textoBotao ?? 'Continuar')))
</script>

<template>
  <div class="navegacao-etapa">
    <button type="submit" class="botao">{{ texto }}</button>
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