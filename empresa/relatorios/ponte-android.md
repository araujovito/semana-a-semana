# Ponte Android: calendário, compartilhar e copiar (revisão por leitura, 22/11)

## Conclusão

- **"Pôr no calendário": nenhum defeito encontrado na leitura.** A data, a repetição semanal, o dia depois de atraso e o texto do evento estão certos no código. O botão some fora do APK. Sem app de calendário, aparece um aviso no cartão. **Falta conferir no emulador** (ver abaixo), principalmente se o evento cai no dia certo no fuso do Brasil. Ninguém viu esse evento preenchido até hoje: na onda 1, o app de calendário do emulador quebrava.
- **Compartilhar e copiar: dois defeitos, corrigidos.**
  1. A página não lia a resposta da ponte. Quando o Java recusava o texto (mais de 250 mil caracteres), **copiar dizia "Copiado." sem ter copiado nada**, e compartilhar não dizia nada. Isso pode acontecer de verdade com o relatório, se as anotações forem longas, e com "Compartilhar os dados guardados" (tela de dados ilegíveis), que não passa pela conferência de tamanho. Agora aparece um diálogo: "Não foi possível copiar/compartilhar", com o tamanho do texto e o limite. Na exportação, se a ponte recusar, a cópia não conta mais como feita.
  2. No Java, `compartilhar()` e `copiar()` não tinham proteção contra exceção do sistema, e o `calendario()` tinha. Agora as duas devolvem `false` em vez de lançar exceção pela ponte, e a página avisa.
- Testes: `bash testar.sh` (resultado no fim). O Java compila: rodei os passos do `montar-apk.sh` até o zipalign. **O APK não foi assinado:** o worktree não tem `android/chave.keystore`, e não copiei a chave.

## O que foi lido e o que se concluiu

Caminho: Perfil → `cartaoLembretes()` em `app/aparelho.js` → `AC.calendario` → `window.Android.calendario("AAAA-MM-DD")` → `MainActivity.Ponte.calendario`.

| Ponto | Situação |
|---|---|
| Botão fora do APK | Só aparece se `window.Android.calendario` for uma função. No navegador e na versão web, não aparece (o teste `fluxo-aparelho.js` confere). |
| Data de início | Em dia: a próxima prevista. Aplicação prevista para hoje: hoje. Atrasada ou "pular": o dia habitual da semana seguinte (`situacao.seguinte`), para a repetição não cair no dia do atraso. Mais de 14 dias sem registro ("fale com o médico") ou nenhuma aplicação: sem cartão. Aplicou hoje: vai para a próxima semana. Coberto por teste (24/11 em dia, 25/11 atrasada). |
| Fuso | Evento de dia inteiro com início à meia-noite UTC e fim 24 h depois, como pede a documentação do `CalendarContract` para eventos de dia inteiro. A data chega como texto e não passa pelo fuso do celular. **Risco:** se o app de calendário ler o início no fuso local (UTC−3), o evento cai um dia antes. Só o emulador ou o celular respondem isso. |
| Repetição | `RRULE=FREQ=WEEKLY`, sem fim. O dia da semana vem da data de início. |
| Data inválida | Formato conferido por regex, e `setLenient(false)` recusa datas como 2026-02-30. Devolve `false`. |
| Texto do evento | Título "Semana a Semana: aplicação" (`res/values/valores.xml`). Sem nome do remédio, sem dose, sem local, sem descrição. Aparece na tela de bloqueio se ela ligar um aviso. |
| Sem app de calendário | `ActivityNotFoundException` é capturada → `false` → o cartão mostra "Não foi possível abrir um app de calendário…". Coberto por teste (com a ponte simulada). |
| Permissões | Nenhuma. O Intent `ACTION_INSERT` só abre a tela do calendário, e ela salva lá. A visibilidade de pacotes do Android 11+ não afeta `startActivity`. |
| Com PIN | Abrir o calendário põe o app em segundo plano e ele bloqueia. Ao voltar, pede o PIN. Isso está no pedido e em `cifra.md`. |
| `MAX_TEXTO` | 250.000 no Java e no JS (`SEG_MAX_TEXTO`), e o teste confere que são iguais. São cerca de 500 KB no Intent, abaixo do limite de ~1 MB da transação. Não foi testado com texto perto do limite num aparelho. |

## Conferir no emulador (direção)

Pré-requisito: APK compilado a partir do ramo, com a chave original (`bash montar-apk.sh` na pasta principal, depois da junção).

```bash
bash emulador.sh ligar
adb shell settings put global auto_time_zone 0
adb root && adb shell setprop persist.sys.timezone America/Sao_Paulo   # se adb root falhar: Configurações > Sistema > Data e hora > Fuso
adb shell date                                                          # deve mostrar -03
adb shell pm list packages | grep -i calendar           # existe app de calendário? anotar qual
bash emulador.sh instalar
```

1. **Evento no dia certo (mais importante).** No app, registre uma aplicação com data de 3 dias atrás (Semana > Diário > Aplicações). Vá ao Perfil. O cartão "Aplicação no calendário" diz o dia da semana e a data de início. Toque em "Pôr no calendário". `bash emulador.sh foto cal1.png`. Confira: dia inteiro, **mesma data do cartão** (não o dia anterior), repetição semanal, título "Semana a Semana: aplicação". Salve e abra o evento no calendário para ver a data gravada.
   - Para ver o que foi enviado: `adb logcat -d | grep -i "ActivityTaskManager.*INSERT"`.
2. **Repetição:** no calendário, avance 1 e 2 semanas. O evento tem que estar no mesmo dia da semana.
3. **Atraso:** apague a aplicação e registre uma com data de 9 dias atrás. O cartão deve dar o dia habitual da semana que vem, não hoje. Repita o passo 1.
4. **Sem app de calendário:** `adb shell pm disable-user --user 0 <pacote do calendário>`. Toque no botão. Deve aparecer o aviso no cartão, e o app não pode fechar. Depois, `adb shell pm enable <pacote>`.
5. **App de calendário que quebra** (visto na onda 1): se o calendário fechar, o Semana a Semana deve continuar aberto (Intent em tarefa separada). `bash emulador.sh log` para ver o erro.
6. **Copiar e compartilhar:** em Diário > Relatório, toque em Copiar: aparece "Copiado.". Toque em Compartilhar → Seguir: abre o seletor do Android. O caminho do texto grande demais só foi testado no navegador. No aparelho, fica opcional: escrever uma anotação de sintoma muito longa é inviável à mão.
7. Com PIN ligado: depois do passo 1, voltar ao app pede o PIN, e os dados continuam lá.

Limite: o emulador roda Android puro. O calendário do Xiaomi (MIUI/HyperOS) pode tratar o Intent de outro jeito, e o passo 1 também precisa ser feito no celular dela na entrega.

## O que mudou

- `app/nucleo.js`: `compartilhar()` e `copiar()` leem o `true`/`false` da ponte e avisam quando ela recusa. `compartilhar()` devolve `false` nesse caso.
- `app/seguranca.js`: a exportação só marca a cópia como feita (e só diz "Cópia pronta e conferida") se o compartilhamento saiu.
- `android/java/.../MainActivity.java`: `try/catch` em `compartilhar()` e `copiar()`.
- Testes: `fluxo-aparelho.js` (copiar aceito e recusado, compartilhar recusado, exportar recusado, aviso de limite, `try/catch` no Java). A ponte simulada de `fluxo-seguranca.js` passou a devolver `true`, como o Java.
