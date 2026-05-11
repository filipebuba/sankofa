# Griot Voices — Sankofa Kids Mundo 1

Voz Vovó narrando memórias coletadas. Disparada quando jogador apanha mem
ou pressiona **E** perto de mem revelada.

## Especificações universais

- **Voz**: feminina, ~50–70 anos, PT-PT, sotaque Guiné-Bissau/Cabo Verde
  preferível (também serve PT-PT continental se necessário).
- **Tom**: contemplativo, calmo, sábio. Como avó a contar à neta.
- **Duração**: 6–12s por linha.
- **Sample rate**: 44.1 kHz mono, mp3 128 kbps.
- **Output**: `kids/game/assets/world1-X/griot/<type>.mp3`.

## Existentes (Fase 1.1 — não tocar)

| Type      | Path                                 | Status |
| --------- | ------------------------------------ | ------ |
| fossil    | `assets/griot/fossil.mp3`            | ✓      |
| chopper   | `assets/griot/chopper.mp3`           | ✓      |
| rupestre  | `assets/griot/rupestre.mp3`          | ✓      |

## Pendentes — Fase 1.2 Saara Verde

Output dir: `kids/game/assets/world1-2/griot/`.

### `bovino.mp3`

> "Olha bem para essa pintura, criança. Onde tu vês deserto, os teus
> antepassados viram lagos. Os bois bebiam água no Saara. O clima muda...
> mas a memória fica."

### `mao.mp3`

> "Cada mão soprada com ocre na pedra é uma assinatura. Era assim que
> diziam: <emphasis>eu estive aqui</emphasis>. Antes da escrita, era assim que
> guardavam a presença."

### `caca.mp3`

> "Eles não eram selvagens. Conheciam cada animal, cada vento, cada
> estação. Sabiam quando caçar e quando deixar a terra descansar. Isso
> também é ciência."

## Pendentes — Fase 1.3 Forja Bantu

Output dir: `kids/game/assets/world1-3/griot/`.

### `forno.mp3`

> "Argila moldou o forno. Carvão deu o calor. O ar dos foles trouxe o
> fogo. E a pedra... a pedra rendeu-se. Nasceu o ferro. Nasceu uma nova
> era."

### `enxada.mp3`

> "Com o ferro, a enxada lavrou a terra mais funda. A colheita cresceu.
> A aldeia cresceu. Onde antes só se podia caçar, agora podia-se ficar.
> Ferro virou raiz."

### `canoa.mp3`

> "Um tronco. Um machado. Um rio. Os Bantu não pararam — seguiram a
> água, levaram a palavra, levaram o ferro. De Camarões até ao sul, um
> só povo, mil línguas-filhas."

## Pipeline de produção

### Opção A — Voz humana (recomendado)

1. Pedir a familiar (mãe, avó, tia) gravar usando telemóvel + Audacity.
2. Mic a ~15 cm da boca, ambiente silencioso, sem reverb digital.
3. Cada linha em ficheiro separado.
4. Edit Audacity:
   - Noise reduction leve.
   - Compress 2:1, ratio.
   - Normalize a -3 dB.
   - Fade-in 100 ms, fade-out 300 ms.
5. Export mp3 128 kbps mono.

### Opção B — Suno v5 (instrumental + voz)

Limitação: Suno é melhor a cantar do que a narrar. Workaround: usar
estilo "spoken word ambient" com cama instrumental mínima.

**Style prompt:**

```
spoken word narration in portuguese, elderly female voice, calm
wisdom tone, no melody, almost a cappella, minimal kalimba bed,
warm reverb, slow pace, intimate close-mic, no rhythm, contemplative
ancestral mood
```

**Lyrics field:** colar texto do griot directamente. Suno tentará
musicalizar; recortar parte mais "falada" no editor.

### Opção C — ElevenLabs / OpenAI TTS

1. ElevenLabs voice "Rachel" (PT) ou clone de voz familiar.
2. OpenAI TTS-1-HD `voice=nova` ou `voice=shimmer`.
3. Adicionar prosódia com SSML: `<prosody rate="slow" pitch="-2st">`.
4. Reverb leve no Audacity post-process.

## Mapping no código

Em `phases/1-2.js` e `phases/1-3.js`, campo `audio.griot` já aponta:

```js
griot: {
  bovino: 'assets/world1-2/griot/bovino.mp3',
  mao:    'assets/world1-2/griot/mao.mp3',
  caca:   'assets/world1-2/griot/caca.mp3'
}
```

Quando ficheiros existirem, automaticamente carregam via `initAudio()`
em `game.js`. Nenhuma mudança de código necessária.

## Checklist

### Fase 1.2
- [ ] `bovino.mp3` (lago/boi)
- [ ] `mao.mp3` (assinatura ocre)
- [ ] `caca.mp3` (peritos bioma)

### Fase 1.3
- [ ] `forno.mp3` (forja)
- [ ] `enxada.mp3` (agricultura)
- [ ] `canoa.mp3` (migração Bantu)

Após gravar, copiar para
`kids/game/assets/world1-X/griot/<type>.mp3` e bump SW cache.
