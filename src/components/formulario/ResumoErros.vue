<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'

export interface ErroDoResumo {
  id: string
  mensagem: string
}

const props = defineProps<{ erros: ErroDoResumo[]; tentativa: number }>()

const caixa = ref<HTMLElement | null>(null)
const idTitulo = useId()

const titulo = computed(() =>
  props.erros.length === 1 ? 'Corrija 1 problema para continuar' : `Corrija ${props.erros.length} problemas para continuar`,
)

watch(
  () => props.tentativa,
  async () => {
    if (!props.erros.length) return
    await nextTick()
    caixa.value?.focus()
  },
)

function irParaCampo(id: string) {
  const alvo = document.getElementById(id)
  if (!alvo) return
  const ehControle = alvo.matches('input, select, textarea, button')
  const campo = ehControle
    ? alvo
    : (alvo.querySelector<HTMLElement>('input:checked') ??
      alvo.querySelector<HTMLElement>('[tabindex="0"]') ??
      alvo.querySelector<HTMLElement>('input, button'))
  const idDoTitulo = alvo.getAttribute('aria-labelledby')
  const referencia =
    alvo.tagName === 'FIELDSET'
      ? alvo.querySelector('legend')
      : idDoTitulo
        ? document.getElementById(idDoTitulo)
        : document.querySelector(`label[for="${id}"]`)
  campo?.focus({ preventScroll: true })
  ;(referencia ?? campo)?.scrollIntoView?.({ block: 'start' })
}
</script>

<template>
  <div
    v-if="props.erros.length"
    ref="caixa"
    class="resumo-erros"
    role="group"
    :aria-labelledby="idTitulo"
    tabindex="-1"
  >
    <h2 :id="idTitulo" class="resumo-erros__titulo">{{ titulo }}</h2>
    <ul class="resumo-erros__lista">
      <li v-for="erro in props.erros" :key="erro.id">
        <a :href="`#${erro.id}`" @click.prevent="irParaCampo(erro.id)">{{ erro.mensagem }}</a>
      </li>
    </ul>
  </div>
</template>