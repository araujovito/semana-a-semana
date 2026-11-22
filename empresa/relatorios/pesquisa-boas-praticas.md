# Pesquisa de boas práticas: apps de saúde, acessibilidade, Android, LGPD, medidas caseiras e fortificação

Data: 20/11/2026. Autor: pesquisador de boas práticas. Destinatário: chefe de pesquisa.

**Situação: INCOMPLETO.** A pesquisa foi encerrada em 20/11 por ordem da direção geral (limite de uso da conta). As seis perguntas têm resposta com fonte, mas os pontos da seção 7 ficaram sem verificação e nada mais foi pesquisado depois disso. Nenhum código deste relatório foi compilado ou testado.

## Conclusão (o que muda no app)

1. **Instalação por APK no Brasil tem regra nova desde 30/09/2026** (verificação de desenvolvedores do Android). A documentação oficial diz, na FAQ, que a instalação por arquivo ainda não é afetada nesta fase; outra página oficial diz que pacote não registrado "não será mais instalável" em aparelho certificado no Brasil. As duas afirmações se contradizem. É preciso testar no celular dela antes de segunda; `adb install` pelo cabo continua permitido sem registro (seção 3.4).
2. **O modo escuro do CSS nunca liga dentro do APK**: o tema Android é `Theme.Material.Light`, e a WebView só informa `prefers-color-scheme: dark` quando o tema do app é escuro (seção 2.5).
3. **Os botões mais usados estão abaixo de 48dp**: "+ 1 copo", "+ 10 g", "Concluí o treino" têm cerca de 31 px de altura; o "apagar" das tabelas tem cerca de 20 px, abaixo até dos 24 px do WCAG 2.2 (seção 2.2). Contraste de texto passa em todas as combinações.
4. **`allowBackup="true"` hoje manda os registros de saúde para o backup do Google** quando o aparelho tem backup ligado. Há três opções com riscos diferentes (desligar, ligar só com criptografia, ou só transferência entre aparelhos); a decisão é da direção (seção 3.2).
5. **Lembrete de dose semanal não precisa de alarme exato.** Alarme inexato que funciona em Doze (`setAndAllowWhileIdle`) basta, não exige a permissão "Alarmes e lembretes" e evita a tela de configuração. Precisa de `POST_NOTIFICATIONS` (Android 13+), canal, receptor de reinício e de os horários ficarem guardados fora do localStorage (seção 3.1).
6. **Exportar/importar arquivo dá para fazer só com o SDK**, pelo seletor do sistema, sem permissão de armazenamento (seção 3.3). Recomenda-se também espelhar os dados num arquivo em `getFilesDir()` (seção 3.5).
7. **Contagem de calorias**: os estudos mostram associação entre apps de contar calorias e sintomas de transtorno alimentar em quem já é vulnerável; o único ensaio randomizado, em mulheres de baixo risco, não achou dano em um mês. Em 2026 saiu um consenso de especialistas pedindo triagem de transtorno alimentar antes de GLP-1. No app, o ponto mais sensível é a linha "Energia das refeições marcadas: X de Y kcal" na tela Hoje e as kcal em cada refeição (seção 1.6).
8. **O app não tem sequências ("streaks"), não usa vermelho/verde para comida e já diz que pesar uma vez por semana basta.** Isso está alinhado com a literatura; a recomendação é manter assim.
9. **Medidas caseiras**: consegui fonte publicada para 66 dos 72 alimentos (IBGE/POF 2008-2009, que traz os valores de Pinheiro e do Guia Alimentar 2006). **21 `gMedida` divergem mais de 20%** da fonte; as maiores: manga fatia, tofu fatia, lombo fatia, tomate pequeno, brócolis e couve-flor ramo, chuchu, mandioca, mamão (seção 5). Isso não muda os nutrientes (o cardápio é em gramas), mas muda o que ela põe no prato se seguir a medida caseira.
10. **Ferro do pão francês está subestimado**: a TACO dá 1,0 mg/100 g (farinha sem fortificação); a TBCA 7.3 dá 4,33 mg/100 g. O folato do pão vem do USDA (170 µg) e fica perto do valor brasileiro (149 µg). Cuscuz de flocão e farinha integral são isentos da fortificação (seção 6).
11. **Castanha-do-pará**: a TBCA dá 3.382 µg de selênio por 100 g (cerca de 135 µg numa castanha de 4 g); o USDA dá 1.917 µg/100 g (cerca de 77 µg). Um estudo brasileiro mostra variação de mais de 30 vezes conforme a origem. Limites: 400 µg/dia (IOM) e 255 µg/dia (EFSA, 2023). "Uma por dia" fica abaixo dos dois limites pela média, mas não necessariamente com castanha de solo rico; vale uma frase no app (seção 6.4).
12. **Não vale trocar USDA por TBCA até segunda**: a TBCA só permite consulta página a página, com links cifrados, e os termos de uso proíbem reprodução. Dá para anotar a limitação no texto e corrigir à mão o ferro do pão francês citando a TBCA (seção 6.3).
13. **LGPD**: o uso descrito cai na exceção do art. 4º, I (pessoa natural, fim particular e não econômico). Publicar na loja ou distribuir a terceiros muda o quadro. As boas práticas valem de qualquer forma (seção 4).
14. **Leitor de tela**: os emojis das abas são lidos em voz alta, o aviso temporário não é anunciado e cada toque redesenha a tela inteira, o que faz o TalkBack perder o foco (seção 2.4).
15. **A chave `android/chave.keystore` é ponto único de falha**: sem ela não há atualização por cima, e a senha está no `montar-apk.sh`. Precisa de cópia fora da máquina (seção 3.4).

Como ler o grau de confiança: **alto** = li na fonte hoje; **médio** = fonte secundária confiável ou inferência direta de algo que li; **baixo** = não confirmei. "NÃO VERIFICADO" marca valor que não li na fonte.

Nada do código de exemplo deste relatório foi compilado ou testado.

---

## 1. Desenho de apps de autocuidado: adesão, abandono e risco de culpa

### 1.1 Abandono e adesão (evidência de pesquisa)

| Achado | Fonte | Confiança |
|---|---|---|
| Em apps para doença crônica, a taxa de abandono combinada foi de 43% (IC 95% 29 a 57); 49% em estudos observacionais e 40% em ensaios randomizados. 17 estudos na meta-análise. | Meyerowitz-Katz et al., J Med Internet Res, 2020. https://www.jmir.org/2020/9/e20283/ | médio (li o resumo via busca, não o artigo) |
| Em apps para sintomas depressivos, abandono combinado de 26,2%, subindo para 47,8% depois do ajuste por viés de publicação. Abandono menor em estudos com retorno humano e com monitoramento de humor no app. | Torous et al., J Affect Disord, 2020, doi 10.1016/j.jad.2019.11.167 | alto (resumo no Europe PMC) |
| Fatores ligados a retenção: lembretes e retorno ("feedback"), apoio de pessoa (colega ou orientador) dentro do app, ter a condição de interesse (razão de chances 4,34). Fatores ligados a abandono: falhas técnicas, falta de recursos de apoio. Reduzir o uso depois de alcançar o objetivo foi descrito como sucesso, não como falha. | Amagai et al., J Med Internet Res, 2022;24(4):e35120. https://pmc.ncbi.nlm.nih.gov/articles/PMC9092233/ | alto (texto no PMC, lido até 100 mil caracteres) |
| Revisão sistemática de fatores de adesão a apps de doenças crônicas, 2007 a 2020. | Jakob et al., J Med Internet Res, 2022, doi 10.2196/35371 | baixo quanto aos resultados: só li objetivo e método no resumo; a lista de fatores é NÃO VERIFICADA |
| Automonitoramento (dieta, exercício, peso) tem associação consistente com perda de peso, mas a força da evidência é fraca por limitações de método. 22 estudos. | Burke, Wang, Sevick, J Am Diet Assoc, 2011, doi 10.1016/j.jada.2010.10.008 | alto (resumo) |
| O registro alimentar diário "cai rápido" ao longo do tempo. | Patel et al., J Med Internet Res, 2019, doi 10.2196/12209 (introdução do resumo) | alto para essa frase; os resultados do ensaio são NÃO VERIFICADOS |

O que isso sustenta: registro com pouco esforço (o app marca a refeição com um toque em vez de pedir alimento por alimento), lembrete discreto e retorno útil são os fatores com mais apoio. O acompanhamento por outra pessoa, que aparece como fator de retenção, existe aqui de forma indireta (relatório para a consulta e para o familiar).

O que eu não achei: estudo sobre "sequências" (streaks) em apps de saúde com desfecho de culpa ou abandono. Qualquer afirmação sobre streaks neste relatório é opinião de desenho, não evidência.

### 1.2 Contagem de calorias e transtorno alimentar (evidência de pesquisa)

| Achado | Fonte | Confiança |
|---|---|---|
| Em 105 pessoas com diagnóstico de transtorno alimentar, cerca de 75% usavam o My Fitness Pal e 73% dessas diziam que o app contribuiu para o transtorno. Estudo transversal. | Levinson, Fewell, Brosof, Eating Behaviors, 2017, doi 10.1016/j.eatbeh.2017.08.003 | alto (resumo) |
| Em 493 universitários, quem usava contador de calorias tinha mais preocupação com a comida e mais restrição alimentar, controlando o IMC. Transversal. Os autores escrevem que, "para algumas pessoas", esses aparelhos "podem fazer mais mal do que bem". | Simpson e Mazzeo, Eating Behaviors, 2017, doi 10.1016/j.eatbeh.2017.02.002 | alto (resumo) |
| Em 122 homens recrutados em redes de fitness, 56% tinham usado o My Fitness Pal; quase 40% dos usuários viam o app como fator que contribuiu, em algum grau, para sintomas. Usuários tinham mais sintomas; tamanhos de efeito grandes. Transversal. | Linardon e Messer, Eating Behaviors, 2019, doi 10.1016/j.eatbeh.2019.02.003 | alto (resumo) |
| Em 1.357 adultos, 71% já tinham usado app de calorias. Quem usava por motivo de peso ou forma relatava mais vezes que o app contribuiu para preocupação com comida, pensamento "tudo ou nada", ansiedade com comida e purgação do que quem usava por saúde ou prevenção de doença. | Messer et al., Eating Behaviors, 2021, doi 10.1016/j.eatbeh.2021.101568 | alto (resumo) |
| **Ensaio randomizado**: 200 universitárias de baixo risco, sem registro alimentar no ano anterior, usaram o MyFitnessPal por cerca de um mês ou nada. Não houve aumento do risco de transtorno alimentar nem mudança em saúde mental ou comportamentos. Adesão de 89,1% dos dias. | Hahn et al., J Acad Nutr Diet, 2021, doi 10.1016/j.jand.2021.06.311 | alto (resumo) |
| Quase metade dos jovens pesquisados (n=106) relatou alguma experiência negativa com apps de alimentação e exercício. | Honary et al., JMIR mHealth uHealth, 2019. https://mhealth.jmir.org/2019/6/e14239 | médio (via busca) |

Leitura: os estudos que mostram dano são transversais e em populações já vulneráveis ou autosselecionadas; não provam causa. O ensaio randomizado não achou dano, mas em população de baixo risco, por um mês, e sem remédio que tira o apetite. Nenhum desses estudos foi feito em pessoas usando GLP-1. A usuária deste app é adulta em tratamento médico, com apetite reduzido pelo remédio: o risco plausível aqui é comer de menos e usar o número de calorias como teto, não como piso. Isso é inferência minha, não resultado de estudo.

Não encontrei estudo que isole o efeito de cores vermelho/verde em barras de calorias. O trabalho mais citado sobre desenho (Eikey e Reddy, CHI 2017, 16 mulheres com histórico de transtorno) eu só confirmei pelo resumo: o uso e a percepção dos apps mudam ao longo da recuperação. Os detalhes sobre cores e números são NÃO VERIFICADOS.

### 1.3 Pesagem frequente (evidência de pesquisa)

| Achado | Fonte | Confiança |
|---|---|---|
| Em adultos buscando tratamento para perda de peso, pesar-se com regularidade associou-se a mais perda de peso e não a desfechos psicológicos adversos. 17 estudos longitudinais. | Zheng et al., Obesity, 2015, doi 10.1002/oby.20946 | alto (resumo) |
| Em 20 artigos, a maior parte dos que mediram autoestima (3 de 4) e parte dos que mediram afeto (4 de 10), avaliação do corpo (4 de 10) e comportamento alimentar (6 de 13) acharam relação negativa. Os resultados negativos concentram-se em mulheres e pessoas mais jovens; em pessoas com sobrepeso buscando tratamento, ausência de relação ou resultado positivo. | Pacanowski, Linde, Neumark-Sztainer, Curr Obes Rep, 2015, doi 10.1007/s13679-015-0142-2 | alto (resumo) |

O app hoje diz "Uma vez por semana, no mesmo dia e horário, é suficiente" e aceita um peso por data. Isso é compatível com as duas revisões.

### 1.4 GLP-1 e transtorno alimentar

| Achado | Fonte | Confiança |
|---|---|---|
| Consenso por método Delphi com 45 especialistas e pessoas com experiência vivida (concordância média 91,7%): triagem de transtorno alimentar atual e passado antes de iniciar GLP-1, com instrumento curto validado; monitoramento de sintomas conforme o risco; material educativo; psicoterapia em paralelo para quem tem transtorno. Em geral evitar em transtorno ativo, em especial anorexia nervosa, anorexia atípica e bulimia com restrição marcada. Cautela com histórico. A evidência é descrita como "limitada e inconsistente". | Keshen et al., World Psychiatry, 2026, doi 10.1002/wps.70096 | alto (resumo no Europe PMC) |
| Revisão narrativa: GLP-1 pode ajudar em compulsão alimentar e, usado de forma inadequada, piorar transtornos restritivos. | J Clin Med, 2025. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12072339/ | médio (via busca) |
| Relatos de caso de reativação de anorexia com semaglutida e tirzepatida. | National Geographic, reportagem citando relatos de 2024 e 2025. https://www.nationalgeographic.com/health/article/glp-1-drugs-eating-disorder-risks | baixo (fonte jornalística, não li os relatos) |

Consequência para o app: ele não faz triagem e não deve fazer diagnóstico (regra 9 do briefing). O que cabe é uma frase no Guia dizendo que, se a relação com a comida ou com o peso começar a causar sofrimento (medo de comer, pular refeições de propósito, compensar), isso é assunto para levar ao médico. Decisão de texto de saúde: sobe para a direção.

### 1.5 Linguagem sem estigma (consenso e recomendação de entidade, não ensaio)

| Achado | Fonte | Confiança |
|---|---|---|
| Consenso internacional (Delphi) afirma que o estigma do peso causa dano físico e psicológico e que pessoas afetadas têm menos chance de receber cuidado adequado. | Rubino et al., Nature Medicine, 2020, doi 10.1038/s41591-020-0803-x | alto (resumo; não li a lista de recomendações) |
| Linguagem "pessoa primeiro": "pessoa com obesidade" em vez de "obeso(a)". | Obesity Action Coalition, People-First Language. https://www.obesityaction.org/ow2019/people-first-language/ | médio (via busca) |
| Posicionamento brasileiro: preferir "medicamentos para tratar a obesidade" a "remédios para emagrecer". | Abeso e SBEM, Arch Endocrinol Metab, 2023;67(4):e230174, doi 10.20945/2359-4292-2023-0174 | médio (via busca) |
| Documento da Abeso sobre "pessoa com obesidade" em português. | não encontrado | NÃO VERIFICADO |

O app hoje não usa "obesa", "gorda", "emagrecer" nem "peso ideal" nos trechos que li de `app.js`. Usa "IMC a partir de 30" numa explicação de cálculo, o que é descritivo.

### 1.6 O que o app faz hoje e o que eu mudaria

Referências de linha: `app/app.js` como estava às 12h25 de 20/11 (a engenharia repartiu o arquivo depois; os trechos continuam localizáveis pelo texto).

| Onde | O que faz hoje | O que a evidência sugere | Força |
|---|---|---|---|
| Hoje, linha 159 | "Energia das refeições marcadas: X de Y kcal." | É a única contagem de calorias consumidas do app. Opções: (a) tirar da tela Hoje e deixar só no relatório para a consulta; (b) manter sem o "de Y", para não virar orçamento; (c) deixar como está, opcional no Perfil. | fraca a moderada (seção 1.2; nenhum estudo em GLP-1) |
| Hoje, linha 164; Plano, linha 189 | Cada refeição mostra "N g de proteína · N kcal". | A proteína é a meta que o app quer destacar. As kcal por refeição convidam a comparar e cortar. Opção: mostrar só proteína na tela Hoje e manter kcal na tela Plano. | fraca (inferência) |
| `barra()`, linha 101; CSS linhas 58 e 59 | Barra fica verde ("ok") com 100% ou mais e âmbar ("falta") abaixo de 70%. | Não há vermelho, o que é bom. O âmbar em "falta" aparece nas barras de nutrientes do cardápio planejado, não do que ela comeu; o risco de culpa é menor. A palavra de classe "falta" não aparece para a usuária. Manter; garantir que nunca haja cor de alerta para "passou da meta de energia". | opinião de desenho |
| Hoje, linhas 155 e 156 | Barras de proteína e água ficam verdes ao bater a meta. | Meta de piso (proteína, água) com retorno positivo é coerente com o tratamento. Manter. | opinião |
| Plano, linha 202 | "Abaixo de 80% da meta só com comida: ..." seguido de "isso é esperado... é o ponto para levar ao médico". | Texto factual, sem culpa, com encaminhamento. Manter. | opinião |
| Hoje, linhas 147 e 148 | "atrasada N dias" | "Atrasada" atribui falha. Alternativa neutra: "a data prevista foi há N dias". | opinião, alinhada à seção 1.5 |
| Diário > Peso, linha 270 | "Variação: −X kg (−Y%)" e gráfico. | Compatível com Zheng 2015 para adultos em tratamento. Não acrescentar comparação com meta de peso, velocidade "esperada" nem cor para subida. | moderada |
| Diário > Peso, linha 265 | "Uma vez por semana... é suficiente." | Manter. | moderada |
| Geral | Não há sequência de dias, medalha nem aviso de "você quebrou a sequência". | Manter sem. Dia de enjoo e dia sem registro não devem aparecer como falha. | opinião (sem estudo localizado) |
| Hoje linha 142, Diário linha 276 | "Quando ela fizer a primeira aplicação", "Como ela está". | O texto fala da usuária na terceira pessoa, como se quem lesse fosse outra pessoa; em outros pontos fala com ela ("Bem-vinda"). Escolher uma voz só. | observação de consistência |
| Perfil, linha 440 | Aceita meta de energia a partir de 800 kcal. | O piso do cálculo é 1.200 kcal (mulher), mas a meta informada pode ser 800. Com apetite reduzido, vale um aviso quando o valor digitado ficar abaixo do piso do app, dizendo que valores assim costumam ser prescritos com acompanhamento. | inferência; sobe para a direção por ser texto de saúde |

### 1.7 Lista do que fazer e do que não fazer

Fazer:
- Registro com um toque e sem digitação obrigatória (moderada: Amagai 2022; Burke 2011).
- Lembrete discreto, configurável e desligável (moderada: Amagai 2022). Texto da notificação sem cobrança.
- Destacar metas de piso (proteína, água, força) em vez de teto de energia (fraca: inferência das seções 1.2 e 1.4).
- Relatório para levar a alguém (moderada: retenção maior com retorno humano, Torous 2020 e Amagai 2022).
- Pesagem semanal sugerida, não diária (moderada: Zheng 2015; Pacanowski 2015).
- Linguagem pessoa-primeiro e descritiva (consenso: Rubino 2020; OAC).
- Uma frase no Guia sobre sofrimento com comida e peso ser assunto de consulta (consenso: Keshen 2026).

Não fazer:
- Mostrar calorias consumidas como orçamento com "de Y kcal" na tela principal (fraca a moderada).
- Vermelho, alerta ou mensagem de reprovação quando a pessoa come mais ou registra menos (opinião; sem estudo localizado).
- Sequências, medalhas, ranking, comparação com outras pessoas (opinião; sem estudo localizado).
- Meta de peso com prazo, "peso ideal", velocidade esperada de perda (opinião, alinhada a Rubino 2020).
- Notificação com nome do remédio ou dado de saúde visível na tela bloqueada (privacidade; seção 3.1).
- Palavras "atrasada", "falhou", "furou", "permitido/proibido", "obesa" (consenso de linguagem).

---

## 2. Acessibilidade em celular

### 2.1 Números de referência

| Critério | Valor | Fonte | Confiança |
|---|---|---|---|
| Alvo de toque no Android | pelo menos 48dp de largura e altura (cerca de 9 mm), com 8dp ou mais de espaço | Ajuda de Acessibilidade do Android. https://support.google.com/accessibility/android/answer/7101858 | alto |
| WCAG 2.2, critério 2.5.8 (nível AA) | 24 por 24 px CSS, com exceções: espaçamento, controle equivalente na mesma página, alvo dentro de frase, tamanho definido pelo navegador, apresentação essencial | W3C. https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html | alto |
| Apple | 44 pt | Human Interface Guidelines | NÃO VERIFICADO hoje (número citado no pedido) |
| WCAG 1.4.3 (AA) | texto 4,5:1; texto grande 3:1. Texto grande: 18 pt, ou 14 pt em negrito (cerca de 24 px e 18,5 px) | W3C. https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html | alto |
| WCAG 1.4.11 | 3:1 para componentes de interface e gráficos | W3C (mencionado na página acima; não abri a página do critério) | médio |

Dentro da WebView com `width=device-width`, 1 px CSS equivale a 1 dp. Confiança: médio (comportamento padrão do viewport; não citei página).

### 2.2 Alvos de toque no `app/estilo.css`

Alturas calculadas a partir de fonte, `line-height: 1.45` e padding. São estimativas de cálculo, não medições em aparelho.

| Linha | Seletor | Altura estimada | 48dp | 24 px |
|---|---|---|---|---|
| 19 | `#btn-perfil` (14 px, padding 4px 12px) | cerca de 30 px | fora | passa |
| 23 | `#abas a` (ícone 20 px + rótulo 12 px, padding 8/10) | cerca de 59 px | passa | passa |
| 40 | `button, .botao` (16 px, padding 10px 14px) | cerca de 43 px | fora por 5 px | passa |
| 42 | `button.mini` (13 px, padding 6px 10px) | cerca de 31 px | **fora** | passa |
| 46 | `.chips button` (14 px, padding 7px 12px) | cerca de 36 px | fora | passa |
| 50 | `input, select, textarea` (16 px, padding 10px) | cerca de 45 px | fora por 3 px | passa |
| 52 e 54 | caixa de marcar de 22 px dentro de `.marcas label` | cerca de 22 px | **fora** | **fora** (22 < 24; o espaço vertical de 6 px não compensa) |
| 76 | `td .x` (botão "apagar", padding 0 6px) | cerca de 20 px | **fora** | **fora** |
| 80 | `summary` | cerca de 23 px | fora | no limite |

Os `button.mini` são os controles mais tocados do app (água, proteína, caminhada, "Concluí o treino", "Dia de enjoo"). O "apagar" é ação destrutiva com o menor alvo da tela. A linha de refeição (linha 63) passa, porque o `label` inteiro é clicável.

Correção de menor risco: `min-height: 48px` em `button`, `.botao`, `.chips button`, `input`, `select`, `summary`, `#btn-perfil` e `.marcas label`; `min-height: 44px` com padding horizontal no `td .x`.

### 2.3 Contraste (calculado pela fórmula do WCAG a partir das cores das linhas 2 a 11)

Todas as combinações de texto passam em 4,5:1 nos dois temas. As mais apertadas no tema claro:

| Par | Razão | Onde |
|---|---|---|
| `--suave` sobre `--cor-clara` | 4,62 | texto `.sub` dentro de cartão `.destaque` |
| `--cor` sobre `--cor-clara` | 4,54 | botão secundário dentro de cartão `.destaque` |
| `--suave` sobre `--alerta-fundo` | 4,88 | `.sub` em cartão de alerta |
| `--ok` e `--falta` sobre `--cartao` | 5,02 | não usados como texto hoje |
| branco sobre `--cor` | 5,47 | botões e topo |

Fora do 3:1 para elementos não textuais (WCAG 1.4.11):
- Linha 50: borda de campo `--linha` sobre `--cartao` = 1,28:1, e o fundo do campo (`--fundo`) sobre o cartão = 1,09:1. O limite do campo de texto quase não se vê. No tema escuro, 1,33:1.
- Linha 46: borda dos chips não selecionados, 1,28:1 (o texto dentro passa).
- Linha 56: trilho da barra de progresso, 1,28:1 sobre o cartão. O preenchimento passa contra o trilho (3,93 a 4,29).

Não depender só de cor:
- Linhas 57 a 59: as três cores de preenchimento (`--cor`, `--ok`, `--falta`) têm luminância quase igual entre si (razões de 1,00 a 1,09). A diferença é só de matiz. A informação também está no texto ao lado ("X / Y · Z%"), então não há perda de informação, mas o estado "bateu a meta" só aparece pela cor. Opção: um "✓" ou a palavra "meta atingida" no texto.
- Linha 70: refeição feita usa risco no texto além da cor. Passa.
- Linha 24: ícone da aba inativa com `opacity: .7` e escala de cinza. É emoji decorativo; o rótulo passa (5,57).

### 2.4 Tamanho de fonte e fonte do sistema

- Fontes pequenas: 12 px nas abas (linha 23), em `.refeicao .tipo` (linha 66) e em `th` (linha 74); 13 px em `.sub` (linha 31), `button.mini` (42), `label` (49), `.nutri` (61), `.prep` (69); 11 px no texto do gráfico (linha 86, dentro de SVG com `viewBox`, que ainda encolhe em tela estreita). O relatório usa 13 px embutido no `app.js`. Não há critério numérico do WCAG para tamanho mínimo; a recomendação usual de 12sp como piso é NÃO VERIFICADA hoje.
- `WebSettings.setTextZoom`: "Sets the text zoom of the page in percent. The default is 100." Fonte: https://developer.android.com/reference/android/webkit/WebSettings#setTextZoom(int). Confiança: alto.
- A WebView aplica o tamanho de fonte do sistema ao texto por conta própria. Fonte: declaração de desenvolvedor do Chromium em lista pública ("WebView has always used the font size specified in the OS to scale text specifically"), https://groups.google.com/a/chromium.org/g/blink-dev/c/bZuQAcwcEig. Confiança: médio (não é documentação oficial; não testado aqui). Consequência: não chamar `setTextZoom(100)` fixo; testar no emulador com fonte do sistema no máximo.
- Riscos de layout com fonte grande: barra de abas fixa com cinco itens (linha 21 a 23), grades de três colunas `.tres` (linha 35) usadas em "Metas diárias" e nos campos de meta do Perfil, `white-space: nowrap` nas linhas 61 e 75, e `#aviso` fixo a 84 px do rodapé (linha 88). NÃO TESTADO.
- A linha 14 (`-webkit-text-size-adjust: 100%`) e o viewport sem `user-scalable=no` (em `index.html`) estão adequados.

### 2.5 Modo escuro

- "WebView always sets the media query `prefers-color-scheme` according to the app's theme attribute `isLightTheme`, i.e. `prefers-color-scheme` is `light` if isLightTheme is true or not specified, otherwise it is `dark`." Fonte: https://developer.android.com/reference/android/webkit/WebSettings#setAlgorithmicDarkeningAllowed(boolean). Confiança: alto. Vale para `targetSdkVersion` 33 ou mais, que é o caso (34).
- O tema do app (`android/res/values/valores.xml`) herda de `android:Theme.Material.Light.NoActionBar`. Consequência: o bloco `@media (prefers-color-scheme: dark)` das linhas 6 a 12 do CSS nunca é ativado no APK, só no navegador. Confiança: médio (inferência direta da frase oficial; não testado em aparelho).
- Saída sem AndroidX: criar `android/res/values-night/valores.xml` com o mesmo estilo herdando de `android:Theme.Material.NoActionBar` e cores escuras para barra de status, navegação e fundo da janela. A Activity declara `configChanges="...|uiMode"`, então não é recriada quando o sistema troca de tema; a troca só apareceria na próxima abertura, a menos que se retire `uiMode` dali. NÃO TESTADO.
- `<meta name="theme-color">` fixo em `#0f766e` não afeta a WebView embutida.

### 2.6 TalkBack com HTML

Observações sobre `index.html` e `app.js`. Recomendações de prática (WAI-ARIA); não citei página específica para cada uma, confiança médio.

| Ponto | Situação | Sugestão |
|---|---|---|
| Abas (`index.html` linhas 17 a 21) | `<span class="ic">☀</span>Hoje`: o leitor lê o nome do emoji antes do rótulo. | `aria-hidden="true"` nos ícones; `aria-current="page"` na aba ativa. |
| Aviso temporário (`#aviso`) | `div` sem papel; some em 2,6 s; não é anunciado. | `role="status"` e `aria-live="polite"`. |
| `render()` | Troca o `innerHTML` da tela inteira a cada toque. | O foco do TalkBack volta ao início depois de "+ 1 copo". Devolver o foco ao controle acionado (por `data-ac` e posição) ou atualizar só o trecho alterado. |
| Botões "− 200 ml", "− 10", "apagar" | Rótulo sem contexto quando lido isolado. | `aria-label` com contexto: "Apagar aplicação de 12/11/2026". |
| Chips de dia e de aba do Diário | Estado ativo só por cor. | `aria-pressed="true"` no ativo. |
| Barras de progresso | `div` com largura; o valor está em texto ao lado. | `aria-hidden="true"` na barra, para não haver parada vazia. |
| Gráfico de peso | `role="img"` com `aria-label="Gráfico de peso"`. | Incluir os valores inicial e atual no rótulo; a tabela abaixo já serve de alternativa. |
| Caixas de marcar e campos | Dentro de `label`. | Adequado. |
| Botões | São `<button>` de verdade; perfil e abas são `<a href>`. | Adequado. |
| Idioma | `lang="pt-BR"`. | Adequado. |

---

## 3. Android para APK instalado por fora da loja, sem AndroidX

### 3.1 Lembretes confiáveis

#### O que a documentação diz

| Afirmação | Página | Confiança |
|---|---|---|
| Alarme inexato (`set`, `setInexactRepeating`, `setAndAllowWhileIdle`): nunca dispara antes da hora; no Android 12+ dispara em até uma hora, salvo economia de bateria ou Doze. | https://developer.android.com/develop/background-work/services/alarms/schedule (seção "Deliver an alarm after a specific time") | alto |
| `setWindow`: entrega dentro da janela; com alvo Android 12+, janela menor que 10 minutos é esticada para 10. | mesma página, "Deliver an alarm during a time window"; e https://developer.android.com/reference/android/app/AlarmManager#setWindow(int,%20long,%20long,%20android.app.PendingIntent) | alto |
| "Most apps can schedule tasks and events using inexact alarms." Alarme exato só quando a função principal depende de hora precisa (despertador, agenda). | mesma página | alto |
| Caso "ação pedida pelo usuário que deve acontecer depois de certa hora, mesmo com o sistema ocioso": usar alarme inexato com `setAndAllowWhileIdle()`. | mesma página, "Use cases that might not require exact alarms" | alto |
| Em Doze, alarmes comuns (inclusive `setExact` e `setWindow`) ficam para a próxima janela de manutenção; `setAndAllowWhileIdle` e `setExactAndAllowWhileIdle` disparam em Doze; `setAlarmClock` dispara normalmente e o sistema sai de Doze pouco antes. | https://developer.android.com/training/monitoring-device-state/doze-standby ("Doze restrictions") | alto |
| `setAndAllowWhileIdle` e `setExactAndAllowWhileIdle` não disparam mais de uma vez a cada nove minutos por app. | mesma página, "Adapt your app to Doze" | alto |
| Com alvo Android 12+, alarme exato exige `SCHEDULE_EXACT_ALARM` (ou `USE_EXACT_ALARM` com alvo 33+); sem isso, `SecurityException`. | https://developer.android.com/develop/background-work/services/alarms/schedule ("Declare the appropriate exact alarm permission") | alto |
| `SCHEDULE_EXACT_ALARM` não é mais concedida por padrão a apps recém-instalados com alvo 33+ em aparelho com Android 14 ou mais. | https://developer.android.com/about/versions/14/changes/schedule-exact-alarms | alto |
| Em aparelhos com Android 12 e 13 ela vinha concedida. | inferência da frase "no longer being pre-granted" da página acima | médio |
| `USE_EXACT_ALARM`: concedida na instalação, o usuário não revoga, casos de uso limitados (agenda, despertador), sujeita a política do Google Play: "Apps will not be able to publish a version of their app with this permission in the manifest unless they qualify". | mesma página e a de alarmes | alto |
| Fora da loja não há revisão de política; a permissão é do tipo normal e o sistema a concede. | inferência (a restrição citada é de publicação) | médio |
| Checar com `AlarmManager.canScheduleExactAlarms()` (API 31); se falso, abrir `Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM` com o pacote e conferir no `onResume()`; ouvir `ACTION_SCHEDULE_EXACT_ALARM_PERMISSION_STATE_CHANGED`. | https://developer.android.com/about/versions/14/changes/schedule-exact-alarms ("Migration steps") | alto |
| Android 13+: `POST_NOTIFICATIONS` é permissão em tempo de execução; em app recém-instalado as notificações vêm desligadas. Com alvo 33+ o app escolhe quando mostrar o pedido. Recomendação: pedir depois de uma ação da pessoa. Conferir com `areNotificationsEnabled()`. | https://developer.android.com/develop/ui/views/notifications/notification-permission | alto |
| A página só mostra o pedido com AndroidX/Compose. Sem AndroidX usa-se `Activity.requestPermissions()` e `onRequestPermissionsResult()`, que são da plataforma desde a API 23. | https://developer.android.com/reference/android/app/Activity | médio (conheço a API; não reabri a página hoje) |
| Canal de notificação é obrigatório a partir da API 26; depois de criado, o app não muda a importância, só nome e descrição; o usuário tem o controle. | https://developer.android.com/develop/ui/views/notifications/channels | alto |
| Com alvo Android 12, todo `PendingIntent` precisa declarar mutabilidade. `FLAG_IMMUTABLE` existe desde a API 23. | https://developer.android.com/about/versions/12/behavior-changes-12 ("Pending intents mutability"); https://developer.android.com/reference/android/app/PendingIntent#FLAG_IMMUTABLE | alto |
| Com alvo Android 12, componente com `intent-filter` sem `android:exported` impede a instalação. | https://developer.android.com/about/versions/12/behavior-changes-12 ("Safer component exporting") | alto |
| Com alvo Android 12, não se pode abrir Activity a partir de um receiver acionado pelo toque na notificação; usar `PendingIntent` direto para a Activity. | mesma página ("Notification trampoline restrictions") | alto |
| "By default, all alarms are canceled when a device shuts down." Reagendar com `RECEIVE_BOOT_COMPLETED` e um receiver; isso "only works if the app has already been launched by the user at least once". | https://developer.android.com/develop/background-work/services/alarms/schedule ("Start an alarm when the device restarts") | alto |
| `BOOT_COMPLETED`, `LOCKED_BOOT_COMPLETED`, `android.intent.action.TIME_SET` e `ACTION_TIMEZONE_CHANGED` estão na lista de exceções e podem ser recebidos por receiver declarado no manifesto. | https://developer.android.com/develop/background-work/background-tasks/broadcasts/broadcast-exceptions | alto |
| `ACTION_MY_PACKAGE_REPLACED`: enviado só ao app que foi atualizado por cima. | https://developer.android.com/reference/android/content/Intent#ACTION_MY_PACKAGE_REPLACED | alto |
| Os alarmes são apagados quando o app é atualizado. | não encontrei na documentação | NÃO VERIFICADO; reagendar nesse evento não tem custo |
| `android:exported="false"` num receiver ainda recebe mensagens do sistema. | https://developer.android.com/guide/topics/manifest/receiver-element | médio (li o começo da frase; o trecho final ficou cortado na minha leitura) |
| Forçar parada: o app fica em estado "parado" até a pessoa abrir de novo; no Android 15 o sistema também cancela todos os `PendingIntent` e, quando o app sai do estado parado, entrega `ACTION_BOOT_COMPLETED` para reagendar. | https://developer.android.com/about/versions/15/behavior-changes-all ("Changes to package stopped state") | alto |
| Em versões anteriores ao 15, forçar parada também remove os alarmes. | comportamento conhecido da plataforma | baixo (não achei página oficial) |
| Pedir isenção de otimização de bateria: `ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS` abre a lista; `ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` pede direto e é restrito por política da loja. App isento continua sem disparar alarmes comuns em Doze. | https://developer.android.com/training/monitoring-device-state/doze-standby ("Support for other use cases") | alto |
| Samsung: "Colocar apps não usados em suspensão" e bateria adaptável; app sem uso por cerca de 3 dias pode não iniciar em segundo plano e os alarmes podem parar. | https://dontkillmyapp.com/samsung | médio (fonte secundária; informação de Android 14 descrita como limitada) |
| Xiaomi e Motorola | não consultei as páginas | NÃO VERIFICADO |

#### Precisa de alarme exato?

Para dose semanal (precisão de dia) e para água (precisão de hora), não. A própria documentação indica alarme inexato para "ação que deve acontecer depois de certa hora". Opções:

| Opção | Atraso possível | Permissão extra | Risco |
|---|---|---|---|
| A. `setAndAllowWhileIdle(RTC_WAKEUP, ...)` | até cerca de uma hora em uso normal; dispara em Doze | nenhuma | pode atrasar com economia de bateria; fabricante pode suspender o app |
| B. `setWindow` com janela de 30 a 60 min | dentro da janela; em Doze fica para a manutenção | nenhuma | com o celular parado a noite toda, o aviso da manhã pode atrasar |
| C. `setAlarmClock` ou `setExactAndAllowWhileIdle` | minutos | `USE_EXACT_ALARM` (API 33+) e `SCHEDULE_EXACT_ALARM` com `maxSdkVersion="32"` | mais bateria; `setAlarmClock` mostra ícone de alarme na barra; no Android 14 sem `USE_EXACT_ALARM` exigiria mandar a usuária à tela de configuração |

A opção A cobre o caso com menos peças. Lembrete de água várias vezes ao dia aumenta o número de notificações; a página oficial lembra que a pessoa vê quantas notificações o app manda e pode revogar a permissão. Decisão de produto.

Como a pessoa pode ajudar (texto para o Guia, se a direção quiser): abrir o app ao menos uma vez depois de instalar ou atualizar; não usar "Forçar parada"; em Samsung, tirar o app de "apps em suspensão" (caminho exato varia por versão; ver dontkillmyapp).

#### Ponto de arquitetura

Os horários dos lembretes precisam ficar em `SharedPreferences` do lado Java. O receiver de reinício roda sem a WebView e não tem como ler o `localStorage`. A ponte recebe do JavaScript "próxima aplicação em tal data, avisar a tal hora" e grava; o receiver lê e reagenda.

#### Linhas de manifesto (NÃO COMPILADO, NÃO TESTADO)

```xml
<!-- dentro de <manifest> -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<!-- Só se a direção escolher a opção C (alarme exato):
<uses-permission android:name="android.permission.USE_EXACT_ALARM" />
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" android:maxSdkVersion="32" />
-->

<!-- dentro de <application> -->
<receiver android:name=".LembreteReceiver" android:exported="false" />
<receiver android:name=".ReagendarReceiver" android:exported="false">
    <intent-filter>
        <action android:name="android.intent.action.BOOT_COMPLETED" />
        <action android:name="android.intent.action.MY_PACKAGE_REPLACED" />
        <action android:name="android.intent.action.TIME_SET" />
        <action android:name="android.intent.action.TIMEZONE_CHANGED" />
    </intent-filter>
</receiver>
```

Se o teste mostrar que `exported="false"` não recebe o `BOOT_COMPLETED` em algum aparelho, trocar para `true` no `ReagendarReceiver` (ele só reagenda a partir de dados locais, sem ler extras da mensagem). Falta também um ícone pequeno monocromático em `res/drawable` para a notificação.

#### Esqueleto Java (NÃO COMPILADO, NÃO TESTADO)

```java
package br.semanaasemana;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

/** Agenda, cancela e mostra os lembretes. So usa android.*. */
final class Lembretes {
    static final String CANAL = "lembretes";
    static final String PREFS = "lembretes";
    static final String K_DOSE = "doseQuandoMs"; // instante do proximo lembrete de aplicacao (0 = nenhum)
    static final int ID_DOSE = 1;

    static void criarCanal(Context c) {
        NotificationChannel canal = new NotificationChannel(CANAL, "Lembretes", NotificationManager.IMPORTANCE_DEFAULT);
        canal.setDescription("Avisos de aplicação e de rotina");
        canal.setLockscreenVisibility(Notification.VISIBILITY_PRIVATE);
        c.getSystemService(NotificationManager.class).createNotificationChannel(canal); // chamar de novo nao altera o canal
    }

    /** Chamado pela ponte: guarda e agenda. quandoMs em milissegundos de relogio (System.currentTimeMillis). */
    static void definirDose(Context c, long quandoMs) {
        c.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putLong(K_DOSE, quandoMs).apply();
        reagendar(c);
    }

    /** Idempotente: pode ser chamado na abertura do app, no reinicio, na troca de hora e apos atualizacao. */
    static void reagendar(Context c) {
        SharedPreferences p = c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        long quando = p.getLong(K_DOSE, 0);
        AlarmManager am = c.getSystemService(AlarmManager.class);
        PendingIntent pi = intentDose(c);
        am.cancel(pi);
        if (quando <= 0) return;
        if (quando < System.currentTimeMillis()) quando = System.currentTimeMillis() + 60_000; // passou enquanto o aparelho estava desligado
        // Inexato, mas dispara em Doze. Nao exige permissao de alarme exato.
        am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, quando, pi);
    }

    private static PendingIntent intentDose(Context c) {
        Intent i = new Intent(c, LembreteReceiver.class).setAction("br.semanaasemana.DOSE");
        return PendingIntent.getBroadcast(c, ID_DOSE, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    static void mostrarDose(Context c) {
        NotificationManager nm = c.getSystemService(NotificationManager.class);
        if (!nm.areNotificationsEnabled()) return;
        criarCanal(c);
        // Toque abre a Activity direto (sem passar por receiver: restricao de "trampolim" do Android 12).
        Intent abrir = new Intent(c, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent toque = PendingIntent.getActivity(c, 0, abrir, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Notification n = new Notification.Builder(c, CANAL)
                .setSmallIcon(R.drawable.ic_notificacao)            // criar: icone monocromatico
                .setContentTitle("Semana a Semana")
                .setContentText("Há um lembrete para hoje.")         // sem nome de remedio na tela bloqueada
                .setVisibility(Notification.VISIBILITY_PRIVATE)
                .setContentIntent(toque)
                .setAutoCancel(true)
                .build();
        nm.notify(ID_DOSE, n);
    }
}
```

```java
package br.semanaasemana;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Dispara quando o alarme vence. O proximo lembrete e definido pelo app quando ela registrar a aplicacao. */
public class LembreteReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context c, Intent i) {
        Lembretes.mostrarDose(c);
        c.getSharedPreferences(Lembretes.PREFS, Context.MODE_PRIVATE).edit().putLong(Lembretes.K_DOSE, 0).apply();
    }
}
```

```java
package br.semanaasemana;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Reinicio do aparelho, atualizacao do app, troca de hora ou de fuso: refaz os alarmes a partir do que esta guardado. */
public class ReagendarReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context c, Intent i) {
        Lembretes.reagendar(c); // nao le nada do Intent recebido
    }
}
```

Trechos a acrescentar na `MainActivity` (NÃO COMPILADO, NÃO TESTADO):

```java
private static final int REQ_NOTIF = 41;

@Override protected void onResume() {
    super.onResume();
    Lembretes.reagendar(this); // cobre "forcar parada" e fabricante que apagou o alarme: basta abrir o app
}

/** Chamar a partir de um toque dela em "Ativar lembretes", nunca na abertura do app. */
private void pedirNotificacoes() {
    if (android.os.Build.VERSION.SDK_INT >= 33
            && checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
        requestPermissions(new String[]{android.Manifest.permission.POST_NOTIFICATIONS}, REQ_NOTIF);
    } else {
        avisarJs("window.aoPermissaoNotificacao && window.aoPermissaoNotificacao(true)");
    }
}

@Override public void onRequestPermissionsResult(int req, String[] perms, int[] res) {
    super.onRequestPermissionsResult(req, perms, res);
    if (req == REQ_NOTIF) {
        boolean ok = res.length > 0 && res[0] == android.content.pm.PackageManager.PERMISSION_GRANTED;
        avisarJs("window.aoPermissaoNotificacao && window.aoPermissaoNotificacao(" + ok + ")");
    }
}

private void avisarJs(final String js) { web.post(new Runnable() { public void run() { web.evaluateJavascript(js, null); } }); }

// Na classe Ponte. Metodos de @JavascriptInterface rodam fora da thread principal: usar runOnUiThread.
@JavascriptInterface public void ativarLembretes() { runOnUiThread(new Runnable() { public void run() { pedirNotificacoes(); } }); }
@JavascriptInterface public void lembrarDose(double quandoMs) { Lembretes.definirDose(MainActivity.this, (long) quandoMs); }
@JavascriptInterface public void cancelarLembreteDose() { Lembretes.definirDose(MainActivity.this, 0); }
@JavascriptInterface public boolean notificacoesLigadas() { return getSystemService(android.app.NotificationManager.class).areNotificationsEnabled(); }
```

Só para a opção C (alarme exato), o trecho de checagem seria:

```java
if (android.os.Build.VERSION.SDK_INT >= 31 && !am.canScheduleExactAlarms()) {
    startActivity(new Intent(android.provider.Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM,
            android.net.Uri.parse("package:" + getPackageName())));
    // conferir de novo em onResume(); enquanto isso, cair para setAndAllowWhileIdle
}
```

Pontos em aberto do esqueleto: `lembrarDose` recebe `double` porque número de JavaScript não cabe em `long` de forma direta na ponte (comportamento a conferir no teste); `R.drawable.ic_notificacao` não existe; falta decidir o texto da notificação.

### 3.2 Cópia de segurança automática do Android (Auto Backup)

| Afirmação | Página | Confiança |
|---|---|---|
| Vale para apps com alvo e execução em Android 6.0+. Os dados vão para o Google Drive da pessoa, protegidos pela conta Google. Limite de 25 MB por app; acima disso, não há backup na nuvem. Só o backup mais recente é guardado. | https://developer.android.com/identity/data/autobackup | alto |
| "The backup is end-to-end encrypted on devices running Android 9 or higher using the device's PIN, pattern, or password." | mesma página | alto |
| Entra por padrão: preferências compartilhadas, arquivos de `getFilesDir()` e de `getDir(String, int)`, bancos de `getDatabasePath()`, arquivos de `getExternalFilesDir()`. Fica fora: `getCacheDir()`, `getCodeCacheDir()`, `getNoBackupFilesDir()`. | mesma página, "Files that are backed up" | alto |
| Os dados da WebView ficam em `app_webview/`, que é o formato de pasta criado por `getDir("webview", ...)`; por isso entram no backup por padrão. | inferência; a página não cita WebView nem `app_webview` | médio. Não há recomendação oficial de incluir ou excluir dados de WebView na página (procurei e não encontrei) |
| Condições para o backup acontecer: backup ligado no aparelho, 24 h desde o último, aparelho ocioso, Wi-Fi. "A device might never back up." | mesma página, "Backup schedule" | alto |
| Exige conta Google no aparelho. | https://developer.android.com/identity/data/backup (tabela: "The user must be logged into the device with a Google Account") | alto |
| O transporte de nuvem na maioria dos aparelhos é parte do Google Mobile Services. | https://developer.android.com/identity/data/testingbackup | alto |
| Restauração: "Data is restored whenever the app is installed, whether from the Play Store, during device setup ... or by running adb install", antes de o app poder ser aberto. | https://developer.android.com/identity/data/autobackup ("Restore schedule") | alto |
| Funciona para app instalado por APK fora da loja. | inferência da frase acima (cita `adb install`) e de o mecanismo ser do sistema, não da loja | médio; NÃO TESTADO. Num aparelho novo, a configuração inicial não reinstala sozinha um app que não está na loja; a restauração ocorreria quando o APK fosse instalado à mão |
| `android:allowBackup`: padrão `true`. Com `false`, não há backup nem restauração. Com alvo Android 12+, em aparelhos de alguns fabricantes `false` desliga a nuvem mas não a transferência entre aparelhos. | https://developer.android.com/guide/topics/manifest/application-element#allowbackup e https://developer.android.com/about/versions/12/behavior-changes-12 ("D2D transfer functionality changes") | alto |
| A página do manifesto sugere, para dado sensível, manter `true` e configurar `dataExtractionRules`. | https://developer.android.com/guide/topics/manifest/application-element#allowbackup | alto (é recomendação do fabricante) |
| Android 12+: `android:dataExtractionRules` com seções separadas `<cloud-backup>` e `<device-transfer>`. Seção ausente = modo totalmente ligado. `disableIfNoEncryptionCapabilities="true"` só permite nuvem quando o backup pode ser cifrado (por exemplo, há bloqueio de tela); a transferência entre aparelhos continua. Para Android 11 ou menos, é preciso também `android:fullBackupContent`. | https://developer.android.com/identity/data/autobackup ("Control backup on Android 12 or higher", "XML config syntax") | alto |
| Com `<include>`, só o que foi incluído entra; `<exclude>` prevalece. Domínios: `root`, `file`, `database`, `sharedpref`, `external` (e variantes `device_`). | mesma página | alto |
| Restauração exige a mesma assinatura do app que fez o backup. | não encontrei na documentação para desenvolvedores | NÃO VERIFICADO |
| Reinstalar com chave diferente: a atualização por cima é recusada; é preciso desinstalar, o que apaga os dados locais. "The signing key never changes during the lifetime of your app"; "if you lose your app's signing key, you lose the ability to update your app". | https://developer.android.com/studio/publish/app-signing | alto para a regra de atualização; a consequência sobre o backup é NÃO VERIFICADA |

#### Opções para a direção

| Opção | Como | Privacidade | Robustez contra perda | Riscos |
|---|---|---|---|---|
| 1. Sem backup do sistema | `android:allowBackup="false"` | A mais contida: nada vai para o Google. | A mais fraca: celular perdido, quebrado ou app desinstalado = perda, salvo exportação manual. | Em alguns fabricantes a transferência por cabo ainda copia (documentado). Depende de ela exportar. |
| 2. Só entre aparelhos | `allowBackup="true"` + `dataExtractionRules` excluindo tudo em `<cloud-backup>` e sem regras em `<device-transfer>`; `fullBackupContent` com as mesmas exclusões para Android 11 ou menos | Nada na nuvem; os dados passam direto de um celular para o outro na troca de aparelho. | Média: cobre troca planejada de celular; não cobre perda, roubo nem quebra. | Transferência entre aparelhos para app fora da loja: NÃO VERIFICADO. Em Android 11 ou menos, as exclusões valem também para a transferência. |
| 3. Nuvem só com criptografia | `allowBackup="true"` + `<cloud-backup disableIfNoEncryptionCapabilities="true">` | Dado de saúde fica no Google Drive dela, cifrado de ponta a ponta com o bloqueio de tela (Android 9+), segundo a documentação. | A mais forte: sobrevive a perda e quebra, se o backup do aparelho estiver ligado e houver Wi-Fi. | Depende de conta Google, de backup ligado e de bloqueio de tela; "um aparelho pode nunca fazer backup"; restauração de app fora da loja não testada; ela não escolhe isso tela a tela, vale o ajuste do aparelho. |
| 4. Como está hoje | `allowBackup="true"` sem regras | Igual à 3, mas sem a exigência de criptografia. | Igual à 3. | Em aparelho sem bloqueio de tela, o backup sobe sem a proteção de ponta a ponta. |

A mais segura para dado de saúde é a 1 (ou a 2, se a transferência entre aparelhos for considerada aceitável). A mais robusta contra perda é a 3. Qualquer que seja a escolha, a exportação em arquivo (seção 3.3) é o único mecanismo sob controle direto dela, e o texto do app ("Os registros ficam só neste celular") precisa corresponder à opção escolhida: com as opções 3 e 4 essa frase não é exata.

Exemplo para a opção 2 (NÃO TESTADO; `res/xml/regras_extracao.xml`):

```xml
<?xml version="1.0" encoding="utf-8"?>
<data-extraction-rules>
    <cloud-backup>
        <exclude domain="root" path="." />
        <exclude domain="file" path="." />
        <exclude domain="database" path="." />
        <exclude domain="sharedpref" path="." />
        <exclude domain="external" path="." />
    </cloud-backup>
    <!-- sem secao device-transfer: transferencia entre aparelhos totalmente ligada -->
</data-extraction-rules>
```

Para a opção 3, trocar o conteúdo de `<cloud-backup>` por nada e acrescentar o atributo `disableIfNoEncryptionCapabilities="true"`. No manifesto: `android:dataExtractionRules="@xml/regras_extracao"` e `android:fullBackupContent="@xml/regras_backup_antigo"`. O `montar-apk.sh` compila `android/res` com `aapt2 compile --dir`, então a pasta `res/xml` entra sem mudar o script (não testei).

### 3.3 Exportar e importar arquivo com o seletor do sistema

| Afirmação | Página | Confiança |
|---|---|---|
| `ACTION_CREATE_DOCUMENT` abre o seletor para a pessoa escolher onde salvar; `ACTION_OPEN_DOCUMENT` para escolher um arquivo. O acesso é concedido pela escolha da pessoa, sem permissão de armazenamento em tempo de execução. | https://developer.android.com/training/data-storage/shared/documents-files | alto (li os trechos dos dois intents e a introdução; a frase sobre permissão é paráfrase) |
| `ACTION_CREATE_DOCUMENT` não sobrescreve: se o nome existe, o sistema acrescenta "(1)". | mesma página | alto |
| Exemplo oficial em Java usa `new Intent(Intent.ACTION_CREATE_DOCUMENT)`, `addCategory(Intent.CATEGORY_OPENABLE)`, `setType(...)`, `putExtra(Intent.EXTRA_TITLE, ...)` e `startActivityForResult`. | mesma página | alto |
| Métodos de `@JavascriptInterface` rodam em thread própria, não na principal. | https://developer.android.com/reference/android/webkit/WebView#addJavascriptInterface(java.lang.Object,%20java.lang.String) | médio (conhecido; não reli hoje) |

Sobre `FileProvider`: é uma classe do AndroidX. Saídas sem AndroidX:
1. `ACTION_CREATE_DOCUMENT`: ela escolhe o destino (Downloads, Google Drive, cartão). Cobre "guardar um arquivo".
2. `ACTION_SEND` com `EXTRA_TEXT`, que o app já usa: cobre "mandar por WhatsApp" enquanto o JSON for pequeno. Limite de tamanho do texto via Intent: NÃO VERIFICADO.
3. Escrever um `ContentProvider` próprio com `openFile()` devolvendo `ParcelFileDescriptor`, `exported="false"` e `grantUriPermissions="true"`. É o que o `FileProvider` faz por dentro. Dá para fazer só com `android.*`, mas é código sensível a erro de segurança (percurso de pastas); não recomendo para esta entrega.
4. Reaproveitar a URI devolvida pelo seletor num `ACTION_SEND`: NÃO VERIFICADO se a permissão pode ser repassada.

#### Esqueleto Java (NÃO COMPILADO, NÃO TESTADO)

Para devolver o conteúdo importado ao JavaScript sem montar texto dentro de código, o Java guarda o texto e o JavaScript vem buscar por um método da ponte. Assim não há escape.

```java
// Campos e metodos novos na MainActivity
private static final int REQ_EXPORTAR = 51, REQ_IMPORTAR = 52;
private static final int LIMITE_IMPORTACAO = 5 * 1024 * 1024; // 5 MB
private volatile String paraExportar;   // conteudo aguardando a escolha do destino
private volatile String importado;      // conteudo lido, aguardando o JS buscar

// Na classe Ponte
@JavascriptInterface public void exportarArquivo(final String json, final String nome) {
    paraExportar = json;
    runOnUiThread(new Runnable() { public void run() {
        Intent i = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        i.addCategory(Intent.CATEGORY_OPENABLE);
        i.setType("application/json");
        i.putExtra(Intent.EXTRA_TITLE, nome); // ex.: semana-a-semana-2026-11-23.json
        try { startActivityForResult(i, REQ_EXPORTAR); }
        catch (android.content.ActivityNotFoundException e) { avisarJs("window.aoExportar && window.aoExportar(false)"); }
    }});
}

@JavascriptInterface public void importarArquivo() {
    runOnUiThread(new Runnable() { public void run() {
        Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        i.addCategory(Intent.CATEGORY_OPENABLE);
        i.setType("*/*"); // muitos provedores marcam .json como octet-stream
        i.putExtra(Intent.EXTRA_MIME_TYPES, new String[]{"application/json", "text/plain", "application/octet-stream"});
        try { startActivityForResult(i, REQ_IMPORTAR); }
        catch (android.content.ActivityNotFoundException e) { avisarJs("window.aoImportar && window.aoImportar(false)"); }
    }});
}

/** O JS chama isto depois de receber aoImportar(true). Devolve uma vez e esquece. */
@JavascriptInterface public String pegarImportado() { String t = importado; importado = null; return t == null ? "" : t; }

@Override protected void onActivityResult(int req, int resultado, Intent dados) {
    super.onActivityResult(req, resultado, dados);
    if (req != REQ_EXPORTAR && req != REQ_IMPORTAR) return;
    final android.net.Uri uri = (resultado == RESULT_OK && dados != null) ? dados.getData() : null;
    if (uri == null) { // a pessoa cancelou
        paraExportar = null;
        avisarJs(req == REQ_EXPORTAR ? "window.aoExportar && window.aoExportar(false)" : "window.aoImportar && window.aoImportar(false)");
        return;
    }
    final boolean exportar = req == REQ_EXPORTAR;
    new Thread(new Runnable() { public void run() { // leitura e escrita fora da thread principal
        boolean ok = false;
        try {
            if (exportar) {
                try (java.io.OutputStream o = getContentResolver().openOutputStream(uri)) {
                    o.write(paraExportar.getBytes(java.nio.charset.StandardCharsets.UTF_8));
                }
                ok = true;
            } else {
                try (java.io.InputStream in = getContentResolver().openInputStream(uri)) {
                    java.io.ByteArrayOutputStream b = new java.io.ByteArrayOutputStream();
                    byte[] buf = new byte[8192]; int n;
                    while ((n = in.read(buf)) > 0) {
                        b.write(buf, 0, n);
                        if (b.size() > LIMITE_IMPORTACAO) throw new java.io.IOException("arquivo grande demais");
                    }
                    importado = new String(b.toByteArray(), java.nio.charset.StandardCharsets.UTF_8);
                }
                ok = true;
            }
        } catch (Exception e) {
            ok = false; // nao registrar o conteudo nem a excecao em log
        } finally {
            if (exportar) paraExportar = null;
        }
        avisarJs((exportar ? "window.aoExportar && window.aoExportar(" : "window.aoImportar && window.aoImportar(") + ok + ")");
    }}).start();
}
```

Do lado do JavaScript: `window.aoImportar = ok => { if (ok) restaurar(Android.pegarImportado()); }`. A validação do JSON continua no JavaScript, como hoje.

Cuidados: `openOutputStream` e `openInputStream` podem devolver `null` (tratar); se a Activity for destruída enquanto o seletor está aberto, `paraExportar` se perde (guardar em `onSaveInstanceState` ou pedir o conteúdo de novo ao JS); `startActivityForResult` está marcado como obsoleto no AndroidX, mas é a API disponível em `android.app.Activity`. Se for preciso passar texto por `evaluateJavascript` em outro ponto, `org.json.JSONObject.quote(texto)` produz um literal de string; não confirmei o tratamento de U+2028/U+2029, por isso a preferência pelo "JS vem buscar".

### 3.4 Instalação por APK

#### Verificação de desenvolvedores (mudou em 2026)

| Afirmação | Página | Confiança |
|---|---|---|
| A partir de 30/09/2026 as proteções valem para usuários no Brasil, Indonésia, Singapura e Tailândia, em aparelhos certificados com Android 8 (API 26) ou mais. Expansão global em 2027. | https://developer.android.com/developer-verification e https://developer.android.com/developer-verification/guides | alto |
| Nesta fase o sistema verifica instalações vindas de: Google Play, HONOR App Market, OPPO App Market, Galaxy Store, Palm Store, V-Appstore e GetApps. | https://developer.android.com/developer-verification/guides ("Where changes are in effect") | alto |
| "If you distribute your app through other stores, or if users sideload your app directly, these new verification requirements won't apply to your app yet." (atualizado em 15/07/2026) | https://developer.android.com/developer-verification/guides/faq | alto |
| "Any package names not registered by this date will no longer be installable on certified Android devices in those regions." | https://developer.android.com/developer-verification/guides/limited-distribution | alto. **Contradiz a linha anterior.** Não sei qual das duas descreve o comportamento real em 20/11/2026. |
| Instalar por ADB não exige verificação nem espera. | FAQ acima ("Will ADB install work without registration?", "Are ADB installs impacted...") | alto |
| Conta de distribuição limitada: gratuita, sem documento de identidade; exige conta Google com verificação em duas etapas, perfil de pagamentos do Google (nome legal e endereço) e e-mail de contato; registra o nome do pacote com a chave de assinatura; a instalação usa convite por QR code ou link com consentimento no aparelho. | https://developer.android.com/developer-verification/guides/limited-distribution | alto |
| Limite de aparelhos da conta limitada: a página do guia diz 50; a FAQ e a tabela de visão geral dizem 20. | mesmas páginas | alto para a existência da divergência |
| "Fluxo avançado" para instalar app de desenvolvedor não verificado: ativar o modo de desenvolvedor, confirmar que não está sendo orientada por terceiros, reiniciar e autenticar, **esperar um dia**, confirmar com biometria ou PIN; depois disso, liberar por 7 dias ou sem prazo. Ainda aparece um aviso com "Instalar mesmo assim". | FAQ acima, seção "Advanced flow" | alto |
| Sem a chave de assinatura não se registra o pacote. | FAQ ("Can I recover a lost signing key?") | alto |

O que isso significa para segunda-feira:
- Se o celular dela barrar a instalação por arquivo, os caminhos documentados são: (a) instalar pelo cabo com `adb install` a partir do computador do dono; (b) fluxo avançado, que tem espera de um dia e portanto precisa começar no sábado ou domingo; (c) conta de distribuição limitada, que envolve dados pessoais do dono no Google e é decisão dele.
- Em 2027 a regra vale para toda instalação. Atualizações futuras do app vão depender de (a), (b) ou (c).
- Criar conta, registrar pacote ou fornecer dados pessoais não é tarefa de nenhum agente: é decisão do dono.

#### Outros requisitos

| Afirmação | Página | Confiança |
|---|---|---|
| Android 8.0+: a pessoa concede "Instalar apps desconhecidos" ao app de origem (navegador, gerenciador de arquivos, WhatsApp), não ao sistema inteiro. | https://developer.android.com/studio/publish#publishing-unknown | alto |
| Play Protect verifica apps na instalação e periodicamente; para app de fora da loja pode recomendar verificação de app "nunca verificado" e pedir para enviar o app ao Google; com "Melhorar a detecção de apps nocivos" ligado, o envio é automático. Bloqueia app não verificado que peça permissões sensíveis (leitura de SMS ou de notificações). | https://support.google.com/googleplay/answer/2812853?hl=pt-BR | alto |
| Texto do botão para prosseguir ("Instalar mesmo assim"). | não está na página de ajuda | médio (aparece na FAQ da verificação de desenvolvedores para o fluxo avançado) |
| Este app pede `POST_NOTIFICATIONS` e `RECEIVE_BOOT_COMPLETED` (se os lembretes entrarem), que não são as permissões sensíveis citadas. O que seria enviado ao Google na verificação é o APK, que não contém dados dela. | inferência | médio |
| Alvo mínimo para instalar: `targetSdkVersion` abaixo de 23 não instala no Android 14; abaixo de 24 não instala no Android 15. O app usa 34. | https://developer.android.com/about/versions/14/behavior-changes-all e https://developer.android.com/about/versions/15/behavior-changes-all | alto |
| Android 16: mudança no alvo mínimo. | não encontrei na página de mudanças do Android 16 | NÃO VERIFICADO |
| App com alvo 30+ precisa de assinatura no esquema v2 ou superior; só v1 não instala no Android 11+. | https://developer.android.com/about/versions/11/behavior-changes-11 ("APK Signature Scheme v2 now required") | alto |
| O `apksigner` do `montar-apk.sh` gera v2/v3 por padrão. | inferência (com `minSdk` 26; há um `.idsig` na pasta, que indica v4) | médio. Conferir com `apksigner verify --verbose semana-a-semana.apk` |
| Atualizar por cima preservando dados: mesmo nome de pacote, mesma chave, `versionCode` maior ou igual. | https://developer.android.com/studio/publish/app-signing (chave); regra do `versionCode` | alto para a chave; médio para o `versionCode` (não reli a página de versionamento) |

Pontos práticos do projeto: o `versionCode` está em 1 no manifesto; cada entrega nova precisa subir esse número. A chave `android/chave.keystore` e a senha (escrita no `montar-apk.sh`) precisam de cópia fora da máquina; perdê-la obriga a desinstalar o app para instalar outro, e isso apaga os registros.

#### Passo a passo de instalação em linguagem leiga

Para o dono seguir no celular dela. Os nomes dos menus mudam um pouco conforme a marca.

1. No computador, pegue o arquivo `semana-a-semana.apk`.
2. Mande o arquivo para o celular dela por um caminho que você controla: cabo USB (copiando para a pasta Download) ou uma conversa de WhatsApp de você para ela.
3. No celular, abra o app **Arquivos** (ou "Meus Arquivos" na Samsung), entre em **Download** e toque em `semana-a-semana.apk`. Se veio pelo WhatsApp, toque no arquivo na conversa.
4. Vai aparecer um aviso dizendo que, por segurança, o celular não permite instalar apps desconhecidos dessa fonte. Toque em **Configurações**, ligue a chave **Permitir desta fonte** e volte.
5. Toque em **Instalar**.
6. Pode aparecer uma tela do **Play Protect** dizendo que o app é de desenvolvedor desconhecido ou que nunca foi verificado. Leia a tela. Há uma opção para continuar (em geral em "Mais detalhes" e depois "Instalar mesmo assim"). Se o Play Protect oferecer enviar o app para verificação, saiba que o que vai é o aplicativo, não os registros dela; aceitar ou recusar é escolha de vocês.
7. Se o celular **não deixar instalar de jeito nenhum** e mencionar "desenvolvedor não verificado", é a regra nova do Android no Brasil. Não insista. Os caminhos são: instalar pelo cabo a partir do computador (comando `adb install`, que a equipe pode orientar) ou ativar no celular a opção de instalar apps de desenvolvedores não verificados, que exige esperar um dia.
8. Depois de instalar, volte em **Configurações > Apps > Acesso especial > Instalar apps desconhecidos** e desligue a permissão que você ligou no passo 4.
9. Abra o app **Semana a Semana** uma vez. Se ela quiser lembretes, é dentro do app que ela ativa; o celular vai perguntar se permite notificações.
10. Para atualizar no futuro: repita os passos 2 a 6 com o arquivo novo, **sem desinstalar** o app antigo. Desinstalar apaga os registros.

Este passo a passo NÃO FOI TESTADO em aparelho real.

### 3.5 Segurança de WebView com arquivos locais e durabilidade do localStorage

| Afirmação | Página | Confiança |
|---|---|---|
| `setAllowFileAccess`: padrão `true` com alvo até Android 10 (Q) e `false` com alvo 11 (R) ou mais. "Assets and resources are still accessible using file:///android_asset and file:///android_res." | https://developer.android.com/reference/android/webkit/WebSettings#setAllowFileAccess(boolean) | alto |
| Recomendação oficial: usar `androidx.webkit.WebViewAssetLoader` para servir os arquivos por `https://` em vez de `file://`. | mesma página e https://developer.android.com/privacy-and-security/risks/webview-unsafe-file-inclusion | alto (recomendação do fabricante; exige AndroidX) |
| `setAllowFileAccessFromFileURLs` e `setAllowUniversalAccessFromFileURLs`: obsoletos desde a API 30, "not secure". | https://developer.android.com/reference/android/webkit/WebSettings | alto |
| O risco de `file://` com JavaScript ligado é script malicioso ler arquivos locais do app; depende de carregar conteúdo que possa ser criado ou alterado por fonte externa. | https://developer.android.com/privacy-and-security/risks/webview-unsafe-file-inclusion | alto |
| Ponte JavaScript: o risco é conteúdo não confiável chamar a interface. Mitigações: só carregar conteúdo do próprio app; remover a interface antes de carregar conteúdo não confiável; não refletir texto de usuário sem escape. | https://developer.android.com/privacy-and-security/risks/insecure-webview-native-bridges | alto |
| `setAllowContentAccess`: padrão ligado. | https://developer.android.com/reference/android/webkit/WebSettings#setAllowContentAccess(boolean) | alto |
| `setDomStorageEnabled`: padrão `false` (o app já liga). | mesma referência | alto |

Avaliação para este app: carrega só `file:///android_asset/`, não tem permissão de internet, e o `app.js` escapa o texto digitado antes de pôr na tela (função `esc`). O risco residual é baixo. Sem AndroidX, não há `WebViewAssetLoader`; reescrever um equivalente com `shouldInterceptRequest` é possível, mas mudar a origem de `file://` para `https://` faria o `localStorage` atual aparecer vazio (origem diferente), o que apagaria os registros de quem já usa. Não recomendo para esta entrega.

Endurecimento barato (NÃO TESTADO):

```java
WebSettings s = web.getSettings();
s.setAllowFileAccess(false);      // ja e o padrao com alvo 34; deixar explicito. android_asset continua acessivel.
s.setAllowContentAccess(false);   // o app nao carrega content://
web.setWebViewClient(new WebViewClient() {
    @Override public boolean shouldOverrideUrlLoading(WebView v, android.webkit.WebResourceRequest r) {
        return !r.getUrl().toString().startsWith("file:///android_asset/"); // bloqueia qualquer outra navegacao
    }
});
```

A ponte não deve ganhar métodos genéricos ("ler arquivo de tal caminho", "gravar em tal caminho"); cada método faz uma coisa fixa.

#### O localStorage é confiável?

| Afirmação | Fonte | Confiança |
|---|---|---|
| O localStorage da WebView é gravado em disco no diretório de dados do app e persiste entre aberturas. | comportamento conhecido; o app já depende disso | médio (não achei página oficial que o garanta) |
| "Limpar cache" nas configurações do Android apaga `getCacheDir()`; "Limpar dados/armazenamento" apaga tudo, inclusive `app_webview`. | comportamento conhecido da plataforma | baixo: procurei e não achei página oficial que descreva a diferença para `app_webview` |
| Não há garantia formal de persistência nem mecanismo para a WebView pedir armazenamento persistente. | discussão de 2017 na lista do Chromium, https://groups.google.com/a/chromium.org/g/chromium-discuss/c/AWMgYFD_gJs | médio (fonte antiga e informal) |
| Há relatos de localStorage que não é lido depois de reiniciar o app. | fóruns de desenvolvedores, sem causa identificada | baixo |
| `WebStorage.deleteAllData()` apaga o armazenamento web. | https://developer.android.com/reference/android/webkit/WebStorage | médio (via busca) |

Alternativa mais durável: além do localStorage, gravar o mesmo JSON num arquivo em `getFilesDir()` pela ponte, a cada `salvar()`. Na abertura, se o localStorage vier vazio e o arquivo existir, o JavaScript restaura dele. `getFilesDir()` é armazenamento interno documentado, entra no Auto Backup por padrão e só some com desinstalação ou "limpar dados". Esqueleto (NÃO COMPILADO, NÃO TESTADO):

```java
// Na classe Ponte. Escrita atomica: grava em arquivo temporario e renomeia.
@JavascriptInterface public boolean guardarCopia(String json) {
    java.io.File dir = getFilesDir(), tmp = new java.io.File(dir, "dados.json.tmp"), fim = new java.io.File(dir, "dados.json");
    try (java.io.FileOutputStream o = new java.io.FileOutputStream(tmp)) {
        o.write(json.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        o.getFD().sync();
    } catch (java.io.IOException e) { return false; }
    return tmp.renameTo(fim);
}

@JavascriptInterface public String lerCopia() {
    java.io.File f = new java.io.File(getFilesDir(), "dados.json");
    if (!f.exists() || f.length() > 5 * 1024 * 1024) return "";
    try (java.io.FileInputStream in = new java.io.FileInputStream(f)) {
        byte[] b = new byte[(int) f.length()]; int lido = 0, n;
        while (lido < b.length && (n = in.read(b, lido, b.length - lido)) > 0) lido += n;
        return new String(b, 0, lido, java.nio.charset.StandardCharsets.UTF_8);
    } catch (java.io.IOException e) { return ""; }
}
```

"Apagar todos os dados" no app precisa apagar também esse arquivo e cancelar os lembretes, senão o botão não cumpre o que diz.

---

## 4. LGPD para um app pessoal com dado de saúde só no aparelho

Não sou advogado; o que segue é leitura do texto da lei, não parecer jurídico.

| Ponto | Texto | Fonte | Confiança |
|---|---|---|---|
| Exceção de uso particular | "Art. 4º Esta Lei não se aplica ao tratamento de dados pessoais: I - realizado por pessoa natural para fins exclusivamente particulares e não econômicos;" | Lei 13.709/2018, https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm | alto |
| Dado sensível | Art. 5º, II: inclui "dado referente à saúde ou à vida sexual, dado genético ou biométrico, quando vinculado a uma pessoa natural". | mesma | alto |
| Tratamento | Art. 5º, X: "toda operação realizada com dados pessoais", incluindo coleta, armazenamento e transmissão. | mesma | alto |
| Controlador | Art. 5º, VI: "pessoa natural ou jurídica ... a quem competem as decisões referentes ao tratamento". | mesma | alto |
| Bases para dado sensível | Art. 11: consentimento específico e destacado (I) ou hipóteses do inciso II, entre elas "tutela da saúde, exclusivamente, em procedimento realizado por profissionais de saúde, serviços de saúde ou autoridade sanitária" (II, f). | mesma | alto |
| Segurança | Art. 46: agentes de tratamento devem adotar medidas de segurança contra acesso não autorizado e perda. | mesma | alto |
| Pessoa natural como agente | Resolução CD/ANPD nº 2/2022, art. 2º, I: agentes de pequeno porte incluem "pessoas naturais ... que realizam tratamento de dados pessoais, assumindo obrigações típicas de controlador ou de operador". | https://www.gov.br/palmares/pt-br/midias/arquivos-menu-acesso-a-informacao/legislacao/resolucao-cd-anpd-n2-2022.pdf | médio (trecho visto via busca, não abri o PDF) |
| Orientação da ANPD específica sobre o art. 4º, I | Existe o Guia Orientativo para Definições dos Agentes de Tratamento (versão 2.0, 2022); não localizei o trecho. | https://www.gov.br/anpd/pt-br/documentos-e-publicacoes/Segunda_Versao_do_Guia_de_Agentes_de_Tratamento_retificada.pdf/ | NÃO VERIFICADO |

Leitura para o caso:

- **Como está (familiar faz o app para a usuÃ¡ria, dados só no celular dela, sem servidor)**: quem trata os dados é ela mesma, sobre si mesma, para fim particular. O familiar escreve um programa e não recebe os dados. O art. 4º, I afasta a lei. Confiança na leitura: médio.
- **Quando ela compartilha o relatório por WhatsApp**: é a titular enviando o próprio dado. Para o familiar, continua fim particular. Para o médico, o tratamento que ele fizer é dele, com base própria (art. 11, II, f). O WhatsApp trata a mensagem nos termos dele. O app não vira controlador por abrir a tela de compartilhamento do sistema. Confiança: médio. Ponto prático: o relatório inclui o nome (se preenchido), dose, peso, IMC e sintomas; vale um aviso curto antes de compartilhar dizendo o que vai no texto.
- **Se o app fosse dado a outras pessoas (amigas, familiares) sem coleta**: os dados continuam no aparelho de cada uma. O autor não decide sobre tratamento nenhum porque não tem acesso. A leitura mais direta é que ele não é controlador; mas deixaria de valer o argumento "fiz para uso da minha casa", e conviria uma nota de privacidade dizendo que nada sai do aparelho. Confiança: baixo (interpretação).
- **Se fosse publicado na loja**: mesmo sem coleta, a loja exige declaração de segurança de dados e política de privacidade para apps de saúde (política da loja, não da lei; NÃO VERIFICADO hoje). Se houver qualquer finalidade econômica, o art. 4º, I deixa de se aplicar a quem explora o app. Se passasse a haver servidor, sincronização ou estatística de uso, o autor viraria controlador de dado sensível, com art. 11 (consentimento específico e destacado), art. 46 e direitos do titular. Confiança: médio.
- **Backup do Google ligado (seção 3.2, opções 3 e 4)**: é ela usando um serviço da conta dela; não muda a posição do autor. Muda a frase "os dados ficam só neste celular", que deixa de ser exata.

Boas práticas que valem mesmo sem obrigação legal (recomendação):
- Dizer em linguagem simples onde os dados ficam e o que sai do aparelho (hoje: só pelo botão Compartilhar; conferir a frase conforme a decisão de backup).
- Botão "Apagar todos os dados" que apaga de fato tudo: localStorage, arquivo espelho, preferências de lembretes e alarmes.
- Não escrever dado de saúde em log (`Log.d`, `console.log`) nem em mensagem de exceção.
- Notificação sem nome de remédio nem dado de saúde na tela bloqueada.
- Sem permissão de internet (já é assim) e sem biblioteca externa.
- Mostrar o que vai no relatório antes de compartilhar; nome é opcional (já é).
- Arquivo de exportação com nome neutro e aviso de que quem tiver o arquivo lê os registros (não é cifrado).

---

## 5. Medidas caseiras publicadas

### 5.1 Quais fontes são acessíveis de graça

| Fonte | Acesso | O que usei |
|---|---|---|
| IBGE. Pesquisa de Orçamentos Familiares 2008-2009: Tabela de Medidas Referidas para os Alimentos Consumidos no Brasil. Rio de Janeiro, 2011. 545 páginas. | PDF público: https://biblioteca.ibge.gov.br/visualizacao/livros/liv50000.pdf | Baixei e li por extração de texto. É a fonte principal da tabela abaixo. Cada linha traz o código do alimento (7 dígitos), a medida, os gramas e de onde veio o número. |
| Pinheiro, Lacerda, Benzecry, Gomes, Costa. Tabela para Avaliação de Consumo Alimentar em Medidas Caseiras. Atheneu. | Livro pago; não achei versão oficial gratuita. | Indireto: o IBGE usa a 5ª edição (2004) como fonte nº 1 do seu Quadro 3 e reproduz os valores com a descrição original ("Arroz cozido - colher de sopa cheia"). |
| Guia Alimentar para a População Brasileira. | A edição de 2006 tem porções em gramas e é a fonte nº 2 do IBGE. A edição de 2014 não consultei; que eu saiba não traz tabela de gramas por medida (NÃO VERIFICADO). | Indireto, via IBGE ("porção Guia Alimentar"). |
| TBCA/USP, versão 7.3 (2025). | Consulta gratuita página a página em https://www.tbca.net.br/base-dados/composicao_alimentos.php. Sem download da base. | Consultei 5 alimentos. Cada página traz colunas por medida caseira com os gramas. |
| Manual fotográfico de quantificação alimentar. | A TBCA cita um "Manual Fotográfico de Porções e Preparações Culinárias de Alimentos" na página inicial. | Não abri. NÃO VERIFICADO. |
| Anvisa, RDC 429/2020 e IN 75/2020 (anexo de porções de rotulagem). | Públicas no site da Anvisa. | Não consultei por falta de tempo. NÃO VERIFICADO. As porções de rótulo são porções de referência, não peso de medida caseira observada. |

Legenda da coluna "origem" (Quadro 3 do IBGE, lido na fonte): **P** = Pinheiro et al., 2004; **G** = Guia Alimentar 2006; **Ph** = Philippi, Pirâmide dos alimentos, 2008; **F** = Fisberg e Villar, 2002; **R** = rótulo; **T** = Tomita e Cardoso, 2000; **N** = Tuma e Monteiro (Nutrivisa), 1999; **U** = itens pesados em universidades brasileiras.

Diferença = (gMedida atual − fonte) ÷ fonte, contra a medida equivalente. Todos os valores do IBGE têm confiança **alto** (lidos no PDF); a escolha de qual linha do IBGE corresponde à medida do app é julgamento meu.

Para que serve o `gMedida`: o app guarda o cardápio em gramas e usa o `gMedida` só para mostrar a medida caseira ao lado ("2 × fatia média") e, na lista "Onde está cada nutriente", como porção padrão de alimento que não está no cardápio. Um `gMedida` errado não muda as contas de nutrientes do cardápio; muda quanto ela põe no prato se seguir a medida caseira.

### 5.2 Tabela por alimento

| chave | medida atual | g atual | medida e gramas na fonte | fonte (código IBGE; origem) | diferença |
|---|---|---|---|---|---|
| frango_peito | filé médio | 100 | "Frango frito - filé médio" 100; filé pequeno 70; porção Guia 100 | 7800402; P, G | 0% |
| frango_sobrecoxa | sobrecoxa sem osso | 90 | "Frango assado - sobrecoxa média" 65; coxa grande 55 (a fonte não diz se é com osso) | 7800302; P | **+38%** |
| carne_patinho | bife médio | 100 | "Bife bovino - unidade média" 100; porção Guia (carne assada) 75 | 7100501, 7109101; P, G | 0% |
| carne_moida | colher de sopa cheia | 25 | colher de sopa cheia 25; colher de arroz cheia 60; porção Guia 63 | 7104301; P, G | 0% |
| carne_musculo | pedaço médio | 40 | "Carne bovina ensopada - pedaço médio" 35; colher de sopa cheia 30 | 7101001; P | +14% |
| porco_lombo | fatia média | 60 | "Porco lombo assado - 1 fatia" 190; meia fatia e porção Guia 95. Para comparação: "Carne assada - fatia média" (bovina) 90 | 7103701, 7104101, 7100608; G, P | **−68%** (−33% contra a fatia bovina) |
| ovo | unidade | 50 | "Ovo de galinha cozido - unidade média" 45; porção Guia 90 | 7803301; P, G | +11% |
| atum | lata drenada | 120 | "Atum sólido em água e sal - lata" 135 (não diz se drenado); colher de sopa cheia 16; porção Guia 112 | 7703402; P, G | −11% |
| sardinha | lata drenada | 84 | "Sardinha em óleo - lata" 125 (rótulo; parece peso líquido, com o óleo); unidade média 41,5 | 7703002; R, P | **−33%** contra a lata inteira; peso drenado não encontrado |
| salmao | filé pequeno | 100 | salmão fresco: não encontrado. Peixe em geral: "Peixe cozido - filé médio" 120; "Peixe à milanesa - filé pequeno" 90; porção Guia 75 | 7200101; P, G | não encontrado para salmão (+11% contra filé pequeno genérico) |
| merluza | filé médio | 100 | "Peixe cozido - filé médio" 120; posta média 200 | 7200101 (peixe de mar); P | −17% |
| tilapia | filé médio | 100 | "Peixe cozido - filé médio" 120 | 7400101 (peixe de água doce); P | −17% |
| tofu | fatia média | 60 | "Queijo tofu - pedaço médio" 20 | 7903402; P | **+200%** |
| whey | medida (scoop) | 30 | não encontrado (depende do rótulo do produto) | nenhuma | não encontrado |
| iogurte | pote | 170 | "Iogurte natural - unidade" 200; porção Guia 165 | 7901201; P, G | −15% (o pote de 2004 era de 200 g) |
| iogurte_desn | pote | 170 | "Iogurte desnatado - unidade" 200 | 7901203; P | −15% |
| leite | copo | 200 | xícara de chá 200; copo médio 240; copo de requeijão 240; copo grande 300; porção Guia 182 | 7900101; P, T, G | 0% contra xícara; −17% contra copo médio ("copo" é ambíguo) |
| leite_desn | copo | 200 | xícara de chá 200; copo médio 240; copo de requeijão 240 | 7903601; P | 0% contra xícara; −17% contra copo médio |
| leite_po_desn | colher de sopa | 10 | "Leite de vaca desnatado pó - colher de sopa cheia" 10 | 7900710; P | 0% |
| queijo_minas | fatia média | 30 | "Queijo minas frescal - fatia média" 30; porção Guia (tipo minas) 50 | 7907301, 7902001; P, G | 0% |
| ricota | fatia média | 35 | "Ricota - fatia média" 35; porção Guia 100 | 7902201; P, G | 0% |
| mozarela | fatia | 20 | "Queijo muçarela - fatia média" 20; porção Guia 45 | 7901801; P, G | 0% |
| feijao_carioca | concha pequena | 80 | concha pequena: não encontrada. Concha média cheia 140; colher de arroz cheia 35; colher de sopa cheia 17; porção Guia (só grãos) 50 | 6303102; P, G | não encontrado para a medida usada |
| feijao_preto | concha pequena | 80 | igual ao anterior (o IBGE usa um código só para os feijões) | 6303102; P, G | não encontrado para a medida usada |
| lentilha | concha pequena | 80 | concha pequena: não encontrada. Concha média cheia 160; colher de arroz 32; colher de sopa 18; porção Guia 48 | 6302901; P, G | não encontrado para a medida usada |
| grao_bico | colher de sopa cheia | 25 | colher de sopa cheia 22; colher de arroz cheia 45; concha média cheia 120 | 6302801; P | +14% |
| arroz_integral | colher de sopa cheia | 25 | colher de sopa cheia 20; colher de arroz cheia 63; escumadeira média cheia 59 | 6300201; P | **+25%** |
| arroz_branco | colher de sopa cheia | 25 | colher de sopa cheia 25; colher de arroz cheia 45; escumadeira média cheia 85; porção Guia 125 | 6300101; P, G | 0% |
| aveia | colher de sopa | 15 | "Aveia flocos - colher de sopa cheia" 15; colher de sobremesa cheia 7 | 6500401; P | 0% |
| pao_integral | fatia | 25 | fatia 25 (o IBGE usa "Pão de forma de aveia - unidade" como referência) | 8001401; P | 0% |
| pao_frances | unidade | 50 | "Pão francês - unidade" 50. TBCA: unidade média 50 | 8000105; P, G. TBCA BRC0002A | 0% |
| batata_doce | rodela média | 40 | "Batata-doce cozida - fatia média" 70 (o IBGE usa esse valor para "rodela"); colher de sopa cheia 42; porção Guia 150 | 6400401; P, G | **−43%** |
| batata | unidade pequena | 80 | unidade pequena 70; unidade média 140; colher de sopa cheia 30 | 6400101; P | +14% |
| mandioca | pedaço médio | 50 | "Aipim cozido - pedaço médio" 100; pedaço pequeno 50; porção Guia 128 | 6400601, 6400609; P, G | **−50%** (50 g é o pedaço pequeno) |
| cuscuz | fatia média | 80 | IBGE: "Cuscuz de milho - pedaço médio" 135. TBCA (cuscuz com leite e açúcar): fatia média 80 | 6902901; P. TBCA BRC0859A | **−41%** contra o IBGE; 0% contra a TBCA (preparo diferente) |
| abobora | colher de sopa cheia | 30 | colher de sopa cheia 36; pedaço médio 50; porção Guia 70 | 6703901; P, G | −17% |
| brocolis | ramo médio | 25 | ramo 60 (o IBGE usa "Couve-flor cozida - ramo médio" como referência); colher de sopa cheia picada 10; porção Guia 60 | 6701704; P, G | **−58%** |
| couve | colher de sopa cheia | 20 | "Couve refogada - colher de sopa cheia picada" 20; folha média 25 | 6700501; P | 0% |
| espinafre | colher de sopa cheia | 25 | "Espinafre cozido - colher de sopa cheia" 25; porção Guia 67 | 6700701; P, G | 0% |
| cenoura_crua | colher de sopa | 12 | "Cenoura crua - colher de sopa cheia ralada" 12; unidade média 120 | 6401201; P | 0% |
| cenoura_coz | colher de sopa cheia | 25 | "Cenoura cozida - colher de sopa cheia picada" 25; porção Guia 35 | 6401201; P, G | 0% |
| tomate | unidade pequena | 80 | unidade pequena 50; unidade média 100; fatia média 15; porção Guia 80 | 6705101; P, G | **+60%** |
| alface | folha | 10 | folha média 10; prato de sobremesa cheio picada 30 | 6700101; P | 0% |
| abobrinha | colher de sopa cheia | 30 | colher de sopa cheia 30 | 6703701; P | 0% |
| chuchu | colher de sopa cheia | 30 | colher de sopa cheia 20; pedaço médio 30; porção Guia 57 | 6704101; P, G | **+50%** |
| beterraba | colher de sopa cheia | 20 | colher de sopa cheia 20; fatia média 12 | 6401101; P | 0% |
| couve_flor | ramo médio | 30 | "Couve-flor cozida - ramo médio" 60; colher de sopa cheia 25 | 6700601; P | **−50%** |
| pepino | colher de sopa (picado) | 18 | colher de sopa cheia picada 18; unidade média 100 | 6704001; P | 0% |
| rucula | prato de sobremesa | 20 | prato de sobremesa 30 (referência: alface, cheio, picada); pires 20; ramo 6 | 6702001; P, G | **−33%** |
| repolho | colher de sopa (picado) | 10 | "Repolho cru - colher de sopa cheia" 10; folha média 26 | 6700901; P | 0% |
| banana | unidade | 70 | "Banana-prata - unidade" 75; porção Guia 86 | 6801101; Ph, G | −7% |
| mamao | fatia média | 100 | "Mamão - fatia média" 170; papaia unidade média 310 (metade = 155); porção Guia (formosa) 160 | 6803101; P, G | **−41%** |
| laranja | unidade | 130 | unidade média 180; unidade pequena 90; porção Guia 144 | 6801801; P, G | **−28%** |
| maca | unidade pequena | 110 | unidade pequena 90; unidade média 150; porção Guia 130 | 6803001; P, G | **+22%** |
| morango | unidade | 12 | unidade média 12; unidade pequena 7 | 6805201; P | 0% |
| goiaba | unidade média | 170 | unidade média 170 | 6804201; P | 0% |
| manga | fatia média | 60 | "Manga hadden - fatia" 22; manga espada pequena (unidade) 60; porção Guia 110 | 6803201; G, P | **+173%** |
| abacate | colher de sopa cheia | 30 | "Abacate - colher de sopa cheia picado" 45. TBCA: colher de sopa cheia 45 | 6802701; P. TBCA BRC0001C | **−33%** |
| kiwi | unidade | 75 | unidade média 94; unidade pequena 57 | 6807801; P | **−20%** (20,2%) |
| melao | fatia média | 90 | fatia média 90; porção Guia 230 | 6803501; P, G | 0% |
| melancia | fatia média | 200 | fatia média 200; porção Guia 296 | 6803401; P, G | 0% |
| abacaxi | fatia média | 75 | fatia média 75; porção Guia 130 | 6802601; P, G | 0% |
| tangerina | unidade | 135 | unidade média 135; unidade pequena 100 | 6802201; P | 0% |
| ameixa_seca | unidade | 8 | não encontrado para ameixa seca. O IBGE traz ameixa preta fresca (unidade média 42) e "Ameixa preta - porção Guia" 30 | 6804301; P, G | não encontrado |
| azeite | colher de sopa | 8 | "Óleo vegetal - colher de sopa" 8; colher de sobremesa 5; porção Guia 7,6 | 8400101; P, G | 0% |
| castanha_brasil | unidade | 4 | "Castanha-do-pará - unidade" 4; porção 8. TBCA: porção média 30 | 6600701; P, Ph. TBCA BRC0003U | 0% |
| castanha_caju | unidade | 2,5 | "Castanha de caju torrada - unidade média" 2,5; punhado 40; porção 10 | 6600801; P, Ph | 0% |
| amendoim | colher de sopa | 17 | "Amendoim torrado com sal - colher de sopa" 17; punhado 30 | 6301001; P | 0% |
| linhaca | colher de sopa | 10 | "Semente de linhaça - colher de sopa" 13; colher de sobremesa 3 | 6302001; U | **−23%** |
| gergelim | colher de sopa | 8 | IBGE: não encontrado. TBCA: colher de sopa rasa 15 | TBCA BRC0016U | **−47%** contra a TBCA |
| noz | unidade | 5 | "Noz - unidade" 5; porção 25 | 6601501; P, N | 0% |
| agua_coco | copo | 200 | copo médio 240; copo de requeijão 240; copo grande 300; unidade (coco) 340 | 8202101; P, T | −17% contra copo médio |

### 5.3 Balanço

- A lista tem **72** alimentos.
- **66** têm valor publicado para a mesma medida ou para medida equivalente (alguns com ressalva anotada na linha: sobrecoxa, atum, sardinha, leite, água de coco, pão integral, brócolis, rúcula).
- **4** têm fonte só para outras medidas: feijão carioca, feijão preto e lentilha (a "concha pequena" não existe na fonte; existe concha média cheia, de 140 e 160 g) e salmão (só peixe em geral).
- **2** não encontrados: whey (rótulo) e ameixa seca.
- **33** batem exatamente com a fonte (em leite e leite desnatado, só se o "copo" for entendido como 200 ml).
- **21 divergem mais de 20%**: manga (+173%), tofu (+200%), lombo de porco (−68%), tomate (+60%), brócolis (−58%), chuchu (+50%), mandioca (−50%), couve-flor (−50%), gergelim (−47%, contra a TBCA), batata-doce (−43%), mamão (−41%), cuscuz (−41%, contra o IBGE), sobrecoxa (+38%), sardinha (−33%, com ressalva), rúcula (−33%), abacate (−33%), laranja (−28%), arroz integral (+25%), linhaça (−23%), maçã (+22%), kiwi (−20,2%).

Ressalvas:
- Os valores de Pinheiro são de 2004 e alguns produtos mudaram (pote de iogurte, latas). Para lata e pote, o rótulo atual é a fonte melhor; não li rótulos (NÃO VERIFICADO).
- O valor de 190 g para a fatia de lombo vem do Guia 2006 e é bem maior que o das outras carnes; pode refletir uma fatia de peça inteira. Tratar com cautela.
- Em vários casos a saída mais simples é trocar o nome da medida em vez do número: "pedaço pequeno" de mandioca (50 g bate), "pires" de rúcula (20 g bate), "unidade pequena" de manga espada (60 g bate), "concha média" de feijão com 140 g.
- Não conferi alimento por alimento na TBCA (só 5), por limite de tempo e pelos termos de uso do site.

---

## 6. Fortificação e fontes brasileiras de micronutrientes

### 6.1 Regra da fortificação de farinhas

| Afirmação | Fonte | Confiança |
|---|---|---|
| A RDC 150/2017 revogou a RDC 344/2002 e passou a fixar mínimo e máximo; a 344 não tinha máximo. | Anvisa, "Enriquecimento de farinhas de trigo e de milho com ferro e ácido fólico: Perguntas e Respostas", 3ª edição, 11/01/2021, perguntas 4 e 5. https://bibliotecadigital.anvisa.gov.br/jspui/bitstream/anvisa/206/1/Enriquecimento%20de%20farinhas%20de%20trigo%20e%20de%20milho%20com%20ferro%20e%20%c3%a1cido%20f%c3%b3lico_perguntas%20e%20respostas_2021.pdf | alto (li o PDF) |
| Faixas: 4 a 9 mg de ferro e 140 a 220 µg de ácido fólico por 100 g de farinha. | mesmo documento, pergunta 27 (frase obrigatória de rótulo) | alto |
| Aplica-se a todas as farinhas de trigo e de milho (fubá) para consumo humano, domésticas ou industriais, nacionais ou importadas. | mesmo documento, pergunta 5 | alto |
| **Não se aplica** a: (a) farinha de biju ou de milho obtida por maceração; (b) farinha de milho flocada ou flocos pré-cozidos, "flocão" ou "floquinho"; (c) farinha de trigo integral; (d) farinha de trigo durum; (e) farinhas em produtos onde ferro ou ácido fólico comprovadamente alterem as características sensoriais. Motivo declarado para (a) a (d): limitação tecnológica. | mesmo documento, pergunta 5 | alto |
| A obrigação recai sobre a farinha, não sobre o produto final. | mesmo documento | alto |
| A RDC 150/2017 foi consolidada na RDC 604/2022 (sal com iodo e farinhas com ferro e ácido fólico). | via busca; o arquivo que baixei da Anvisa não era um PDF válido | médio. Se as faixas mudaram na 604: NÃO VERIFICADO |
| Valores exatos da RDC 344/2002 (4,2 mg de ferro e 150 µg de ácido fólico por 100 g). | memória | NÃO VERIFICADO |

Consequências diretas:
- **Pão francês e macarrão comum** são feitos com farinha refinada, que é fortificada.
- **Cuscuz de flocão** é feito com farinha isenta: não se deve presumir ferro nem ácido fólico adicionados.
- **Pão integral**: a farinha integral é isenta, mas pão "integral" de mercado costuma misturar farinha refinada fortificada; o teor depende da receita. Proporção típica: NÃO VERIFICADO.

### 6.2 Como TACO e TBCA tratam isso

| Alimento | Ferro na TACO 4ª ed. (arquivo local `dados/fontes/taco.json`) | Ferro na TBCA 7.3 | Folato usado pelo app | Folato na TBCA 7.3 |
|---|---|---|---|---|
| Pão francês | 1,0 mg/100 g (id 53) | 4,33 mg/100 g (BRC0002A, "de padaria, com farinha de trigo refinada, médias de diferentes amostras") | 170 µg (USDA 172675, pão francês americano) | 149 µg de equivalente de folato |
| Farinha de trigo | 0,95 mg/100 g (id 35) | não consultei | não está na lista do app | não consultei |
| Macarrão de trigo cru | 0,88 mg/100 g (id 40) | não consultei | não está na lista do app | não consultei |
| Pão de forma integral | 2,99 mg/100 g (id 52) | não consultei | 42 µg (USDA 172688) | não consultei |
| Cuscuz de milho cozido com sal | 0,17 mg/100 g (id 533) | 1,16 mg/100 g na versão com leite e açúcar (BRC0859A), que não é comparável | 0 (não há id do USDA para o cuscuz) | 65,2 µg na versão com leite e açúcar |

Leitura:
- Os valores de ferro da TACO para farinha de trigo (0,95), macarrão (0,88) e pão francês (1,0) estão abaixo do mínimo legal de 4 mg/100 g da farinha. **A TACO não reflete a fortificação nesses itens.** Confiança no número: alto (lido no arquivo local). A conclusão é inferência minha; não achei a frase correspondente no texto da TACO (NÃO VERIFICADO).
- A TBCA reflete: 4,33 mg de ferro e 149 µg de folato no pão francês. Confiança: alto (lido na página do alimento).
- O app subestima o ferro do pão francês em cerca de 3,3 mg por 100 g, ou 1,7 mg por unidade de 50 g. Para comparação, a meta de ferro do app para mulher até 50 anos é 18 mg.
- O folato do pão francês no app (170 µg, americano) fica 14% acima do brasileiro (149 µg). Coincidência razoável, porque os dois países fortificam.
- O cuscuz aparece com folato zero porque não há correspondência no USDA. Não é dado medido; é ausência de dado. Hoje o app soma zero sem dizer isso.
- O ferro do pão integral na TACO (2,99) pode refletir mistura com farinha fortificada ou o ferro natural do grão; não dá para saber pelo número.

### 6.3 A TBCA serve de fonte brasileira para B12, D, E, K, folato, selênio e ômega-3?

| Pergunta | Resposta | Fonte | Confiança |
|---|---|---|---|
| Versão atual | 7.3, São Paulo, 2025. | https://www.tbca.net.br/ ("Como Citar") | alto |
| Quais desses nutrientes traz | Selênio, vitamina B12, vitamina D, alfa-tocoferol (vitamina E), folato em equivalente de folato alimentar, ácidos graxos poli-insaturados totais. | página inicial (lista de componentes) e páginas de alimento | alto |
| Vitamina K | Não vi na lista de componentes nem nas páginas consultadas. | idem | médio (ausência observada, não afirmada pelo site) |
| Ômega-3 separado (EPA, DHA, ALA) | Não vi nas páginas de alimento; a base principal mostra poli-insaturados totais. Pode existir em outra consulta do site. | idem | baixo |
| Dado analítico brasileiro ou emprestado | O site descreve duas bases: uma com dados analíticos originais (biodiversidade e regionais) e outra, dos alimentos mais consumidos, montada por análise direta e por compilação de publicações, teses, laudos de indústria "e outras tabelas". Há "valor estimado", obtido por cálculo a partir de alimentos semelhantes, e itens marcados "(dado importado)". | página inicial ("Apresentação", "Critérios Adotados"); vi "(dado importado)" no óleo de gergelim e no tahini | alto para a descrição geral. Qual valor de B12, D ou folato é analítico em cada alimento: NÃO VERIFICADO |
| Dá para baixar a base em planilha | Não. Para download só há tabelas complementares em PDF (carboidratos, resposta glicêmica, flavonoides, vitamina A). A base da POF é enviada a pesquisadores mediante termo de confidencialidade. Os links das páginas de alimento são cifrados, o que impede montar endereço pelo código. | página inicial ("Informações Gerais e Downloads", "Como Citar") | alto |
| Licença | "É estimulada a divulgação de dados, sem fins comerciais, sendo necessário citar a fonte." "Para fins comerciais, é necessário contatar os coordenadores." "Não é permitida a reprodução total ou parcial do material." "Não é permitido a alteração total ou mesmo parcial do conteúdo." Registro sob a Lei 9.610/1998. | página inicial ("Como Citar", "Registro da Obra") | alto |
| Citação pedida | Tabela Brasileira de Composição de Alimentos (TBCA). Universidade de São Paulo (USP). Centro de Pesquisa em Alimentos (FoRC). Versão 7.3. São Paulo, 2025. Disponível em http://www.fcf.usp.br/tbca. | idem | alto |

**Vale trocar o USDA pela TBCA até segunda?** Opções:

| Opção | O que envolve | Risco |
|---|---|---|
| A. Não trocar; anotar a limitação no texto do app | Ajustar a frase da tela Plano: B12, D, E, K e folato vêm de tabela americana; alimentos fortificados diferem entre países; onde não há dado, o app soma zero. | Nenhum de prazo. O ferro do pão francês continua subestimado. |
| B. Corrigir à mão poucos valores com a TBCA, citando a fonte | Ferro do pão francês (4,33 mg/100 g). Eventualmente folato do pão francês (149 µg). Uma exceção documentada no `gerar_alimentos.py`. | Baixo. Uso pontual, não comercial, com citação; ainda assim os termos do site dizem "não é permitida a reprodução total ou parcial", e a interpretação disso para dois números cabe à direção. |
| C. Trocar todos os valores de B12, D, E, folato para a TBCA | 72 consultas manuais, página a página, com correspondência de alimento e preparo; sem vitamina K. | Alto para o prazo; conflito provável com os termos de uso; sem ganho claro, porque parte dos valores da TBCA também é compilada de outras tabelas. |

A opção A cabe no prazo sem risco; a B acrescenta uma correção que muda o número de ferro em qualquer dia com pão francês. A C não cabe até segunda. Decisão da direção, por mexer em número de saúde.

### 6.4 Selênio da castanha-do-pará

| Dado | Valor | Fonte | Confiança |
|---|---|---|---|
| TBCA 7.3, castanha-do-brasil crua | 3.382 µg/100 g | TBCA, código BRC0003U | alto |
| USDA SR Legacy, "Nuts, brazilnuts, dried, unblanched" | 1.917 µg/100 g | arquivo local `dados/fontes/usda_sr_legacy.zip`, fdc_id 170569, nutriente 1103 | alto |
| Peso de uma castanha | 4 g | IBGE, código 6600701 (Pinheiro) | alto |
| Selênio por castanha de 4 g | cerca de 135 µg (TBCA) ou 77 µg (USDA) | conta minha | alto para a conta |
| Variação por origem | Mediana de 2,07 mg/kg (Mato Grosso) a 68,15 mg/kg (Amazonas). Uma castanha fornece de 11% a 288% da necessidade diária de um homem adulto (70 µg), ou seja, cerca de 8 a 200 µg. | Silva Junior et al., "Natural variation of selenium in Brazil nuts and soils from the Amazon region", Chemosphere 188:650-658, 2017. https://repositorio.unesp.br/handle/11449/163410 | médio (resumo via busca; não abri o artigo) |
| Mesma faixa convertida para 4 g | cerca de 8 a 273 µg por castanha | conta minha a partir das medianas | médio |
| Limite superior tolerável, Europa | 255 µg/dia para adultos, incluindo gestantes e lactantes; efeito crítico: queda de cabelo; derivado de 330 µg/dia no estudo SELECT com fator 1,3. O parecer cita "consumidores regulares de castanha-do-brasil" como grupo que pode passar do limite. | EFSA, Scientific opinion on the tolerable upper intake level for selenium, EFSA Journal 2023;21(1):e07704 | médio (resumo via busca) |
| Limite superior tolerável, EUA | 400 µg/dia para adultos (IOM, 2000) | a página do NIH recusou o acesso | NÃO VERIFICADO hoje (valor amplamente citado) |
| Recomendação diária de selênio | 55 µg/dia para adultos | idem | NÃO VERIFICADO hoje |
| A TACO traz selênio | Não: o arquivo local não tem campo de selênio. | `dados/fontes/taco.json` | alto |

Leitura para o cardápio ("Uma castanha-do-pará por dia basta"; aparece em pelo menos dois dias, 4 g cada):
- Pela média da TBCA, uma castanha entrega cerca de 135 µg: acima da recomendação diária citada e abaixo dos dois limites.
- Pela faixa do estudo brasileiro, uma castanha de região de solo rico pode passar de 200 µg, perto ou acima do limite europeu de 255 µg quando somada ao resto da alimentação (o pão francês tem 7,3 µg/100 g na TBCA, o gergelim 34,7).
- O rótulo não informa a origem nem o teor.
- O app não soma selênio. A frase atual está correta no sentido de "não coma mais que isso", mas não diz por quê.
- Opções de texto para a direção: (a) manter; (b) acrescentar que a castanha é muito rica em selênio, que o teor varia conforme a região, e que por isso a sugestão é uma unidade e não um punhado; (c) além disso, dizer que quem toma suplemento com selênio deve comentar com o médico ou nutricionista. Texto de saúde: sobe para a direção, com as fontes acima.

---

## 7. O que não consegui verificar

- Qual das duas afirmações oficiais sobre instalação por arquivo no Brasil está valendo hoje (seção 3.4). Só um teste no aparelho responde.
- Nada de Android foi compilado ou executado: os esqueletos das seções 3.1, 3.2, 3.3 e 3.5, o tema escuro (2.5) e o comportamento com fonte grande (2.4).
- Se os dados de WebView entram de fato no Auto Backup e se a restauração e a transferência entre aparelhos funcionam para app fora da loja (3.2).
- Regra de assinatura na restauração do backup (3.2).
- Diferença entre "limpar cache" e "limpar dados" para `app_webview` em fonte oficial (3.5).
- Restrições de Xiaomi e Motorola; alarmes após atualização do app; alarmes após "forçar parada" antes do Android 15 (3.1).
- Resultados de Jakob 2022 e de Patel 2019; detalhes de Eikey e Reddy 2017; a lista de recomendações de Rubino 2020; documento da Abeso sobre "pessoa com obesidade" (seção 1).
- Diretriz da Apple de 44 pt e piso de 12sp para fonte (seção 2).
- Guia da ANPD sobre o art. 4º, I; texto da Resolução CD/ANPD 2/2022 no original; política da loja para apps de saúde (seção 4).
- Livro de Pinheiro no original, Guia Alimentar 2014, manual fotográfico, RDC 429/2020 e IN 75/2020; rótulos atuais de lata e pote; 67 dos 72 alimentos na TBCA (seção 5).
- Texto da RDC 604/2022 e valores da RDC 344/2002; afirmação da própria TACO sobre fortificação; origem (analítica ou compilada) de cada valor de vitamina na TBCA; limite de 400 µg e recomendação de 55 µg de selênio em fonte primária (seção 6).

Os arquivos baixados para esta pesquisa (dado não confiável, não executado) ficaram numa pasta temporária da sessão, fora do projeto: PDF do IBGE, PDF de perguntas e respostas da Anvisa, texto da LGPD e cópias em texto das páginas de developer.android.com e da TBCA. O caminho foi informado ao chefe de pesquisa. Para refazer a tabela da seção 5, basta baixar de novo o PDF do IBGE pelo link da seção 5.1.
