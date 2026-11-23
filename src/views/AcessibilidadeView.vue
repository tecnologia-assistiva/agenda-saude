<script setup lang="ts">
import TituloPagina from '@/components/comum/TituloPagina.vue'
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

    <h2>Recursos</h2>
    <ul>
      <li>Temas claro, escuro e alto contraste.</li>
      <li>Texto até 200%, mais espaço entre linhas e fonte mais fácil de ler.</li>
      <li>Sem tempo limite e sem CAPTCHA.</li>
      <li>Lista dos próximos horários livres, para quem não quer usar o calendário.</li>
    </ul>

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
      <li>
        Em tela de 320 px com texto em 200% e mais espaço entre letras, palavras longas, como “Configurações”,
        podem quebrar no meio.
      </li>
    </ul>
  </div>
</template>