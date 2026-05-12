# Midjourney v6 Prompts — NPC Sprites Mundo 1

5 prompts prontos para gerar sprites dos NPCs pendentes. Cole no Discord
do Midjourney (`/imagine prompt: ...`), gera 4 takes, escolhe a melhor,
upscale, remove background (Photopea / remove.bg), salva no path indicado.

## Settings universais

- **Versão**: `--v 6`
- **Aspect**: `--ar 2:3` (vertical)
- **Stylize**: `--s 350` (controlado, não estilizado demais)
- **Estilo base**: cartoon Kirikou/Sankofa, pintura digital quente

## Pós-processamento

1. Upscale (U1/U2/U3/U4 conforme melhor take).
2. Download imagem 2x.
3. Photopea: magic wand background → delete → export PNG-32 transparente.
4. Resize para 512×768 (mantendo proporção).
5. Drop em `kids/game/assets/world1-X/<nome>.png`.
6. Adicionar ao `sw.js` precache + bump cache.

---

## Fase 1.2 — Saara Verde

### `pastor.png` — Pastor Saariano

**Path final**: `kids/game/assets/world1-2/pastor.png`
**Fallback emoji**: 🧔🏾

```
/imagine prompt: full body portrait of a saharan pastoralist man, mid 40s, dark brown skin, short black beard, wearing deep indigo tuareg robe and white head wrap, holding a wooden shepherd staff, calm wise expression, looking forward, west african cartoon style inspired by Kirikou Michel Ocelot, flat shading with one shadow layer, vibrant warm palette of indigo blue ochre orange and bone white, transparent background, vertical 2:3 ratio, no text, no border, no logo --v 6 --ar 2:3 --s 350
```

### `pintora.png` — Pintora Tassili

**Path final**: `kids/game/assets/world1-2/pintora.png`
**Fallback emoji**: 👩🏿‍🎨

```
/imagine prompt: full body portrait of a young african woman cave painter, dark brown skin, hands and forearms covered in red ochre pigment, wearing earth-tone simple dress, hair in long braids, gentle proud expression, one hand extended as if just finishing a cave painting, west african cartoon style inspired by Kirikou Michel Ocelot, flat shading with one shadow layer, palette of ochre red terracotta and warm brown, transparent background, vertical 2:3 ratio, no text, no border --v 6 --ar 2:3 --s 350
```

---

## Fase 1.3 — Forja Bantu

### `ferreiro.png` — Ferreiro Nok

**Path final**: `kids/game/assets/world1-3/ferreiro.png`
**Fallback emoji**: 🧑🏿‍🏭

```
/imagine prompt: full body portrait of a robust african blacksmith man, mid 30s, dark brown skin, broad shoulders, wearing leather apron over bare chest, soot mark on cheek, holding a iron hammer resting on shoulder, determined focused expression, west african cartoon style inspired by Kirikou Michel Ocelot, flat shading with one shadow layer, palette of brown leather iron gray and ember orange, transparent background, vertical 2:3 ratio, no text, no border --v 6 --ar 2:3 --s 350
```

### `linguista.png` — Linguista Bantu

**Path final**: `kids/game/assets/world1-3/linguista.png`
**Fallback emoji**: 👨🏿‍🏫

```
/imagine prompt: full body portrait of a wise african teacher man, around 50 years old, dark brown skin, gentle wrinkles, wearing patterned green tunic with yellow geometric design, holding a wooden tablet or carved stick, one hand raised in teaching gesture, thoughtful warm expression, west african cartoon style inspired by Kirikou Michel Ocelot, flat shading with one shadow layer, palette of forest green yellow ochre and white, transparent background, vertical 2:3 ratio, no text, no border --v 6 --ar 2:3 --s 350
```

### `pescador.png` — Pescador Canoeiro

**Path final**: `kids/game/assets/world1-3/pescador.png`
**Fallback emoji**: 🧑🏿‍🌾

```
/imagine prompt: full body portrait of a young african canoe fisherman, early 20s, dark brown skin, lean athletic build, bare torso or simple sleeveless shirt, rolled up pants, holding a long wooden paddle, river water dripping from fingers, content peaceful expression, west african cartoon style inspired by Kirikou Michel Ocelot, flat shading with one shadow layer, palette of river blue tree brown and golden ochre, transparent background, vertical 2:3 ratio, no text, no border --v 6 --ar 2:3 --s 350
```

---

## Tip — Iterações

Se Midjourney não pega "transparent background" bem:
- Adiciona `isolated on plain white background, full character visible` e remove fundo branco em Photopea.
- Ou usa `--seed <num>` para iterar mesma composição com pequenos ajustes.

Se cara sair ocidental:
- Reforçar `west african features, dark brown skin, expressive face, NOT european NOT asian`.

Se sair muito realista:
- Adicionar `flat cartoon illustration, 2D animation cel style, NOT photorealistic, NOT 3D render`.

## Checklist

### Fase 1.2
- [ ] `pastor.png`
- [ ] `pintora.png`

### Fase 1.3
- [ ] `ferreiro.png`
- [ ] `linguista.png`
- [ ] `pescador.png`

Após cada PNG entrar, bump `sw.js` CACHE e add path em ASSETS.
