<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  RETORNO_REVISAO,
  caminhoDaPrimeiraEtapaIncompleta,
  etapa,
  legendaDaEtapa,
} from '@/router/etapas'
import { QUALQUER_PROFISSIONAL, nomeDaEspecialidade, nomeDoProfissional } from '@/servicos/catalogo'
import { useAgendamentoStore } from '@/stores/agendamento'
import { formatarDataCompleta } from '@/utils/datas'
import TituloPagina from '@/components/comum/TituloPagina.vue'
import AvisoEtapaIncompleta from '@/components/agendamento/AvisoEtapaIncompleta.vue'
import AvisoRemarcacao from '@/components/agendamento/AvisoRemarcacao.vue'
import ListaResumo, { type ItemResumo } from '@/components/agendamento/ListaResumo.vue'
import NavegacaoEtapa from '@/components/agendamento/NavegacaoEtapa.vue'

const router = useRouter()
const agendamento = useAgendamentoStore()
const r = agendamento.rascunho

interface Bloco {
  numero: number
  titulo: string
  itens: ItemResumo[]
}

const horario = computed(() => {
  const h = r.horario
  if (!h) return ''
  return r.profissionalId === QUALQUER_PROFISSIONAL ? `${h.hora}, com ${nomeDoProfissional(h.profissionalId)}` : h.hora
})

const blocos = computed<Bloco[]>(() => [
  {
    numero: 1,
    titulo: 'Seus dados',
    itens: [
      { rotulo: 'Nome', valor: r.dados.nome },
      { rotulo: 'Data de nascimento', valor: r.dados.dataNascimento },
      { rotulo: 'Telefone', valor: r.dados.telefone },
      { rotulo: 'Cartão SUS', valor: r.dados.cartaoSus || 'Não informado' },
    ],
  },
  {
    numero: 2,
    titulo: 'Tipo de atendimento',
    itens: [
      { rotulo: 'Especialidade', valor: nomeDaEspecialidade(r.especialidadeId) },
      { rotulo: 'Profissional', valor: nomeDoProfissional(r.profissionalId) },
    ],
  },
  {
    numero: 3,
    titulo: 'Data e horário',
    itens: [
      { rotulo: 'Data', valor: r.horario ? formatarDataCompleta(r.horario.data) : '' },
      { rotulo: 'Horário', valor: horario.value },
    ],
  },
])

const textoConfirmar = computed(() => (r.remarcando ? 'Confirmar remarcação' : 'Confirmar agendamento'))

let enviando = false

async function confirmar() {
  if (enviando) return
  if (agendamento.primeiraEtapaIncompleta < 4) {
    await router.push(caminhoDaPrimeiraEtapaIncompleta())
    return
  }
  enviando = true
  agendamento.confirmar()
  await router.replace(etapa(5).caminho)
  agendamento.limparRascunho()
}
</script>

<template>
  <TituloPagina :legenda="legendaDaEtapa(4)">Revise e confirme</TituloPagina>
  <AvisoEtapaIncompleta />
  <AvisoRemarcacao />
  <p>A consulta só fica marcada depois que você confirmar.</p>

  <div v-for="bloco in blocos" :key="bloco.numero" class="revisao__bloco">
    <div class="revisao__cabecalho">
      <h2 class="revisao__titulo">{{ bloco.titulo }}</h2>
      <RouterLink :to="{ path: etapa(bloco.numero).caminho, query: { retorno: RETORNO_REVISAO } }" class="revisao__alterar">
        Alterar<span class="visualmente-oculto">{{ ` ${bloco.titulo.toLowerCase()}` }}</span>
      </RouterLink>
    </div>
    <ListaResumo :itens="bloco.itens" />
  </div>

  <form novalidate @submit.prevent="confirmar">
    <NavegacaoEtapa :voltar-para="etapa(3).caminho" :texto-botao="textoConfirmar" />
  </form>
</template>

<style scoped>
.revisao__cabecalho {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0 var(--espaco-4);
  margin-top: var(--espaco-6);
  margin-bottom: var(--espaco-2);
}

.revisao__titulo {
  min-width: 0;
  margin: 0;
  font-size: 1.375rem;
}

.revisao__alterar {
  display: inline-flex;
  align-items: center;
  min-height: var(--alvo-minimo);
}
</style>