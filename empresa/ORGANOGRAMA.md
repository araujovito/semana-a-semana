# Organograma

```
Vitor (dono)  ........................ assiste; não decide
└── Direção geral  ................... decide tudo, integra as áreas, fala com o dono
    ├── Auditoria (o questionador) ... independente; reporta só à direção; pode barrar uma entrega
    ├── Pesquisa
    │   └── Chefe de pesquisa  ....... define as perguntas, cobra fonte, entrega a síntese
    │       ├── Pesquisador de literatura científica
    │       ├── Analista de concorrentes
    │       └── Pesquisador de boas práticas (apps de saúde, Android, privacidade)
    └── Engenharia
        └── Chefe de engenharia  ..... prioriza, reparte arquivos, revisa e integra
            ├── Engenheiro de nutrição e dados
            ├── Engenheiro de app (telas e registros)
            ├── Engenheiro Android
            └── Engenheiro de testes
```

## Regras de comando

- Cada pessoa tem um chefe só. Dúvida sobe um nível; nunca chega ao dono.
- O chefe decide e anota o porquê em `empresa/decisoes.md`. Decisão que muda o que a usuária vê ou lê sobre saúde sobe para a direção.
- A auditoria não implementa e não responde aos chefes de área. Os achados dela vão para a direção, que distribui.
- Nada vai para a usuária sem passar por: teste automático verde, revisão do chefe de engenharia e parecer da auditoria.

## Calendário

- Sexta 20/11: pesquisa, auditoria da versão atual, primeira onda de engenharia.
- Sábado 21/11: segunda onda, com o que a pesquisa e a auditoria apontarem.
- Domingo 22/11: congelamento, auditoria final, APK.
- Segunda 23/11: entrega.
