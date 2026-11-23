# Agenda Saúde

Agendamento de consultas numa Unidade Básica de Saúde (UBS) fictícia, feito para ser usado por todas as
pessoas: com leitor de tela, só com teclado, com acionador ou com zoom.

[![Testar e publicar](https://github.com/tecnologia-assistiva/agenda-saude/actions/workflows/deploy.yml/badge.svg)](https://github.com/tecnologia-assistiva/agenda-saude/actions/workflows/deploy.yml)

**Site publicado:** <https://tecnologia-assistiva.github.io/agenda-saude/>

> Projeto acadêmico. Os dados são fictícios: nenhuma consulta é marcada de verdade.

## Objetivo e contexto

Projeto final da disciplina **Tecnologias Assistivas**. O objetivo é mostrar, num serviço público do dia a
dia, como fazer formulários, um fluxo em etapas, um calendário e diálogos acessíveis, seguindo a
**WCAG 2.2 nível AA**, o **eMAG 3.1** e a **ABNT NBR 17060:2022**.

O app foi feito para funcionar com **NVDA** (Windows), **VoiceOver** e **Controle Assistivo** (iPhone) e
**só com teclado**: o teclado e o axe são conferidos por testes automáticos, e os leitores de tela, na
avaliação manual. O visual é sóbrio, de serviço público (inspirado no GOV.UK, sem copiar marca ou fonte):
uma tarefa por tela, texto curto e linguagem simples.

## Funcionalidades

- **Agendar em 5 etapas:** seus dados → tipo de atendimento → data e horário → revisão → confirmação.
- **Escolher o horário** pela lista dos próximos horários livres (o caminho mais simples) ou pelo calendário.
- **Revisar antes de confirmar**, com "Alterar" em cada bloco; nada é marcado antes do botão
  "Confirmar agendamento".
- **Confirmação** com protocolo, "Imprimir comprovante" e "Adicionar à agenda" (arquivo `.ics`).
- **Minhas consultas:** ver, remarcar (mesmo protocolo, sem digitar os dados de novo) e cancelar (com
  confirmação).
- **Dados do último agendamento** já preenchidos no próximo, com a opção "Apagar meus dados".
- **Configurações:** tema claro, escuro ou alto contraste; texto de 100% a 200%; mais espaço entre linhas e
  letras; fonte mais fácil de ler; reduzir animações; dicas extras. Na primeira visita, segue as
  preferências do aparelho.
- **Barra de acessibilidade** com o link para a página de acessibilidade e o botão de alto contraste.
- Rascunho salvo a cada mudança: voltar, recarregar ou fechar a página não apaga nada.

## Decisões de acessibilidade

| Decisão | Critérios WCAG |
|---|---|
| HTML nativo antes de ARIA: `header`, `nav`, `main`, `footer`, `fieldset`/`legend`, `<dialog>`, `<button>`, `<dl>`. | 1.3.1, 4.1.2 |
| A cada troca de página: título novo ("Etapa 2 de 5: Tipo de atendimento – Agenda Saúde") e foco no h1. | 2.4.2, 2.4.3, 4.1.3 |
| Etapas: lista com "Etapa X de 5" e `aria-current="step"`; a legenda também fica dentro do h1. | 1.3.1, 2.4.6, 2.4.8 (AAA) |
| Formulários: rótulo visível, "(obrigatório)/(opcional)" em texto, `autocomplete`, data, telefone e cartão SUS só com números e formatados enquanto a pessoa digita, sem validar enquanto digita. | 1.3.5, 3.3.2, 3.2.2 |
| Erros: resumo no topo que recebe o foco, mensagem junto de cada campo dizendo como corrigir, "Erro:" no título. | 3.3.1, 3.3.3, 4.1.3 |
| Revisão antes de confirmar e diálogo antes de cancelar ou apagar dados. | 3.3.4 |
| Dados do último agendamento preenchidos; remarcar não pede os dados de novo. | 3.3.7 |
| Calendário no padrão de grade do W3C (APG), com o dia como `<button>` dentro da célula (VoiceOver e Controle Assistivo acionam com segurança). Estado no nome: "quarta-feira, 25 de novembro, selecionado, 4 horários livres". | 2.1.1, 4.1.2, 2.5.3 |
| Dias sem vaga riscados e "concluída" escrito nas etapas: nunca só a cor. | 1.4.1 |
| Diálogo nativo (`showModal()`): foco começa em "Não, manter…", Esc fecha e o foco volta para quem abriu. | 2.1.2, 2.4.3 |
| Anúncios na região de status (horário apagado, consulta cancelada, tema alterado), sem mover o foco. | 4.1.3 |
| Contraste conferido por teste em todos os pares de cores dos 3 temas; foco amarelo com barra escura. | 1.4.3, 1.4.11, 2.4.7 |
| Cabeçalho não fixo e margem de rolagem: o foco nunca fica escondido. | 2.4.11 |
| Alvos com pelo menos 44 px (a área de toque do radio é a linha toda). | 2.5.8 |
| Sem rolagem horizontal em 320 px, mesmo com texto em 200% e mais espaçamento. | 1.4.4, 1.4.10, 1.4.12 |
| Menu e nomes iguais em todas as páginas. | 3.2.3, 3.2.4 |
| Nome acessível começa pelo texto visível ("Cancelar a consulta de…"). | 2.5.3, 2.4.4 |
| Sem tempo limite e sem CAPTCHA. | 2.2.1 |

## Como rodar

Precisa do Node 22.12 ou mais novo.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # gera dist/ (com 404.html para o GitHub Pages)
```

Para o GitHub Pages, o build usa o nome do repositório: `BASE_PATH=/agenda-saude/ npm run build`.
A publicação é automática na branch `main` (`.github/workflows/deploy.yml`).

## Como testar

```bash
npm test           # unitários (Vitest + jsdom)
npm run lint       # ESLint, com regras de acessibilidade para Vue
npm run e2e        # e2e (Playwright + axe) contra o build de produção
```

Na primeira vez, instale o navegador dos e2e: `npx playwright install chromium` (no Linux ou WSL, com
`--with-deps`). Para rodar um arquivo só: `npm run e2e -- teclado`.

- **Unitários (`tests/unit/`):** componentes, regras de validação, contraste de todos os pares de cores,
  foco na troca de página, regiões de anúncio, calendário, diálogo, arquivo `.ics` e o fluxo completo.
- **E2E (`tests/e2e/`), com a data fixa em 18/11/2026:**
  - `axe`: todas as rotas e os estados importantes (erros, calendário, diálogos, listas), nos 3 temas;
  - `teclado`: o fluxo inteiro só com teclado;
  - `largura`: 320 px, também com texto em 200% e espaçamento ampliado;
  - `foco`: indicador de foco nos 3 temas;
  - `impressao-e-cores-forcadas`: comprovante impresso e modo de contraste do Windows.
- O workflow roda lint, unitários, build e e2e em todo pull request; só publica se tudo passar.

## Estrutura de pastas

```text
src/
  components/   layout/ (cabeçalho, barra de acessibilidade, menu, rodapé), comum/ (título, dica, diálogo),
                formulario/ (campo, grupo de opções, resumo de erros), agendamento/ (etapas, calendário)
  views/        uma tela por rota; agendar/ tem as 5 etapas
  router/       rotas, guardas das etapas e foco na troca de página
  stores/       preferências, rascunho do agendamento e consultas (Pinia + localStorage)
  servicos/     catálogo, gerador de horários, arquivo .ics, acesso ao localStorage
  utils/        datas, validação, formatação e cálculo de contraste
  composables/  anúncios para leitor de tela e formulários
  dados/        especialidades, profissionais e modelo da agenda (JSON)
  styles/       tokens de cor dos 3 temas, base e preferências
tests/
  unit/         Vitest
  e2e/          Playwright + axe
```

## Documentação

- Página [Sobre a acessibilidade](https://tecnologia-assistiva.github.io/agenda-saude/acessibilidade) (declaração no próprio site)

## Limitações

- Não há servidor: as consultas e os dados ficam no `localStorage` do navegador. Trocar de aparelho ou limpar
  os dados do navegador apaga tudo.
- Não há tradução para Libras.
- Em 320 px com texto em 200% e espaçamento ampliado, palavras longas como "Configurações" podem quebrar no
  meio (não há rolagem horizontal).
- O `.ics` usa a hora local do aparelho, sem fuso.
- Os testes automáticos encontram só uma parte dos problemas.

## Créditos e licenças

- **Código:** [licença MIT](LICENSE).
- **Fonte Atkinson Hyperlegible Next**, do Braille Institute of America, sob a
  [SIL Open Font License 1.1](https://openfontlicense.org), distribuída pelo pacote
  [@fontsource/atkinson-hyperlegible-next](https://fontsource.org/fonts/atkinson-hyperlegible-next).
- Referências: [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [WAI-ARIA Authoring Practices (APG)](https://www.w3.org/WAI/ARIA/apg/),
  [eMAG 3.1](https://emag.governoeletronico.gov.br/), ABNT NBR 17060:2022 e o
  [GOV.UK Design System](https://design-system.service.gov.uk/) como inspiração visual.
- Feito com Vue 3, Vite, Pinia e Vue Router. Testes com Vitest, Playwright e
  [axe-core](https://github.com/dequelabs/axe-core) (MPL 2.0, só nos testes).