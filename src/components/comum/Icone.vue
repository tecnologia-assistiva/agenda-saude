<script setup lang="ts">
import { computed } from 'vue'

export type NomeIcone = 'check'

const TRACOS: Record<NomeIcone, string[]> = {
  check: ['M20 6 9 17l-5-5'],
}

const props = defineProps<{ nome: NomeIcone }>()
const tracos = computed(() => TRACOS[props.nome])
</script>

<template>
  <svg
    class="icone"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="3"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path v-for="(traco, indice) in tracos" :key="indice" :d="traco" />
  </svg>
</template>