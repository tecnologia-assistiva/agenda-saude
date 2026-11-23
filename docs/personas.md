# Personas

> **Rascunho, a validar.** Personas fictícias, feitas para guiar o projeto. Precisam ser conferidas com
> pessoas reais que usam essas tecnologias assistivas.

Quatro personas com as capacidades distribuídas entre elas (Unidade 5.2): cada uma representa principalmente
uma capacidade, e algumas combinam mais de uma, como acontece na vida real.

| Capacidade | Ana | José | Rafael | Luana |
|---|:-:|:-:|:-:|:-:|
| Visão | cegueira | baixa visão | | |
| Audição | | | | surdez |
| Mobilidade e destreza | | tremor nas mãos | tetraplegia | |
| Cognição, memória e linguagem | | pouca experiência digital | | português como 2ª língua |

Quem também ganha com as mesmas soluções: quem está com o braço engessado (só teclado), quem usa o
celular no sol forte (alto contraste) ou quem está cansado e distraído (telas curtas, sem tempo limite).

---

## Ana Ribeiro, 34 anos — cega

**Perfil:** auxiliar administrativa. Perdeu a visão aos 20 anos. Usa o computador o dia todo no trabalho e
é rápida no teclado. Marca as próprias consultas e as da mãe.

**Tecnologia assistiva:** leitor de tela NVDA no Windows, com Firefox ou Chrome. Navega por títulos (H),
por campos de formulário (F) e por regiões (D).

**Cenário no app:** no intervalo do almoço, marca uma consulta de clínica geral. Digita a data de nascimento
com o ano em 2 números e envia. Ouve "Corrija 1 problema para continuar", segue o link até o campo, corrige
e continua. Na etapa 3, escolhe "Escolher no calendário", anda pelos dias com as setas e ouve
"quinta-feira, 26 de novembro, 6 horários livres".

**Barreiras num sistema comum:**
- campos sem rótulo ou com o exemplo só dentro do campo (some ao digitar);
- máscaras de data e telefone que mudam o texto enquanto ela digita e confundem o leitor;
- erros mostrados só em vermelho, sem aviso falado;
- calendário feito de `div`, que não recebe o foco nem diz qual dia está escolhido;
- pop-up de confirmação que não recebe o foco, ou que prende o foco;
- CAPTCHA de imagem.

**Como o app resolve:** rótulos visíveis ligados aos campos, sem máscara (formata só ao sair do campo);
resumo de erros que recebe o foco, "Erro:" no título e no começo da mensagem (3.3.1, 4.1.3); foco no h1
a cada etapa, com "Etapa 3 de 5" (2.4.3); calendário no padrão do W3C com o estado no nome de cada dia
(4.1.2) e, como alternativa, a lista dos próximos horários; diálogo nativo com o foco na opção segura;
nada de CAPTCHA.

---

## José Almeida, 71 anos — baixa visão e tremor nas mãos

**Perfil:** aposentado, mora sozinho. Tem degeneração macular (enxerga mal no centro da visão) e tremor nas
mãos. Usa o celular para WhatsApp e quase nada além disso. Tem medo de "apertar errado e estragar tudo".

**Tecnologia assistiva:** iPhone com Texto Maior e Zoom; às vezes liga o VoiceOver para ouvir um texto
longo. Prefere letras amarelas no fundo preto.

**Cenário no app:** precisa remarcar a consulta de enfermagem (medir a pressão) porque vai viajar. Abre
Configurações, liga "Alto contraste" e texto em 200%. Em "Minhas consultas", toca em "Remarcar", escolhe
outro horário e confirma. Os dados dele já estão lá; o protocolo continua o mesmo.

**Barreiras num sistema comum:**
- texto que não aumenta, ou que aumenta e faz a página andar para os lados;
- botões pequenos e colados uns nos outros (o tremor faz tocar no vizinho);
- sessão que expira enquanto ele lê com calma;
- ter que digitar tudo de novo para mudar só a data;
- cancelar sem querer, sem nenhuma confirmação.

**Como o app resolve:** texto até 200% e espaçamento maior, sem rolagem lateral em 320 px (1.4.4, 1.4.10,
1.4.12); tema alto contraste (1.4.3); alvos com pelo menos 44 px e a linha inteira do radio como área de
toque (2.5.8); sem tempo limite e rascunho salvo a cada mudança (2.2.1); remarcar sem redigitar (3.3.7);
revisão antes de confirmar e diálogo antes de cancelar (3.3.4); uma tarefa por tela, com frases curtas.

---

## Rafael Souza, 26 anos — tetraplegia

**Perfil:** estudante de Direito. Tem lesão medular (C5): movimenta a cabeça e um pouco os ombros, mas não
as mãos. Muito acostumado com tecnologia.

**Tecnologia assistiva:** Controle Assistivo do iPhone, com dois acionadores presos na cadeira de rodas
(um avança a varredura, o outro seleciona). No computador, usa um mouse de cabeça.

**Cenário no app:** marca uma consulta de clínica geral para renovar uma receita. Na etapa 3, fica na lista
"Ver próximos horários disponíveis", que tem menos itens para varrer que o calendário, escolhe o primeiro
horário e segue até a confirmação.

**Barreiras num sistema comum:**
- botões feitos de `div` ou `span` que a varredura não encontra;
- páginas longas, com muitos links antes do botão principal (cada item é um passo a mais na varredura);
- arrastar para escolher a data ou deslizar um carrossel;
- alvos minúsculos, difíceis de acertar com o mouse de cabeça;
- tempo limite, que não perdoa a varredura lenta.

**Como o app resolve:** só elementos nativos (`button`, `input`, `a`), inclusive o dia do calendário,
que é um `<button>` dentro da célula (4.1.2); telas enxutas, com uma ação principal (menos passos de
varredura); a lista de próximos horários como caminho curto; nada de arrastar nem gestos (2.5.1, 2.5.7);
alvos de 44 px (2.5.8); sem tempo limite (2.2.1).

---

## Luana Martins, 29 anos — surda

**Perfil:** designer gráfica, grávida do primeiro filho. Surda desde que nasceu; a primeira língua dela é a
Libras, e o português escrito é a segunda. Lê bem textos curtos e diretos; textos longos e cheios de termos
técnicos cansam.

**Tecnologia assistiva:** celular com legendas e alertas visuais; usa o VLibras quando o site oferece e faz
chamadas de vídeo em Libras. Não usa telefone de voz.

**Cenário no app:** marca a consulta de pré-natal (Ginecologia). Liga "Mostrar dicas extras" para ter mais
explicações. Escolhe a profissional, revisa e confirma. Depois toca em "Adicionar à agenda" para receber o
lembrete no celular.

**Barreiras num sistema comum:**
- instruções com jargão e frases longas ("Preencha os campos obrigatórios conforme a máscara");
- mensagens de erro genéricas, como "Campo inválido";
- avisos só por som, ou vídeos sem legenda e sem Libras;
- atendimento só por telefone de voz.

**Como o app resolve:** linguagem simples, frases curtas e botões com verbo; mensagens de erro que dizem
como corrigir, com exemplo (3.3.3); tudo o que é anunciado também aparece escrito na tela; nenhum conteúdo
em áudio ou vídeo; dicas extras opcionais.

**O que ainda falta para ela:** não há Libras (por exemplo, o VLibras), e a ajuda do rodapé é só por
telefone. Um canal por texto (chat ou mensagem) resolveria.
