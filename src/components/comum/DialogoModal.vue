<script setup lang="ts">
import { nextTick, ref, useId } from 'vue'

defineProps<{
  titulo: string
  confirmar: string
  manter: string
}>()
const emit = defineEmits<{ confirmar: [] }>()

const dialogo = ref<HTMLDialogElement | null>(null)
const botaoManter = ref<HTMLButtonElement | null>(null)
const idTitulo = useId()
const idTexto = useId()

let origem: HTMLElement | null = null
let confirmou = false

async function abrir(quemAbriu?: EventTarget | null): Promise<void> {
  const elemento = dialogo.value
  if (!elemento || elemento.open) return
  origem = quemAbriu instanceof HTMLElement ? quemAbriu : (document.activeElement as HTMLElement | null)
  confirmou = false
  await nextTick()
  elemento.showModal()
  botaoManter.value?.focus()
}

function fechar(confirmar: boolean): void {
  confirmou = confirmar
  dialogo.value?.close()
}

async function aoFechar(): Promise<void> {
  if (confirmou) emit('confirmar')
  confirmou = false
  await nextTick()
  const destino = origem?.isConnected ? origem : document.querySelector<HTMLElement>('main h1')
  origem = null
  destino?.focus()
}

defineExpose({ abrir })
</script>

<template>
  <dialog ref="dialogo" class="dialogo" :aria-labelledby="idTitulo" :aria-describedby="idTexto" @close="aoFechar">
    <h2 :id="idTitulo" class="dialogo__titulo">{{ titulo }}</h2>
    <div :id="idTexto" class="dialogo__texto">
      <slot />
    </div>
    <div class="acoes">
      <button ref="botaoManter" type="button" class="botao" @click="fechar(false)">{{ manter }}</button>
      <button type="button" class="botao botao--secundario" @click="fechar(true)">{{ confirmar }}</button>
    </div>
  </dialog>
</template>

<style scoped>
.dialogo {
  width: calc(100% - 2 * var(--espaco-2));
  max-width: 34rem;
  padding: var(--espaco-4);
  border: 0.25rem solid var(--cor-texto);
  border-radius: 0;
  background-color: var(--cor-fundo);
  color: var(--cor-texto);
}

@media (min-width: 40em) {
  .dialogo {
    padding: var(--espaco-5);
  }
}

.dialogo::backdrop {
  background-color: var(--cor-fundo);
  opacity: 0.85;
}

.dialogo__titulo {
  margin-top: 0;
}

.dialogo__texto > :last-child {
  margin-bottom: var(--espaco-5);
}
</style>