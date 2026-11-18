<script setup lang="ts">
import { useAgendamentoStore } from '@/stores/agendamento'
import TituloPagina from '@/components/comum/TituloPagina.vue'
import DicaExtra from '@/components/comum/DicaExtra.vue'

const agendamento = useAgendamentoStore()
</script>

<template>
  <div class="coluna-leitura">
    <TituloPagina>Agendar consulta</TituloPagina>
    <p class="texto-destaque">Marque, veja ou cancele consultas na UBS Vila Esperança.</p>
    <p>
      <!-- Com um agendamento pela metade, o mesmo botão leva de volta à etapa que falta. -->
      <RouterLink to="/agendar" class="botao botao--inicio">
        {{ agendamento.iniciado ? 'Continuar agendamento' : 'Começar agendamento' }}
      </RouterLink>
    </p>
    <p>
      <RouterLink to="/minhas-consultas">Ver minhas consultas</RouterLink>
    </p>
    <p>Você vai precisar do nome, data de nascimento e telefone. Não há tempo limite.</p>
    <DicaExtra>você pode voltar e mudar qualquer resposta antes de confirmar.</DicaExtra>
  </div>
</template>
