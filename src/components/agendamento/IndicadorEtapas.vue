<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ETAPAS, TOTAL_ETAPAS } from '@/router/etapas'
import { useAgendamentoStore } from '@/stores/agendamento'

const props = defineProps<{ atual: number }>()
const agendamento = useAgendamentoStore()

const naConfirmacao = computed(() => props.atual === TOTAL_ETAPAS)

const itens = computed(() =>
  ETAPAS.map((e) => {
    const concluida = naConfirmacao.value
      ? e.numero < props.atual
      : e.numero !== props.atual && agendamento.etapaCompleta(e.numero)
    return { ...e, atual: e.numero === props.atual, concluida, link: concluida && !naConfirmacao.value }
  }),
)
</script>

<template>
  <ol class="etapas" aria-label="Etapas do agendamento">
    <li
      v-for="item in itens"
      :key="item.numero"
      class="etapas__item"
      :class="{ 'etapas__item--atual': item.atual, 'etapas__item--concluida': item.concluida }"
      :aria-current="item.atual ? 'step' : undefined"
    >
      <component :is="item.link ? RouterLink : 'span'" :to="item.link ? item.caminho : undefined" class="etapas__conteudo">
        <span class="etapas__numero">Etapa {{ item.numero }} de {{ TOTAL_ETAPAS }}<span class="visualmente-oculto">: </span></span>
        <span class="etapas__nome">{{ item.nome }}</span>
        <span v-if="item.concluida" class="etapas__estado"><span class="visualmente-oculto">, </span>concluída</span>
      </component>
    </li>
  </ol>
</template>

<style scoped>
.etapas {
  display: none;
}

@media (min-width: 40em) {
  .etapas {
    display: flex;
    flex-wrap: wrap;
    gap: var(--espaco-3) var(--espaco-2);
    margin: 0 0 var(--espaco-6);
    padding: 0;
    list-style: none;
  }

  .etapas__item {
    flex: 1 1 9rem;
    margin: 0;
  }

  .etapas__conteudo {
    display: flex;
    flex-direction: column;
    min-height: var(--alvo-minimo);
    padding-top: var(--espaco-2);
    border-top: 0.25rem solid var(--cor-separador);
    font-size: 1rem;
  }

  .etapas__item--concluida .etapas__conteudo {
    border-top-color: var(--cor-link);
  }

  .etapas__item--atual .etapas__conteudo {
    border-top-color: var(--cor-texto);
    font-weight: 700;
  }

  .etapas__numero {
    font-weight: 400;
  }
}
</style>