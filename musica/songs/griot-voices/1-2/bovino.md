# Suno v5 — Griot Saara Verde · Bovino

**Target file**: `kids/game/assets/world1-2/griot/bovino.mp3`
**Duração alvo**: 8–12s
**Suno settings**: Instrumental **OFF** (queremos voz)

## Style prompt (campo "Style")

```
spoken word narration in european portuguese, elderly female voice with warm grandmother tone, calm contemplative wisdom, no melody, almost a cappella, very minimal kalimba bed in background, slow pace, intimate close-mic, warm reverb, no rhythm, no drums, contemplative ancestral mood, soulful storytelling, like a griot from west africa speaking to a child
```

## Lyrics (campo "Lyrics")

```
[Spoken intimate]
Olha bem para essa pintura, criança.
Onde tu vês deserto,
os teus antepassados viram lagos.
Os bois bebiam água no Saara.
O clima muda...
mas a memória fica.
```

## Persona (opcional)

```
Warm elderly female narrator, Portuguese from West Africa (Guinea-Bissau or Cape Verde accent), grandmother telling story to grandchild by the fire
```

## Negative tags

```
modern pop, autotune, electronic, rap, singing melodically, choir, multiple voices, fast tempo, drums, percussion heavy, english language, brazilian accent
```

## Iterações

- v1: pedir 2 takes; escolher mais "falado" e menos cantado.
- v2: se sair muito musical, adicionar `pure spoken word, no singing, narration only`.
- v3: se sair pouco africana, adicionar `west african lusophone accent`.

## Pós-produção

1. Recortar só parte falada limpa.
2. Audacity: noise gate, normalize -3dB, fade-in 100ms, fade-out 300ms.
3. Export mp3 128 kbps mono → `kids/game/assets/world1-2/griot/bovino.mp3`.
