# EP1 — Prompts Suno para Trilha + Cantiga

> 3 elementos musicais para o EP1.
> Cole no Suno.com Custom Mode.
> Workflow: gerar 2 versões → escolher → download WAV → master Audacity.

---

## Output esperado

- `audio/music/ep1-trilha-loop.wav` — trilha base instrumental loop 60s
- `audio/music/ep1-cantiga-lucy.wav` — cantiga refrão 25s
- `audio/music/ep1-final-sting.wav` — kalimba sting final 4s

---

## 1. Trilha base instrumental (loop 60s)

**Style**:
```
gentle children's afro-folk instrumental score in Portuguese (pt-BR
context), soft kalimba thumb-piano as melodic anchor with sparse 3-note
motif (G C E ascending), warm low-tuned djembe heartbeat at 70 BPM
playing every quarter note softly, distant ambient string pad in C major,
calabash shaker very faint, savanna wind ambience texture underneath,
no vocals, no lyrics, instrumental only, gentle warm intimate lullaby
feel, perfect 60-second loop, BPM 70, key C major, 4/4, mood reverent
ancestral peaceful child-friendly bedtime-story warmth
```

**Title**: `Sankofa Kids EP1 Trilha`

**Exclude Styles**:
```
vocals, singing, lyrics, drums kit, snare, hi-hat, electric guitar,
synth lead, EDM, dubstep, trap, autotune, pop, rock, jazz, swing,
classical orchestra, choir, vocoder, hyperpop, club music, distortion,
heavy bass, modern beats, lo-fi hip-hop
```

**Use no edit**: loop sob narração das cenas 1, 2, 3, 6, 7, 8, 9. Volume baixo (-18 dBFS, atrás da voz).

---

## 2. Cantiga refrão "Lucy, Lucy" (25s)

**Lyrics** (cole exato no Suno):
```
[Verse]
Lucy, Lucy, andou primeiro
Lucy, Lucy, vale do Rift
De pé, de pé, no chão da savana
A Lucinha caminhou!

[Chorus]
Lucy, Lucy, andou primeiro
Lucy, Lucy, vale do Rift
De pé, de pé, no chão da savana
A Lucinha caminhou!

[End]
```

**Style**:
```
joyful afro-folk children's song in Portuguese (pt-BR), bright kalimba
arpeggio melody, lively djembe rhythm with hand-claps, warm female
lead vocal age-appropriate motherly contralto plus children's chorus
joining on every line, sing-along call-response feel, fingerpicked
nylon guitar arpeggios, light shaker, BPM 92, key G major, 4/4,
mood happy proud celebratory child-friendly ancestral, simple memorable
catchy melody for kids 4-9 to sing along, no autotune, organic acoustic
production, intimate close-mic vocals, total length 25 seconds
```

**Title**: `Lucy Andou Primeiro`

**Exclude Styles**:
```
EDM, trap, drill, autotune, vocoder, hyperpop, dubstep, electric rock,
distortion, modern pop production, club music, reggaeton, K-pop,
mumble rap, screamo, country, lo-fi beats, synth lead, drum machine
```

**Use no edit**: cena 5 (00:50 → 01:25). Volume +0 dBFS (frente).

---

## 3. Sting final kalimba (4s)

**Style**:
```
brief kalimba musical sting in Portuguese (pt-BR context) for end-card,
gentle thumb-piano arpeggio C major ascending then resolving to G,
warm acoustic timbre, slight wind ambience tail, no vocals, no drums,
instrumental only, 4 seconds total, slow-decay reverb, soft and warm,
mood peaceful conclusive welcoming, perfect series-signature jingle,
BPM 70, key C major
```

**Title**: `Sankofa Kids Sting`

**Exclude Styles**:
```
vocals, lyrics, drums, percussion, electric instruments, synth, EDM,
modern production, autotune, vocoder, anything not kalimba and pad
```

**Use no edit**: cena 10 final (03:22 → 03:30) + selo Sankofa Kids.

---

## Pós-processamento (Audacity / DaVinci Fairlight)

### Trilha base (1)
1. Normalize -6 dBFS peak
2. Loudness -23 LUFS (background, baixo)
3. EQ low-pass em 12kHz (calor)
4. Verify loop gap (cortar attack se necessário, crossfade 200ms)
5. Export WAV 48kHz 24-bit

### Cantiga (2)
1. Normalize -3 dBFS peak
2. Loudness -16 LUFS (foreground)
3. Compressor leve (2:1, -18 threshold)
4. EQ presença +2 dB em 3kHz nas vozes
5. Verify lip-sync timing com narração
6. Export WAV 48kHz 24-bit

### Sting (3)
1. Fade-in 200ms se attack abrupto
2. Fade-out 1s na cauda (reverb)
3. Normalize -6 dBFS
4. Export WAV 48kHz 24-bit

---

## Mix final EP1 — referência de níveis

| Elemento | Loudness alvo | Pan |
|---|---|---|
| Narração Vovó | -16 LUFS | center |
| Narração Fred | -16 LUFS | center |
| Trilha base | -23 LUFS | wide stereo |
| Cantiga refrão | -16 LUFS | center |
| Sting final | -18 LUFS | wide stereo |
| SFX ambiente (vento) | -28 LUFS | wide stereo |
| SFX pontual (whoosh) | -20 LUFS | center |

**Master final**: -16 LUFS integrado (padrão broadcast kids YouTube).

---

## Reaproveitamento entre episódios

- **Trilha base** pode ser reusada como template (mudar key + instrumentos étnicos por episódio):
  - EP2 (África Antiga): adicionar tar + ney
  - EP3 (Medieval): krar + masenqo
  - EP4 (Bloqueada): ngoni
  - EP5 (Diáspora): garaon caribenho
  - EP6 (Resistências): mbira zulu
  - EP7 (Independências): marrabenta + tabla
  - EP8 (Contemporâneo): township jazz piano
- **Sting final**: idêntico em todos os episódios (assinatura da série)
- **Cantiga refrão**: nova por episódio (figura/tema diferente)

---

CC BY-SA 4.0 — Sankofa Educa.
