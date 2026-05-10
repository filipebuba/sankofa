# EP1 — Prompts para teu app TTS

> Cola cada bloco no app, gera, baixa como `.mp3` ou `.wav`, e salva com o nome indicado em `audio/voice/ep1-stems-v3/`.
> Voz: Vovó Sankofa (cenas 1-8, 10-11) + Fred Fóssil (cena 9, voz infantil/cartoon).
> Idioma: pt-BR. Texto já tem fonética para Bítols, Lúci, etc.

---

## Setup

Cria pasta `audio/voice/ep1-stems-v3/` antes de começar.

Para cada cena: **cola só o texto entre `>>>` e `<<<`** no campo de prompt do app.
A "Direção" é orientação de tom (não cola).

---

## CENA 1 — abertura
**Direção**: tom suave, acolhedor, como avó cumprimentando neta. Pausa final 0.5s.
**Output**: `01-cena1-abertura.mp3`

>>>
Olá, criança! Eu sou a Vovó Sankofa. Vem comigo voltar muuuito atrás no tempo.
<<<

---

## CENA 2 — volta no tempo
**Direção**: crescendo lento, suspense leve, cada "Mais" com pausa 0.6s. "Imagina!" com sorriso.
**Output**: `02-cena2-volta-tempo.mp3`

>>>
Mais. Mais. Mais ainda. Antes do celular. Antes da televisão. Antes do livro. Antes da escrita. Antes da escola. Três milhões e duzentos mil anos atrás. Imagina!
<<<

---

## CENA 3 — Lucinha aparece
**Direção**: carinhosa, apresentando alguém querido. "Algo especial" sussurrado quase.
**Output**: `03-cena3-apresentacao.mp3`

>>>
Aqui está ela. Lúcinha. Ela tem quatro anos. Vive na Etiópia, no leste do continente africano. E ela tem uma coisa especial.
<<<

---

## CENA 4 — caminhar (CORRIGIDO HGA)
**Direção**: entusiasmada mas calma. "Famosa" com peso. Pausa antes de "três milhões". Sem dizer "primeira a caminhar"!
**Output**: `04-cena4-caminhar.mp3`

>>>
Olha! Olha bem! Lúcinha está em pé. Sobre os dois pés! Caminhando! Lúcinha é uma das primeiras meninas que conhecemos que andou em pé na nossa família grande e antiga. Antes dela, há muitos milhões de anos, outras crianças também andavam em pé — em Chade, em Quénia, na Etiópia. Mas a Lúcinha é a mais famosa de todas. Uma menina pequenininha, há três milhões de anos, caminhando na savana africana!
<<<

---

## CENA 5 — chama cantiga
**Direção**: convite caloroso. Frase curta e brilhante.
**Output**: `05-cena5-intro-cantiga.mp3`

>>>
Vamos cantar comigo pra Lúcinha?
<<<

---

## CENA 6 — descoberta científica
**Direção**: curiosa, conspiratória ("te conto um segredo"). "Mil novecentos e setenta e quatro" com empolgação. "Bítols" pronunciar /BÍ-tols/. Sorriso na voz.
**Output**: `06-cena6-descoberta.mp3`

>>>
Sabe como a gente sabe da Lúcinha? Cientistas — pessoas que estudam o passado — encontraram os ossos dela. Em mil novecentos e setenta e quatro! Na Etiópia! E sabe o nome que deram pra ela? Lúci. Por causa de uma música dos Bítols que tocava no acampamento.
<<<

---

## CENA 7 — conexão com criança
**Direção**: íntima, chegando perto. "Tu" com afeto. "Toda gente do mundo inteiro" abrindo a voz.
**Output**: `07-cena7-conexao.mp3`

>>>
Sabe de uma coisa? Cada vez que tu caminhas em pé... cada vez que tu corres, pulas, danças... Tu estás fazendo o que a Lúcinha começou. Há três milhões de anos. Ela faz parte da nossa família muito antiga. De toda gente do mundo inteiro.
<<<

---

## CENA 8 — moral + Sankofa
**Direção**: serena, ensinando. "Volta. E. Busca." cada palavra clara, lenta. Sorriso final.
**Output**: `08-cena8-moral.mp3`

>>>
Lembra do meu nome? Sankofa. É uma palavra antiga, do povo Akan, em Gana. Quer dizer: Volta. E. Busca. Volta no tempo. Busca a história. Aprende com quem veio antes. Tu fazes parte dessa história, criança.
<<<

---

## CENA 9 — Fred Fóssil ⚠️ VOZ DIFERENTE!
**Direção**: voz infantil/cartoon, aguda, brincalhona, ~7 anos. ENERGIA TOTAL. NÃO usar voz da Vovó!
**Voice ID sugerida**: voz infantil masculina, ou voz da Vovó com pitch +30Hz / rate +5%.
**Output**: `09-cena9-fred.mp3`

>>>
Tchau! Lembra: caminhar em pé é coisa muito antiga! Eu sou os ossos! Hahahaha! Sankofa!
<<<

---

## CENA 10 — fim Vovó
**Direção**: sussurrada, ternura, lenta.
**Output**: `10-cena10-fim.mp3`

>>>
Até a próxima.
<<<

---

## CENA 11 — silêncio (skip se app não suporta)
**Direção**: NÃO precisa gerar. Será silêncio 1s gerado por ffmpeg.
**Output**: pular

---

## Configurações sugeridas para o app

Se o app expor sliders ElevenLabs:
- **Stability**: 65 (consistente, mas com expressão)
- **Similarity boost**: 75
- **Style exaggeration**: 30 (cena 9 Fred = 70)
- **Speaker boost**: ON
- **Model**: `eleven_multilingual_v2`

Se o app é o que tu fizeste ontem com nuE5FWBCfLcIqaRgrTaz, usa esse voice ID em todas as cenas EXCETO a 9 (Fred precisa voz diferente).

---

## Depois de gerares todos

Coloca os 10 arquivos em `audio/voice/ep1-stems-v3/` com os nomes exatos acima. Avisa quando terminar — eu concat + re-mixo + re-renderizo EP1 v8.
