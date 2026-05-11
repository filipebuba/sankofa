# EP1 — Lista de Efeitos Sonoros

> SFX necessários para o EP1.
> Bibliotecas grátis: **Freesound.org**, **BBC Sound Effects**, **Zapsplat** (free tier).
> Convenção arquivos: `audio/sfx/<numero>-<nome-curto>.wav`

---

## SFX por cena

### CENA 1 — Abertura (00:00–00:08)

| # | Nome | Descrição | Duração | Source sugerido |
|---|---|---|---|---|
| 01 | `vento-savana-loop` | Vento suave de planície africana (loop) | 60s loop | Freesound: "savanna wind africa" |
| 02 | `kalimba-intro` | Acorde único kalimba (já no Suno trilha) | 2s | Suno output |
| 03 | `bater-asas-vovo` | Bater de asas Vovó Sankofa (3 batidas) | 1.5s | Freesound: "bird wings flap" |

### CENA 2 — Volta no tempo (00:08–00:25)

| # | Nome | Descrição | Duração | Source |
|---|---|---|---|---|
| 04 | `whoosh-tempo-reverso` | Whoosh suave reversed | 2s | Freesound: "whoosh reverse soft" |
| 05 | `cigarras-savana` | Cigarras + insetos de savana | 30s loop | Freesound: "cicada savanna africa" |
| 06 | `transicao-numero` | Pulse pequeno a cada número aparecendo | 0.3s x6 | Freesound: "ui pulse soft" |

### CENA 3 — Lucinha aparece (00:25–00:50)

| # | Nome | Descrição | Duração | Source |
|---|---|---|---|---|
| 07 | `passos-suaves` | Passos descalços em terra | 3s | Freesound: "barefoot walk dirt" |
| 08 | `colher-fruta` | Pegar fruto da árvore (folhas mexendo) | 1s | Freesound: "leaves rustle pick" |
| 09 | `risada-crianca-leve` | Riso curto suave (Lucinha) | 1s | Freesound: "child laugh soft" |

### CENA 4 — Caminhar ereta (00:50–01:25)

| # | Nome | Descrição | Duração | Source |
|---|---|---|---|---|
| 10 | `passos-deliberados` | Passos lentos e firmes (caminhada ereta) | 5s | Freesound: "footsteps slow deliberate" |
| 11 | `wow-criancas` | "Uau!" de crianças na tropa (espanto) | 1s | Gravar ou Freesound |
| 12 | `kalimba-clima` | Pequeno acorde kalimba de clímax | 2s | Suno output |

### CENA 5 — Cantiga (00:50–01:25)

Sem SFX adicional — só a cantiga Suno + palmas.

| # | Nome | Descrição | Duração | Source |
|---|---|---|---|---|
| 13 | `palmas-criancas` | Palmas de crianças no fim da cantiga | 3s | Freesound: "kids clapping" |

### CENA 6 — Descoberta científica (01:50–02:20)

| # | Nome | Descrição | Duração | Source |
|---|---|---|---|---|
| 14 | `escavar-arqueologia` | Pincel de arqueólogo + raspar terra | 3s | Freesound: "archaeology brush dirt" |
| 15 | `descoberta-revelacao` | Sting de revelação positiva | 1s | Freesound: "reveal gentle bell" |
| 16 | `radio-vintage-beatles` | Pequena distorção rádio antigo (1974) | 2s | Freesound: "old radio static" |

### CENA 7 — Conexão com criança (02:20–02:50)

| # | Nome | Descrição | Duração | Source |
|---|---|---|---|---|
| 17 | `passos-criancas-modernas` | Passos de tênis (criança atual) | 2s | Freesound: "kids running sneakers" |
| 18 | `corrida-pulo-danca` | Mistura: correr + pular + dançar | 3s | Freesound: "kids playing collage" |

### CENA 8 — Moral Sankofa (02:50–03:10)

| # | Nome | Descrição | Duração | Source |
|---|---|---|---|---|
| 19 | `kalimba-pensativo` | Acorde kalimba reflexivo | 3s | Suno output |
| 20 | `vento-suave-final` | Vento de savana mais calmo | 10s | Reuso de #01 |

### CENA 9 — Fred Fóssil (03:10–03:22)

| # | Nome | Descrição | Duração | Source |
|---|---|---|---|---|
| 21 | `boing-cartoon-entrada` | "Boing!" cartoonesco de entrada Fred | 0.5s | Freesound: "cartoon boing" |
| 22 | `chocalho-ossos` | Ossos chacoalhando (Fred dançando) | 2s | Freesound: "bones rattle cute" |
| 23 | `risada-cartoon-fred` | "Hahahaha!" cartoon | 1.5s | Freesound: "cartoon laugh kid" |

### CENA 10 — Logo + fim (03:22–03:30)

| # | Nome | Descrição | Duração | Source |
|---|---|---|---|---|
| 24 | `logo-sting-final` | Sting kalimba final | 4s | Suno output (sting EP1) |
| 25 | `silencio-warm` | Silêncio com leve room tone (não digital total) | 2s | Gravar ou Freesound |

---

## Total: 25 SFX

- Reuso entre episódios: SFX 01, 02, 04, 05, 07, 17, 19, 20, 21, 22, 23, 24, 25 (13/25 = 52% reaproveitáveis)
- SFX exclusivos EP1: 12

---

## Workflow de download

1. Conta Freesound (grátis)
2. Filtrar por: CC0, CC-BY, CC-BY-SA (compatível com licença Sankofa)
3. Download WAV 48kHz se possível
4. Renomear conforme convenção (`01-vento-savana-loop.wav` etc.)
5. Salvar em `audio/sfx/`
6. Criar `audio/sfx/CREDITS.md` listando autor + licença de cada arquivo

---

## Edição em DaVinci Resolve Fairlight

- Track 1: Narração (mono → stereo bus)
- Track 2: Música (cantiga + trilha)
- Track 3: SFX pontuais
- Track 4: Ambiente loop (vento, cigarras)
- Master: -16 LUFS integrated, true peak -1 dBTP

---

## Acessibilidade áudio

- Todo SFX pontual deve ser **opcional** narrativamente — história inteligível só com voz
- Volume SFX nunca acima da narração
- Sem frequências altas penetrantes (>10kHz com ganho)
- Sem bass drops (criança 4 anos não gosta + alguns autistas reagem mal)

---

CC BY-SA 4.0 — Sankofa Educa.
