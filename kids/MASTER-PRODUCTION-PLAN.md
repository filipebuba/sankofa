# Sankofa Kids — Master Production Plan (Temporada 1, 8 episódios)

> Plano consolidado de produção. Mapa único do que existe e o que falta.

---

## Status atual

| Categoria | Estado |
|---|---|
| Roteiros | ✅ 8 eps em `STORYBOARD-EP1.md` + `STORYBOARDS-EP2-8.md` |
| Bíblia visual | ✅ Paleta oficial (PNG/ASE/GPL) + 4 model sheets personagens |
| Concept art | ⏳ Falta gerar (prompts em `art/characters/IMAGE-PROMPTS.md`) |
| Backgrounds | ⏳ Falta — usar prompts no IMAGE-PROMPTS.md |
| Narração | 📝 Scripts EP1 + EP2–EP8 prontos, falta gravar/ElevenLabs |
| Música | 📝 Prompts Suno EP1 + EP2–EP8 prontos, falta gerar |
| SFX | 📝 Lista EP1 (25 itens) + EP2–EP8 únicos prontos, falta baixar |
| Storyboard frames | ⏳ Falta desenhar 30 frames × 8 eps |
| Rig animação | ⏳ Falta fazer no Moho/OpenToonz |
| Animação | ⏳ Por fazer |
| Render+master | 🛠️ Script `render_ep.sh` pronto |
| Legendas | 🛠️ Script `transcribe_subs.sh` pronto |
| Upload | ⏳ Por fazer (canal YouTube Kids precisa criar) |

---

## Estrutura de pastas final

```
kids/
├── README.md                               # Pipeline geral
├── MASTER-PRODUCTION-PLAN.md               # Este ficheiro
├── STORYBOARD-EP1.md                       # Roteiro EP1
├── STORYBOARDS-EP2-8.md                    # Roteiros EP2–8
│
├── storyboard/
│   ├── EP1-SHOT-LIST.md                    # 30 shots EP1
│   └── EP2-8-SHOT-LISTS.md                 # 22 shots únicos × 7 eps
│
├── art/
│   ├── palette/
│   │   ├── sankofa-kids.png/.ase/.gpl      # Paleta oficial 13 cores
│   │   └── sankofa-kids-skin.png           # Strip 6 tons pele
│   └── characters/
│       ├── IMAGE-PROMPTS.md                # Prompts AI Midjourney/SDXL
│       ├── lucinha/TURNAROUND.md
│       ├── vovo-sankofa/TURNAROUND.md      # Recorrente nos 8 eps
│       ├── tropa/TURNAROUND.md
│       └── fred-fossil/TURNAROUND.md       # Recorrente nos 8 eps
│
├── audio/
│   ├── voice/
│   │   ├── EP1-NARRACAO.md                 # Script EP1 detalhado
│   │   └── EP2-8-NARRACAO.md               # Scripts EP2–8
│   ├── music/
│   │   ├── EP1-MUSIC-PROMPTS.md            # 3 prompts Suno EP1
│   │   └── EP2-8-MUSIC-PROMPTS.md          # 14 prompts Suno EP2–8
│   ├── sfx/
│   │   └── EP1-SFX-LIST.md                 # 25 SFX EP1 (52% reusáveis)
│   └── masters/                            # Mix finais .wav
│
├── animation/{moho,opentoonz,cavalry,rive}/
├── renders/{ep1..ep8}/                     # PNG sequences por ep
├── exports/{youtube-16x9,reels-9x16,tiktok-9x16}/
├── subs/{pt-BR,en,kriol-gb}/
└── scripts/
    ├── generate_palette.py
    ├── render_ep.sh                        # ffmpeg PNG seq → MP4
    └── transcribe_subs.sh                  # Whisper SRT
```

---

## Roadmap de execução

### Fase 1 — Concept art (semana 1–2)

**Objetivo**: turnarounds finais de todos os personagens + backgrounds-chave.

- [ ] Gerar 4 turnarounds Lucinha em Midjourney (prompts prontos)
- [ ] Gerar Vovó Sankofa pose icônica
- [ ] Gerar Fred Fóssil
- [ ] Gerar Tomé, Naia, Bibi
- [ ] Gerar 8 protagonistas (Hatshé, Musinho, Zimbi, Adesua, Nzinguinha, Dandarinha, Cabralzinho — falta criar prompts dos 7 novos!)
- [ ] Refinar tudo em Krita conforme bíblia visual
- [ ] Backgrounds: savana baobá (EP1), Karnak (EP2), Niani (EP3), Grande Zimbabwe (EP4), oficina Benin (EP5), corte Ndongo (EP6), Serra da Barriga (EP7), Bissau (EP8)

**Pendência**: criar prompts AI para os 7 protagonistas EP2–8.

### Fase 2 — Áudio (semana 3–4)

- [ ] ElevenLabs Voz Vovó: gravar todos 8 episódios (~25 min total fala)
- [ ] ElevenLabs Voz Fred: gravar 8 falas curtas
- [ ] Suno Trilhas: gerar 8 (1 por ep)
- [ ] Suno Cantigas: gerar 8 (1 por ep)
- [ ] Suno Sting final: gerar 1 (reusa todos)
- [ ] Master Audacity de todas as faixas
- [ ] Baixar 25 SFX EP1 + ~35 SFX únicos EP2–8 = ~60 SFX total

**Tempo estimado**: 2 dias narração + 2 dias música + 1 dia SFX = **5 dias**.

### Fase 3 — Storyboard visual (semana 5)

- [ ] Storyboarder: 30 frames × 8 eps = 240 frames-rascunho
- [ ] Validar timing com narração já gravada
- [ ] Aprovação interna antes de animação

**Tempo estimado**: 5 dias (1 ep por dia).

### Fase 4 — Animação (semana 6–13)

- [ ] Rig Moho: 4 personagens recorrentes (Vovó, Fred, Lucinha, criança espectadora) + 7 protagonistas
- [ ] Animar EP1 (piloto pra calibrar workflow)
- [ ] Animar EP2–8 (1 por semana, paralelo se possível)

**Tempo estimado**: **8 semanas** com 1 animador (paralelizar com 2–3 animadores reduz pra 3 semanas).

### Fase 5 — Mix final + render + upload (semana 14)

- [ ] DaVinci Resolve: compor PNG seq + áudio + texto/legendas para cada ep
- [ ] Master 16:9: `./scripts/render_ep.sh ep1` (até `ep8`)
- [ ] Adapt 9:16 para Reels/Shorts/TikTok
- [ ] Whisper auto-legendas pt-BR + revisão manual + tradução en/kriol-gb
- [ ] Thumbnails (1280x720) — 8 unidades
- [ ] Upload YouTube Kids (Made for Kids ON)
- [ ] Upload Reels + TikTok + YT Shorts

**Tempo estimado**: 5 dias.

---

## Pendências críticas (próximos 3 passos)

1. **Criar prompts AI para 7 protagonistas EP2–8** — atualmente só Lucinha tem
   → adicionar a `art/characters/IMAGE-PROMPTS.md`
2. **Gerar e baixar todas as Sunos** (16 faixas) — 1 dia de trabalho
3. **Iniciar gravação narração EP1 com ElevenLabs** para testar pipeline completo

---

## Orçamento estimado (mínimo viável)

| Item | Custo |
|---|---|
| Suno Pro (1 mês) | $30 |
| ElevenLabs Creator (1 mês) | $22 |
| Midjourney (1 mês) | $30 |
| Total ferramentas pagas | **$82/mês** |
| Software (DaVinci, Krita, OpenToonz, Audacity, Whisper, Storyboarder) | grátis |
| Microfone básico (se gravar humano) | $80–150 one-time |
| Hospedagem domínio | $12/ano |
| **Total temporada inteira** | **~$200–300** |

---

## Métricas de sucesso (canal YouTube Kids)

- **Lançamento**: 8 episódios em batch ou semanal?
  - Recomendado: batch de 4 lançamento + 4 seguintes em 2 meses (algoritmo gosta de regularidade)
- **Meta 6 meses**: 1.000 inscritos, 100k views totais
- **Meta 1 ano**: 10.000 inscritos, 1M views totais
- **Critério qualidade**: retention > 60% nos primeiros 30s, audiência satisfeita

---

## Próximos epis depois da temporada 1

- Temporada 2 (8 eps adicionais) — outras figuras dos 8 mundos
- Especiais Mundo 9 — futuro afro-brasileiro / afro-futurismo
- Versões em outras línguas: kriol-gb, en, fr, es

---

CC BY-SA 4.0 — Sankofa Educa · sankofa.education
