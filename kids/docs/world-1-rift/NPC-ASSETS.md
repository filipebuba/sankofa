# NPC Sprite Assets — Sankofa Kids Mundo 1

Sprites para personagens não-jogáveis. PNG transparente, vertical, estilo
Kirikou/Sankofa (cartoon afro-cêntrico).

## Especificações universais

- **Formato**: PNG-32 com alpha, sem fundo branco.
- **Resolução base**: 512×768 px (proporção 2:3 vertical).
- **Anti-aliasing**: leve, evitar bordas duras.
- **Anchor pivot**: centro-pé (já implícito no `spr.center.set(.5, 0)`).
- **Estilo**: traços limpos, paleta restrita (3–5 cores principais),
  sombreamento flat + 1 nível de profundidade.
- **Output**: `kids/game/assets/world1-X/<nome>.png`.

## Fallback automático

Se PNG não carrega (404 ou erro), `buildNPCs()` em `game.js` faz swap
automático para `emojiTexture(n.avatar)` — joga-se com emojis até PNGs
ficarem prontos. Sem crash, sem fix necessário.

## Pendentes

### Fase 1.2 — Saara Verde

#### `pastor.png` — Pastor Saariano

- **Avatar fallback**: 🧔🏾
- **Descrição visual**: homem ~40 anos, pele escura, barba curta, túnica
  azul-índigo tuareg, vara de pastor na mão, lenço enrolado na cabeça.
- **Pose**: de perfil ¾, vara apoiada no chão, expressão calma.
- **Paleta**: índigo profundo + ocre + branco.

#### `pintora.png` — Pintora Tassili

- **Avatar fallback**: 👩🏿‍🎨
- **Descrição visual**: mulher jovem, mãos pintadas de ocre, vestido
  simples cor de terra, cabelo em tranças.
- **Pose**: de pé, mão estendida como acabou de pintar parede.
- **Paleta**: ocre + vermelho-terracota + castanho.

### Fase 1.3 — Forja Bantu

#### `ferreiro.png` — Ferreiro Nok

- **Avatar fallback**: 🧑🏿‍🏭
- **Descrição visual**: homem robusto, avental de cabedal, martelo
  pousado no ombro, marca de fuligem no rosto.
- **Pose**: de pé ao lado da bigorna, expressão determinada.
- **Paleta**: castanho + cinza-ferro + laranja-brasa.

#### `linguista.png` — Linguista Bantu

- **Avatar fallback**: 👨🏿‍🏫
- **Descrição visual**: homem ~50 anos, túnica padronizada, livro/tabua
  na mão, óculos circulares ou ar reflexivo.
- **Pose**: de pé com mão erguida em gesto de explicação.
- **Paleta**: verde-floresta + amarelo + branco.

#### `pescador.png` — Pescador Canoeiro

- **Avatar fallback**: 🧑🏿‍🌾
- **Descrição visual**: jovem adulto, torso descoberto ou camiseta
  simples, remo na mão, calça arregaçada.
- **Pose**: junto à canoa, remo apoiado.
- **Paleta**: azul-rio + castanho-tronco + ocre.

## Pipeline de produção

### Opção A — IA generativa (recomendado para rapidez)

1. **Midjourney v6** ou **DALL-E 3** com prompt em inglês:
   > "Full-body character portrait of a [descrição EN], west african
   > cartoon style inspired by Kirikou movie, flat shading, transparent
   > background, vertical 2:3 ratio, vibrant warm palette, no text, no
   > borders"
2. Limpar fundo no Photopea/GIMP (magic wand alpha).
3. Resize para 512×768 PNG-32.
4. Drop em `kids/game/assets/world1-X/<nome>.png`.

### Opção B — Desenho manual

1. Procreate / Krita / Photoshop.
2. Trace inicial em low-opacity sobre referência fotográfica.
3. Color flat + 1 layer shadow + 1 layer highlight.
4. Export PNG-32 transparente.

### Opção C — Comissionar artista

Estimativa: 20–60 €/sprite consoante estilo e detalhe.

## Pipeline pós-produção

1. Salvar em `kids/game/assets/world1-2/` ou `world1-3/`.
2. Adicionar caminho ao `sw.js` precache.
3. Bump cache version.
4. Testar `?phase=1.2` ou `?phase=1.3`, verificar sprite carrega +
   anel dourado aparece à volta.

## Checklist

### Fase 1.2
- [ ] `pastor.png`
- [ ] `pintora.png`

### Fase 1.3
- [ ] `ferreiro.png`
- [ ] `linguista.png`
- [ ] `pescador.png`

## Existentes (referência de estilo)

- `assets/lucinha.png` (sprite jogadora)
- `assets/vovo.png` (Vovó intro/cutscene)
- `assets/fred.png` (Fred Fóssil — NPC removido em 2026-05-11, ficheiro
  ainda no disco; pode servir como referência de estilo para futuros
  sprites Vol.I).
