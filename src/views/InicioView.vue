<script setup lang="ts">
import TituloPagina from '@/components/comum/TituloPagina.vue'
</script>

<template>
  <div class="coluna-leitura">
    <TituloPagina>Agendar consulta na UBS Vila Esperança</TituloPagina>
    <p class="texto-destaque">
      Use este serviço para marcar uma consulta e para ver, cancelar ou remarcar as consultas que você já
      marcou.
    </p>

    <p>
      <RouterLink to="/agendar" class="botao botao--inicio">Começar agendamento</RouterLink>
    </p>
    <p>
      <RouterLink to="/minhas-consultas">Ver minhas consultas</RouterLink>
    </p>

    <h2>Antes de começar</h2>
    <p>Você vai precisar de:</p>
    <ul>
      <li>seu nome completo;</li>
      <li>sua data de nascimento;</li>
      <li>um telefone para contato;</li>
      <li>o número do cartão SUS, se tiver (não é obrigatório).</li>
    </ul>
    <p>Não há tempo limite. Você pode voltar e mudar suas respostas antes de confirmar.</p>

    <h2>Como funciona</h2>
    <ol>
      <li>Seus dados.</li>
      <li>Tipo de atendimento: especialidade e profissional.</li>
      <li>Data e horário.</li>
      <li>Revisão: você confere tudo antes de confirmar.</li>
      <li>Confirmação: você recebe um número de protocolo.</li>
    </ol>
  </div>
</template>
