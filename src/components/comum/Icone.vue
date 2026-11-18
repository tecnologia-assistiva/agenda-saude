<script setup lang="ts">
/*
 * Ícones só onde carregam informação que o texto não dá (por exemplo, o ✓ que mostra que
 * "Alto contraste" está ligado). Sempre aria-hidden: o estado ou o nome vêm do HTML/ARIA.
 * Usam currentColor, então seguem o tema e o modo de cores forçadas.
 */
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
