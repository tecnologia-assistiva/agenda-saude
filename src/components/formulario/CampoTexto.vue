<script setup lang="ts">
/*
 * Campo de texto acessível. Ordem: rótulo → instrução/formato → dica extra → erro → campo.
 * - "(obrigatório)" ou "(opcional)" em texto no rótulo, além do `required` nativo
 *   (o <form> usa novalidate: a validação é nossa, ao enviar).
 * - aria-describedby liga instrução, dica e erro ao campo; aria-invalid só quando há erro.
 * - Sem máscara durante a digitação: aceita colar em qualquer formato e formata ao sair (`formatar`).
 * - Fonte de pelo menos 16 px (base.css), para o iPhone não dar zoom ao focar.
 */
import { computed } from 'vue'
import { useConfiguracoesStore } from '@/stores/configuracoes'
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
      @blur="aoSair"
    />
  </div>
</template>
