# Avaliação de acessibilidade

Avaliação do Agenda Saúde pela **WCAG 2.2, níveis A e AA**, pelo **eMAG 3.1** e pelas **10 heurísticas de
Nielsen**.

- **Automática:** testes unitários (`tests/unit/`, Vitest) e e2e (`tests/e2e/`, Playwright + axe com as
  tags wcag2a, wcag2aa, wcag21a, wcag21aa e wcag22aa). Rodam a cada pull request e antes de publicar.
- **Manual:** colunas NVDA, VoiceOver, Teclado e Resultado, para preencher.

| Dado da avaliação manual | Preencher |
|---|---|
| Data | |
| Endereço e versão (commit) | |
| NVDA (versão) + navegador | |
| VoiceOver: iPhone e versão do iOS | |
| Controle Assistivo: iPhone, acionadores | |

Legenda para as colunas manuais: ✅ passou · ⚠️ passou com ressalva (anotar) · ❌ falhou · — não testado.

## Critérios que se aplicam

Evidências: `unit/x` = `tests/unit/x.spec.ts`; `e2e/x` = `tests/e2e/x.spec.ts`.

| Critério | Como foi atendido | Evidência automática | NVDA | VoiceOver | Teclado | Resultado |
|---|---|---|---|---|---|---|
| 1.1.1 Conteúdo não textual (A) | Não há imagens de conteúdo. O único ícone (✓ do "Alto contraste") tem `aria-hidden`; o estado vem do `aria-pressed`. | `unit/layout` ("sem ícones decorativos"); `e2e/axe` | | | | |
| 1.3.1 Informações e relações (A) | Regiões (`header`, `nav`, `main`, `footer`), h1/h2, `fieldset`/`legend`, `<dl>` nos resumos, tabelas com `caption` e `th`, grade do calendário. | `unit/layout`, `unit/etapa-atendimento`, `unit/calendario`; `e2e/axe` | | | | |
| 1.3.2 Sequência com significado (A) | A ordem do código é a da tela: rótulo → instrução → erro → campo; legenda da etapa dentro do h1. | `unit/campo-texto` ("ordem"); `e2e/teclado` | | | | |
| 1.3.3 Características sensoriais (A) | Nenhuma instrução depende só de forma ou posição: "Dias riscados não têm horários livres" também vai no nome do dia ("sem horários"). | `unit/calendario` ("descrita pela legenda") | | | | |
| 1.3.4 Orientação (AA) | Nenhuma trava de orientação; o layout se adapta a retrato e paisagem. | `e2e/largura` | | | | |
| 1.3.5 Identificar o propósito da entrada (AA) | `autocomplete` name, bday e tel nos dados pessoais. | `unit/etapa-dados` ("autocomplete correto") | | | | |
| 1.4.1 Uso de cor (A) | Riscado nos dias sem vaga, "concluída" nas etapas, "(obrigatório)" e "Erro:" em texto, links sublinhados, ✓ no alto contraste. | `unit/calendario`, `unit/fluxo-etapas`, `unit/campo-texto` | | | | |
| 1.4.3 Contraste mínimo (AA) | Todos os pares de cores dos 3 temas com pelo menos 4,5:1. | `unit/contraste`; `e2e/axe` (3 temas) | | | | |
| 1.4.4 Redimensionar o texto (AA) | Texto de 100% a 200% em Configurações; tudo em rem/em. | `unit/configuracoes-view`; `e2e/largura` (200%) | | | | |
| 1.4.5 Imagens de texto (AA) | Não há imagens de texto. | — (inspeção) | | | | |
| 1.4.10 Refluxo (AA) | Sem rolagem horizontal em 320 px em nenhuma rota. | `e2e/largura` | | | | |
| 1.4.11 Contraste não textual (AA) | Bordas de campos e botões com pelo menos 3:1; foco em duas cores (amarelo + barra escura). | `unit/contraste` (bordas e foco) | | | | |
| 1.4.12 Espaçamento de texto (AA) | "Mais espaço entre linhas e letras" (linha 1,8; letras 0,12em; palavras 0,16em; parágrafo 2em) sem cortar nada. | `e2e/largura` (espaçamento ampliado) | | | | |
| 2.1.1 Teclado (A) | Tudo funciona com teclado; calendário com setas, Home/End e Page Up/Down. | `e2e/teclado` (fluxo inteiro); `unit/calendario` | | | | |
| 2.1.2 Sem bloqueio do teclado (A) | O diálogo fecha com Esc; a grade do calendário tem um só ponto de Tab. | `unit/dialogo-modal` ("Esc fecha"); `e2e/teclado` | | | | |
| 2.1.4 Atalhos de teclado por caractere (A) | Os atalhos do eMAG (`accesskey` 1, 2 e 4) sempre usam tecla modificadora. | `unit/layout` ("atalhos 1, 2 e 4") | | | | |
| 2.2.1 Tempo ajustável (A) | Não há tempo limite; o rascunho fica salvo. | `unit/agendamento` ("recarregar não perde nada") | | | | |
| 2.4.1 Ignorar blocos (A) | "Ir para o conteúdo/menu/rodapé" no topo, mais as regiões. | `unit/layout`; `e2e/teclado` (1º Tab) | | | | |
| 2.4.2 Página com título (A) | Título por página, com a etapa ("Etapa 2 de 5: …") e "Erro:" quando há erro. | `unit/foco-rota`, `unit/fluxo-etapas`, `unit/etapa-dados` | | | | |
| 2.4.3 Ordem do foco (A) | Foco no h1 a cada página; resumo de erros recebe o foco; diálogo começa na opção segura e devolve o foco. | `unit/foco-rota`, `unit/dialogo-modal`, `unit/minhas-consultas`; `e2e/teclado` | | | | |
| 2.4.4 Finalidade do link (A) | "Alterar seus dados", "Remarcar a consulta de quarta-feira, 25 de novembro, às 09:00". | `unit/etapa-revisao`, `unit/minhas-consultas` | | | | |
| 2.4.5 Várias formas (AA) | Menu, links na tela inicial e no rodapé. As etapas são um processo (exceção do critério). | `unit/layout` | | | | |
| 2.4.6 Cabeçalhos e rótulos (AA) | Um h1 por página, h2 por bloco, rótulos que dizem o que pedir. | `unit/etapa-revisao`; `e2e/axe` | | | | |
| 2.4.7 Foco visível (AA) | Fundo amarelo + barra escura em links, botões, radios e dias do calendário. | `e2e/foco` (3 temas); `e2e/impressao-e-cores-forcadas` | | | | |
| 2.4.11 Foco não obscurecido (mínimo) (AA) | Cabeçalho não fixo e `scroll-padding`: nada cobre o elemento com foco. | — (inspeção) | | | | |
| 2.5.2 Cancelamento do acionamento (A) | Só botões e links nativos (a ação acontece ao soltar). | — (inspeção) | | | | |
| 2.5.3 Rótulo no nome acessível (A) | O nome acessível começa pelo texto visível ("Conteúdo" → "Ir para o conteúdo", número do dia no nome). | `unit/layout`, `unit/calendario`, `unit/etapa-revisao` | | | | |
| 2.5.8 Tamanho do alvo (mínimo) (AA) | Alvos com pelo menos 44 px; no radio, a linha inteira. | `e2e/axe` (target-size) | | | | |
| 3.1.1 Idioma da página (A) | `lang="pt-BR"`. | `e2e/axe` | | | | |
| 3.1.2 Idioma das partes (AA) | Não há trechos em outra língua (só nomes próprios, como "Atkinson Hyperlegible"). | — (inspeção) | | | | |
| 3.2.1 Em foco (A) | Receber o foco não muda nada. | `e2e/teclado` | | | | |
| 3.2.2 Em entrada (A) | Escolher opção ou dia não muda de página nem move o foco; trocar a especialidade ou o dia avisa antes e depois. | `unit/etapa-atendimento`, `unit/etapa-data-horario` | | | | |
| 3.2.3 Navegação consistente (AA) | Mesmo cabeçalho, menu e rodapé em todas as páginas. | `unit/layout` | | | | |
| 3.2.4 Identificação consistente (AA) | Os mesmos nomes para a mesma função ("Continuar", "Voltar", "Alterar"). | `unit/etapa-dados`, `unit/etapa-revisao` | | | | |
| 3.2.6 Ajuda consistente (A) | A ajuda fica no rodapé, no mesmo lugar em todas as páginas. | `unit/layout` ("rodapé igual") | | | | |
| 3.3.1 Identificação do erro (A) | Resumo no topo, mensagem junto do campo, `aria-invalid`. | `unit/etapa-dados`, `unit/etapa-atendimento`, `unit/etapa-data-horario` | | | | |
| 3.3.2 Rótulos ou instruções (A) | Rótulo visível, "(obrigatório)/(opcional)", exemplo do formato. | `unit/campo-texto` | | | | |
| 3.3.3 Sugestão de erro (AA) | A mensagem diz como corrigir ("Digite o ano com 4 números, por exemplo 15/03/1980."). | `unit/validacao`, `unit/etapa-dados` | | | | |
| 3.3.4 Prevenção de erros (AA) | Revisão antes de confirmar; diálogo antes de cancelar a consulta ou apagar os dados. | `unit/etapa-revisao`, `unit/minhas-consultas`, `unit/dados-salvos` | | | | |
| 3.3.7 Entrada redundante (A) | Dados do último agendamento já preenchidos; remarcar não pede os dados de novo. | `unit/dados-salvos`, `unit/minhas-consultas`, `unit/consultas` | | | | |
| 4.1.2 Nome, função, valor (A) | Elementos nativos; `aria-pressed`, `aria-current`, `aria-selected`, `aria-invalid`, `aria-disabled` onde precisa. | `unit/layout`, `unit/calendario`; `e2e/axe` | | | | |
| 4.1.3 Mensagens de status (AA) | Regiões `status` e `alert`: horário apagado, dia escolhido, consulta cancelada, tema alterado. | `unit/anunciador`, `unit/etapa-data-horario`, `unit/minhas-consultas` | | | | |

**Não se aplicam:** 1.2.1 a 1.2.5 e 1.4.2 (não há áudio nem vídeo); 1.4.13 (nada aparece ao passar o mouse
ou focar); 2.2.2 (nada se move nem se atualiza sozinho); 2.3.1 (nada pisca); 2.5.1 e 2.5.7 (não há gestos
nem arrastar); 2.5.4 (nada depende de mexer o aparelho); 3.3.8 (não há login). O 4.1.1 saiu da WCAG 2.2.

**Além do AA:** o modo de contraste do Windows (forced-colors) e a impressão do comprovante são conferidos
em `e2e/impressao-e-cores-forcadas`; a legenda "Etapa X de 5" atende o 2.4.8 Localização (AAA).

## eMAG 3.1: recomendações atendidas

| Seção | Recomendações | Como |
|---|---|---|
| Marcação | 1.1 a 1.4, 1.6 a 1.9 | HTML semântico e válido, títulos em ordem, ordem lógica de Tab, tabelas só para dados, regiões, nada abre em janela nova. |
| Marcação | 1.5 | Barra de acessibilidade com atalhos 1 (conteúdo), 2 (menu) e 4 (rodapé); o 3 fica reservado para a busca. |
| Comportamento | 2.1 a 2.7 | Tudo pelo teclado; sem atualização ou redirecionamento automático; sem tempo limite; nada pisca. |
| Conteúdo | 3.1, 3.3 a 3.5, 3.9 a 3.11 | `lang`, título por página, "Etapa X de 5", links que se explicam, tabelas com `caption` e `th`, linguagem simples. |
| Apresentação | 4.1 a 4.4 | Contraste, informação nunca só pela cor, texto até 200%, foco bem visível. |
| Formulário | 6.2 a 6.8 | Rótulos ligados aos campos, ordem lógica, nada muda sozinho, instruções, erros descritos e confirmação do envio, `fieldset`, sem CAPTCHA. |
| Elementos padronizados | Barra de acessibilidade, alto contraste e página "Acessibilidade" | No topo de todas as páginas; a página explica os recursos e os atalhos. |

**Parcial:** 3.12 (explicar siglas): "UBS" aparece no cabeçalho e no Início sem a forma por extenso
(Unidade Básica de Saúde).

Não se aplicam: 3.2 (não há trechos em outra língua), 3.6 a 3.8 (não há imagens, mapas de imagem nem
documentos para baixar, além do `.ics`), a seção 5 (multimídia) e a 6.1 (não há botões de imagem).

## Avaliação heurística (Nielsen)

| Heurística | Como aparece no app |
|---|---|
| 1. Visibilidade do estado do sistema | "Etapa X de 5" no indicador e no h1; avisos ao apagar o horário; "Consulta agendada" com protocolo. |
| 2. Correspondência com o mundo real | Termos do dia a dia de uma UBS (especialidade, profissional, protocolo, comprovante); datas por extenso. |
| 3. Controle e liberdade | "Voltar" em toda etapa, "Alterar" na revisão, remarcar e cancelar; "Não, manter" como opção padrão nos diálogos. |
| 4. Consistência e padrões | Mesmo cabeçalho, menu e rodapé; um botão principal por tela; padrões do W3C (APG) e do eMAG. |
| 5. Prevenção de erros | Revisão antes de confirmar, diálogo antes de cancelar, horários ocupados nem aparecem, sem máscaras. |
| 6. Reconhecer em vez de lembrar | Escolhas por opções; dados do último agendamento preenchidos; a revisão mostra tudo antes de confirmar. |
| 7. Flexibilidade e eficiência | Lista dos próximos horários ou calendário; atalhos do eMAG; colar a data só com números. |
| 8. Estética e design minimalista | Uma tarefa por tela, frases curtas, o que não é essencial fica nas "dicas extras". |
| 9. Ajudar a reconhecer e corrigir erros | Resumo com links até o campo; mensagens que dizem como corrigir, com exemplo. |
| 10. Ajuda e documentação | Ajuda no rodapé, dicas extras opcionais e a página "Sobre a acessibilidade" com atalhos e teclas. |
