# Agenda Saúde — guia para retomar o trabalho

App web para agendar consultas numa UBS fictícia. Projeto final de Tecnologias Assistivas, feito do zero
para demonstrar formulários, fluxo em etapas, calendário e diálogos acessíveis (WCAG 2.2 AA, eMAG 3.1,
ABNT NBR 17060). Precisa funcionar com NVDA, VoiceOver e Controle Assistivo (iPhone) e só com teclado.

## Regras
- **Não fazer commits, push nem criar branches.** O usuário cuida do Git.
- Uma etapa por vez. No fim: testes + build, atualizar este arquivo (reescrever, não só acrescentar),
  parar e mostrar resumo curto, lista de arquivos e sugestão de commit ("✨ feat: ..." / "🐞 fix: ...").
  Só começar a próxima quando o usuário pedir.
- Do zero: não abrir nem reaproveitar o projeto anterior do usuário (comunicador CAA).
- Sem biblioteca de UI, sem back-end (dados em JSON, agendamentos no localStorage).
- HTML nativo antes de ARIA. Texto em pt-BR, linguagem simples, botões com verbo.
- Abrir só os arquivos que a tarefa pedir; nunca `node_modules` ou `dist`.

## Comandos
- `npm run dev` · `npm test` (Vitest) · `npm run lint` · `npm run build` (vue-tsc + Vite + 404.html)
- Build do Pages: `BASE_PATH=/agenda-saude/ npm run build`
- `npm run e2e` (Playwright, etapa 5; no WSL: `npx playwright install --with-deps chromium`, pede sudo)

## Mapa
- `index.html`: lang pt-BR + script que aplica as preferências antes da pintura (espelha a store).
- `vite.config.ts`: `base` = `BASE_PATH`, plugin que copia 404.html, config do Vitest (setup em `tests/unit/setup.ts`).
- `src/App.vue`: header, nav, main#conteudo, footer e as regiões role=status/alert.
- `src/router/`: `index.ts` (rotas, `meta.titulo`, scrollBehavior) · `foco-rota.ts` (title + foco no h1).
- `src/stores/configuracoes.ts`: preferências (tema, texto 100–200%, espaçamento, fonte, movimento, dicas).
- `src/servicos/armazenamento.ts`: localStorage com prefixo `agenda-saude:`, versão e try/catch.
- `src/composables/useAnunciador.ts` · `src/utils/contraste.ts` (cálculo WCAG + leitor de tokens).
- `src/components/layout/`: BarraAcessibilidade, CabecalhoSite, MenuPrincipal, RodapeSite.
- `src/components/comum/`: TituloPagina (h1), AvisoProjeto, Icone · `formulario/GrupoOpcoes.vue`.
- `src/views/`: Inicio, Configuracoes, Acessibilidade (versão inicial), NaoEncontrada.
- `src/styles/`: tokens.css (cores) · base.css · preferencias.css.
- `tests/unit/`: contraste, configuracoes, configuracoes-view, foco-rota, layout, anunciador; `ajuda/`.

## Padrões de acessibilidade
- Cores: só tokens hex em `styles/tokens.css`, um bloco por tema; `tests/unit/contraste.spec.ts`
  confere os pares (texto 4,5:1; foco, bordas e primária 3:1) e falha se um token ficar sem par.
- Foco: `outline` 3px + offset em `styles/base.css`; a barra eMAG troca `--cor-foco` pelo seu token.
- Preferências: atributos `data-*` e font-size % no `<html>` (`stores/configuracoes.ts`).
- Troca de rota: `router/foco-rota.ts`; não foca na 1ª carga nem quando só o # muda; `definirTituloDocumento(t, {erro})`.
- Anúncios: `composables/useAnunciador.ts`; `alertar` só para erro crítico (ex.: falha ao salvar).
- Barra eMAG: `components/layout/BarraAcessibilidade.vue`; accesskey 1, 2, 4 (3 reservado para a busca).
- Radios: `components/formulario/GrupoOpcoes.vue` (fieldset/legend, cartão inteiro clicável, h2 opcional na legend).
- Resumo de erros: etapa 2 (`components/formulario/ResumoErros.vue`).
- Diálogos: etapa 4 (`components/comum/DialogoModal.vue`, `<dialog>` + showModal).
- Calendário: etapa 3 (`components/agendamento/CalendarioDatas.vue`).

## Status das etapas
1. Base — **feita** (menu já aponta para /agendar e /minhas-consultas, que dão 404 até as etapas 2 e 4)
2. Etapas 1 e 2 do agendamento — pendente
3. Calendário e horários — pendente
4. Revisão, confirmação, Minhas consultas e diálogos — pendente
5. E2E com axe — pendente (também é a primeira verificação visual: não há navegador funcionando no WSL ainda)
6. Documentação e deploy — pendente

## Decisões
- Horários gerados em tempo de execução a partir de `dados/agenda-modelo.json` (grade semanal, dias
  lotados em dias úteis a partir de hoje, feriados); sorteio com semente fixa. Testes fixam a data.
- Cabeçalho não fixo (2.4.11 por construção) + `scroll-padding`. `createWebHistory`; build copia 404.html.
- "Configurações" no cabeçalho é link com visual de botão; "Alto contraste" é `<button aria-pressed>` + ícone.
- Calendário: semântica APG, foco num `<button>` em cada `<td>`; "selecionado" no nome acessível do dia
  escolhido; `aria-current="date"` no dia de hoje; dias sem vaga mostram e anunciam "sem horários". Testar isso.
- Etapa 3 começa com "Como você prefere escolher?": "Ver próximos horários disponíveis" (padrão) ou calendário.
- Remarcar carrega a consulta no rascunho e abre a etapa 3; mesmo protocolo. Dados pessoais pré-preenchidos.
- Trocar especialidade/profissional apaga só o horário, com aviso.
- Configurações: anuncia tema, tamanho e restaurar; checkboxes não (o leitor já fala o estado). Só salva
  depois da 1ª mudança (antes disso segue o sistema). Radios/checkboxes nativos com `accent-color`.
- Fonte: Atkinson Hyperlegible Next (@fontsource, pesos 400 e 700).
- Node 22.22.1 (apt; a instalação do nvm foi bloqueada pela permissão) → jsdom 29 (o 30+ pede 22.22.2).
  TypeScript 6.0 (typescript-eslint pede < 6.1). ESLint com `no-layout-rules` (sem regras de formatação).
- No Vitest, CSS importado com `?raw` vem vazio: o teste de contraste lê `tokens.css` com `fs`.
