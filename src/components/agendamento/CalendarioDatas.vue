<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'
import { useAnunciador } from '@/composables/useAnunciador'
import {
  DIAS_DA_SEMANA,
  DIAS_DA_SEMANA_CURTOS,
  adicionarDias,
  adicionarMeses,
  compararMeses,
  diaDaSemana,
  diasNoMes,
  formatarDataLonga,
  formatarDiaMes,
  formatarMesAno,
  mesDe,
  paraISO,
  semanasDoMes,
  somarMeses,
  type MesAno,
} from '@/utils/datas'

const props = withDefaults(
  defineProps<{
    hoje: string
    fim: string
    livresPorDia: Map<string, number>
    erro?: string
    id?: string
  }>(),
  { erro: undefined, id: 'calendario' },
)

const modelo = defineModel<string | null>({ required: true })
const { anunciar } = useAnunciador()

const idTitulo = useId()
const idLegenda = `${props.id}-legenda`
const idErro = `${props.id}-erro`
const raiz = ref<HTMLElement | null>(null)

const mesMinimo = computed(() => mesDe(props.hoje))
const mesMaximo = computed(() => mesDe(props.fim))

function livres(data: string): number {
  return props.livresPorDia.get(data) ?? 0
}

function primeiroDia(mes: MesAno): string {
  return paraISO(new Date(mes.ano, mes.mes - 1, 1))
}

function ultimoDia(mes: MesAno): string {
  return paraISO(new Date(mes.ano, mes.mes - 1, diasNoMes(mes)))
}

function primeiroDiaLivre(mes: MesAno): string | null {
  for (let dia = primeiroDia(mes); dia <= ultimoDia(mes); dia = adicionarDias(dia, 1)) {
    if (livres(dia) > 0) return dia
  }
  return null
}

function limitar(data: string): string {
  const minimo = primeiroDia(mesMinimo.value)
  const maximo = ultimoDia(mesMaximo.value)
  return data < minimo ? minimo : data > maximo ? maximo : data
}

function dataInicial(): string {
  if (modelo.value) return limitar(modelo.value)
  const primeiroLivre = [...props.livresPorDia.entries()]
    .filter(([, quantidade]) => quantidade > 0)
    .map(([data]) => data)
    .sort()[0]
  return limitar(primeiroLivre ?? props.hoje)
}

const dataComFoco = ref(dataInicial())
const mesExibido = ref<MesAno>(mesDe(dataComFoco.value))

watch(modelo, (nova) => {
  if (nova && nova !== dataComFoco.value) {
    dataComFoco.value = limitar(nova)
    mesExibido.value = mesDe(dataComFoco.value)
  }
})

const titulo = computed(() => formatarMesAno(mesExibido.value))
const semanas = computed(() => semanasDoMes(mesExibido.value))
const podeVoltar = computed(() => compararMeses(mesExibido.value, mesMinimo.value) > 0)
const podeAvancar = computed(() => compararMeses(mesExibido.value, mesMaximo.value) < 0)

function focarBotao(data: string) {
  nextTick(() => raiz.value?.querySelector<HTMLElement>(`[data-data="${data}"]`)?.focus())
}

function moverFoco(data: string) {
  const destino = limitar(data)
  dataComFoco.value = destino
  mesExibido.value = mesDe(destino)
  focarBotao(destino)
}

const TECLAS: Record<string, (data: string) => string> = {
  ArrowRight: (d) => adicionarDias(d, 1),
  ArrowLeft: (d) => adicionarDias(d, -1),
  ArrowDown: (d) => adicionarDias(d, 7),
  ArrowUp: (d) => adicionarDias(d, -7),
  Home: (d) => adicionarDias(d, -diaDaSemana(d)),
  End: (d) => adicionarDias(d, 6 - diaDaSemana(d)),
  PageUp: (d) => adicionarMeses(d, -1),
  PageDown: (d) => adicionarMeses(d, 1),
}

function aoTeclar(evento: KeyboardEvent, data: string) {
  const calcular = TECLAS[evento.key]
  if (!calcular || evento.altKey || evento.ctrlKey || evento.metaKey) return
  evento.preventDefault()
  moverFoco(calcular(data))
}

function mudarMes(delta: -1 | 1) {
  if (delta < 0 ? !podeVoltar.value : !podeAvancar.value) return
  const novoMes = somarMeses(mesExibido.value, delta)
  mesExibido.value = novoMes
  const escolhidoNoMes = modelo.value && compararMeses(mesDe(modelo.value), novoMes) === 0
  dataComFoco.value = escolhidoNoMes ? (modelo.value as string) : (primeiroDiaLivre(novoMes) ?? primeiroDia(novoMes))
}

function escolher(data: string) {
  dataComFoco.value = data
  if (livres(data) === 0) {
    anunciar(`${formatarDataLonga(data)}: sem horários livres. Escolha outro dia.`)
    return
  }
  modelo.value = data
}

function partesDoNome(data: string) {
  const quantidade = livres(data)
  const estado = [
    data === props.hoje ? 'hoje' : null,
    data === modelo.value ? 'selecionado' : null,
    quantidade === 0 ? 'sem horários' : `${quantidade} ${quantidade === 1 ? 'horário livre' : 'horários livres'}`,
  ].filter(Boolean)
  return {
    antes: `${DIAS_DA_SEMANA[diaDaSemana(data)]}, `,
    numero: String(Number(data.slice(8))),
    depois: `${formatarDiaMes(data).replace(/^\d+/, '')}, ${estado.join(', ')}`,
  }
}

const descritoPor = computed(() => [idLegenda, props.erro ? idErro : null].filter(Boolean).join(' '))
</script>

<template>
  <div ref="raiz" class="calendario">
    <div class="calendario__topo">
      <h2 :id="idTitulo" class="calendario__mes" aria-live="polite">{{ titulo }}</h2>
      <div class="calendario__navegacao">
        <button
          type="button"
          class="botao botao--secundario"
          :aria-disabled="podeVoltar ? undefined : 'true'"
          @click="mudarMes(-1)"
        >
          Mês anterior
        </button>
        <button
          type="button"
          class="botao botao--secundario"
          :aria-disabled="podeAvancar ? undefined : 'true'"
          @click="mudarMes(1)"
        >
          Próximo mês
        </button>
      </div>
    </div>

    <p v-if="props.erro" :id="idErro" class="campo__erro">
      <span class="visualmente-oculto">Erro: </span>{{ props.erro }}
    </p>

    <table :id="props.id" role="grid" class="calendario__grade" :aria-labelledby="idTitulo" :aria-describedby="descritoPor">
      <thead>
        <tr>
          <th v-for="(nome, indice) in DIAS_DA_SEMANA" :key="nome" scope="col">
            <span aria-hidden="true">{{ DIAS_DA_SEMANA_CURTOS[indice] }}</span>
            <span class="visualmente-oculto">{{ nome }}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(semana, s) in semanas" :key="s">
          <td
            v-for="(data, d) in semana"
            :key="data ?? `vazio-${s}-${d}`"
            :aria-selected="data && data === modelo ? 'true' : undefined"
          >
            <button
              v-if="data"
              type="button"
              class="calendario__dia"
              :class="{
                'calendario__dia--livre': livres(data) > 0,
                'calendario__dia--selecionado': data === modelo,
                'calendario__dia--hoje': data === props.hoje,
              }"
              :data-data="data"
              :tabindex="data === dataComFoco ? 0 : -1"
              :aria-disabled="livres(data) === 0 ? 'true' : undefined"
              :aria-current="data === props.hoje ? 'date' : undefined"
              @click="escolher(data)"
              @keydown="aoTeclar($event, data)"
            >
              <span class="visualmente-oculto">{{ partesDoNome(data).antes }}</span>{{ partesDoNome(data).numero
              }}<span class="visualmente-oculto">{{ partesDoNome(data).depois }}</span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <p :id="idLegenda" class="calendario__legenda">Dias riscados não têm horários livres.</p>
  </div>
</template>

<style scoped>
.calendario {
  margin-bottom: var(--espaco-6);
}

.calendario__topo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--espaco-2) var(--espaco-4);
  margin-bottom: var(--espaco-3);
}

.calendario__mes {
  margin: 0;
  font-size: 1.5rem;
}

.calendario__mes::first-letter {
  text-transform: uppercase;
}

.calendario__navegacao {
  display: flex;
  flex-wrap: wrap;
  gap: var(--espaco-2);
}

.calendario__navegacao .botao[aria-disabled='true'] {
  border-style: dashed;
  border-color: var(--cor-separador);
  color: var(--cor-texto-suave);
  cursor: not-allowed;
  text-decoration: none;
}

.calendario__grade {
  width: 100%;
  max-width: 28rem;
  margin: 0 0 var(--espaco-2);
  table-layout: fixed;
  border-collapse: collapse;
}

@media (max-width: 39.9375em) {
  .calendario__grade {
    width: calc(100% + 2 * var(--margem-lateral));
    max-width: none;
    margin-inline: calc(-1 * var(--margem-lateral));
  }
}

.calendario__grade th,
.calendario__grade td {
  padding: 0;
  border: 0;
  text-align: center;
}

.calendario__grade th {
  padding-bottom: var(--espaco-1);
  font-size: 1rem;
}

.calendario__dia {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: var(--alvo-minimo);
  padding: 0;
  border: 0.125rem solid var(--cor-fundo);
  background-color: transparent;
  color: var(--cor-texto-suave);
  font-size: 1.0625rem;
  text-decoration: line-through;
  cursor: default;
}

.calendario__dia--livre {
  box-shadow: inset 0 0 0 0.125rem var(--cor-link);
  color: var(--cor-link);
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.calendario__dia--selecionado {
  background-color: var(--cor-link);
  box-shadow: inset 0 0 0 0.125rem var(--cor-link);
  color: var(--cor-fundo);
}

.calendario__dia--hoje::after {
  content: '';
  position: absolute;
  bottom: 0.3rem;
  left: 30%;
  right: 30%;
  height: 0.1875rem;
  background-color: currentColor;
}

.calendario__dia:focus-visible {
  outline: var(--contorno-foco) solid transparent;
  background-color: var(--cor-foco-fundo);
  box-shadow: inset 0 -0.25rem 0 var(--cor-foco-barra);
  color: var(--cor-foco-texto);
}

.calendario__dia--selecionado:focus-visible {
  box-shadow: inset 0 0 0 0.25rem var(--cor-foco-barra);
}

.calendario__legenda {
  margin: 0;
  color: var(--cor-texto-suave);
}

@media (forced-colors: active) {
  .calendario__dia--livre {
    border-color: ButtonText;
  }

  .calendario__dia--selecionado {
    border-color: Highlight;
    background-color: Highlight;
    color: HighlightText;
    forced-color-adjust: none;
  }

  .calendario__dia:focus-visible {
    outline-color: Highlight;
  }
}
</style>