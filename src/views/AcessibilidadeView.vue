<script setup lang="ts">
/*
 * Declaração de acessibilidade (versão final): conformidade, data e método da avaliação, recursos,
 * atalhos, a adaptação do calendário, limitações conhecidas e como relatar um problema.
 * A situação ("parcialmente conforme") é revista depois da avaliação manual (docs/avaliacao-wcag.md).
 */
import TituloPagina from '@/components/comum/TituloPagina.vue'

const REPOSITORIO = 'https://github.com/tecnologia-assistiva/agenda-saude'
const ENDERECO_CHAMADOS = `${REPOSITORIO}/issues`
const ENDERECO_RELATORIO = `${REPOSITORIO}/blob/main/docs/avaliacao-wcag.md`
</script>

<template>
  <div class="coluna-leitura">
    <TituloPagina>Sobre a acessibilidade</TituloPagina>
    <p>Este site foi feito para funcionar com leitor de tela, só com teclado, com acionador e com zoom.</p>

    <h2>Conformidade</h2>
    <p>Seguimos a WCAG 2.2 (nível AA), o eMAG 3.1 e a ABNT NBR 17060:2022.</p>
    <p>Situação: <strong>parcialmente conforme</strong>, pelas limitações descritas abaixo.</p>

    <h2>Como avaliamos</h2>
    <p>Última avaliação: novembro de 2026.</p>
    <ul>
      <li>
        Automática: axe em todas as telas e nos 3 temas, mais testes de teclado, foco, largura de 320 px e
        impressão. Roda a cada mudança, antes de publicar.
      </li>
      <li>Manual: com NVDA no Windows, VoiceOver e Controle Assistivo no iPhone, e só com teclado.</li>
    </ul>
    <p><a :href="ENDERECO_RELATORIO">Veja o relatório de avaliação</a>.</p>

    <h2>Recursos</h2>
    <ul>
      <li>Atalhos no topo para o conteúdo, o menu e o rodapé.</li>
      <li>Temas claro, escuro e alto contraste.</li>
      <li>Texto até 200%, mais espaço entre linhas e fonte mais fácil de ler.</li>
      <li>Sem tempo limite e sem CAPTCHA.</li>
      <li>Lista dos próximos horários livres, para quem não quer usar o calendário.</li>
    </ul>

    <h2>Atalhos de teclado</h2>
    <p>
      Use <kbd>Alt</kbd> + número no Chrome e no Edge, <kbd>Alt</kbd> + <kbd>Shift</kbd> + número no Firefox
      ou <kbd>Control</kbd> + <kbd>Option</kbd> + número no Safari do Mac.
    </p>
    <table>
      <caption>Atalhos da barra do topo</caption>
      <thead>
        <tr>
          <th scope="col">Número</th>
          <th scope="col">Vai para</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><kbd>1</kbd></td>
          <td>Conteúdo</td>
        </tr>
        <tr>
          <td><kbd>2</kbd></td>
          <td>Menu</td>
        </tr>
        <tr>
          <td><kbd>4</kbd></td>
          <td>Rodapé</td>
        </tr>
      </tbody>
    </table>
    <p>O 3 fica reservado para a busca, como no eMAG.</p>

    <h2>Calendário</h2>
    <p>
      Segue o padrão de calendário do W3C (APG), com uma mudança: cada dia é um botão dentro da célula, e não
      a própria célula. Assim o VoiceOver e o Controle Assistivo do iPhone acionam o dia com segurança.
    </p>
    <table>
      <caption>Teclas do calendário</caption>
      <thead>
        <tr>
          <th scope="col">Tecla</th>
          <th scope="col">O que faz</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Setas</td>
          <td>Mudam o dia.</td>
        </tr>
        <tr>
          <td><kbd>Home</kbd> e <kbd>End</kbd></td>
          <td>Começo e fim da semana.</td>
        </tr>
        <tr>
          <td><kbd>Page Up</kbd> e <kbd>Page Down</kbd></td>
          <td>Mês anterior e próximo mês.</td>
        </tr>
        <tr>
          <td><kbd>Enter</kbd> ou <kbd>Espaço</kbd></td>
          <td>Escolhem o dia.</td>
        </tr>
      </tbody>
    </table>

    <h2>Limitações conhecidas</h2>
    <ul>
      <li>Os dados ficam só neste navegador. Limpar os dados do navegador apaga as consultas.</li>
      <li>Não há tradução para Libras.</li>
      <li>A ajuda do rodapé é só por telefone (fictício).</li>
      <li>Os atalhos com número podem coincidir com atalhos do navegador ou do leitor de tela.</li>
      <li>
        Em tela de 320 px com texto em 200% e mais espaço entre letras, palavras longas, como “Configurações”,
        podem quebrar no meio.
      </li>
    </ul>

    <h2>Como relatar um problema</h2>
    <p>
      <a :href="ENDERECO_CHAMADOS">Abra um chamado no GitHub</a> dizendo a página, o que tentou fazer e a
      tecnologia assistiva que usa.
    </p>
  </div>
</template>
