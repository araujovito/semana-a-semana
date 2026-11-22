# Pesquisa de literatura: o que os estudos e as bulas dizem, e o que muda no app

Data: 20/11/2026. Autor: pesquisador de literatura. Arquivos conferidos: `app/conteudo.js` (GUIA e TREINO.regras) e `metas()` em `app/app.js`.

## Conclusão (o que muda no app)

1. **A bula brasileira oficial foi aberta e lida inteira** (paciente, profissional e instruções de uso; aprovada pela Anvisa em 22/04/2026, baixada do site da Lilly Brasil). Doses, aplicação, janela de 4 dias (96 h), intervalo de 3 dias (72 h) e "21 dias abaixo de 30 °C" **conferem** com ela.
2. **Anticoncepcional: a atribuição está incompleta.** A própria bula brasileira traz a orientação das 4 semanas de método de barreira. A Febrasgo (03/07/2025) diz o mesmo. Trocar "Febrasgo e bula americana" por "bula brasileira e Febrasgo". A bula europeia (EMA) é a que diverge: não pede método de barreira.
3. **Amamentação: a frase do app está errada em parte.** A bula brasileira não proíbe: diz que o uso depende de avaliação do médico. Gravidez: a bula manda parar pelo menos 1 mês antes de uma gravidez planejada; o app não diz esse prazo.
4. **Apresentação vendida no Brasil:** a bula no site da Lilly Brasil só lista caneta de uso único (caixa com 4), nas seis concentrações. A caneta multidose (KwikPen) foi registrada na Anvisa em 03/2026 segundo a imprensa, mas não achei bula brasileira dela nem confirmação de venda. O texto de armazenamento do app serve para a caneta de uso único; para a multidose o prazo (bulas dos EUA e da Europa) é 30 dias após o primeiro uso.
5. **"O remédio também reduz a sede" não tem fonte para tirzepatida.** O artigo citado pelo app não fala em sede. Há um ensaio pequeno com outro remédio da classe (dulaglutida) em que as pessoas beberam menos, sem mudança na sensação de sede. Proponho reescrever.
6. **Meta de água de 2.000 ml está no limite de baixo.** A revisão de Almandoz (2024) fala em "mais de 2 a 3 litros por dia". O artigo de Mozaffarian (2025) não dá número de líquidos nem de fibra.
7. **Proteína: 1,2 a 1,6 g/kg e 80 a 120 g/dia conferem com o artigo**, mas ele diz que não há consenso sobre qual peso usar e que proteína sem treino de força provavelmente não basta. A fórmula do app (peso de IMC 25 + 25% do excesso) existe na prática de nutrição hospitalar, não na literatura desses remédios. Há um **degrau no código**: em IMC 29,9 usa o peso real e em IMC 30,0 passa ao ajustado (para 1,60 m, a meta cai de 107 g para 94 g de um dia para o outro).
8. **Treino "pelo menos 3 vezes por semana" confere** com o artigo, mas é opinião de especialistas. O que foi testado em ensaio foi exercício com liraglutida, não com tirzepatida.
9. **Lista de micronutrientes confere** palavra por palavra. A **lista de exames** (hemograma, ferritina, B12, vitamina D) **não está no artigo citado**: ele só fala em reavaliar nutrientes "por métodos clinicamente aceitos".
10. **Sinais de alerta conferem com a bula.** Faltam dois itens que a bula brasileira traz: perda súbita de visão em qualquer pessoa (não só em quem tem diabetes) e o aviso de desnutrição.
11. **Números novos e úteis para o guia:** cerca de 25% do peso perdido é massa magra (subestudo DXA do SURMOUNT-1); ao parar, só 17% mantiveram pelo menos 80% da perda em um ano (SURMOUNT-4); 4% a 7% param por efeito adverso; enjoo em 25% a 29%.
12. **Anestesia:** nota da Sociedade Brasileira de Anestesiologia de 15/05/2026 (com SBD e Abeso) muda a conduta antiga de suspender por 15 a 21 dias. Só li fonte secundária; o texto do app ("avisar; eles dizem se é preciso pausar") continua adequado.
13. **Não consegui:** bulário da Anvisa (bloqueio 403), texto integral dos ensaios no NEJM/Lancet/JAMA (só resumos), texto integral de Wharton 2022 e Almandoz 2024, curva de peso nas semanas 4, 12 e 24, e a errata de 2026 do artigo de Mozaffarian.

## Como ler este relatório

Grau de confiança: **alto** = li na fonte primária; **médio** = fonte secundária confiável citando a primária, ou só o resumo do artigo; **baixo** = não consegui confirmar.

Fontes e o que foi aberto (as siglas são usadas nas tabelas):

| Sigla | Fonte | O que abri | Link |
|---|---|---|---|
| BULA-BR | Mounjaro, bula do paciente, Eli Lilly do Brasil, aprovada pela Anvisa em 22/04/2026 (CDS12FEV26) | Texto integral (PDF oficial, via página "Medicamentos aprovados" da Lilly Brasil) | https://www.lilly.com/br/medicamentos/medicamentos-aprovados (arquivo MOUNJARO_IRMA_LIT_PAT_22APR26.pdf) |
| BULA-BR-PRO | Mounjaro, bula do profissional, mesma data | Texto integral | mesma página (MOUNJARO_IRMA_LIT_HCP_22APR26.pdf) |
| IFU-BR | Instruções de uso da caneta de uso único, Lilly Brasil | Texto integral | mesma página (Mounjaro_IFU_uso_Paciente.pdf) |
| ZEP-EUA | Zepbound, bula americana (revisão 11/2026) | Texto integral | https://pi.lilly.com/us/zepbound-uspi.pdf |
| MJ-EUA | Mounjaro, bula americana | Baixada; usei só para conferência pontual | https://pi.lilly.com/us/mounjaro-uspi.pdf |
| EMA | Mounjaro, texto europeu (SmPC e folheto) | Texto integral das seções citadas | https://www.ema.europa.eu/en/documents/product-information/mounjaro-epar-product-information_en.pdf |
| MOZ | Mozaffarian D et al. Nutritional priorities to support GLP-1 therapy for obesity. Obesity 2025;33(8):1475-1503 | Texto integral (versão da revista Obesity, pelo Europe PMC, PMC12304835) | https://pmc.ncbi.nlm.nih.gov/articles/PMC12304835/ · doi:10.1002/oby.24336 |
| ALM | Almandoz JP et al. Nutritional considerations with antiobesity medications. Obesity 2024;32(9):1613-1631 | Só o resumo. Números tirados do comunicado da The Obesity Society (fonte secundária) | https://pubmed.ncbi.nlm.nih.gov/38853526/ · https://www.obesity.org/experts-develop-nutritional-recommendations-for-patients-treated-with-anti-obesity-medications/ |
| SM1 | Jastreboff AM et al. Tirzepatide once weekly for the treatment of obesity (SURMOUNT-1). N Engl J Med 2022 | Só o resumo (NEJM devolveu erro 403) | https://pubmed.ncbi.nlm.nih.gov/35658024/ · doi:10.1056/NEJMoa2206038 |
| SM1-3A | Jastreboff AM et al. Tirzepatide for obesity treatment and diabetes prevention (SURMOUNT-1, 3 anos). N Engl J Med 2025 | Só o resumo | https://pubmed.ncbi.nlm.nih.gov/39536238/ · doi:10.1056/NEJMoa2410819 |
| SM1-DXA | Look M et al. Body composition changes during weight reduction with tirzepatide in the SURMOUNT-1 study. Diabetes Obes Metab 2025 | Texto integral | https://pmc.ncbi.nlm.nih.gov/articles/PMC11965027/ · doi:10.1111/dom.16275 |
| SM2 | Garvey WT et al. SURMOUNT-2. Lancet 2023 | Só o resumo | https://pubmed.ncbi.nlm.nih.gov/37385275/ |
| SM3 | Wadden TA et al. SURMOUNT-3. Nat Med 2023 | Texto integral | https://pmc.ncbi.nlm.nih.gov/articles/PMC10667099/ |
| SM4 | Aronne LJ et al. SURMOUNT-4. JAMA 2024;331(1):38-48 | Só o resumo (o PMC não liberou o texto por API); números também na BULA-BR-PRO | https://pmc.ncbi.nlm.nih.gov/articles/PMC10714284/ |
| SM4-PH | Horn DB et al. Análise pós-hoc do SURMOUNT-4. JAMA Intern Med 2026 | Só o resumo | https://pmc.ncbi.nlm.nih.gov/articles/PMC12645400/ |
| SM5 | Aronne LJ et al. Tirzepatide as compared with semaglutide (SURMOUNT-5). N Engl J Med 2025 | Só o resumo | https://pubmed.ncbi.nlm.nih.gov/40353578/ |
| RUB | Rubino DM et al. Gastrointestinal tolerability... SURMOUNT-1 to -4. Diabetes Obes Metab 2025 | Texto integral | https://pmc.ncbi.nlm.nih.gov/articles/PMC11885085/ |
| KOK | Kokkinos A et al. Early weight response, SURMOUNT-1 e -2. Diabetes Obes Metab 2026 | Texto integral (trechos) | https://pmc.ncbi.nlm.nih.gov/articles/PMC13448863/ |
| HORN | Horn DB et al. Time to weight plateau, SURMOUNT-1 e -4. Clin Obes 2025 | Só o resumo | https://pmc.ncbi.nlm.nih.gov/articles/PMC12096058/ |
| GOR | Gorgojo-Martínez JJ et al. Clinical recommendations to manage gastrointestinal adverse events... J Clin Med 2023;12(1):145 | Texto integral | https://pmc.ncbi.nlm.nih.gov/articles/PMC9821052/ |
| WHA | Wharton S et al. Managing the gastrointestinal side effects of GLP-1 receptor agonists in obesity. Postgrad Med 2022 | Só o resumo (a revista devolveu erro 403) | https://pubmed.ncbi.nlm.nih.gov/34775881/ |
| FEB | Febrasgo. Recomendações sobre medicamentos emagrecedores e anticoncepcionais orais, 03/07/2025 | Página aberta (resumo com trechos literais) | https://www.febrasgo.org.br/noticia/recomendacoes-da-febrasgo-sobre-medicamentos-emagrecedores-e-anticoncepcionais-orais/ |
| DGA | Dietary Guidelines for Americans 2020-2025, Tabela A1-2 (reproduz as DRIs do Institute of Medicine) | Tabela lida | https://www.dietaryguidelines.gov/sites/default/files/2020-12/Dietary_Guidelines_for_Americans_2020-2025.pdf |

Limitações que valem para tudo:

- O bulário eletrônico da Anvisa respondeu "Sua solicitação foi bloqueada por uma regra de segurança HTTP 403". Não tentei contornar. A bula usada é a do site da Lilly Brasil, que traz a frase "Esta bula foi aprovada pela Anvisa em 22/04/2026". A própria Lilly avisa que o bulário da Anvisa pode ter versão mais nova.
- O artigo de Mozaffarian tem uma errata publicada em 2026 (Obesity 2026;34(7):1516, doi:10.1002/oby.70222). Não consegui ler o conteúdo dela. Não sei qual número ela corrige.
- A pasta temporária é compartilhada com outros agentes. Um script auxiliar meu de busca foi sobrescrito por outro de mesmo nome durante o trabalho. Só afetou o formato de uma listagem de resumos; refiz as buscas numa pasta separada. Nenhum dado deste relatório veio daquela listagem.

---

## 1. Ensaios SURMOUNT e SURPASS

### 1.1 Perda de peso por dose (evidência de ensaio)

| Ensaio | População | Tempo | 5 mg | 10 mg | 15 mg | Placebo | Fonte | Confiança |
|---|---|---|---|---|---|---|---|---|
| SURMOUNT-1 | 2.539 adultos sem diabetes, peso médio 104,8 kg, IMC 38,0 | 72 sem | −15,0% | −19,5% | −20,9% | −3,1% | SM1 (resumo; análise "regime de tratamento") | médio |
| SURMOUNT-1, mesma coisa na bula | idem | 72 sem | −16,0% (−16,1 kg) | −21,4% (−22,2 kg) | −22,5% (−23,6 kg) | −2,4% | BULA-BR-PRO, Tabela 7 (análise "eficácia", só quem seguiu o tratamento) | alto |
| SURMOUNT-1, 3 anos | 1.032 com pré-diabetes | 176 sem | −12,3% | −18,7% | −19,7% | −1,3% | SM1-3A (resumo) | médio |
| SURMOUNT-2 | 938 adultos com diabetes tipo 2, peso 100,7 kg | 72 sem | não testada | −12,8% | −14,7% | −3,2% | SM2 (resumo) | médio |
| SURMOUNT-3 | 579 adultos que já tinham perdido 6,9% em 12 semanas de programa intensivo | 72 sem depois | dose máxima tolerada (10 ou 15 mg): −18,4% a mais; total −24,3% | | | +2,5%; total −4,5% | SM3 (texto integral) | alto |
| SURMOUNT-4 | 670 adultos sem diabetes, 107,3 kg | 36 sem (fase aberta) | dose máxima tolerada: −20,9% | | | não havia | SM4 (resumo) | médio |
| SURMOUNT-5 | 751 adultos sem diabetes | 72 sem | dose máxima tolerada: −20,2% (semaglutida: −13,7%) | | | não havia | SM5 (resumo) | médio |
| SURPASS-1 (diabetes) | 478 adultos, 85,9 kg | 40 sem | −7,0 kg | −7,8 kg | −9,5 kg | −0,7 kg | BULA-BR-PRO | alto |
| SURPASS-2 (diabetes) | versus semaglutida 1 mg | 40 sem | −7,8 kg | −10,3 kg | −12,4 kg | semaglutida −6,2 kg | BULA-BR-PRO | alto |

Por que há dois números para o SURMOUNT-1: o artigo conta todo mundo, inclusive quem parou o remédio; a bula mostra a análise de quem continuou. Para texto de app, o do artigo (−15%, −19,5%, −20,9%) é o mais conservador.

Proporção que perdeu pelo menos 5% em 72 semanas (SURMOUNT-1): 85%, 89% e 91% com 5, 10 e 15 mg; 35% com placebo (SM1, resumo, médio). Perderam 20% ou mais: 50% (10 mg) e 57% (15 mg); 3% com placebo.

Resposta individual varia. Mulheres tiveram 2,4 vezes mais chance de perder 20% com tirzepatida (MOZ, seção "Efficacy", citando análise multivariada; médio).

### 1.2 Curva no tempo

| Semana | O que achei | Fonte | Confiança |
|---|---|---|---|
| 4 | NÃO VERIFICADO. Só aparece em figura do NEJM, que não abriu | | baixo |
| 8 | SURMOUNT-1: −7,9% em quem respondeu cedo (perdeu 5% ou mais até ali) e −3,1% nos demais. Na semana 8 todos estavam há 4 semanas em 5 mg | KOK, texto integral | alto |
| 12 | NÃO VERIFICADO | | baixo |
| 20 | Fim do escalonamento no SURMOUNT-1 e -2 (2,5 mg a mais a cada 4 semanas) | BULA-BR-PRO | alto |
| 24 | NÃO VERIFICADO em número. Mediana do tempo até o platô: 24,3 semanas (sobrepeso), 26,0 (obesidade grau I), 36,1 (graus II e III) | HORN, resumo | médio |
| 36 | −20,9% com 10 ou 15 mg (SURMOUNT-4, fase aberta) | SM4, resumo | médio |
| 72 | Ver tabela 1.1. Cerca de 88% a 90% já tinham chegado ao platô | HORN, resumo | médio |
| 88 | −25,3% em quem continuou (SURMOUNT-4) | SM4, resumo | médio |
| 176 | −12,3%, −18,7%, −19,7% | SM1-3A, resumo | médio |

O artigo de Mozaffarian resume assim (opinião de revisão, seção "Efficacy"): a perda é mais rápida nos primeiros 6 meses, desacelera e tende a estabilizar por volta de 18 meses.

Conta minha, a partir de SM4: 20,9% de 107,3 kg são 22,4 kg em 36 semanas, média de 0,62 kg por semana (0,58% do peso inicial por semana). É média de grupo; não é meta.

### 1.3 Efeitos adversos por dose (evidência de ensaio)

Fonte: ZEP-EUA, Tabela 1, soma de SURMOUNT-1 e SURMOUNT-2, 2.519 pessoas tratadas, até 72 semanas. Texto integral. Confiança alta.

| Efeito | Placebo | 5 mg | 10 mg | 15 mg |
|---|---|---|---|---|
| Náusea | 8% | 25% | 29% | 28% |
| Diarreia | 8% | 19% | 21% | 23% |
| Vômito | 2% | 8% | 11% | 13% |
| Constipação | 5% | 17% | 14% | 11% |
| Dor abdominal | 5% | 9% | 9% | 10% |
| Dispepsia | 4% | 9% | 9% | 10% |
| Reação no local da injeção | 2% | 6% | 8% | 8% |
| Cansaço | 3% | 5% | 6% | 7% |
| Arroto | 1% | 4% | 5% | 5% |
| Queda de cabelo | 1% | 5% | 4% | 5% |
| Refluxo | 2% | 4% | 4% | 5% |
| Tontura | 2% | 4% | 5% | 4% |
| Qualquer efeito gastrointestinal | 30% | 56% | 56% | 56% |
| Efeito gastrointestinal grave | 1% | 1,7% | 2,5% | 3,1% |

Outros números da mesma bula (alto):

- Colelitíase (pedra na vesícula): 1,1% com tirzepatida, 1,0% com placebo. Colecistite: 0,7% contra 0,2%. Retirada da vesícula: 0,2% contra 0. "Acute gallbladder events were associated with weight reduction."
- Pancreatite aguda confirmada: 0,2% contra 0,2% (0,14 contra 0,15 por 100 pessoas-ano). Nos estudos de diabetes: 0,23 contra 0,11 por 100 pessoas-ano.
- Hipotensão: 1,6% contra 0,1%.

Em quem já tinha feito 12 semanas de programa intensivo (SURMOUNT-3, texto integral, alto) as taxas foram mais altas: náusea 39,7%, diarreia 31,0%, constipação 23,0%, vômito 18,1%, reação no local 11,1%, queda de cabelo 7,0%, colelitíase 1,4% (placebo 1,0%), pancreatite 0,3% (placebo 0,3%).

Bula brasileira (BULA-BR, seção 8, alto): náusea e diarreia são "muito comuns" (mais de 10%); nos estudos de peso também vômito e constipação. Queda de cabelo, tontura, hipotensão e colelitíase são "comuns" (1% a 10%). Pancreatite aguda é "incomum" (0,1% a 1%).

### 1.4 Quando os efeitos aparecem

- "A incidência de náusea, vômito e diarreia foi maior durante o período de aumento de dose e diminuiu com o tempo" (BULA-BR, seção 8). Alto.
- "The majority of nausea, vomiting, and/or diarrhea events occurred during dose escalation and decreased over time" (ZEP-EUA 6.1). Alto.
- No SURMOUNT-1 de 3 anos, os eventos se concentraram "in the first 20 weeks" (SM1-3A, resumo). Médio.
- O primeiro uso de remédio para enjoo ou diarreia foi mais frequente nas primeiras 24 semanas (RUB, texto integral). Alto.
- O atraso do esvaziamento do estômago "is largest after the first dose and this effect diminishes over time" (ZEP-EUA 12.2). Alto.
- Não achei dado de ensaio dizendo que o enjoo vem "nos dias seguintes à aplicação". Isso é observação clínica. MOZ diz que o enjoo "often occurs in the morning or after longer periods without eating" (opinião).

### 1.5 Quem para por efeito adverso (evidência de ensaio)

| Ensaio | Tirzepatida | Placebo | Fonte | Confiança |
|---|---|---|---|---|
| SURMOUNT-1 | 4,3% (5 mg), 7,1% (10 mg), 6,2% (15 mg) | 2,6% | SM1, resumo | médio |
| SURMOUNT-1 + 2 | 4,8%, 6,3%, 6,7% | 3,4% | ZEP-EUA 6.1 | alto |
| Só por efeito gastrointestinal | 1,9%, 3,3%, 4,3% | 0,5% | ZEP-EUA 6.1 | alto |
| SURMOUNT-3 | 10,5% | 2,1% | SM3 | alto |
| SURMOUNT-4, fase aberta de 36 semanas | 7% | não havia | ZEP-EUA 6.1 | alto |
| SURMOUNT-5 | NÃO VERIFICADO (resumo não traz) | | | baixo |

A maioria dos que pararam parou nos primeiros meses, por efeito gastrointestinal (ZEP-EUA 6.1, alto). Fora dos ensaios, a interrupção por qualquer motivo é muito maior: 50% a 67% em 1 ano e 85% em 2 anos (MOZ, "Introduction", dados dos EUA; médio). O motivo mais comum lá é custo.

### 1.6 Massa magra (evidência de ensaio)

Subestudo DXA do SURMOUNT-1 (SM1-DXA, texto integral, alto). 160 pessoas (124 com tirzepatida, 36 com placebo), 73% mulheres, peso médio 102,5 kg.

| Medida, em 72 semanas | Tirzepatida | Placebo |
|---|---|---|
| Peso | −21,3% | −5,3% |
| Massa gorda | −33,9% (−15,9 kg) | −8,2% (−3,6 kg) |
| Massa magra | −10,9% (−5,6 kg) | −2,6% (−1,2 kg) |
| Parte da perda que é gordura / massa magra | 74% / 26% | 75% / 25% |

A proporção foi parecida em mulheres (75% gordura) e homens (73%) e nas três faixas de idade. O subestudo não mediu força, nem proteína ingerida, nem treino. "Massa magra" no DXA inclui músculo, órgãos e água; não é só músculo. MOZ estima que músculo é cerca de metade da massa magra (opinião de revisão).

Observação: MOZ escreve que no SURMOUNT-1 a massa magra caiu "8.5 absolute percentage points". O artigo primário dá −10,9% com tirzepatida e diferença de −8,3 pontos em relação ao placebo. Use o número do artigo primário.

### 1.7 Reganho ao parar (evidência de ensaio)

SURMOUNT-4 (SM4, resumo; BULA-BR-PRO, Tabela 13, texto integral):

- 783 pessoas começaram; 670 chegaram à semana 36 com 10 ou 15 mg e foram sorteadas: 335 continuaram, 335 passaram a placebo por 52 semanas.
- Perda na fase aberta (36 semanas): 20,9%.
- Da semana 36 à 88: −5,5% em quem continuou; **+14,0%** em quem parou (SM4, resumo, médio). Na bula brasileira os mesmos dados aparecem como −6,7% e +14,8%, ou −5,7 kg e +11,9 kg (análise de eficácia; alto).
- Perda total da semana 0 à 88: 25,3% contra 9,9% (SM4, resumo).
- Mantiveram pelo menos 80% da perda: 89,5% de quem continuou contra **16,6%** de quem parou (SM4, resumo). Na bula: 93,4% contra 13,5%.
- "O peso corporal médio observado para os pacientes tratados com placebo foi menor na semana 88 do que no início" (BULA-BR-PRO). Ou seja: em média, um ano depois de parar, ainda havia perda de cerca de 10%.
- Análise pós-hoc (SM4-PH, resumo, médio): de 308 pessoas que tinham perdido 10% ou mais e pararam, 54 recuperaram menos de 25% do que perderam, 77 de 25% a 50%, 103 de 50% a 75% e 74 recuperaram 75% ou mais. Somando: 82% recuperaram pelo menos um quarto; 57% recuperaram pelo menos metade. Pressão, cintura e glicemia pioraram junto com o reganho.
- Todos continuaram recebendo orientação de dieta e atividade física (BULA-BR-PRO).

SURMOUNT-1, 3 anos: houve 17 semanas sem remédio depois das 176 semanas (SM1-3A, resumo). **Quanto de peso voltou nessas 17 semanas: NÃO VERIFICADO.** O resumo só dá diabetes (2,4% contra 13,7%). Uma busca devolveu um resumo de congresso com "72,9% tiveram reganho de 3% ou mais" e um site secundário com "cerca de 20% do peso perdido"; não confirmei nenhum dos dois na fonte e não recomendo usar.

MOZ (opinião de revisão, seção "Efficacy"): até dois terços do peso perdido volta em 1 ano depois de parar, mesmo com aconselhamento nutricional convencional.

---

## 2. Massa magra: proteína e treino de força

### 2.1 O que é ensaio

| Afirmação | Fonte | O que abri | Confiança |
|---|---|---|---|
| Com tirzepatida, 26% da perda foi massa magra, igual à proporção do placebo (25%) | SM1-DXA | integral | alto |
| Com liraglutida, 1 ano de programa de exercício somado ao remédio reduziu a gordura corporal em 3,9 pontos percentuais, cerca do dobro de exercício só (1,7) ou remédio só (1,9). 195 adultos, depois de 8 semanas de dieta de 800 kcal | Lundgren JR et al., N Engl J Med 2021; https://pubmed.ncbi.nlm.nih.gov/33951361/ | resumo | médio |
| No mesmo ensaio, quem só usou liraglutida perdeu densidade óssea no quadril e na coluna em comparação com quem só fez exercício; a combinação manteve o osso igual ao placebo | Jensen SBK et al., JAMA Netw Open 2024; https://pubmed.ncbi.nlm.nih.gov/38916894/ | resumo | médio |
| Perder peso devagar ou depressa (mesma perda total): sem diferença significativa em massa livre de gordura; quem perdeu devagar perdeu mais gordura e preservou mais o gasto de repouso | Ashtary-Larky D et al., Br J Nutr 2020 (meta-análise); https://pubmed.ncbi.nlm.nih.gov/32576318/ | resumo | médio |

**Não achei ensaio randomizado de treino de força nem de quantidade de proteína em pessoas usando tirzepatida.** O ensaio com exercício é com liraglutida, e o programa era aeróbico moderado a vigoroso combinado, não só força. O resumo não detalha frequência.

### 2.2 O que é opinião de especialista ou consenso

| Recomendação | Fonte e seção | Confiança de que o texto diz isso |
|---|---|---|
| Proteína de 1,2 a 1,6 g/kg/dia "have also been proposed during active weight reduction" | MOZ, "Preservation of muscle and bone mass" | alto |
| "it is unclear whether these goals should be based on actual body weight, corrected (adjusted or ideal) body weight, or fat-free mass, as the use of actual weight can significantly overestimate protein requirements" | MOZ, mesma seção | alto |
| 1,5 g por kg de massa livre de gordura "is considered more accurate but requires body composition data" | MOZ | alto |
| Alternativa: "an absolute protein target of 80–120 g/day, or 16%–24% energy on a 2000 kcal/d diet" | MOZ | alto |
| Piso: não abaixo de 0,4 a 0,5 g/kg/dia. Teto: evitar 2 g/kg/dia ou mais por tempo prolongado | MOZ | alto |
| "increased protein intake alone is likely inadequate to support the preservation of muscle mass in the absence of structured resistance/strength training" | MOZ | alto |
| "regular strength training at least three times weekly plus at least 150 min of moderate-intensity aerobic exercise weekly" | MOZ | alto |
| Estudo retrospectivo com 360 min/semana com ênfase em força preservou massa livre de gordura | MOZ (cita estudo observacional) | alto para o texto; evidência fraca |
| Mais de 60 a 75 g de proteína por dia e 0,8 a 1,5 g/kg/dia; acima de 1,5 g/kg caso a caso | ALM, via comunicado da The Obesity Society | médio |
| A perda de massa magra relatada com a classe varia de 15% ou menos até 40% a 60% do peso perdido, conforme o estudo | Neeland IJ et al., Diabetes Obes Metab 2024; https://pubmed.ncbi.nlm.nih.gov/38937282/ (resumo) | médio |

**Distribuição por refeição (gramas por refeição): o artigo de Mozaffarian não dá número.** Diz só para comer a proteína primeiro na refeição e fazer refeições pequenas e regulares. O valor de 20 a 30 g por refeição que circula vem de estudos de síntese proteica em pessoas saudáveis e idosos, fora do contexto desses remédios. Não abri essas fontes hoje. Se o app for dar número por refeição, marque como extrapolado.

**Frequência de força:** as diretrizes gerais de atividade física falam em 2 ou mais dias por semana (OMS 2020; não reabri hoje, confiança média). O "pelo menos 3" é do consenso de Mozaffarian.

### 2.3 A fórmula de peso ajustado do app

O app usa: se IMC ≥ 30, peso de referência = peso de IMC 25 + 25% do que passa disso.

- **Na literatura desses remédios não há fórmula recomendada.** MOZ diz que não há consenso (acima).
- **A fórmula existe na nutrição hospitalar.** A diretriz europeia de terapia intensiva (ESPEN 2019) usa "adjusted body weight (actual body weight − ideal body weight) × 0.25 + ideal body weight" e proteína de 1,3 g/kg desse peso. Fonte: Dickerson RN et al., Crit Care 2022;26:283, Tabela 1 (https://pmc.ncbi.nlm.nih.gov/articles/PMC9486775/), fonte secundária que li em parte. Confiança média. O mesmo artigo nota que nenhuma diretriz define qual "peso ideal" usar. Uma busca achou um levantamento de nutricionistas da Austrália e Nova Zelândia que define peso ajustado como "weight at BMI 25 kg/m² + 25% excess weight", igual ao app; não abri esse levantamento (confiança baixa).
- **Alternativas citadas:** (a) 1,5 g por kg de massa livre de gordura, se houver bioimpedância (MOZ); (b) meta absoluta de 80 a 120 g/dia (MOZ); (c) mais de 60 a 75 g/dia (ALM, secundária).
- **Problema de código, não de literatura:** o corte em IMC 30 cria um degrau. Altura 1,60 m: com 76,5 kg (IMC 29,9) a meta é 1,4 × 76,5 = 107 g; com 76,8 kg (IMC 30,0) passa a 1,4 × 67,2 = 94 g. Uma usuária perto de IMC 30 veria a meta pular 13 g ao perder ou ganhar 300 g. Opções: aplicar o ajuste a partir de IMC 25 (fica contínuo); ou manter o peso real e limitar a meta à faixa 80 a 120 g; ou manter como está e aceitar o degrau.

---

## 3. Micronutrientes, exames e suplementos

### 3.1 O que está documentado

| Afirmação | Fonte | O que abri | Confiança |
|---|---|---|---|
| Em 461.382 adultos que começaram um agonista de GLP-1 (80,5% com diabetes tipo 2), 12,7% receberam diagnóstico de deficiência nutricional em 6 meses e 22,4% em 12 meses. Vitamina D foi a mais comum: 7,5% e 13,6% | Scott Butsch W et al., Obes Pillars 2025; https://pmc.ncbi.nlm.nih.gov/articles/PMC12205620/ | resumo | médio |
| Limite desse estudo: dados de plano de saúde, observacional, maioria com diabetes; diagnóstico depende de alguém pedir o exame | idem | resumo | médio |
| "Desnutrição: foram reportados eventos relacionados a desnutrição, incluindo eventos graves... deficiência de vitaminas e minerais, deficiência de proteínas e baixo peso corporal. Suporte nutricional balanceado deve ser considerado." | BULA-BR-PRO, Advertências | integral | alto |
| Esses remédios reduzem a ingestão de energia em 16% a 39% | MOZ, "Nutritional deficiencies" | integral | alto |
| Abaixo de 1.200 kcal/dia (mulheres) e 1.800 kcal/dia (homens) a ingestão de vitaminas e minerais pode ficar insuficiente | MOZ, mesma seção | integral | alto (é afirmação de revisão, com referência) |
| Nutrientes de atenção: "iron, calcium, magnesium, zinc, and vitamins A, D, E, K, B1, B12, and C" | MOZ, mesma seção | integral | alto |
| Dietas de 1.200 a 1.500 kcal: MOZ não traz estudo específico. O SURMOUNT-3 usou 1.200 kcal (mulheres) e 1.500 kcal (homens) na fase de programa intensivo | ZEP-EUA 14.1 | integral | alto |

### 3.2 Tabela obrigatória: todos os números de Mozaffarian et al. 2025

Versão lida: revista Obesity, texto integral em XML pelo Europe PMC (PMC12304835). O artigo foi publicado em conjunto em AJCN, Obesity Pillars, AJLM e Obesity; li só a de Obesity. É um documento de consenso de especialistas ("Advisory"), não um ensaio. Quando ele cita ensaio, digo.

| Tema | Número ou texto | Seção do artigo | Natureza |
|---|---|---|---|
| Perda de peso ajustada por placebo | 5% a 18% | Abstract; Introduction | resumo de ensaios |
| Perda nos ensaios originais | 5,3% a 17,8% em 56 a 72 semanas | Efficacy | ensaios |
| Tirzepatida 5 / 10 / 15 mg, 72 semanas | 15,0% / 19,5% / 20,9%; placebo 3,1% | Tabela 1 (o título diz "52 weeks", as notas dizem 72) | ensaio |
| Semaglutida 2,4 mg, 68 semanas | 14,9%; placebo 2,4% | Tabela 1 | ensaio |
| Liraglutida 3,0 mg, 56 semanas | 7,9%; placebo 2,6% | Tabela 1 | ensaio |
| Vida real, semaglutida | cerca de 8% (com diabetes) e 11% (sem), em 60 semanas | Efficacy | observacional |
| Ritmo | mais rápido nos 6 primeiros meses; platô relativo aos 18 meses; mantido por pelo menos 4 anos com uso contínuo | Efficacy | revisão |
| Reganho ao parar | até dois terços do peso perdido em 1 ano | Efficacy | revisão de ensaios |
| Resposta individual | de mínima a 30% ou mais; mulheres 2,4 vezes mais chance de perder 20% com tirzepatida | Efficacy | análise de ensaio |
| Uso nos EUA em 2024 | 6% dos adultos usando; 12% usando ou já usaram | Introduction | pesquisa |
| Interrupção na vida real | 50% a 67% em 1 ano; 85% em 2 anos | Introduction; Adherence and costs | observacional |
| Adesão nos ensaios | 83% a 88% em 66 a 68 semanas | Adherence and costs | ensaios |
| Náusea | 25% a 44% | Side effects | ensaios |
| Diarreia | 19% a 30% | Side effects | ensaios |
| Vômito | 8% a 24% | Side effects | ensaios |
| Constipação | 17% a 24% | Side effects | ensaios |
| Dor abdominal | 9% a 20% | Side effects | ensaios |
| Tirzepatida 15 mg contra placebo | náusea 28/8; diarreia 23/8; vômito 13/2; constipação 11/5; dor abdominal 10/5; dispepsia 10/4; cansaço 7/3; arroto 5/1; refluxo 5/2; queda de cabelo 5/1; tontura 4/2 (%) | Tabela 2 | ensaio |
| Parar por efeito gastrointestinal | menos de 10% | Side effects | ensaios |
| Redução da ingestão de energia | 16% a 39% | Nutritional deficiencies; Navigation of dietary preferences | ensaios |
| Calorias mínimas | risco de micronutrientes insuficientes "especially at energy intakes <1200 kcal/d for females and <1800 kcal/d for males" | Nutritional deficiencies | revisão |
| Micronutrientes de atenção | ferro, cálcio, magnésio, zinco, vitaminas A, D, E, K, B1, B12 e C | Nutritional deficiencies | revisão |
| Sinais de deficiência | cansaço além do esperado, queda de cabelo excessiva, pele descamando ou coçando, fraqueza muscular, cicatrização ruim, manchas roxas incomuns | Nutritional deficiencies | revisão |
| Massa magra, semaglutida (STEP 1) | de 13,6 kg perdidos, 8,3 kg (62%) gordura e 5,3 kg (38%) massa magra | Muscle and bone loss | ensaio |
| Músculo | cerca de metade da massa magra; logo cerca de 20% do peso perdido | Muscle and bone loss | estimativa dos autores |
| Massa magra, tirzepatida | "reduced by 8.5 absolute percentage points" (ver ressalva em 1.6) | Muscle and bone loss | ensaio, citado de forma imprecisa |
| Músculo por sexo, sem treino de força | 10% a 15% do peso perdido em mulheres; 20% a 25% em homens | Muscle and bone loss | modelagem |
| Osso | perda de peso de 14% ou mais em 3 a 4 meses se associa a perda óssea significativa | Muscle and bone loss | observacional |
| Custo nos EUA | US$ 12.000 a 16.000 por ano (lista); US$ 7.000 a 8.000 com descontos; manipulados US$ 1.800 a 3.000 | Adherence and costs | não se aplica ao Brasil |
| Programas de estilo de vida | ajudam a perder 5% a 10% | Guidelines and practice | revisão |
| Diretriz AHA/ACC/TOS 2013 | perda de 3% a 5% já traz benefício; pelo menos 14 sessões em 6 meses | Tabela 3 | diretriz |
| Escalonamento nos ensaios | permitido ficar até 8 semanas na mesma dose para os sintomas passarem | Management of GI side effects | ensaios |
| Náusea: manejo | refeições menores e mais frequentes; evitar comida gordurosa **ou rica em fibra** nos primeiros dias; café da manhã pequeno e depois refeições pequenas a cada 3 a 4 h; líquidos adequados; chá de gengibre ou hortelã; pulseira de acupressão; remédio para enjoo se preciso (preferir proclorperazina a ondansetrona, que prende o intestino) | Management of GI side effects | opinião |
| Náusea: quando | "often occurs in the morning or after longer periods without eating" | idem | opinião |
| Vômito | mais provável com refeições grandes | idem | opinião |
| Desidratação | pode causar lesão renal aguda e palpitações | idem | relatos pós-venda |
| Constipação: manejo | líquidos e fibra dos alimentos; alimentos com mais água; aumento gradual de fibra solúvel e insolúvel (ameixa seca e outras frutas secas); se não bastar, magnésio diário (citrato) ajustado, fibra em pó ou cápsula, polietilenoglicol 3350, amolecedor de fezes | idem | opinião |
| Constipação: alerta | constipação prolongada pode levar a diarreia reativa; alimentos ricos em proteína ou gordura retardam mais o esvaziamento e podem piorar | idem | opinião |
| Diarreia: manejo | evitar refeições grandes ou gordurosas; fibra em cápsula ou pó para dar volume; antidiarreico para alívio | idem | opinião |
| Álcool | "may also worsen nausea and gastroesophageal reflux... should be minimized" | idem | opinião |
| Refluxo | **nenhuma orientação específica além do álcool** | idem | ausência |
| Líquidos | **nenhum número.** Só "adequate fluids" e "Ensure adequate fluids" | Management of GI side effects; Tabela 6 | ausência |
| Fibra | **nenhum número em gramas** | | ausência |
| Sede | **nenhuma menção** | | ausência |
| Proteína, população geral | 0,8 g/kg/dia | Preservation of muscle and bone mass | DRI |
| Proteína durante a perda | 1,2 a 1,6 g/kg/dia ("proposed") | idem | opinião |
| Proteína, piso e teto | não abaixo de 0,4 a 0,5 g/kg/dia; evitar 2 g/kg/dia ou mais por tempo prolongado | idem | opinião |
| Proteína por massa magra | 1,5 g por kg de massa livre de gordura | idem | opinião |
| Proteína absoluta | 80 a 120 g/dia, ou 16% a 24% da energia numa dieta de 2.000 kcal | idem | opinião |
| Proteína por refeição | **nenhum número.** "Protein-rich foods can be consumed first in a meal" | idem | opinião |
| Fontes de proteína | leguminosas, grãos integrais, laticínios, peixe, ovos, aves magras; carne vermelha e processada com moderação; opções de pouco volume: peixe, ovos, iogurte grego, queijo cottage, castanhas e pastas | idem | opinião |
| Atividade física | força pelo menos 3 vezes por semana + pelo menos 150 min/semana de aeróbico moderado | idem | opinião |
| Atividade física, estudo citado | 360 min/semana com ênfase em força preservou massa livre de gordura | idem | observacional |
| Exercício e osso | 1 ano de remédio + exercício preservou densidade óssea; remédio só reduziu | idem | ensaio (liraglutida) |
| Monitorar músculo | bioimpedância na consulta; DXA a cada 1 ou 2 anos; testes de sentar e levantar, subir escada, levantar e andar | idem; Tabela 5 | opinião |
| Suplementos | "Dietary supplements can be proactively considered for at-risk nutrients, such as vitamin D, calcium, B12, or a multivitamin-mineral tablet, at appropriate doses and tailored to each person's needs" | Prevention and mitigation of nutrient deficiencies | opinião |
| Suplementos: doses | **nenhuma dose** | idem | ausência |
| Exames | **nenhuma lista de exames.** "re-assessment of nutrient levels, using clinically accepted methodologies" | idem | opinião |
| Exames antes de começar | podem ser indicados se houve dieta de muito baixa caloria, cirurgia bariátrica, doença celíaca, doença inflamatória ou deficiência prévia | Completion of baseline assessment; Tabela 5 | opinião |
| Triagem antes de começar | sintomas e doenças gastrointestinais; transtornos de humor e ideação suicida; compulsão, anorexia, bulimia, comer noturno; sarcopenia e osteopenia; cálculo renal e função renal; insegurança alimentar; hábitos alimentares; força e função muscular; sono, estresse, substâncias, vínculos sociais | Tabela 5 | opinião |
| Transtorno alimentar | restritivo é contraindicação geral; encaminhar a especialista | Tabela 5, nota | opinião |
| Cálculo renal | evitar alimentos ricos em oxalato, ultraprocessados e proteína animal | Completion of baseline assessment | opinião |
| Alimentos a estimular | frutas, verduras, grãos integrais, laticínios, proteínas magras e ovos, castanhas e sementes, óleos vegetais, chá de gengibre ou hortelã | Tabela 6 | opinião |
| Alimentos a reduzir | carboidrato refinado, bebida adoçada, carne vermelha e processada, fast food, doces e salgadinhos | Tabela 6 | opinião |
| Hábitos | refeições pequenas e regulares em horários consistentes; flexibilidade; pouco álcool; evitar ficar muitas horas sem comer e refeições grandes; alarme para lembrar de comer | Tabela 6; Prevention and mitigation | opinião |
| Manutenção do peso (registro americano) | atividade física de 60 min/dia ou mais; tela abaixo de 10 h/semana; automonitoramento de peso, comida e atividade | Tabela 6, nota; Future directions | observacional |
| Lifestyle + remédio | STEP 3: 16% contra 5,7%; SURMOUNT-3: 25% contra 4,8% (ver nota) | Maximization of weight reduction | ensaios |
| Jejum intermitente, cetogênica | risco de hipoglicemia em quem usa insulina ou sulfonilureia; manter refeições em horários regulares | Use of specific dietary patterns | opinião |

Nota: MOZ escreve "25%" para o SURMOUNT-3; o artigo primário (SM3) dá 24,3% na análise principal e 26,6% na de eficácia.

### 3.3 Exames e suplementos nas outras fontes

- ALM (via comunicado da sociedade, médio): polivitamínico completo, cálcio e vitamina D "as appropriate", sem doses. Não consegui ver se o texto integral lista exames.
- BULA-BR (alto): "Seu médico poderá solicitar suplemento nutricional ou descontinuação do tratamento em casos graves ou persistentes."
- Não achei diretriz que liste "hemograma, ferritina, B12 e vitamina D" especificamente para quem usa esses remédios. A lista do app é plausível (são os exames das deficiências mais citadas) mas não está na fonte que o app cita.

---

## 4. Velocidade de perda, músculo e vesícula

| Afirmação | Tipo | Fonte | O que abri | Confiança |
|---|---|---|---|---|
| O risco de cálculo de vesícula cresce de forma exponencial com a velocidade de perda e aumenta muito acima de 1,5 kg por semana. Os autores sugerem não passar de 1,5 kg/semana em média | análise de 5 estudos prospectivos | Weinsier RL et al., Am J Med 1995;98(2):115-7; https://pubmed.ncbi.nlm.nih.gov/7847427/ | resumo | médio |
| Dieta de 520 kcal/dia por 16 semanas: 10,9% formaram cálculo (27 de 248) | estudo prospectivo | Yang H et al., Dig Dis Sci 1992; https://pubmed.ncbi.nlm.nih.gov/1587196/ | resumo | médio |
| Dieta de 500 kcal contra dieta de 1.200 a 1.500 kcal, 3 meses: cálculo com internação 3,4 vezes mais frequente (152 contra 44 por 10.000 pessoas-ano). Risco absoluto baixo | coorte pareada, 6.640 pessoas | Johansson K et al., Int J Obes 2014; https://pubmed.ncbi.nlm.nih.gov/23736359/ | resumo | médio |
| Cálculos novos aparecem em cerca de 4 semanas de perda rápida; um terço dá sintoma | revisão | Weinsier RL, Ullmann DO, Obes Res 1993; https://pubmed.ncbi.nlm.nih.gov/16350561/ | resumo | médio |
| Fator protetor: ácido ursodesoxicólico reduziu cálculos durante a perda de peso (risco relativo 0,33; em dietas, 0,17). **Dietas com mais gordura também** (risco relativo 0,09, intervalo 0,01 a 0,61) | meta-análise de 13 ensaios, 1.836 pessoas | Stokes CS et al., Clin Gastroenterol Hepatol 2014; https://pubmed.ncbi.nlm.nih.gov/24321208/ | resumo | médio |
| Agonistas de GLP-1 aumentam o risco de doença de vesícula e vias biliares: risco relativo 1,37; nos ensaios de obesidade, 2,29. Dose maior e uso mais longo pesam | meta-análise de 76 ensaios | He L et al., JAMA Intern Med 2022; https://pubmed.ncbi.nlm.nih.gov/35344001/ | números lidos em GOR, que cita o artigo; resumo aberto só em parte | médio |
| Com tirzepatida: colelitíase 1,1% contra 1,0%; colecistite 0,7% contra 0,2%. "Acute gallbladder events were associated with weight reduction" | ensaios | ZEP-EUA 5.4 | integral | alto |
| "Ursodeoxycholic acid may be administered to patients with a history of cholelithiasis" | opinião | GOR, seção 5 | integral | alto (é decisão médica; não entra no app) |
| Perda de 14% ou mais em 3 a 4 meses se associa a perda óssea | observacional | MOZ | integral | alto para o texto |
| Perda rápida contra gradual, mesma perda total: sem diferença significativa em massa livre de gordura | meta-análise | Ashtary-Larky 2020 (ver 2.1) | resumo | médio |
| Faixa habitual de diretriz: 0,5 a 1 kg por semana | diretriz | NIH 1998 e AHA/ACC/TOS 2013. **Não reabri hoje** | nenhum | baixo |

O que isso dá para o app:

- **Vesícula:** o limite de 1,5 kg/semana tem fonte (Weinsier 1995, resumo). O dado vem de dietas de muito baixa caloria, não de tirzepatida. Na média dos ensaios de tirzepatida a perda foi de cerca de 0,6 kg/semana nas primeiras 36 semanas (conta minha em 1.2), abaixo desse limite. Uma pessoa pode perder mais rápido que a média.
- **Gordura na dieta:** há meta-análise de ensaios mostrando menos cálculos com dietas de mais gordura durante a perda. O número exato de gramas de gordura que protege **não está no resumo**; não cite gramas. Os 30% de gordura do app (40 g/dia em 1.200 kcal) ficam dentro da faixa de 20% a 35% (ALM, secundária) e não são uma dieta pobre em gordura.
- **Músculo:** não achei limiar em kg/semana a partir do qual a perda muscular cresce. A meta-análise não viu diferença de massa magra entre perder rápido e devagar. O que as fontes ligam à perda de massa magra é o tamanho da perda total, falta de treino de força, pouca proteína e idade (MOZ, opinião).
- Sugestão de alerta no diário, se quiserem um: perda média acima de 1,5 kg por semana por 4 semanas seguidas → "vale avisar o médico". Base: Weinsier 1995. É extrapolação para tirzepatida; marcar assim em `decisoes.md`.

---

## 5. Manejo não farmacológico dos sintomas

### 5.1 O que tem ensaio e o que é consenso

**Não achei nenhum ensaio randomizado que teste medida alimentar para sintoma causado por agonista de GLP-1 ou tirzepatida.** Tudo o que os documentos recomendam é consenso de especialistas. Os próprios textos dizem isso: WHA se baseia em "published evidence and our collective clinical experience" (resumo); GOR é "multidisciplinary expert consensus"; MOZ é "Advisory".

O que tem dado de ensaio é o **momento** dos sintomas (seção 1.4) e o efeito de **subir a dose mais devagar** (nos ensaios podia-se ficar até 8 semanas na mesma dose; MOZ).

| Sintoma | Recomendação | Quem diz | Tipo |
|---|---|---|---|
| Náusea | Refeições menores e mais frequentes; comer devagar; parar ao sentir estômago cheio | MOZ; GOR Tabela 2; RUB (discussão) | consenso |
| Náusea | Café da manhã pequeno e refeições pequenas a cada 3 a 4 h | MOZ | consenso |
| Náusea | Evitar gordura e também comida rica em fibra nos primeiros dias | MOZ | consenso |
| Náusea | Comida de fácil digestão, pouca gordura, assada, grelhada ou cozida; evitar doces, molhos, comida apimentada | GOR Tabela 2 | consenso |
| Náusea | Biscoito de água e sal, maçã, hortelã, gengibre ou bebida de gengibre | GOR Tabela 2 | consenso |
| Náusea | Evitar cheiros fortes | GOR Tabela 2 | consenso |
| Náusea persistente | Não beber durante a refeição; beber 30 a 60 min antes ou depois | GOR Tabela 2 | consenso |
| Náusea | Líquidos em goles pequenos, claros e frescos, sem encher demais | GOR Tabela 2 | consenso |
| Náusea | Dura em geral 8 dias ou menos; mais frequente nas primeiras 4 a 5 semanas | GOR 4.3.1 (cita estudos) | observacional |
| Vômito | Hidratação; porções menores | GOR; MOZ | consenso |
| Diarreia | Evitar refeições grandes e gordurosas | MOZ | consenso |
| Diarreia | Hidratação generosa; **evitar isotônico de esporte**; evitar laticínios, café, álcool, refrigerante, adoçantes terminados em "ol"; reduzir fibra por um tempo; caldo de frango, arroz, cenoura, fruta madura sem casca | GOR Tabela 2 | consenso |
| Diarreia | Começa nas 4 primeiras semanas; dura cerca de 3 dias | GOR 4.3.3 (cita estudo) | observacional |
| Constipação | Água, fibra da comida aumentada aos poucos, mais movimento | MOZ; GOR | consenso |
| Constipação | Pode durar mais que os outros sintomas: mediana de 47 dias | GOR 4.3.4 (cita estudo) | observacional |
| Constipação | "Secondary to the feeling of gastric fullness... patients tend to reduce water intake" | GOR 4.3.4 | opinião |
| Refluxo | Não deitar depois de comer; não comer perto da hora de dormir; pouco álcool | GOR Tabela 2; MOZ | consenso |
| Refluxo | Janela de "2 a 3 horas" sem deitar | vem das diretrizes de refluxo em geral (American College of Gastroenterology 2022). **Não reabri hoje** | baixo |
| Geral | Diário alimentar ajuda a achar o que piora | GOR Tabela 2 | consenso |
| Geral | Se os remédios para sintoma forem necessários por mais de um mês na dose de manutenção, considerar reduzir a dose | GOR 4.3.1 | consenso |

### 5.2 Gengibre e hortelã

| Pergunta | Resposta | Fonte | O que abri | Confiança |
|---|---|---|---|---|
| Gengibre foi testado em quem usa esses remédios? | Não achei nenhum ensaio | busca no PubMed | | |
| Em quem foi testado? | Grávidas: 12 ensaios, 1.278 mulheres. Melhorou a náusea; não reduziu de forma significativa os episódios de vômito. Qualidade da evidência baixa. Doses abaixo de 1.500 mg/dia de gengibre (cápsula ou pó) pareceram melhores | Viljoen E et al., Nutr J 2014; https://pubmed.ncbi.nlm.nih.gov/24642205/ | resumo | médio |
| | Quimioterapia: cápsulas de gengibre somadas ao antiemético reduziram náusea aguda grave | Lin CY et al., Cancer Nurs 2025; https://pubmed.ncbi.nlm.nih.gov/38625733/ | resumo | médio |
| Hortelã foi testada em quem usa esses remédios? | Não achei nenhum ensaio | | | |
| Em quem foi testada? | Síndrome do intestino irritável, em **cápsula de óleo**, não chá: melhor que placebo para sintomas gerais e dor; mais efeitos adversos que placebo; qualidade muito baixa | Ingrosso MR et al., Aliment Pharmacol Ther 2022; https://pubmed.ncbi.nlm.nih.gov/35942669/ | resumo | médio |
| | Náusea pós-operatória, como aromaterapia: revisão Cochrane de 16 estudos; o trecho do resumo que li não chega ao resultado | Hines S et al., Cochrane 2018; https://pubmed.ncbi.nlm.nih.gov/29523018/ | resumo parcial | baixo |
| O chá, especificamente? | Os ensaios usaram cápsula, pó ou óleo. O chá entra por consenso: "Ginger or peppermint tea, as well as acupressure bands, can be beneficial" | MOZ; GOR | integral | alto para o texto |

Resumo para o app: gengibre tem ensaio em enjoo de gravidez e de quimioterapia; hortelã, em intestino irritável. Em quem usa tirzepatida, os dois entram por recomendação de especialistas, sem ensaio. A frase do app pode ficar, sem prometer efeito.

---

## 6. Bula brasileira do Mounjaro

Fonte: BULA-BR, BULA-BR-PRO e IFU-BR, baixadas em 20/11/2026 da página "Medicamentos aprovados" da Lilly Brasil. Li os três textos. Confiança alta em tudo o que está entre aspas. Comparação com ZEP-EUA (revisão 11/2026) e EMA.

| Item | Bula brasileira (literal) | EUA (Zepbound) | Europa (EMA) | Difere? |
|---|---|---|---|---|
| Apresentações | "solução injetável, contendo 2,5 mg, 5 mg, 7,5 mg, 10 mg, 12,5 mg ou 15 mg de tirzepatida em 0,5 mL. Cada embalagem contém 4 canetas aplicadoras de 0,5 mL. Caneta de uso único." | caneta de dose única, frasco de dose única, frasco multidose e KwikPen (4 doses) | caneta de dose única, frasco e KwikPen multidose (4 doses de 0,6 mL) | **Sim.** A bula brasileira lida não traz KwikPen |
| Armazenamento | "Armazenar em geladeira de 2°C a 8°C. Manter na embalagem original para proteger da luz. Não congelar." | igual | igual | Não |
| Congelou | "Em caso de congelamento da Caneta, descarte a Caneta e utilize uma Caneta nova." (IFU-BR) | "Do not use ZEPBOUND if frozen" | igual | Não |
| Fora da geladeira, caneta de uso único | "MOUNJARO pode ser armazenado fora de refrigeração a temperaturas abaixo de 30°C por até 21 dias." IFU-BR: "abaixo de 30°C por até 21 dias no total" | "not to exceed 30°C (86°F) for up to a total of 21 days" | "up to 21 cumulative days at a temperature below 30 ºC and then... must be discarded" | Não |
| Fora da geladeira, multidose | não consta | fechada: descartar após 30 dias em temperatura ambiente. Aberta: geladeira ou até 30 °C; descartar "after a total of 30 days at room temperature, 30 days after first use, or after taking 4 weekly doses" | "After first use: 30 days... refrigerator or unrefrigerated at a temperature below 30 ºC. Must be discarded 30 days after first use" | Só existe fora do Brasil, pelo que li |
| Dose esquecida | "deverá ser administrada assim que possível dentro de 4 dias (96 horas) após o esquecimento da dose. Caso mais de 4 dias tenham se passado, a dose esquecida não deverá ser administrada, e a próxima dose deverá ser administrada no dia do cronograma usual." | igual, "4 days (96 hours)" | "within 4 days" | Não |
| Trocar o dia | "contanto que o intervalo entre as duas doses seja de pelo menos 3 dias (72 horas)" | igual | "at least 3 days" | Não |
| Escalonamento | "a dose inicial de MOUNJARO é 2,5 mg uma vez por semana. Após 4 semanas, a dose deve ser aumentada para 5 mg uma vez por semana. Se necessário, aumentos de dose podem ser feitos em acréscimos de 2,5 mg após o mínimo de 4 semanas na dose atual." "as doses de manutenção recomendadas são 5 mg, 10 mg e 15 mg. A dose máxima de MOUNJARO é 15 mg" | igual | igual | Não |
| Reavaliação | "se você não conseguir perder pelo menos 5% do seu peso corporal inicial em até 6 meses após a titulação até a dose tolerada mais alta, seu médico avaliará se você deve ou não continuar" | não consta assim | consta | |
| Local e horário | "por via subcutânea no abdome, coxa ou outra pessoa deve administrar na parte de trás do braço. Alterne o local de injeção de cada dose. Administrar MOUNJARO em qualquer horário do dia, independente das refeições." | igual | igual | Não |
| Anticoncepcional oral | "Não é necessário ajuste de dose de contraceptivos orais em mulheres com IMC normal. Não se sabe ao certo como a tirzepatida pode afetar a eficácia dos anticoncepcionais orais em mulheres com obesidade ou sobrepeso. Como existe a possibilidade da redução da eficácia desses anticoncepcionais, recomenda-se o uso de outro método que não seja oral ou acrescentar um método de barreira (como preservativo) no início do tratamento com MOUNJARO (por 4 semanas) e por 4 semanas após cada aumento de dose. Contraceptivos hormonais que não são administrados por via oral não devem ser afetados." | "switch to a non-oral contraceptive method, or add a barrier method of contraception for 4 weeks after initiation... and for 4 weeks after each dose escalation" | "This reduction in exposure after a single dose of tirzepatide is not considered clinically relevant. No dose adjustment of oral contraceptives is required." | **Sim: a europeia não pede barreira.** Brasil e EUA pedem |
| Dado por trás | dose única de 5 mg: etinilestradiol com pico 59% menor e exposição total 20% menor, pico 4 h mais tarde (BULA-BR-PRO) | igual | igual | Não |
| Gravidez | "Se você deseja engravidar, MOUNJARO deve ser descontinuado pelo menos 1 mês antes de uma gravidez planejada." "Para controle crônico do peso e apneia obstrutiva do sono, MOUNJARO não deve ser utilizado para redução do peso durante a gravidez." Categoria C | "May cause fetal harm. When pregnancy is recognized, discontinue" | "discontinued at least 1 month before a planned pregnancy" | Não no essencial |
| Amamentação | "A quantidade de MOUNJARO no leite materno foi considerada indetectável a muito baixa... MOUNJARO somente deve ser utilizado em lactantes se o benefício potencial para a mãe justificar o risco para o bebê." "depende da avaliação e acompanhamento do seu médico" | pesar benefícios; indetectável em 164 de 171 amostras | "Overall, tirzepatide could be considered for use during breast-feeding" | Nenhuma das três proíbe |
| Tireoide | "não é indicado para pacientes com histórico pessoal ou familiar de carcinoma medular de tireoide... ou em pacientes com neoplasia endócrina múltipla tipo 2 (NEM2)". Sintomas: "massa no pescoço, disfagia (dificuldade para engolir), dispneia (falta de ar) e rouquidão persistente" | contraindicação com aviso em destaque | advertência | redação |
| Pancreatite | "Se você estiver com suspeita de pancreatite... informe ao seu médico e interrompa o tratamento. Se houver a confirmação de pancreatite, MOUNJARO não deverá ser reiniciado." | igual | igual | Não |
| Vesícula | "doenças agudas da vesícula biliar, como colelitíase... e colecistite... foram relatadas nos estudos clínicos" | igual, com números | igual | Não |
| Anestesia | "Foi reportada aspiração pulmonar (broncoaspiração) em pacientes submetidos a anestesia geral ou sedação profunda... Antes da realização desses procedimentos, informe seu médico imediatamente sobre o uso desta classe de medicamentos." | igual; "Available data are insufficient to inform recommendations... including whether... temporarily discontinuing" | | Não. Nenhuma dá prazo de suspensão |
| Hipoglicemia | "pacientes em tratamento com MOUNJARO combinado a um secretagogo... por exemplo, sulfonilureia, ou à insulina podem apresentar um risco aumentado de hipoglicemia" | igual | igual | Não |
| Retinopatia | "uma melhora rápida no controle do açúcar no sangue pode estar associada a uma piora temporária da retinopatia diabética" | igual | igual | Não |
| Perda de visão (qualquer pessoa) | "Foram relatados casos de uma condição rara chamada neuropatia óptica isquêmica anterior não arterítica (NAION)... Essa condição pode causar diminuição da visão e, em alguns casos, perda permanente da visão." | seção 5.9 | | Não |
| Desidratação e rim | "Esses eventos podem levar à desidratação (perda de líquidos), o que pode diminuir a função renal. É importante aumentar a ingestão de líquidos para evitar a desidratação." | igual | igual | Não |
| Desnutrição | "foram reportados eventos relacionados à desnutrição... podendo ser graves" | não localizei | não conferi | |
| Humor | "comportamento e pensamento suicida foram reportados com o uso de produtos que induzem a perda de peso" | consta | | |
| Indicações | Diabetes tipo 2 em adultos e a partir de 10 anos; "controle crônico do peso... em adultos com IMC maior ou igual a 30 kg/m² (obesidade) ou maior ou igual a 27 kg/m² (sobrepeso) na presença de pelo menos uma condição de comorbidade"; "apneia obstrutiva do sono moderada a grave em adultos com obesidade" | Zepbound: peso e apneia; Mounjaro: diabetes | | No Brasil um só nome cobre as três |
| Venda | "VENDA SOB PRESCRIÇÃO - COM RETENÇÃO DA RECEITA." | | | |
| Meia-vida | "aproximadamente 5 dias" | | | |
| Sede | **nenhuma menção** em BULA-BR, BULA-BR-PRO, ZEP-EUA e EMA (busquei "sede", "thirst") | | | |
| Recomeçar após semanas sem aplicar | **não consta** na bula brasileira | não localizei | | |

### 6.1 Os dois pontos pedidos

**"Até 21 dias fora da geladeira abaixo de 30 °C": CONFIRMADO** para a caneta de uso único, que é a apresentação da bula brasileira. O IFU brasileiro acrescenta "no total" (o prazo é a soma dos períodos fora). Para a caneta multidose, as bulas dos EUA e da Europa dizem 30 dias depois do primeiro uso, em geladeira ou até 30 °C.

**Pílula "atribuída à Febrasgo e à bula americana": CORRIGIR A ATRIBUIÇÃO.** A orientação está na própria bula brasileira (trecho acima). A bula americana diz o mesmo. A Febrasgo publicou em 03/07/2025 "Recomendações da FEBRASGO sobre medicamentos emagrecedores e anticoncepcionais orais": usuárias de tirzepatida devem trocar de método ou "associar métodos de barreira" "por, pelo menos, quatro semanas após o início do uso ou ajuste da dose"; com semaglutida, "Contraceptivos orais podem ser mantidos". Recomenda oferecer DIU e implante. Sobre gravidez: suspender a tirzepatida pelo menos um mês antes. Link em FEB. A ferramenta de leitura me devolveu resumo com trechos literais curtos, não a página inteira; confiança média para os detalhes, alta para a existência e a data.

Diferença pequena de redação: Febrasgo fala em "ajuste da dose"; as bulas falam em "aumento de dose".

### 6.2 Caneta multidose no Brasil

- Imprensa (Times Brasil, 18/03/2026, https://timesbrasil.com.br/empresas-e-negocios/anvisa-aprova-mounjaro-multidose-entenda-diferenca/): registro do "Mounjaro multidose" publicado no Diário Oficial, validade de 24 meses; a opção disponível "até o momento" era de dose única. Fonte secundária, confiança média.
- A página de bulas da Lilly Brasil, hoje, lista para Mounjaro só: bula do paciente, bula do profissional e instruções de uso da caneta de uso único. Nenhum documento de KwikPen.
- **Não confirmei se a multidose já está à venda nem achei bula brasileira dela.** O app precisa funcionar para as duas hipóteses. O texto atual ("Confira a bula da apresentação que ela comprou") já cobre isso.

---

## 7. Diretrizes e posicionamentos brasileiros

| Documento | Quem, quando | O que diz | O que abri | Link | Confiança |
|---|---|---|---|---|---|
| Recomendações sobre medicamentos emagrecedores e anticoncepcionais orais | Febrasgo, 03/07/2025 | Ver 6.1 | página (resumo com trechos) | FEB | média/alta |
| Posicionamento conjunto sobre medicamentos injetáveis de origem alternativa | SBD, SBEM e Abeso; 10/07/2026, reiterando o de 04/02/2025 | Usar "exclusivamente medicamentos registrados na Anvisa", comprados em "canais regulares de comercialização". Produto do Paraguai "não possui validade regulatória no Brasil". Uma amostra testada tinha cerca de 60% mais princípio ativo que o rótulo. Recomenda que profissionais não prescrevam versões manipuladas ou alternativas | página (resumo com trechos) | https://diabetes.org.br/posicionamento-conjunto-da-sbd-sbem-e-abeso-sobre-medicamentos-injetaveis-de-origem-alternativa-destinados-ao-tratamento-da-obesidade-e-do-diabetes-mellitus/ | média |
| Nota da SBEM sobre a proibição da semaglutida manipulada e pedido de extensão à tirzepatida | SBEM; data não confirmada | Pede à Anvisa que proíba também a manipulação de tirzepatida | só resultado de busca | https://www.endocrino.org.br/noticias/nota-oficial-da-sbem-sobre-a-proibicao-da-semaglutida-manipulada-e-a-necessidade-de-extensao-da-medida-para-a-tirzepatida/ | baixa |
| Situação atual da Anvisa sobre tirzepatida manipulada | | **NÃO VERIFICADO** | | | baixa |
| Pharmacologic treatment of obesity in adults: 2024 update and position statement | Abeso e SBEM; Moreira RO et al., Arch Endocrinol Metab 2024;68:e240422 | Revisa os remédios aprovados e inclui a tirzepatida. "The therapeutic target is quality weight loss." Cita reganho de 6,9% ao parar semaglutida (STEP 4). Não achei recomendação de proteína nem de treino na parte lida | li cerca de um terço (a seção de tirzepatida ficou fora) | https://pmc.ncbi.nlm.nih.gov/articles/PMC11634287/ | média |
| Diretriz brasileira de tratamento farmacológico da obesidade | Abeso, 2025 (a página da Abeso lista versões 2025 e 2026) | Segundo a imprensa: 32 recomendações; priorizar remédios mais potentes (semaglutida, tirzepatida) quando disponíveis; tirzepatida para apneia moderada a grave | só imprensa e resultado de busca | https://abeso.org.br/diretrizes/ | baixa |
| Diretriz brasileira 2025 de obesidade e prevenção cardiovascular | Abeso, SBC, SBEM, SBD e Academia Brasileira do Sono | Escolha do remédio conforme risco cardiovascular | só resultado de busca | https://pmc.ncbi.nlm.nih.gov/articles/PMC13148858/ | baixa |
| Nota sobre manejo perioperatório de agonistas de GLP-1 e coagonistas GLP-1/GIP (C.SBA 01744/2026) | Sociedade Brasileira de Anestesiologia, com SBD e Abeso; 15/05/2026 | Dieta líquida sem resíduos nas 24 h antes para todos os usuários; jejum de cerca de 8 a 12 h; suspender só em alto risco (7 dias para os de ação longa, 1 dia para os de ação curta); alto risco = fase de aumento de dose, sintomas gastrointestinais ativos, suspeita de gastroparesia; uso há mais de 12 semanas sem sintomas não precisa suspender; ultrassom gástrico à beira do leito | **só fonte secundária** (Portal Afya, 11/06/2026). Não achei o documento original | https://portal.afya.com.br/anestesiologia/atualizacao-no-manejo-pre-operatorio-de-agonistas-glp1-gip | média |
| Orientação anterior divulgada na imprensa (2024-2025) | atribuída à SBA | Suspender 15 dias (tirzepatida) ou 21 dias (semaglutida) antes | só resultado de busca | | baixa; parece superada |
| Diretriz SBD de hiperglicemia no perioperatório | SBD, com SBA e Abeso | Base da nota acima, segundo fonte secundária | o link devolveu erro 404 | https://diretriz.diabetes.org.br/ | baixa |

Para o app: não escrever prazo de suspensão antes de cirurgia. As bulas não dão prazo, a conduta brasileira mudou em 2026 e eu não li o original. A frase atual do guia está de acordo com a bula.

---

## 8. Conferência do guia, frase por frase

Vereditos: **CONFIRMADA** (a fonte diz isso), **IMPRECISA** (a fonte diz algo próximo; convém ajustar), **SEM FONTE** (não achei respaldo nas fontes lidas; não quer dizer que esteja errada), **ERRADA** (a fonte diz outra coisa). As siglas de fonte estão na tabela do início, com link.

### 8.1 Como o remédio age

| Frase atual | Veredito | Correção proposta | Fonte |
|---|---|---|---|
| "A tirzepatida (Mounjaro) imita dois hormônios do intestino, GIP e GLP-1. Na prática: a fome diminui, a saciedade chega antes e o estômago esvazia mais devagar." | CONFIRMADA | — | BULA-BR seção 2; BULA-BR-PRO |
| "É esse esvaziamento lento que explica a maior parte dos efeitos no estômago e no intestino, e ele é mais forte nas primeiras semanas de cada dose." | IMPRECISA. As fontes dão mais de uma causa (estômago, cérebro, intestino). A bula americana diz que o atraso é maior depois da primeira dose e diminui com o tempo; não fala em "cada dose" | "O esvaziamento lento é uma das causas dos efeitos no estômago e no intestino. Ele é maior depois da primeira dose e diminui com o tempo. Enjoo, vômito e diarreia são mais frequentes na fase de aumento de dose." | MOZ "Side effects"; ZEP-EUA 12.2; BULA-BR seção 8 |

### 8.2 Doses: como sobem

| Frase atual | Veredito | Correção proposta | Fonte |
|---|---|---|---|
| "Início com 2,5 mg uma vez por semana, por 4 semanas. Essa dose serve para o corpo se acostumar." | CONFIRMADA | — | BULA-BR seção 6 |
| "Depois o médico pode subir de 2,5 em 2,5 mg, com pelo menos 4 semanas em cada dose: 5, 7,5, 10, 12,5 e no máximo 15 mg." | CONFIRMADA. A bula acrescenta que as doses de manutenção recomendadas são 5, 10 e 15 mg | Opcional: "As doses de manutenção citadas na bula são 5, 10 e 15 mg." | BULA-BR seção 6 |
| "Não há obrigação de chegar a 15 mg. Quem decide se sobe, mantém ou reduz é o médico, olhando resultado e efeitos colaterais." | CONFIRMADA | — | BULA-BR-PRO: "Considere a resposta ao tratamento e a tolerabilidade ao selecionar a dose de manutenção" |
| "O diário deste app mostra há quantas semanas ela está na dose atual, para levar à consulta." | Não é afirmação de saúde | — | |

### 8.3 Aplicação

| Frase atual | Veredito | Correção proposta | Fonte |
|---|---|---|---|
| "Uma vez por semana, sempre no mesmo dia, em qualquer horário, com ou sem comida." | CONFIRMADA | — | BULA-BR seção 6 |
| "Locais: abdômen, coxa ou parte de trás do braço (no braço, aplicada por outra pessoa). Troque o ponto a cada semana; o diário sugere o próximo." | CONFIRMADA | — | BULA-BR seção 6; IFU-BR |
| "Dá para mudar o dia da semana, desde que haja pelo menos 3 dias (72 horas) entre duas aplicações." | CONFIRMADA | — | BULA-BR seção 6 |
| "O passo a passo da caneta vem no folheto da embalagem e varia conforme a apresentação. Na primeira vez, vale aplicar com o farmacêutico ou com o médico olhando." | CONFIRMADA a primeira parte. A segunda é sugestão sem fonte | — | IFU-BR |

### 8.4 Esqueci a dose

| Frase atual | Veredito | Correção proposta | Fonte |
|---|---|---|---|
| "Até 4 dias (96 horas) depois do horário previsto: aplicar assim que lembrar e seguir o dia habitual na semana seguinte." | CONFIRMADA | — | BULA-BR seção 7 |
| "Mais de 4 dias: pular a dose esquecida e aplicar a próxima no dia habitual. Não aplicar duas doses para compensar." | CONFIRMADA a regra. "Não aplicar duas doses" não está escrito na bula brasileira, mas decorre do intervalo mínimo de 72 h | — | BULA-BR seções 6 e 7 |
| "Se ficar várias semanas sem aplicar, falar com o médico antes de retomar: pode ser preciso recomeçar numa dose menor." | SEM FONTE na bula. É conduta clínica | "Se ficar várias semanas sem aplicar, falar com o médico antes de retomar. A bula não diz com que dose voltar." | BULA-BR (ausência) |

### 8.5 Como guardar

| Frase atual | Veredito | Correção proposta | Fonte |
|---|---|---|---|
| "Na geladeira, entre 2 °C e 8 °C, dentro da embalagem original (protege da luz). Não congelar; se congelou, não usar." | CONFIRMADA | — | BULA-BR seção 5; IFU-BR |
| "Fora da geladeira, abaixo de 30 °C, o prazo citado nas bulas é de até 21 dias no total. Confira a bula da apresentação que ela comprou, porque o prazo depois do primeiro uso pode ser diferente." | CONFIRMADA para a caneta de uso único (a da bula brasileira) | "Caneta de uso único (caixa com 4): fora da geladeira, abaixo de 30 °C, por até 21 dias no total. Passado esse prazo, a bula manda descartar. Se a caneta for multidose (várias doses na mesma caneta), o prazo é outro: confira a bula que veio na caixa." | BULA-BR; IFU-BR; EMA; ZEP-EUA 16.2 |
| "Em viagem: bolsa térmica, sem encostar a caneta direto no gelo." | SEM FONTE direta. Decorre de "não congelar" | — | |

### 8.6 Enjoo

| Frase atual | Veredito | Correção proposta | Fonte |
|---|---|---|---|
| "É o efeito mais comum e costuma aparecer nos dias seguintes à aplicação e depois de cada aumento de dose." | IMPRECISA. "Mais comum" e "aumento de dose" conferem. "Nos dias seguintes à aplicação" não tem dado de ensaio | "É o efeito mais comum: nos estudos, cerca de 1 em cada 4 pessoas teve. Aparece mais na fase de aumento de dose e diminui com o tempo." | ZEP-EUA Tabela 1; BULA-BR seção 8 |
| "O que costuma ajudar: café da manhã pequeno, refeições pequenas a cada 3 ou 4 horas, comer devagar e parar ao primeiro sinal de estômago cheio." | CONFIRMADA (consenso, sem ensaio) | — | MOZ; GOR Tabela 2 |
| "Nos primeiros dias depois da aplicação, evitar comida gordurosa, fritura e refeições grandes. Comida fria ou em temperatura ambiente tem menos cheiro." | IMPRECISA. O artigo fala em "primeiros dias de tratamento" e inclui comida rica em fibra. "Evitar cheiros fortes" tem fonte; "comida fria tem menos cheiro" não | "Nos primeiros dias de cada dose nova, evitar comida gordurosa, fritura e refeições grandes. Se o enjoo estiver forte, reduzir também a fibra por uns dias. Cheiro forte piora; comida fria ou morna costuma ter menos cheiro." | MOZ; GOR Tabela 2 |
| "Chá de gengibre ou de hortelã. Líquidos em goles pequenos, de preferência entre as refeições." | CONFIRMADA como consenso. Sem ensaio em quem usa o remédio (ver 5.2) | Opcional: "Chá de gengibre ou de hortelã é sugestão de especialistas; não foi testado em quem usa este remédio." | MOZ; GOR Tabela 2 |
| "Álcool piora enjoo e refluxo." | CONFIRMADA; o artigo diz "pode piorar" | "Álcool pode piorar enjoo e refluxo." | MOZ |
| "Use o \"Dia de enjoo\" na aba Plano. Se o enjoo impedir de comer ou beber, o médico pode prescrever remédio ou segurar o aumento de dose." | CONFIRMADA | — | MOZ; GOR 4.2 |

### 8.7 Intestino preso, diarreia e refluxo

| Frase atual | Veredito | Correção proposta | Fonte |
|---|---|---|---|
| "Intestino preso: água ao longo do dia, fibra da comida (feijão, aveia, linhaça, mamão, ameixa seca, verduras) aumentada aos poucos e caminhada diária. Se não resolver, o médico pode indicar magnésio, fibra em pó ou laxante." | CONFIRMADA (consenso). Os alimentos são exemplos do app; o artigo cita ameixa seca e frutas secas | Opcional, acrescentar: "Pode durar mais que os outros sintomas." | MOZ; GOR 4.3.4 |
| "Diarreia: refeições menores e com menos gordura, repor líquidos (água, água de coco, soro caseiro). Se durar mais de 2 ou 3 dias, avisar o médico." | IMPRECISA. Refeição menor, menos gordura e hidratação conferem. Água de coco e soro caseiro: sem fonte. O prazo de 2 ou 3 dias: sem fonte direta (o consenso diz que dura cerca de 3 dias) | "Diarreia: refeições menores e com menos gordura, e bastante líquido. Nos estudos, costuma durar cerca de 3 dias. Se passar disso ou vier com sinais de desidratação, avisar o médico." | MOZ; GOR Tabela 2 e 4.3.3 |
| "Refluxo e arroto: não deitar nas 2 ou 3 horas depois de comer, jantar pequeno, evitar álcool, fritura e bebida com gás." | IMPRECISA. "Não deitar depois de comer", "não comer perto de dormir" e álcool têm fonte. "2 ou 3 horas" vem das diretrizes de refluxo em geral, que não reabri. "Bebida com gás": sem fonte direta | Pode ficar. Se quiserem só o que tem fonte lida: "Refluxo e arroto: não deitar logo depois de comer, jantar pequeno e cedo, pouco álcool e menos fritura." | GOR Tabela 2; MOZ |

### 8.8 Sinais de alerta

| Frase atual | Veredito | Correção proposta | Fonte |
|---|---|---|---|
| "Procurar atendimento sem esperar a consulta se aparecer:" | — | — | |
| "• Dor forte e contínua na barriga, que pode ir para as costas, com ou sem vômito (pode ser pâncreas)." | CONFIRMADA | — | BULA-BR seção 4; ZEP-EUA 5.5 |
| "• Dor no alto da barriga do lado direito, febre, pele ou olhos amarelados (pode ser vesícula)." | CONFIRMADA | — | BULA-BR seção 4; ZEP-EUA 17 |
| "• Vômito ou diarreia que não param, boca seca, urina escura e pouca, tontura ao levantar (desidratação, que pode afetar os rins)." | CONFIRMADA | — | BULA-BR seção 4 |
| "• Inchaço no rosto, lábios ou garganta, falta de ar, coceira intensa pelo corpo (reação alérgica)." | CONFIRMADA | — | BULA-BR seções 3 e 4 |
| "• Se também usa insulina ou sulfonilureia: tremor, suor frio, confusão (hipoglicemia)." | CONFIRMADA | — | BULA-BR seção 4 |
| "• Caroço ou inchaço no pescoço, rouquidão que não passa, dificuldade para engolir." | CONFIRMADA. A bula lista também falta de ar | — | BULA-BR seção 4 |
| "• Mudança na visão, em quem tem diabetes." | IMPRECISA. A bula brasileira traz também um problema raro de visão que não depende de diabetes | "• Perda ou piora súbita da visão, em qualquer pessoa. Em quem tem diabetes, qualquer mudança na visão." | BULA-BR seções 4 e 8; ZEP-EUA 5.9 |
| "• Tristeza intensa ou pensamentos de se machucar." | CONFIRMADA | — | BULA-BR seção 4 |
| "• Suspeita de gravidez." | CONFIRMADA | — | BULA-BR seção 4 |
| (falta) | A bula brasileira tem aviso de desnutrição | Sugestão de item novo, fora da lista de urgência: "Cansaço fora do normal, queda de cabelo intensa, fraqueza ou machucado que demora a fechar podem ser falta de nutrientes. Vale contar ao médico." | BULA-BR seção 4; MOZ "Nutritional deficiencies" |

### 8.9 Anticoncepcional e gravidez

| Frase atual | Veredito | Correção proposta | Fonte |
|---|---|---|---|
| "A tirzepatida pode reduzir o efeito da pílula anticoncepcional, porque atrasa a absorção no estômago." | CONFIRMADA | — | BULA-BR seção 4; ZEP-EUA 8.3 |
| "A orientação da Febrasgo e da bula americana do remédio: quem usa pílula deve somar um método de barreira (camisinha) por 4 semanas depois da primeira dose e por 4 semanas depois de cada aumento de dose, ou trocar por um método que não seja oral (DIU, implante, injeção, adesivo)." | IMPRECISA na atribuição. O conteúdo confere. A bula brasileira diz o mesmo; a europeia não | "A bula brasileira e a Febrasgo orientam: quem usa pílula soma um método de barreira (camisinha) por 4 semanas depois da primeira dose e por 4 semanas depois de cada aumento de dose, ou troca por um método que não seja oral (DIU, implante, injeção, adesivo, anel)." | BULA-BR seção 4; FEB; ZEP-EUA; EMA (diverge) |
| "O remédio não é usado na gravidez nem na amamentação. Quem planeja engravidar combina com o médico quando parar." | **ERRADA na parte da amamentação**; incompleta na da gravidez | "Para perder peso, o remédio não é usado na gravidez. A bula orienta parar pelo menos 1 mês antes de uma gravidez planejada. Na amamentação, a bula não proíbe: diz que o uso depende de avaliação do médico. A Febrasgo lembra que não há prova de segurança nessas fases." | BULA-BR seção 4; EMA 4.6; FEB |

### 8.10 Comer pouco, mas comer bem

| Frase atual | Veredito | Correção proposta | Fonte |
|---|---|---|---|
| "Com menos fome, o risco deixa de ser comer demais e passa a ser comer de menos. Abaixo de cerca de 1.200 kcal por dia (mulheres) fica difícil atingir vitaminas e minerais." | CONFIRMADA | — | MOZ "Nutritional deficiencies" |
| "Proteína primeiro: em cada refeição, comece pela carne, ovo, peixe, queijo ou iogurte. A faixa usada para quem está emagrecendo com esse tipo de remédio é de 1,2 a 1,6 g por kg por dia, ou 80 a 120 g por dia." | CONFIRMADA, com ressalva: é faixa "proposta", por consenso, e o artigo diz que não há acordo sobre qual peso usar | "Proteína primeiro: em cada refeição, comece pela carne, ovo, peixe, feijão, queijo ou iogurte. A faixa proposta por especialistas para quem está emagrecendo é de 1,2 a 1,6 g por kg por dia, ou 80 a 120 g por dia. Não há acordo sobre qual peso usar na conta; o app usa um peso ajustado e o nutricionista pode trocar a meta." | MOZ "Preservation of muscle and bone mass" |
| "Não pular refeição por falta de fome: refeições pequenas em horários fixos funcionam melhor do que esperar o apetite." | CONFIRMADA (consenso) | — | MOZ Tabela 6 |
| "Água: o remédio também reduz a sede. A meta de água do app serve de lembrete." | **SEM FONTE** para tirzepatida. Nenhuma bula nem o artigo citado falam em sede. Um ensaio pequeno com dulaglutida (20 voluntários) viu menos líquido ingerido, sem mudança na sensação de sede | "Água: com o estômago cheio por mais tempo, é comum beber menos sem perceber. Vômito e diarreia também tiram líquido. A meta de água do app serve de lembrete." | GOR 4.3.4; BULA-BR seção 4; Winzeler B et al., Endocrine 2020, https://pubmed.ncbi.nlm.nih.gov/32623637/ (resumo) |
| "Menos açúcar, refrigerante e farinha branca; mais comida de verdade e fibra." | CONFIRMADA (consenso) | — | MOZ Tabela 6 |

### 8.11 Músculo e osso

| Frase atual | Veredito | Correção proposta | Fonte |
|---|---|---|---|
| "Em qualquer emagrecimento rápido, parte do peso perdido é músculo. Duas coisas reduzem essa perda: proteína suficiente e treino de força." | IMPRECISA. Não é só no emagrecimento rápido (placebo teve a mesma proporção). O artigo diz que proteína sem treino provavelmente não basta. Não há ensaio com tirzepatida | "Em qualquer emagrecimento, parte do peso perdido é massa magra. No estudo com tirzepatida foi cerca de um quarto. Especialistas recomendam treino de força e proteína suficiente para reduzir essa perda; só a proteína, sem o treino, provavelmente não basta." | SM1-DXA; MOZ |
| "A referência é treino de força pelo menos 3 vezes por semana e 150 minutos semanais de atividade aeróbica moderada, como caminhada rápida." | CONFIRMADA (consenso; não é dado de ensaio). Diretrizes gerais falam em 2 ou mais dias | Opcional: "A referência dos especialistas é..." | MOZ |
| "Cálcio, vitamina D e proteína também protegem os ossos." | SEM FONTE direta. O que tem ensaio é exercício: com liraglutida, quem fez exercício manteve a densidade óssea | "Num estudo com um remédio parecido, quem fez exercício manteve a densidade dos ossos; quem só usou o remédio perdeu um pouco. Cálcio, vitamina D e proteína entram na lista de nutrientes a acompanhar." | Jensen 2024 (resumo); MOZ |

### 8.12 Vitaminas e minerais para acompanhar

| Frase atual | Veredito | Correção proposta | Fonte |
|---|---|---|---|
| "Os que mais ficam abaixo do necessário em quem come pouco: ferro, cálcio, magnésio, zinco e vitaminas A, D, E, K, B1, B12 e C." | CONFIRMADA; a lista é idêntica. O artigo os chama de "exemplos de nutrientes de atenção", não "os que mais ficam abaixo" | "Nutrientes que pedem atenção em quem come pouco: ferro, cálcio, magnésio, zinco e vitaminas A, D, E, K, B1, B12 e C." | MOZ "Nutritional deficiencies" |
| "A aba Plano mostra quanto o cardápio entrega de cada um. No nível de calorias do tratamento, ferro, vitamina D e vitamina E costumam ficar abaixo da meta só com comida." | Fora do meu escopo: é resultado do cardápio do app. Conferir com `dados/conferir_cardapio.js`. Na literatura, vitamina D foi a deficiência mais diagnosticada | — | Scott Butsch 2025 (resumo) |
| "Suplemento (polivitamínico, vitamina D, ferro, B12, cálcio) é decisão do médico ou do nutricionista, de preferência com exame de sangue antes. Ferro e vitamina A em excesso também fazem mal." | CONFIRMADA em parte. O artigo cita vitamina D, cálcio, B12 e polivitamínico; ferro não está na lista de suplementos dele. "Com exame antes" e "ferro e vitamina A em excesso" são corretos como princípio, sem fonte lida hoje | "Suplemento (polivitamínico, vitamina D, cálcio, B12 e outros) é decisão do médico ou do nutricionista. Ferro e vitamina A em excesso também fazem mal." | MOZ "Prevention and mitigation" |
| "Exames que valem a conversa: hemograma, ferritina, vitamina B12, vitamina D, além dos que o médico já pede." | **SEM FONTE** no artigo citado, que não lista exames | "O artigo de referência recomenda reavaliar os nutrientes durante o tratamento, sem listar exames. Vale perguntar ao médico quais ele pede; hemograma, ferritina, vitamina B12 e vitamina D são os que medem as faltas mais citadas." | MOZ (ausência); Scott Butsch 2025 |

### 8.13 Cirurgia, endoscopia e anestesia

| Frase atual | Veredito | Correção proposta | Fonte |
|---|---|---|---|
| "Como o estômago esvazia mais devagar, pode haver comida nele mesmo depois do jejum. Avisar o médico, o dentista e o anestesista que usa tirzepatida antes de qualquer procedimento com sedação ou anestesia. Eles dizem se é preciso pausar e por quanto tempo." | CONFIRMADA | Opcional: "A orientação brasileira mudou em 2026; por isso vale avisar com antecedência." (só se alguém ler o documento original da SBA) | BULA-BR seção 4; ZEP-EUA 5.10; seção 7 deste relatório |

### 8.14 Perguntas para levar ao médico

São perguntas, não afirmações. Todas compatíveis com as fontes. Duas sugestões de pergunta, com base na bula:

- "Se eu não perder 5% do peso em 6 meses na dose mais alta que eu tolerar, o que muda?" (BULA-BR seção 6)
- "Penso em engravidar: com quanto tempo de antecedência eu paro?" (BULA-BR seção 4: pelo menos 1 mês)

### 8.15 E depois?

| Frase atual | Veredito | Correção proposta | Fonte |
|---|---|---|---|
| "Nos estudos, a maior parte das pessoas recupera peso quando para o remédio. O tempo de tratamento serve para montar o que fica: rotina de refeições, proteína, treino de força e sono." | CONFIRMADA a primeira parte. A segunda é proposta do app; não há ensaio mostrando que hábitos evitam o reganho ("has not been studied in controlled trials", MOZ) | "No estudo em que metade parou o remédio depois de 36 semanas, quem parou recuperou em um ano cerca de metade do que tinha perdido, mesmo com orientação de dieta e exercício. Quem continuou manteve. Ainda não há estudo mostrando o que evita o reganho; rotina de refeições, proteína, treino de força e sono são o que os especialistas recomendam montar durante o tratamento." | SM4; BULA-BR-PRO Tabela 13; MOZ "Efficacy" |
| "Parar, reduzir ou manter uma dose de manutenção é uma decisão para tomar com o médico, não sozinha." | CONFIRMADA | — | BULA-BR: "Não interrompa o tratamento sem o conhecimento do seu médico." |

Conta por trás de "cerca de metade": perda de 20,9% na semana 36 e de 9,9% na semana 88 (SM4, resumo). (20,9 − 9,9) / 20,9 = 53%.

### 8.16 De onde vêm estas informações

| Frase atual | Veredito | Correção proposta | Fonte |
|---|---|---|---|
| "Doses, aplicação, dose esquecida e armazenamento: bula do Mounjaro (Eli Lilly) e Lilly Medical Brasil." | CONFIRMADA | "...bula do Mounjaro (Eli Lilly do Brasil), versão aprovada pela Anvisa em 22/04/2026." | BULA-BR |
| "Alimentação, proteína, micronutrientes, atividade física e manejo dos sintomas: \"Nutritional priorities to support GLP-1 therapy for obesity\" (2025), documento conjunto de quatro sociedades médicas americanas (ACLM, ASN, OMA e TOS)." | CONFIRMADA. Duas ressalvas: a ASN é sociedade de nutrição; o documento é consenso de especialistas | "...documento de consenso de quatro sociedades científicas americanas (ACLM, ASN, OMA e TOS). É opinião de especialistas apoiada em estudos, não um ensaio." | MOZ |
| "Anticoncepcional: bula e recomendação da Febrasgo." | CONFIRMADA | "Anticoncepcional: bula brasileira e recomendação da Febrasgo de 03/07/2025." | BULA-BR; FEB |
| "Composição dos alimentos: TACO, 4ª edição (NEPA/Unicamp). Vitaminas B12, D, E, K e folato não constam na TACO e vêm do USDA SR Legacy." | Fora do meu escopo (dados de alimentos) | — | |
| "Metas de vitaminas e minerais: DRIs (Institute of Medicine / NASEM) para adultos." | CONFIRMADA (ver 8.18) | — | DGA Tabela A1-2 |
| "Este app organiza informação e registros. Ele não substitui o médico nem o nutricionista, e as metas podem ser trocadas pelas que eles definirem (aba Perfil)." | Não é afirmação de saúde | — | |

Se entrarem números de ensaio no guia (itens 8.6, 8.11, 8.15), acrescentar a esta seção: "Números de efeitos e de reganho: estudos SURMOUNT-1 e SURMOUNT-4 e bula."

### 8.17 Regras do treino (TREINO.regras)

| Frase atual | Veredito | Correção proposta | Fonte |
|---|---|---|---|
| "3 treinos de força por semana, em dias alternados (por exemplo segunda, quarta e sexta). Alterne A e B." | CONFIRMADA a frequência (consenso). "Dias alternados" é prática de treino, sem fonte lida | — | MOZ |
| "Descanso de 60 a 90 segundos entre as séries." | SEM FONTE nas fontes lidas. Prática usual de treino para iniciantes | — | |
| "5 minutos de aquecimento antes: caminhar no lugar, girar ombros e quadril." | SEM FONTE nas fontes lidas | — | |
| "Caminhada nos outros dias: comece com 10 a 15 minutos e some até chegar a 150 minutos por semana." | CONFIRMADA a meta de 150 min. A progressão é do app | — | MOZ; ZEP-EUA 14.1 (os ensaios recomendaram no mínimo 150 min/semana) |
| "Coma algo com proteína e carboidrato 1 a 2 horas antes. Treinar em jejum com o apetite reduzido aumenta a chance de tontura." | SEM FONTE direta. Apoio indireto: a bula registra tontura (4% a 5%) e queda de pressão (1,6%), ligada a desidratação | Pode ficar. Opcional: "Tontura e queda de pressão aparecem na bula; comer e beber antes do treino reduz a chance." | ZEP-EUA 6.1 |
| "No dia da aplicação ou em dia de enjoo, vale fazer só a caminhada ou reduzir a carga." | SEM FONTE. Ajuste de bom senso; o artigo pede planos adaptados à capacidade da pessoa | — | MOZ |
| "Pare e procure atendimento se sentir dor no peito, falta de ar fora do normal, tontura forte ou desmaio." | SEM FONTE lida hoje; é aviso padrão de segurança em exercício | — | |

Fases do treino (2 séries, depois 3; sobra de 2 a 4 repetições): fora das fontes lidas. Compatível com "customized to match the individual's fitness level" (MOZ). Nada a corrigir.

### 8.18 Parâmetros de `metas()`

| Parâmetro | Veredito | Observação e opção | Fonte |
|---|---|---|---|
| Mifflin-St Jeor para o gasto de repouso | SEM FONTE lida hoje. É a equação mais usada em adultos com obesidade | Erra para mais ou para menos em cada pessoa; por isso o piso e a possibilidade de o nutricionista trocar a meta são importantes | Mifflin MD et al., Am J Clin Nutr 1990 (não reaberto) |
| Déficit de 500 kcal | CONFIRMADA: é o que os ensaios SURMOUNT usaram | "a reduced-calorie diet (approximately 500 kcal/day deficit)" | ZEP-EUA 14.1 |
| Piso de 1.200 kcal para mulher | CONFIRMADA | O SURMOUNT-3 usou 1.200 (mulheres) e 1.500 (homens) na fase intensiva. O piso de homem no app é 1.800 (MOZ); ALM dá 1.500 a 1.800 | MOZ; ZEP-EUA 14.1; ALM (secundária) |
| Proteína 1,4 g/kg (faixa 1,2 a 1,6) | CONFIRMADA a faixa (consenso) | Ver ressalva sobre qual peso usar | MOZ |
| Peso ajustado: IMC 25 + 25% do excesso, quando IMC ≥ 30 | IMPRECISA. A fórmula existe (nutrição hospitalar), sem respaldo específico para esses remédios. **Há um degrau em IMC 30** (ver 2.3) | Opções: (a) aplicar a partir de IMC 25; (b) usar peso real e limitar o resultado a 80-120 g; (c) manter. Em qualquer caso, registrar em `decisoes.md` que é escolha do app | MOZ; Dickerson 2022 |
| Teto 1,6 g/kg | CONFIRMADA | Abaixo dos 2 g/kg que o artigo manda evitar | MOZ |
| Gordura 30% das kcal | CONFIRMADA: dentro de 20% a 35% | Não é dieta pobre em gordura, o que é coerente com o dado de vesícula (seção 4) | ALM (secundária); DGA |
| Água 2.000 ml | IMPRECISA. Não há número em MOZ. ALM diz "greater than 2 to 3 L/day" | Opções: manter 2.000 ml como mínimo e dizer "pelo menos"; ou subir para 2.200 a 2.500 ml. A meta já pode ser trocada no Perfil | ALM (secundária) |
| Fibra 25 g (21 g acima de 50 anos) | CONFIRMADA | Igual à faixa de ALM (21 a 25 g para mulheres) | ALM (secundária); DRI |
| Cálcio 1.000 mg (1.200 em mulher acima de 50) | CONFIRMADA | | DGA Tabela A1-2 |
| Ferro 18 mg (8 mg acima de 50) | CONFIRMADA | | DGA |
| Magnésio 310 mg até 30 anos, 320 depois | CONFIRMADA | | DGA |
| Zinco 8 mg; potássio 2.600 mg | CONFIRMADA | | DGA |
| Vitamina A 700; B1 1,1 mg; B12 2,4; folato 400; C 75 mg; E 15 mg; K 90 | CONFIRMADA | | DGA |
| Vitamina D 15 µg (20 acima de 70) | CONFIRMADA (600 UI; 800 UI acima de 70) | | DGA |

---

## O que não consegui verificar (lista única)

1. Bulário eletrônico da Anvisa: bloqueado (HTTP 403). Usei a bula do site da Lilly Brasil, aprovada em 22/04/2026.
2. Se a caneta multidose (KwikPen) está à venda no Brasil, e a bula brasileira dela.
3. Texto integral de SURMOUNT-1, SURMOUNT-1 de 3 anos, SURMOUNT-2, SURMOUNT-4 e SURMOUNT-5 (só resumos). Por isso: curva de peso nas semanas 4, 12 e 24; reganho nas 17 semanas sem remédio do SURMOUNT-1; interrupção por efeito adverso no SURMOUNT-5.
4. Texto integral de Wharton 2022 e de Almandoz 2024. Os números de Almandoz vêm do comunicado da The Obesity Society.
5. Errata de 2026 do artigo de Mozaffarian (doi:10.1002/oby.70222): existe, não li.
6. Documento original da nota da SBA de 15/05/2026; li só o Portal Afya.
7. Diretriz Abeso 2025/2026 de tratamento farmacológico: não abri. Do posicionamento Abeso/SBEM 2024 li um terço.
8. Situação atual da Anvisa sobre tirzepatida manipulada.
9. Fontes clássicas que citei de memória e não reabri hoje: Mifflin 1990; faixa de 0,5 a 1 kg/semana (NIH 1998, AHA/ACC/TOS 2013); OMS 2020 (força 2 ou mais dias); diretriz de refluxo (2 a 3 h sem deitar); gramas de proteína por refeição.
10. A página da Febrasgo e a do posicionamento SBD/SBEM/Abeso foram lidas por uma ferramenta que devolve resumo com trechos literais, não o texto corrido.
