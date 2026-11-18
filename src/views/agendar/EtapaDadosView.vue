<script setup lang="ts">
/*
 * Etapa 1: dados pessoais. Os campos editam o rascunho direto (nada se perde ao voltar).
 * Validação só ao enviar; antes, formata o que foi colado e ainda não saiu do campo.
 */
import { useRoute, useRouter } from 'vue-router'
import { useFormulario } from '@/composables/useFormulario'
import { destinoAoContinuar, legendaDaEtapa } from '@/router/etapas'
import { useAgendamentoStore } from '@/stores/agendamento'
import { formatarCartaoSus, formatarData, formatarNome, formatarTelefone } from '@/utils/formatacao'
import { validarDadosPessoais } from '@/utils/validacao'
import TituloPagina from '@/components/comum/TituloPagina.vue'
import CampoTexto from '@/components/formulario/CampoTexto.vue'
import ResumoErros from '@/components/formulario/ResumoErros.vue'
import AvisoEtapaIncompleta from '@/components/agendamento/AvisoEtapaIncompleta.vue'
import NavegacaoEtapa from '@/components/agendamento/NavegacaoEtapa.vue'

const route = useRoute()
const router = useRouter()
const agendamento = useAgendamentoStore()
const dados = agendamento.rascunho.dados

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
      instrucao="Com DDD. Por exemplo: (11) 98765-4321."
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
