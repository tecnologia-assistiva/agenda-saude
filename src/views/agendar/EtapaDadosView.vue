<script setup lang="ts">
/*
 * Etapa 1: dados pessoais. Os campos editam o rascunho direto (nada se perde ao voltar).
 * Validação só ao enviar; antes, formata o que foi colado e ainda não saiu do campo.
 * Num agendamento novo, os campos já vêm com os dados do último (WCAG 3.3.7), com aviso e a opção
 * "Apagar meus dados", que pede confirmação no DialogoModal.
 */
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAnunciador } from '@/composables/useAnunciador'
import { useFormulario } from '@/composables/useFormulario'
import { destinoAoContinuar, legendaDaEtapa } from '@/router/etapas'
import { useAgendamentoStore } from '@/stores/agendamento'
import { formatarCartaoSus, formatarData, formatarNome, formatarTelefone } from '@/utils/formatacao'
import { validarDadosPessoais } from '@/utils/validacao'
import TituloPagina from '@/components/comum/TituloPagina.vue'
import DialogoModal from '@/components/comum/DialogoModal.vue'
import CampoTexto from '@/components/formulario/CampoTexto.vue'
import ResumoErros from '@/components/formulario/ResumoErros.vue'
import AvisoEtapaIncompleta from '@/components/agendamento/AvisoEtapaIncompleta.vue'
import AvisoRemarcacao from '@/components/agendamento/AvisoRemarcacao.vue'
import NavegacaoEtapa from '@/components/agendamento/NavegacaoEtapa.vue'

const route = useRoute()
const router = useRouter()
const agendamento = useAgendamentoStore()
const { anunciar } = useAnunciador()
const dados = agendamento.rascunho.dados

agendamento.preencherComDadosSalvos()
/** O diálogo só existe na tela quando há dados salvos para apagar. */
const temDialogo = agendamento.rascunho.usouDadosSalvos
const dialogo = ref<InstanceType<typeof DialogoModal> | null>(null)
const dadosApagados = ref(false)

function apagarDados() {
  agendamento.apagarDadosPessoais()
  dadosApagados.value = true
  anunciar('Seus dados foram apagados.')
}

const { erros, listaErros, tentativa, validarAoEnviar } = useFormulario({
  campos: [
    { chave: 'nome', id: 'nome' },
    { chave: 'dataNascimento', id: 'data-nascimento' },
    { chave: 'telefone', id: 'telefone' },
    { chave: 'cartaoSus', id: 'cartao-sus' },
  ],
  validar: () => validarDadosPessoais(dados),
  titulo: () => route.meta.titulo,
})

function continuar() {
  dados.nome = formatarNome(dados.nome)
  dados.dataNascimento = formatarData(dados.dataNascimento)
  dados.telefone = formatarTelefone(dados.telefone)
  dados.cartaoSus = formatarCartaoSus(dados.cartaoSus)
  if (validarAoEnviar()) router.push(destinoAoContinuar(1, route.query))
}
</script>

<template>
  <TituloPagina :legenda="legendaDaEtapa(1)">Seus dados</TituloPagina>
  <AvisoEtapaIncompleta />
  <AvisoRemarcacao />
  <div v-if="agendamento.rascunho.usouDadosSalvos" class="dados-salvos">
    <p>Usamos os dados do seu último agendamento.</p>
    <button type="button" class="botao botao--secundario" @click="dialogo?.abrir($event.currentTarget)">
      Apagar meus dados
    </button>
  </div>
  <p v-else-if="dadosApagados" class="texto-atencao">Seus dados foram apagados.</p>
  <DialogoModal
    v-if="temDialogo"
    ref="dialogo"
    titulo="Apagar seus dados?"
    confirmar="Sim, apagar meus dados"
    manter="Não, manter meus dados"
    @confirmar="apagarDados"
  >
    <p>Os campos ficam em branco e o site esquece seus dados. As consultas marcadas não mudam.</p>
  </DialogoModal>
  <form novalidate @submit.prevent="continuar">
    <ResumoErros :erros="listaErros" :tentativa="tentativa" />
    <CampoTexto
      id="nome"
      v-model="dados.nome"
      rotulo="Nome completo"
      autocomplete="name"
      autocapitalize="words"
      :verificar-ortografia="false"
      dica="Escreva como está no seu documento."
      :erro="erros.nome"
      :formatar="formatarNome"
    />
    <CampoTexto
      id="data-nascimento"
      v-model="dados.dataNascimento"
      rotulo="Data de nascimento"
      instrucao="Por exemplo: 15/03/1980."
      dica="Pode digitar só os números, como 15031980."
      autocomplete="bday"
      inputmode="numeric"
      largura="curta"
      :erro="erros.dataNascimento"
      :formatar="formatarData"
    />
    <CampoTexto
      id="telefone"
      v-model="dados.telefone"
      rotulo="Telefone"
      instrucao="Celular ou fixo, com DDD. Por exemplo: (11) 98765-4321."
      tipo="tel"
      autocomplete="tel"
      largura="media"
      :erro="erros.telefone"
      :formatar="formatarTelefone"
    />
    <CampoTexto
      id="cartao-sus"
      v-model="dados.cartaoSus"
      rotulo="Cartão SUS"
      opcional
      instrucao="São 15 números."
      dica="O número está no cartão e no aplicativo Meu SUS Digital."
      inputmode="numeric"
      largura="media"
      :erro="erros.cartaoSus"
      :formatar="formatarCartaoSus"
    />
    <NavegacaoEtapa voltar-para="/" />
  </form>
</template>

<style scoped>
.dados-salvos {
  margin-bottom: var(--espaco-6);
}

.dados-salvos p {
  margin-bottom: var(--espaco-3);
}
</style>
