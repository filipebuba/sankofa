# EP1 — Script de Narração (Vovó Sankofa)

> Voz: feminina, materna, ~35–50 anos, dicção pausada, calorosa, sem sotaque marcado.
> Idioma: pt-BR neutro.
> Total: ~3:10 de fala (mais 20s SFX/música sem voz no final).
> Timecodes alinhados a `STORYBOARD-EP1.md`.

---

## Output esperado

- `audio/voice/ep1-narracao.wav` — 48kHz 24-bit mono
- `audio/voice/ep1-narracao-stems/01-cena1.wav`, `02-cena2.wav`, ... (cenas separadas para flexibilidade no edit)

---

## Linhas (timecodes + texto + direção)

### 00:00 → 00:08 — CENA 1 (abertura)

**[suave, acolhedora]**
> Olá, criança! Eu sou a Vovó Sankofa.
> Vem comigo voltar muuuito atrás no tempo.

**Pausa**: 1s no fim.

---

### 00:08 → 00:25 — CENA 2 (volta no tempo)

**[crescendo lento, criando suspense leve]**
> Mais.
> Mais.
> Mais ainda.
>
> Antes do celular.
> Antes da televisão.
> Antes do livro.
> Antes da escrita.
> Antes da escola.
>
> **[mais íntima, encantada]**
> Três milhões e duzentos mil anos atrás.
> Imagina!

**Direção**: cada "mais" com pausa de 0.6s. "Imagina!" com sorriso na voz.

---

### 00:25 → 00:50 — CENA 3 (Lucinha aparece)

**[carinhosa, apresentando alguém querido]**
> Aqui está ela.
> Lucinha.
>
> Ela tem 4 anos.
> Vive na Etiópia, no leste do continente africano.
>
> **[mistério na voz]**
> E ela tem uma coisa que ninguém tinha antes.

**Direção**: "ninguém tinha antes" sussurrado quase, criar expectativa.

---

### 00:50 → 01:25 — CENA 4 (caminhar ereta — clímax)

**[entusiasmada, mas calma]**
> Olha! Olha bem!
>
> Lucinha está em pé.
> Sobre os dois pés!
> Caminhando!
>
> **[explicativa, tom professorinha boa]**
> Antes da Lucinha, todo mundo da família dela andava de quatro,
> ou subia em árvores como os macacos.
>
> Mas a Lucinha foi diferente.
> Ela ficou em pé.
> Ela caminhou.
>
> **[orgulhosa]**
> A primeira menina a caminhar de pé!

**Direção**: "primeira" com peso. Pausa dramática antes.

---

### 01:25 → 01:50 — CENA 5 (cantiga refrão)

**[CANTANDO — usar versão Suno gerada, narração só fala "vamos cantar"]**
> Vamos cantar pra Lucinha?
>
> *[aqui entra a cantiga gerada Suno, narração silencia 25s]*
>
> [01:48] Que linda! Bate palma!

**Letra cantada (gerar via Suno — ver `EP1-MUSIC-PROMPTS.md`)**:
> Lucy, Lucy, andou primeiro
> Lucy, Lucy, vale do Rift
> De pé, de pé, no chão da savana
> A Lucinha caminhou!

---

### 01:50 → 02:20 — CENA 6 (descoberta científica)

**[curiosa, conspiratória — "te conto um segredo"]**
> Sabe como a gente sabe da Lucinha?
>
> Cientistas — pessoas que estudam o passado —
> encontraram os ossos dela.
>
> **[empolgada]**
> Em mil novecentos e setenta e quatro!
> Na Etiópia!
> Os ossos dela!
>
> **[carinhosa]**
> E sabe o nome que deram pra ela?
> Lucy.
> Por causa de uma música dos Beatles que tocava no acampamento.

**Direção**: "Beatles" pronunciar /BÍ-tols/. Sorriso na voz.

---

### 02:20 → 02:50 — CENA 7 (conexão com criança)

**[íntima, chegando perto]**
> Sabe de uma coisa?
>
> Cada vez que você caminha de pé...
> cada vez que você corre, pula, dança...
>
> **[com emoção]**
> Você está fazendo o que a Lucinha começou.
> Há três milhões de anos.
>
> Ela é tua bisa-bisa-bisa-bisa-bisavó muito antiga.
> De toda gente do mundo inteiro.

**Direção**: "tua" com afeto. "Toda gente do mundo inteiro" abrindo a voz.

---

### 02:50 → 03:10 — CENA 8 (moral + Sankofa)

**[serena, ensinando o símbolo]**
> Lembra do meu nome?
> Sankofa.
>
> É uma palavra antiga, do povo Akan, em Gana.
> Quer dizer:
> **[lenta, cada palavra clara]**
> Volta. E. Busca.
>
> Volta no tempo. Busca a história.
> Aprende com quem veio antes.
>
> **[sorriso]**
> Tu é parte dessa história, criança.

**Pausa**: 1s.

---

### 03:10 → 03:22 — CENA 9 (Fred Fóssil)

**[Fred Fóssil — voz diferente: cartoon, voz aguda, brincalhona, ~criança 7 anos]**
> Tchau! Lembra: caminhar de pé veio da Lucy!
> Eu sou os ossos! Hahahaha!
> Sankofa!

**Direção**: voz totalmente diferente da Vovó. Energética. Cartoon clássico.

---

### 03:22 → 03:30 — CENA 10 (logo + fim)

**[Vovó Sankofa, sussurrada]**
> Até a próxima.

**Música**: kalimba sting final + fade out.

---

## Sugestão de geração com ElevenLabs

### Voz Vovó Sankofa
- **Vozes recomendadas pt-BR no ElevenLabs**:
  - "Maria" (warm, mature) — primeira escolha
  - "Camila" (motherly, soft)
  - Custom voice clone se artista preferir gravar 5 minutos de amostra
- **Settings**:
  - Stability: 65
  - Similarity: 75
  - Style exaggeration: 30
  - Speaker boost: ON
- **Modelo**: `eleven_multilingual_v2` (melhor pt-BR)

### Voz Fred Fóssil
- Voz infantil masculina ou feminina aguda
- Stability: 40 (mais expressiva)
- Style: 70
- Pitch shift +20% no Audacity se necessário

---

## Direção geral de gravação

- **NÃO usar voz robótica/info**
- **NÃO usar voz "infantil falsa" (a famosa voz de tia)**
- **USAR**: tom de avó contando história à neta, antes de dormir
- Pausas valorizam o texto — não acelerar
- Volume baixo nas perguntas, ligeiramente mais alto nas afirmações

---

## Pós-processamento Audacity

1. **Noise reduction** (se ruído de fundo)
2. **EQ**: corte abaixo de 80Hz (rumble), pequena boost em 3kHz (presença)
3. **Compressor**: ratio 3:1, threshold -18dB, attack 5ms, release 100ms
4. **De-esser** se necessário
5. **Normalize a -3dB peak**
6. **Loudness**: -16 LUFS integrado (broadcast kids)
7. **Export WAV 48kHz 24-bit**

---

## Checklist gravação

- [ ] Ambiente silencioso (cobertor por trás do microfone)
- [ ] Microfone: condenser USB ou XLR (Rode NT-USB, Blue Yeti, Audio-Technica AT2020)
- [ ] Distância: 15–20cm da boca, com filtro pop
- [ ] Gravar cada cena separada (mais fácil editar)
- [ ] Take 3 versões mínimo de cada linha
- [ ] Tomar água, não falar com fome ou cansada
- [ ] Sorrir genuinamente nas linhas alegres (audível)

---

CC BY-SA 4.0 — Sankofa Educa.
