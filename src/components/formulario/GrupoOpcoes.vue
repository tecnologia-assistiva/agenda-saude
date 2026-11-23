<script setup lang="ts" generic="T extends string | number">
import { computed, useId } from 'vue'

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
    id?: string
    nivelTitulo?: 2 | 3
    instrucao?: string
    erro?: string
    emLinha?: boolean
  }>(),
  { id: undefined, nivelTitulo: undefined, instrucao: undefined, erro: undefined, emLinha: false },
)

const modelo = defineModel<T | null>({ required: true })

const idGerado = useId()
const idBase = props.id ?? idGerado
const idInstrucao = `${idBase}-instrucao`
const idErro = `${idBase}-erro`

const descritoPor = computed(() => {
  const ids = [props.instrucao ? idInstrucao : null, props.erro ? idErro : null].filter(Boolean)
  return ids.length ? ids.join(' ') : undefined
})
</script>

<template>
  <fieldset :id="props.id" class="grupo-opcoes" :class="{ 'grupo-opcoes--erro': props.erro }" :aria-describedby="descritoPor">
    <legend>
      <component :is="`h${props.nivelTitulo}`" v-if="props.nivelTitulo">{{ props.legenda }}</component>
      <template v-else>{{ props.legenda }}</template>
    </legend>
    <p v-if="props.instrucao" :id="idInstrucao" class="grupo-opcoes__instrucao texto-suave">{{ props.instrucao }}</p>
    <p v-if="props.erro" :id="idErro" class="campo__erro">
      <span class="visualmente-oculto">Erro: </span>{{ props.erro }}
    </p>
    <div class="lista-opcoes" :class="{ 'lista-opcoes--linha': props.emLinha }">
      <label v-for="opcao in props.opcoes" :key="opcao.valor" class="opcao">
        <input
          v-model="modelo"
          type="radio"
          :name="props.nome"
          :value="opcao.valor"
          :aria-invalid="props.erro ? 'true' : undefined"
        />
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
  margin-top: calc(-1 * var(--espaco-1));
  margin-bottom: var(--espaco-3);
}
</style>