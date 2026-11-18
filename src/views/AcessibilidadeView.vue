<script setup lang="ts">
/* Declaração de acessibilidade (versão inicial; a final sai na etapa 6, com os resultados dos testes). */
import TituloPagina from '@/components/comum/TituloPagina.vue'

const ENDERECO_CHAMADOS = 'https://github.com/tecnologia-assistiva/agenda-saude/issues'
</script>

<template>
  <div class="coluna-leitura">
    <TituloPagina>Sobre a acessibilidade</TituloPagina>
    <p>
      A Agenda Saúde foi feita desde o começo para que todas as pessoas consigam usar: quem usa leitor de
      tela, só o teclado, acionador ou lupa, e quem prefere textos curtos e uma coisa de cada vez.
    </p>
    <p>Última revisão: novembro de 2026.</p>

    <h2>Padrões que seguimos</h2>
    <ul>
      <li><strong>WCAG 2.2, nível AA:</strong> as diretrizes de acessibilidade para a web do W3C.</li>
      <li><strong>eMAG 3.1:</strong> o Modelo de Acessibilidade em Governo Eletrônico.</li>
      <li>
        <strong>ABNT NBR 17060:2022:</strong> a norma brasileira de acessibilidade em aplicativos de
        celular.
      </li>
    </ul>

    <h2>Nível de conformidade</h2>
    <p>
      O objetivo é atender ao nível AA da WCAG 2.2. Hoje o site está <strong>parcialmente conforme</strong>:
      os testes com NVDA, VoiceOver e Controle Assistivo ainda estão em andamento. Esta página vai ser
      atualizada com o resultado.
    </p>

    <h2>Recursos de acessibilidade</h2>
    <ul>
      <li>Barra de acessibilidade no topo, com atalhos para o conteúdo, o menu e o rodapé.</li>
      <li>Três temas de cores: claro, escuro e alto contraste (preto e amarelo).</li>
      <li>Texto de 100% a 200%, espaço maior entre linhas e letras e uma fonte mais fácil de ler.</li>
      <li>Opção de reduzir animações. O site também segue a preferência do seu aparelho.</li>
      <li>Dicas extras em cada etapa do agendamento, para quem quiser mais explicação.</li>
      <li>Tudo funciona só com o teclado, e o foco sempre aparece na tela.</li>
      <li>Os formulários dizem o que falta e como corrigir. Não há tempo limite nem CAPTCHA.</li>
      <li>
        O calendário funciona com teclado e leitor de tela. Quem preferir pode ver uma lista com os
        próximos horários livres.
      </li>
      <li>Ao mudar de página, o leitor de tela anuncia o título da página nova.</li>
    </ul>

    <h2>Atalhos de teclado</h2>
    <h3>Barra de acessibilidade</h3>
    <p>Aperte as teclas de atalho do seu navegador junto com o número:</p>
    <ul>
      <li>Chrome e Edge no Windows: <kbd>Alt</kbd> + número.</li>
      <li>Firefox no Windows: <kbd>Alt</kbd> + <kbd>Shift</kbd> + número.</li>
      <li>Safari no Mac: <kbd>Control</kbd> + <kbd>Option</kbd> + número.</li>
    </ul>
    <table>
      <caption>Números dos atalhos</caption>
      <thead>
        <tr>
          <th scope="col">Número</th>
          <th scope="col">Vai para</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><kbd>1</kbd></td>
          <td>Conteúdo principal</td>
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
    <p>O número 3 fica reservado para a busca, como no padrão do eMAG. Este site não tem busca.</p>

    <h3>Navegação geral</h3>
    <table>
      <caption>Teclas para navegar no site</caption>
      <thead>
        <tr>
          <th scope="col">Tecla</th>
          <th scope="col">O que faz</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><kbd>Tab</kbd></td>
          <td>Vai para o próximo link, botão ou campo.</td>
        </tr>
        <tr>
          <td><kbd>Shift</kbd> + <kbd>Tab</kbd></td>
          <td>Volta para o item anterior.</td>
        </tr>
        <tr>
          <td><kbd>Enter</kbd></td>
          <td>Abre um link ou aciona um botão.</td>
        </tr>
        <tr>
          <td><kbd>Espaço</kbd></td>
          <td>Aciona um botão ou marca uma caixa de seleção.</td>
        </tr>
        <tr>
          <td>Setas</td>
          <td>Trocam a opção marcada num grupo de opções.</td>
        </tr>
        <tr>
          <td><kbd>Esc</kbd></td>
          <td>Fecha uma janela de confirmação.</td>
        </tr>
      </tbody>
    </table>

    <h3>Calendário</h3>
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
          <td>Vão para o começo e o fim da semana.</td>
        </tr>
        <tr>
          <td><kbd>Page Up</kbd> e <kbd>Page Down</kbd></td>
          <td>Vão para o mês anterior e o próximo mês.</td>
        </tr>
        <tr>
          <td><kbd>Enter</kbd> ou <kbd>Espaço</kbd></td>
          <td>Escolhem o dia.</td>
        </tr>
      </tbody>
    </table>

    <h2>Limitações conhecidas</h2>
    <ul>
      <li>
        No calendário, cada dia é um botão dentro da grade. O exemplo do W3C (APG) coloca o foco na própria
        célula. Mudamos porque o VoiceOver e o Controle Assistivo do iPhone acionam botões com mais
        segurança. As teclas funcionam do mesmo jeito.
      </li>
      <li>Os atalhos com número podem coincidir com atalhos do navegador ou de outros programas.</li>
      <li>
        Os dados ficam só neste navegador. Se você limpar os dados de navegação, as consultas e as
        configurações somem.
      </li>
      <li>Os testes com tecnologias assistivas ainda estão em andamento.</li>
    </ul>

    <h2>Como relatar um problema</h2>
    <p>Se algo não funcionou para você, conte para a gente. Abra um chamado no GitHub do projeto:</p>
    <p>
      <a :href="ENDERECO_CHAMADOS">Relatar um problema no GitHub</a>
    </p>
    <p>
      Diga em que página você estava, o que tentou fazer e o que aconteceu. Se usar tecnologia assistiva,
      diga qual (por exemplo, NVDA com Firefox).
    </p>
  </div>
</template>

