<script setup lang="ts">
/*
 * Diálogo de confirmação com <dialog> nativo aberto por showModal(): o navegador deixa o resto da
 * página inerte, prende o Tab no diálogo e fecha com Esc. Nome = título (aria-labelledby); o texto
 * vai no aria-describedby, para o leitor de tela ler junto ao abrir.
 * - O foco começa na opção segura (`manter`), que vem primeiro e é o botão principal.
 * - Ao fechar (por um botão ou Esc), o foco volta para quem abriu. Se esse elemento sumiu (a
 *   consulta cancelada saiu da lista), vai para o h1 da página.
 * Uso: `dialogo.abrir(evento.currentTarget)`; a ação vem no evento `confirmar`.
 */
import { nextTick, ref, useId } from 'vue'

defineProps<{
  titulo: string
  /** Texto do botão que faz a ação, por exemplo "Sim, cancelar consulta". */
  confirmar: string
  /** Texto do botão que desiste, por exemplo "Não, manter consulta". */
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
  // No Safari, clicar num botão não dá foco a ele: por isso quem chama passa o botão.
  origem = quemAbriu instanceof HTMLElement ? quemAbriu : (document.activeElement as HTMLElement | null)
  confirmou = false
  // O texto pode depender do que acabou de ser escolhido (qual consulta): espera ele aparecer.
  await nextTick()
  elemento.showModal()
  botaoManter.value?.focus()
}

function fechar(confirmar: boolean): void {
  confirmou = confirmar
  dialogo.value?.close()
}

/** Evento close: vale para os botões e para o Esc. */
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
/*
 * Borda grossa em vez de sombra; o fundo da página fica esmaecido na cor do próprio tema.
 * Na tela estreita, quase toda a largura e recuo menor: com texto em 200% sobra espaço para as palavras.
 * Se não couber na altura, o próprio diálogo rola (max-height do navegador).
 */
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
