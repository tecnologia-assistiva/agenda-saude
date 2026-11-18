<script setup lang="ts" generic="T extends string | number">
/*
 * Grupo de radios nativos: fieldset + legend, setas trocam a opção (comportamento do navegador).
 * O rótulo envolve o cartão inteiro, com pelo menos 44 px de altura.
 * Com `nivelTitulo`, a legenda vira também um título (h2/h3) para quem navega por títulos.
 */
import { useId } from 'vue'

export interface Opcao<V> {
  valor: V
  rotulo: string
  descricao?: string
}

const props = withDefaults(
  defineProps<{
    legenda: string
    nome: string
    opcoes: Opcao<T>[]
    nivelTitulo?: 2 | 3
    instrucao?: string
    emLinha?: boolean
  }>(),
  { nivelTitulo: undefined, instrucao: undefined, emLinha: false },
)

const modelo = defineModel<T | null>({ required: true })

const id = useId()
const idInstrucao = `${id}-instrucao`
</script>

<template>
  <fieldset class="grupo-opcoes" :aria-describedby="props.instrucao ? idInstrucao : undefined">
    <legend>
      <component :is="`h${props.nivelTitulo}`" v-if="props.nivelTitulo">{{ props.legenda }}</component>
      <template v-else>{{ props.legenda }}</template>
    </legend>
    <p v-if="props.instrucao" :id="idInstrucao" class="grupo-opcoes__instrucao">{{ props.instrucao }}</p>
    <div class="lista-opcoes" :class="{ 'lista-opcoes--linha': props.emLinha }">
      <label v-for="opcao in props.opcoes" :key="opcao.valor" class="opcao">
        <input v-model="modelo" type="radio" :name="props.nome" :value="opcao.valor" />
        <span class="opcao__texto">
          <span class="opcao__rotulo">{{ opcao.rotulo }}</span>
          <span v-if="opcao.descricao" class="opcao__descricao">{{ opcao.descricao }}</span>
        </span>
      </label>
    </div>
  </fieldset>
</template>

<style scoped>
.grupo-opcoes__instrucao {
  margin-top: calc(-1 * var(--espaco-2));
}
</style>
