<script setup lang="ts">
import { computed } from 'vue'
import { useConfiguracoesStore } from '@/stores/configuracoes'
import { somenteDigitos } from '@/utils/formatacao'
import DicaExtra from '@/components/comum/DicaExtra.vue'

const props = withDefaults(
  defineProps<{
    id: string
    rotulo: string
    opcional?: boolean
    instrucao?: string
    dica?: string
    erro?: string
    tipo?: 'text' | 'tel'
    autocomplete?: string
    inputmode?: 'text' | 'numeric' | 'tel'
    autocapitalize?: 'off' | 'words'
    verificarOrtografia?: boolean
    largura?: 'curta' | 'media' | 'longa'
    formatar?: (valor: string) => string
    mascarar?: (valor: string) => string
  }>(),
  {
    opcional: false,
    instrucao: undefined,
    dica: undefined,
    erro: undefined,
    tipo: 'text',
    autocomplete: undefined,
    inputmode: undefined,
    autocapitalize: undefined,
    verificarOrtografia: true,
    largura: 'longa',
    formatar: undefined,
    mascarar: undefined,
  },
)

const modelo = defineModel<string>({ required: true })
const configuracoes = useConfiguracoesStore()

const idInstrucao = `${props.id}-instrucao`
const idDica = `${props.id}-dica`
const idErro = `${props.id}-erro`

const descritoPor = computed(() => {
  const ids = [
    props.instrucao ? idInstrucao : null,
    props.dica && configuracoes.dicasExtras ? idDica : null,
    props.erro ? idErro : null,
  ].filter(Boolean)
  return ids.length ? ids.join(' ') : undefined
})

function aoSair() {
  if (props.formatar) modelo.value = props.formatar(modelo.value)
}

function posicaoDepoisDosDigitos(texto: string, quantidade: number): number {
  if (quantidade === 0) return 0
  let vistos = 0
  for (let i = 0; i < texto.length; i++) {
    if (/\d/.test(texto.charAt(i))) vistos++
    if (vistos === quantidade) return i + 1
  }
  return texto.length
}

function aoDigitar(evento: Event) {
  if (!props.mascarar || (evento as InputEvent).isComposing) return
  const entrada = evento.target as HTMLInputElement
  const digitado = entrada.value
  const mascarado = props.mascarar(digitado)
  if (mascarado === digitado) return
  const digitosAntes = somenteDigitos(digitado.slice(0, entrada.selectionStart ?? digitado.length)).length
  entrada.value = mascarado
  modelo.value = mascarado
  if (document.activeElement === entrada) {
    const posicao = posicaoDepoisDosDigitos(mascarado, digitosAntes)
    entrada.setSelectionRange(posicao, posicao)
  }
}
</script>

<template>
  <div class="campo" :class="{ 'campo--erro': props.erro }">
    <label :for="props.id" class="campo__rotulo">
      {{ props.rotulo }}
      <span class="campo__exigencia">({{ props.opcional ? 'opcional' : 'obrigatório' }})</span>
    </label>
    <p v-if="props.instrucao" :id="idInstrucao" class="campo__instrucao">{{ props.instrucao }}</p>
    <DicaExtra v-if="props.dica" :id="idDica">{{ props.dica }}</DicaExtra>
    <p v-if="props.erro" :id="idErro" class="campo__erro">
      <span class="visualmente-oculto">Erro: </span>{{ props.erro }}
    </p>
    <input
      :id="props.id"
      v-model="modelo"
      :name="props.id"
      :type="props.tipo"
      class="campo__entrada"
      :class="`campo__entrada--${props.largura}`"
      :autocomplete="props.autocomplete"
      :inputmode="props.inputmode"
      :autocapitalize="props.autocapitalize"
      :spellcheck="props.verificarOrtografia"
      :required="!props.opcional"
      :aria-invalid="props.erro ? 'true' : undefined"
      :aria-describedby="descritoPor"
      @input="aoDigitar"
      @blur="aoSair"
    />
  </div>
</template>