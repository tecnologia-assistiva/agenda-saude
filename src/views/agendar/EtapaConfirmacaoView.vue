<script setup lang="ts">
/*
 * Etapa 5: confirmação. O h1 já diz que deu certo ("Consulta agendada" ou "Consulta remarcada") e
 * recebe o foco na troca de rota. Mostra o protocolo e o resumo, com:
 * - "Imprimir comprovante": o CSS de impressão tira cabeçalho, menu, barra eMAG, rodapé e botões;
 * - "Adicionar à agenda": link que baixa o .ics (servicos/calendario-ics.ts).
 */
import { computed, onMounted } from 'vue'
import { definirTituloDocumento } from '@/router/foco-rota'
import { legendaDaEtapa } from '@/router/etapas'
import { NOME_UNIDADE, enderecoDoIcs, nomeDoArquivoIcs } from '@/servicos/calendario-ics'
import { nomeDaEspecialidade, nomeDoProfissional } from '@/servicos/catalogo'
import { useConsultasStore } from '@/stores/consultas'
import { formatarDataCompleta } from '@/utils/datas'
import TituloPagina from '@/components/comum/TituloPagina.vue'
import DicaExtra from '@/components/comum/DicaExtra.vue'
import ListaResumo, { type ItemResumo } from '@/components/agendamento/ListaResumo.vue'

const consultas = useConsultasStore()
const confirmacao = computed(() => consultas.confirmacaoAtual)
const consulta = computed(() => confirmacao.value?.consulta)
const remarcada = computed(() => confirmacao.value?.tipo === 'remarcada')
const titulo = computed(() => (remarcada.value ? 'Consulta remarcada' : 'Consulta agendada'))

const itens = computed<ItemResumo[]>(() => {
  const c = consulta.value
  if (!c) return []
  return [
    { rotulo: 'Nome', valor: c.dados.nome },
    { rotulo: 'Especialidade', valor: nomeDaEspecialidade(c.especialidadeId) },
    { rotulo: 'Profissional', valor: nomeDoProfissional(c.horario.profissionalId) },
    { rotulo: 'Data', valor: formatarDataCompleta(c.horario.data) },
    { rotulo: 'Horário', valor: c.horario.hora },
    { rotulo: 'Local', valor: NOME_UNIDADE },
  ]
})

const enderecoIcs = computed(() => (consulta.value ? enderecoDoIcs(consulta.value) : undefined))
const nomeArquivo = computed(() => (consulta.value ? nomeDoArquivoIcs(consulta.value) : undefined))

// O título da aba também diz que deu certo (a rota só sabe "Confirmação").
onMounted(() => definirTituloDocumento(`${legendaDaEtapa(5)}: ${titulo.value}`))

function imprimir() {
  window.print()
}
</script>

<template>
  <p class="so-impressao">Agenda Saúde, {{ NOME_UNIDADE }}. Comprovante de demonstração, com dados fictícios.</p>
  <TituloPagina :legenda="legendaDaEtapa(5)">{{ titulo }}</TituloPagina>
  <template v-if="consulta">
    <p class="texto-destaque">
      Protocolo: <strong>{{ consulta.protocolo }}</strong><template v-if="remarcada"> (continua o mesmo)</template>
    </p>
    <p v-if="consultas.salvamentoFalhou" class="texto-atencao">
      Este navegador não guardou a consulta. Anote o protocolo ou imprima o comprovante.
    </p>
    <ListaResumo :itens="itens" />
    <p>Chegue 15 minutos antes, com um documento com foto.</p>

    <div class="acoes nao-imprimir">
      <button type="button" class="botao botao--secundario" @click="imprimir">Imprimir comprovante</button>
      <a :href="enderecoIcs" :download="nomeArquivo" class="botao botao--secundario">Adicionar à agenda</a>
    </div>
    <DicaExtra class="nao-imprimir">
      “Adicionar à agenda” baixa um arquivo que o aplicativo de agenda do celular ou do computador abre.
    </DicaExtra>
    <p class="nao-imprimir">
      <RouterLink to="/minhas-consultas">Ver minhas consultas</RouterLink>
    </p>
  </template>
</template>
