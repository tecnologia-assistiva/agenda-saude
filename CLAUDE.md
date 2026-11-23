# Agenda Saúde — guia para retomar o trabalho

App web para agendar consultas numa UBS fictícia. Projeto final de Tecnologias Assistivas, feito do zero
para demonstrar formulários, fluxo em etapas, calendário e diálogos acessíveis (WCAG 2.2 AA, eMAG 3.1,
ABNT NBR 17060). Precisa funcionar com NVDA, VoiceOver e Controle Assistivo (iPhone) e só com teclado.

## Status: projeto **concluído** (etapas 1–6: base, etapas do agendamento, calendário, revisão/confirmação/
Minhas consultas/diálogos, e2e, documentação). Falta só o que é do usuário:
- Testes manuais (NVDA, VoiceOver, Controle Assistivo, teclado): preencher as colunas e os dados do topo de
  `docs/avaliacao-wcag.md`. Depois, rever "Situação: parcialmente conforme" e a data em `AcessibilidadeView.vue`.
- Revisar e validar as personas (`docs/personas.md`, marcado "rascunho, a validar").
- Gravar o vídeo (`docs/roteiro-video.md`) e pôr o link no README.
- Conferir o titular no `LICENSE` (ficou "Kavalkievicz"). Opcional: "UBS" por extenso (eMAG 3.12, parcial).

## Regras
- **Git: só leitura** (status, diff, log). Nada que altere o índice ou o histórico (add, rm, restore, commit,
  branch, push), nem para desfazer. Para apagar um arquivo, apagar só da pasta.
- Uma etapa por vez. No fim: unitários + e2e + lint + build, reescrever este arquivo (≤ 80 linhas), parar e
  mostrar resumo curto, arquivos e sugestão de commit ("✨ feat: ..." / "🐞 fix: ..."). Seguir só quando pedirem.
- Do zero: não abrir nem reaproveitar o projeto anterior do usuário (comunicador CAA).
- Sem biblioteca de UI nem back-end (JSON + localStorage). HTML nativo antes de ARIA; pt-BR simples; botões com verbo.
- Abrir só os arquivos que a tarefa pedir; nunca `node_modules` ou `dist`. Dependência nova só com o usuário.

## Comandos
- `npm run dev` · `npm test` (Vitest) · `npm run lint` · `npm run build` (vue-tsc + Vite + 404.html)
- `npm run e2e`: build com `BASE_PATH=/agenda-saude/` + Playwright (sobe o `vite preview`); um arquivo: `npm run e2e -- largura`.
- `npm run prints`: build + `scripts/prints.mjs` → 40 PNG em `docs/prints/todas/` (fora do Git) e as 8 do README
  em `docs/prints/*.webp` (lista `PARA_O_README`; WebP 0,92 codificado pelo Chromium, sem dependência a mais).
- Deploy (`.github/workflows/deploy.yml`): lint, unitários, build, e2e; só na main publica no Pages.
  Site: https://tecnologia-assistiva.github.io/agenda-saude/

## Mapa
- `src/router/`: `index.ts` (rotas, `meta.titulo`/`meta.etapa`, rota de remarcar) · `etapas.ts` (guardas, destinos) · `foco-rota.ts`.
- `src/stores/`: `configuracoes.ts` · `agendamento.ts` (rascunho, confirmar, remarcar, dados salvos) · `consultas.ts`.
- `src/servicos/`: `armazenamento.ts` · `catalogo.ts` · `horarios.ts` · `calendario-ics.ts` · `src/utils/` · `src/composables/`.
- `src/components/`: `layout/` (Cabecalho, BarraAcessibilidade, Menu, Rodape) · `comum/` (TituloPagina, DicaExtra,
  Icone, DialogoModal) · `formulario/` (CampoTexto, GrupoOpcoes, ResumoErros) · `agendamento/` (IndicadorEtapas,
  NavegacaoEtapa, AvisoEtapaIncompleta, AvisoRemarcacao, CalendarioDatas, ListaResumo).
- `src/views/`: Inicio, MinhasConsultas, Configuracoes, Acessibilidade (declaração), NaoEncontrada, AgendarLayout, `agendar/`.
- Testes: `tests/unit/` (+ `ajuda/`, stub do showModal) · `tests/e2e/` (`ajuda.ts`, axe, teclado, largura, foco,
  impressao-e-cores-forcadas) · `playwright.config.ts` · `tsconfig.e2e.json`.
- Docs: `README.md` · `LICENSE` (MIT) · `docs/`: `avaliacao-wcag.md`, `personas.md`, `roteiro-video.md`, `prints/`.

## Diretrizes visuais (serviço público sóbrio; inspiração GOV.UK, sem copiar marca/fonte)
- **Tela enxuta:** um objetivo e uma ação principal por tela; no máximo 1–2 frases curtas por bloco; sem
  repetir informação. O que não for essencial vai para `<DicaExtra>` ("Mostrar dicas extras", desligado).
- Claro é o tema principal; conteúdo em `.coluna-leitura` (40rem). Aviso acadêmico só no topo e no rodapé.
- Sem cartões, sombras, bordas laterais nem ícones decorativos. Links sublinhados. Botões retangulares, sem ícone;
  um `.botao` principal por tela, o resto é link (ou `.botao--secundario` se não navega). Resumos em `<dl>`.

## Padrões de acessibilidade
- Cores: só tokens hex em `styles/tokens.css`; `contraste.spec.ts` confere pares e foco. Impressão: `@media print`
  (`:root:root`, sempre claro). Foco: fundo amarelo + barra escura; forced-colors: contorno `Highlight`.
- Largura: `body { overflow-wrap: anywhere }`; item flex com texto pode precisar de `min-width: 0`; nada de
  `nowrap` em texto (usar `inline-block`). Botão "Configurações": recuo `clamp(.25rem, 7.5vw - .5rem, 1rem)`.
- Troca de rota: `foco-rota.ts` (title + foco no h1; não na 1ª carga nem só com # ou query). Anúncios:
  `useAnunciador.ts` (`alertar` só para erro crítico). Barra eMAG: accesskey 1, 2, 4 (3 = busca).
- Campos: `CampoTexto.vue`; radios: `GrupoOpcoes.vue` (fieldset/legend); erros: `ResumoErros.vue` (recebe o foco).
- Etapas: `IndicadorEtapas.vue` (ol, aria-current="step") + legenda "Etapa X de 5" no h1. Calendário: grid APG
  com <button> na <td> (motivo: VoiceOver e Controle Assistivo), tabindex móvel, estado no nome do dia.
- Diálogo: `DialogoModal.vue` (`<dialog>` + showModal; foco em "Não, manter…"; Esc; foco volta a quem abriu ou ao h1).
- Ações repetidas: visível no começo + data em `.visualmente-oculto` (no Vue, espaço inicial no `<span>` some: `{{ ` x` }}`).

## Decisões
- Horários: de `dados/agenda-modelo.json`, amanhã a hoje+30, ocupação por hash fixo (50%), 30 min; os já marcados
  somem. Unitários e e2e fixam hoje em 18/11/2026 (e2e: `page.clock`, fuso de Brasília).
- Rascunho: campos editam a store direto; guarda leva à 1ª etapa incompleta; "Alterar" usa `?retorno=revisao`.
- Revisão grava, `router.replace` para a confirmação e só então apaga o rascunho (etapa 5 pela `ultimaConfirmacao`).
- Confirmação: imprimir (sem cabeçalho, rodapé, etapas, `.nao-imprimir`) e .ics (hora flutuante, UID = protocolo).
- Remarcar = link com beforeEnter (rascunho + etapa 3, mesmo protocolo); "Cancelar" e "Apagar meus dados" → diálogo.
- E2E: axe com wcag2a/2aa/21a/21aa/22aa; largura com 200% + espaçamento ligados pela tela de Configurações; os
  testes não importam o app. Limitações (página e README): dados só no navegador, sem Libras, ajuda só por
  telefone, atalhos podem colidir, "Configurações" quebra em 320 px + 200% + espaçamento (ou fonte larga).
- Node 22.22.1 → jsdom 29; TypeScript 6.0; Playwright 1.65 = Chromium 1255 (já no cache do WSL). `npm audit`:
  5 moderados de `@vue/test-utils` → js-beautify (glob/minimatch).
