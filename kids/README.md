# Sankofa Kids — Pipeline de Produção

> Canal Sankofa Kids — animação 2D educativa para 4–9 anos.
> Episódios de 3:30 min em pt-BR, exportados 16:9 (YouTube Kids) e 9:16 (Reels/Shorts/TikTok).
> 8 episódios planejados, com roteiros EP1-EP8, narrações, masters de arte e exports MVP em `exports/youtube-16x9/`.

---

## Estrutura de pastas

```
kids/
├── STORYBOARD-EP1.md          # Roteiro + storyboard textual EP1 (Lucy)
├── STORYBOARDS-EP2-8.md       # Roteiros EP2 a EP8
├── README.md                  # Este ficheiro
│
├── storyboard/                # Frames-rascunho (PNG/PSD/Storyboarder)
│
├── art/
│   ├── palette/               # Swatches paleta oficial (hex + .ase)
│   ├── characters/            # Lucinha, Vovó Sankofa, Tropa, Fred Fóssil — turnaround + expressões
│   ├── backgrounds/           # Cenários masters
│   ├── production/            # Derivados prontos: fundos 16:9 + personagens 1024
│   └── props/                 # Frutos, ossos, lascas de pedra, ferramentas
│
├── animation/
│   ├── moho/                  # Projetos Moho (.moho) — recomendado
│   ├── opentoonz/             # Projetos OpenToonz alternativos
│   ├── cavalry/               # Cavalry (Vovó Sankofa pássaro motion)
│   └── rive/                  # Rive (animações interativas — futuro: integrar no jogo)
│
├── audio/
│   ├── voice/                 # Narração Vovó Sankofa (raw + processado)
│   ├── music/                 # Trilha Suno (kalimba+djembé loops + cantigas)
│   ├── sfx/                   # Vento savana, cigarras, whoosh tempo, kalimba sting
│   └── masters/               # Mix final por episódio (.wav 48kHz 24-bit)
│
├── renders/
│   ├── ep1/                   # Renders intermédios EP1 (PNG sequence + drafts)
│   ├── ep2/ ... ep8/          # Idem outros episódios
│
├── exports/
│   ├── youtube-16x9/          # Master final 1920x1080 H.264
│   ├── reels-9x16/            # Vertical 1080x1920 Instagram Reels
│   └── tiktok-9x16/           # Vertical 1080x1920 TikTok / YT Shorts
│
├── subs/
│   ├── pt-BR/                 # Legendas pt-BR .srt (canal principal)
│   ├── en/                    # English subs (alcance internacional)
│   └── kriol-gb/              # Kriol Guiné-Bissau (público lusófono africano)
│
└── scripts/                   # Utilitários (batch render, lip-sync, export shorts)
```

---

## Stack recomendado (mínimo viável, ~$0)

| Etapa | Ferramenta | Custo |
|---|---|---|
| Roteiro | `*.md` + Markdown editor | grátis |
| Storyboard | Storyboarder (Wonder Unit) | grátis |
| Arte estática | Krita | grátis |
| Animação 2D | OpenToonz **ou** Moho Debut | grátis / $60 |
| Voz narração | ElevenLabs (TTS pt-BR) **ou** Audacity (gravação humana) | $5/mês ou grátis |
| Música | Suno v5 (workflow já em `musica/`) | $10/mês |
| Lip-sync | Rhubarb Lip Sync | grátis |
| Edição final | DaVinci Resolve | grátis |
| Legendas | Whisper (local) + Subtitle Edit | grátis |
| Adapt 9:16 | CapCut Desktop | grátis |

## Stack profissional (~$80–100/mês)

| Etapa | Ferramenta | Custo |
|---|---|---|
| Arte | Procreate (iPad) + Affinity Designer 2 | $13 + $70 one-time |
| Animação | Moho Pro **ou** Toon Boom Harmony | $400 / $25/mês |
| Voz | ElevenLabs Creator | $22/mês |
| Música | Suno Pro | $30/mês |
| Edição | DaVinci Resolve Studio | $295 one-time |

---

## Pipeline (por episódio)

```
1. Roteiro    → STORYBOARD-EPx.md
2. Storyboard → storyboard/epx/*.png (Storyboarder)
3. Arte       → art/characters + art/backgrounds + art/props
4. Voz        → audio/voice/epx-narracao.wav (Audacity/ElevenLabs)
5. Música     → audio/music/epx-trilha.wav (Suno → Audacity master)
6. SFX        → audio/sfx/epx-*.wav
7. Lip-sync   → Rhubarb processa voz → fonemas → import Moho/Animate
8. Animação   → animation/moho/epx.moho — rig + key + tween
9. Render     → renders/epx/frames PNG sequence (1920x1080 @ 24fps)
10. Compose   → DaVinci Resolve: PNG seq + audio mix + texto/legenda
11. Master    → exports/youtube-16x9/epx-master.mp4 (H.264 yuv420p crf 18)
12. Adapt     → exports/reels-9x16/epx-reel.mp4 (CapCut crop + zoom)
13. Subs      → subs/pt-BR/epx.srt (Whisper auto + revisão manual)
14. Upload    → YouTube Kids + Reels + TikTok + YT Shorts
```

---

## Bíblia visual (resumo do EP1, validar com Lucinha + Vovó Sankofa)

### Paleta oficial

| Cor | Hex | Uso |
|---|---|---|
| Céu terra | `#a8693d` | Gradiente céu topo |
| Ocre | `#d9b95a` | Gradiente céu base + acentos |
| Savana | `#6a8530` | Capim, vegetação |
| Pele 1 (escuro) | `#3a2010` | Sombras pele |
| Pele 6 (claro) | `#d9b07a` | Highlights pele |
| Ouro | `#c9a84c` | Vovó Sankofa, decorações |
| Terracota | `#b85a3a` | Acentos quentes |
| Branco osso | `#ede5d5` | Texto, dentes, claro |
| Linha preta | `#1f1408` | Outline grosso (estilo afro contemporâneo) |

Salvar em `art/palette/sankofa-kids.ase` (Adobe Swatch Exchange) + `palette.png` (referência rápida).

### Tipografia

- **Títulos**: Playfair Display (mesma do jogo Sankofa)
- **Legendas**: Atkinson Hyperlegible — contorno preto + fill branco
- Tamanho mínimo legenda: 56px @ 1080p (acessibilidade kids)

### Música base

- Loop kalimba + djembé suave (exportar do motor de áudio do jogo Sankofa)
- Cantiga refrão por episódio (gerada via Suno — ver `musica/CANCOES-EDUCATIVAS-SUNO.md`)

---

## Especificações técnicas de export

### YouTube Kids (16:9)
- Resolução: 1920x1080
- Framerate: 24 fps (animação) ou 30 fps
- Codec: H.264 yuv420p
- Bitrate: 8–12 Mbps
- Áudio: AAC 320 kbps stereo 48 kHz
- Container: .mp4
- Duração alvo: 3:30 min

### Reels / Shorts / TikTok (9:16)
- Resolução: 1080x1920
- Framerate: 30 fps
- Duração alvo: 60–90s (recorte do master 16:9)
- Estratégia: pegar 3 cenas-chave + chamada para episódio completo

---

## Checklist por episódio

- [ ] Roteiro revisto (factualidade histórica + linguagem 4–9 anos)
- [ ] Storyboard frames PNG completos
- [ ] Bíblia visual aplicada (paleta + tipografia + personagens)
- [ ] Narração gravada/gerada (pt-BR neutro, dicção clara)
- [ ] Música Suno gerada + masterizada
- [ ] SFX nas cenas-chave
- [ ] Animação chave + tween
- [ ] Lip-sync Vovó Sankofa
- [ ] Render PNG sequence
- [ ] Mix áudio finalizado em DaVinci
- [ ] Master 16:9 H.264 exportado
- [ ] Versão 9:16 exportada
- [ ] Legendas pt-BR + en revistas
- [ ] Thumbnail criada (1280x720)
- [ ] Metadata YouTube (título, descrição, tags) preenchida
- [ ] Upload YouTube Kids configurado (Made for Kids ON)

---

## Acessibilidade (obrigatório kids)

- Legendas SEMPRE (mesmo em pt-BR — leitura precoce)
- Áudio descrito em pontos visuais críticos
- Contraste WCAG AA mínimo (texto/fundo)
- Sem flashes >3 Hz (epilepsia fotossensível)
- Volume normalizado a -16 LUFS (broadcast kids)

---

## Licenciamento

- Código + assets: CC BY-SA 4.0
- Música Suno: revisar termos Suno por conta paga
- Vozes ElevenLabs: revisar licença comercial
- Atribuição obrigatória: "Sankofa Educa — sankofa.education"

---

## Próximos passos

1. Usar `art/production/backgrounds-16x9/` como base dos masters 16:9.
2. Usar `art/production/characters-1024/` para composições, thumbnails e testes de animação.
3. Revisar legendas pt-BR dos exports MVP e gerar versões EN/Kriol quando a edição final estiver fechada.
4. Escolher o export final por episódio em `exports/youtube-16x9/` e criar as versões 9:16.
5. Validar factualidade histórica e linguagem 4-9 anos antes da gravação final.

---

CC BY-SA 4.0 — Sankofa Educa.
