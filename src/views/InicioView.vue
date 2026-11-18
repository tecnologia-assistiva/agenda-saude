<script setup lang="ts">
import TituloPagina from '@/components/comum/TituloPagina.vue'
import AvisoProjeto from '@/components/comum/AvisoProjeto.vue'
import Icone from '@/components/comum/Icone.vue'
</script>

<template>
  <div class="inicio">
    <TituloPagina>Marque sua consulta na UBS sem sair de casa</TituloPagina>
    <p class="inicio__introducao">
      Aqui você marca consultas na UBS Vila Esperança e vê as que já marcou. Não tem tempo limite: vá no
      seu ritmo.
    </p>

    <AvisoProjeto />

    <h2>O que você quer fazer?</h2>
    <ul class="inicio__caminhos">
      <li class="inicio__caminho">
        <RouterLink to="/agendar" class="botao botao--primario botao--grande">
          <Icone nome="calendario" />
          Agendar consulta
        </RouterLink>
        <p>Escolha a especialidade, o dia e o horário. São 5 etapas curtas.</p>
      </li>
      <li class="inicio__caminho">
        <RouterLink to="/minhas-consultas" class="botao botao--secundario botao--grande">
          <Icone nome="lista" />
          Minhas consultas
        </RouterLink>
        <p>Veja, cancele ou remarque as consultas que você marcou.</p>
      </li>
    </ul>

    <h2>Como funciona o agendamento</h2>
    <ol class="inicio__etapas">
      <li><strong>Seus dados:</strong> nome, data de nascimento e telefone.</li>
      <li><strong>Tipo de atendimento:</strong> a especialidade e o profissional.</li>
      <li><strong>Data e horário:</strong> veja os próximos horários livres ou escolha no calendário.</li>
      <li><strong>Revisão:</strong> confira tudo. Dá para mudar qualquer resposta.</li>
      <li><strong>Confirmação:</strong> anote o protocolo, imprima ou salve na sua agenda.</li>
    </ol>
    <p>Se você voltar uma etapa, nada do que escreveu se perde.</p>

    <h2>Do seu jeito</h2>
    <p>
      Dá para usar o site só com o teclado, com leitor de tela ou com acionador. Em
      <RouterLink to="/configuracoes">Configurações</RouterLink> você aumenta o texto, muda as cores e
      liga dicas extras.
    </p>
  </div>
</template>

<style scoped>
.inicio__introducao {
  font-size: 1.125rem;
}

.inicio__caminhos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: var(--espaco-5);
  margin: 0 0 var(--espaco-5);
  padding: 0;
  list-style: none;
}

.inicio__caminho {
  margin: 0;
}

.inicio__caminho .botao {
  width: 100%;
}

.inicio__caminho p {
  margin: var(--espaco-2) 0 0;
}

.inicio__etapas {
  padding-inline-start: var(--espaco-5);
}
</style>
