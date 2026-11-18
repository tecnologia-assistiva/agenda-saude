<script setup lang="ts">
/*
 * Ícones sempre decorativos: aria-hidden e focusable="false".
 * O texto ao lado (ou o aria-label do botão) é que dá o nome. Usam currentColor, então seguem
 * o tema e o modo de cores forçadas.
 */
import { computed } from 'vue'

export type NomeIcone =
  | 'ajustes'
  | 'ajuda'
  | 'alerta'
  | 'calendario'
  | 'check'
  | 'contraste'
  | 'info'
  | 'lista'
  | 'saude'
  | 'seta-direita'
  | 'seta-esquerda'

interface Traco {
  d: string
  preenchido?: boolean
}

const CIRCULO = 'M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20'

const TRACOS: Record<NomeIcone, Traco[]> = {
  ajustes: [
    { d: 'M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1' },
    { d: 'M15 4a2 2 0 1 0 0 4a2 2 0 1 0 0-4M9 10a2 2 0 1 0 0 4a2 2 0 1 0 0-4M17 16a2 2 0 1 0 0 4a2 2 0 1 0 0-4' },
  ],
  ajuda: [{ d: CIRCULO }, { d: 'M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.6v.6M12 17h.01' }],
  alerta: [{ d: 'M12 3 2 20h20L12 3z' }, { d: 'M12 10v4M12 17h.01' }],
  calendario: [
    { d: 'M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z' },
    { d: 'M3 10h18M8 3v4M16 3v4' },
  ],
  check: [{ d: 'M20 6 9 17l-5-5' }],
  contraste: [{ d: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18' }, { d: 'M12 3a9 9 0 0 1 0 18z', preenchido: true }],
  info: [{ d: CIRCULO }, { d: 'M12 11v6M12 7.5h.01' }],
  lista: [{ d: 'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01' }],
  saude: [{ d: 'M9 3h6v6h6v6h-6v6H9v-6H3V9h6z' }],
  'seta-direita': [{ d: 'M9 18l6-6-6-6' }],
  'seta-esquerda': [{ d: 'M15 18l-6-6 6-6' }],
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
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path
      v-for="(traco, indice) in tracos"
      :key="indice"
      :d="traco.d"
      :fill="traco.preenchido ? 'currentColor' : undefined"
    />
  </svg>
</template>
