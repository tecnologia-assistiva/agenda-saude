<script setup lang="ts">
/*
 * Minhas consultas: as próximas consultas, em ordem de data. O h1 é o título da lista.
 * - "Remarcar" é link (navega): a rota carrega a consulta no rascunho e abre a etapa 3.
 * - "Cancelar" abre o DialogoModal. Ao confirmar, a consulta sai da lista, a mensagem aparece na tela
 *   e na região de status, e o foco vai para o h1 (o botão que abriu o diálogo sumiu).
 * Os dois têm o visível no começo do nome acessível (2.5.3) e a data escondida no fim, para não
 * haver vários "Cancelar" iguais na lista de links e botões do leitor de tela.
 */
import { ref } from 'vue'
import { useAnunciador } from '@/composables/useAnunciador'
import { nomeDaEspecialidade, nomeDoProfissional } from '@/servicos/catalogo'
import { descreverHorario } from '@/servicos/horarios'
import { useConsultasStore, type Consulta } from '@/stores/consultas'
import TituloPagina from '@/components/comum/TituloPagina.vue'
import DialogoModal from '@/components/comum/DialogoModal.vue'

const consultas = useConsultasStore()
const { anunciar } = useAnunciador()

const dialogo = ref<InstanceType<typeof DialogoModal> | null>(null)
const paraCancelar = ref<Consulta | null>(null)
const mensagem = ref('')

function atendimento(c: Consulta): string {
  return `${nomeDaEspecialidade(c.especialidadeId)}, com ${nomeDoProfissional(c.horario.profissionalId)}`
}

function pedirCancelamento(c: Consulta, evento: MouseEvent) {
  paraCancelar.value = c
  dialogo.value?.abrir(evento.currentTarget)
}

function cancelar() {
  const c = paraCancelar.value
  if (!c || !consultas.cancelar(c.protocolo)) return
  mensagem.value = `Consulta de ${descreverHorario(c.horario)} cancelada.`
  anunciar(mensagem.value)
}
</script>

<template>
  <div class="coluna-leitura">
    <TituloPagina>Minhas consultas</TituloPagina>
    <p v-if="mensagem" class="texto-atencao">{{ mensagem }}</p>

    <ul v-if="consultas.proximas.length" class="consultas" aria-labelledby="titulo-pagina">
      <li v-for="c in consultas.proximas" :key="c.protocolo" class="consulta">
        <h2 class="consulta__quando">{{ descreverHorario(c.horario) }}</h2>
        <p class="consulta__detalhes">
          {{ atendimento(c) }}.<br />
          Protocolo {{ c.protocolo }}.
        </p>
        <div class="acoes">
          <RouterLink :to="{ name: 'remarcar', params: { protocolo: c.protocolo } }" class="consulta__remarcar">
            Remarcar<span class="visualmente-oculto"> a consulta de {{ descreverHorario(c.horario) }}</span>
          </RouterLink>
          <button type="button" class="botao botao--secundario" @click="pedirCancelamento(c, $event)">
            Cancelar<span class="visualmente-oculto"> a consulta de {{ descreverHorario(c.horario) }}</span>
          </button>
        </div>
      </li>
    </ul>
    <template v-else>
      <p>Você não tem consultas marcadas.</p>
      <p><RouterLink to="/agendar">Agendar consulta</RouterLink></p>
    </template>

    <DialogoModal
      ref="dialogo"
      titulo="Cancelar esta consulta?"
      confirmar="Sim, cancelar consulta"
      manter="Não, manter consulta"
      @confirmar="cancelar"
    >
      <p v-if="paraCancelar">
        {{ atendimento(paraCancelar) }}, {{ descreverHorario(paraCancelar.horario) }}. Não dá para desfazer.
      </p>
    </DialogoModal>
  </div>
</template>

<style scoped>
.consultas {
  margin: 0 0 var(--espaco-6);
  padding: 0;
  list-style: none;
  border-top: 0.0625rem solid var(--cor-separador);
}

.consulta {
  margin: 0;
  padding-block: var(--espaco-4);
  border-bottom: 0.0625rem solid var(--cor-separador);
}

.consulta__quando {
  margin: 0 0 var(--espaco-2);
  font-size: 1.375rem;
}

.consulta__detalhes {
  margin-bottom: var(--espaco-3);
}

.consulta__remarcar {
  display: inline-flex;
  align-items: center;
  min-height: var(--alvo-minimo);
}
</style>
