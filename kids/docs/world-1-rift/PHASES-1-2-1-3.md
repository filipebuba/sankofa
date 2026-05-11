# Mundo 1 — Specs Fases 1.2 e 1.3

Extensão do Mundo 1 (Origens, Vol.I) a partir da fase base 1.1 (Rift Memories).
Versão: draft 2026-05-11.

---

## Fase 1.2 — Saara Verde

**Período**: 11k–5k anos atrás. Vol.I, cap. Saara húmido.

**Story beat**: Lúcia atravessa savana inundada onde antepassados pintaram Tassili. Vovó: "Onde hoje há areia, viveram hipopótamos."

### Learning objectives

- Saara já foi verde com lagos
- Tassili n'Ajjer = pinturas rupestres patrimônio UNESCO
- Pastoreio bovino no Saara antes da desertificação
- Migração forçada quando aridificou (~5k anos atrás)

### Layout (x: -5 → 45)

- Solo dividido em ilhotas separadas por água rasa (hazard: cair = -1 vida, respawn na última plat).
- Plataformas flutuantes = troncos de palmeira em y:2–6.
- 2 zonas de "areia" cobrindo paredes rochosas (x:15, x:34) — mecânica nova revela pinturas.
- Vento que empurra sprite ±0.3 unidades (parallax visual + leve drag).

### Mecânica nova — "Soprar areia"

- Botão B (reuso) sopra cone à frente. Se sobrepuser parede com areia, areia cai (animação opacity 1→0 em 800ms), revela pintura rupestre estática + toast com nome.
- 3 paredes para limpar antes de poder ativar memória rupestre final.

### Hazards

- Hipopótamo pacífico (sprite 🦛) bloqueia caminho em x:22 — espera 2s, mergulha, libera passagem. Storytelling: "Não és predador, ele não foge."
- Crocodilo em x:28 patrulha 5 unidades horizontais; toque = -1 vida.

### Cauris

12 unidades. Espalhar entre ilhotas. Premiar exploração das plataformas mais altas.

### NPCs

**NPC 1 — Pastor Saariano** 🧔🏾 (x:10, fácil, unlock:0)

- Role: "Levei vacas onde hoje é só areia."
- Q: "Há 8 mil anos o Saara tinha o quê?"
- O: ["Lagos, gado e pinturas", "Só dunas", "Pirâmides"]
- C: 0
- R: "+5 cauris"
- OK: "Verde! Pastores criavam gado antes do clima secar."

**NPC 2 — Pintora Tassili** 👩🏿‍🎨 (x:30, médio, unlock:1)

- Role: "Mãos no ocre, histórias na pedra."
- Q: "Como guardamos memória antes da escrita?"
- O: ["Pinturas + tradição oral", "Computador", "Pirâmides", "Hieróglifos"]
- C: 0
- R: "+1 vida"
- OK: "Tassili n'Ajjer — UNESCO desde 1982."

### Memórias

| Tipo      | Posição    | Griot                                                                |
| --------- | ---------- | -------------------------------------------------------------------- |
| `bovino`  | x:13, y:3  | "Vacas no deserto — clima muda, memória fica."                       |
| `mao`     | x:24, y:5  | "Sopro de ocre — assinatura ancestral."                              |
| `caca`    | x:38, y:6.5| "Não eram selvagens — eram peritos do bioma."                        |

**Reveal**: scan (cajado) funciona como antes. Soprar areia em paredes adicionais dá bónus cauris (+3 cada).

### Win

- Base: 3 memórias + 1 NPC mín.
- Perfect: 3 mem + 2 NPC + todos cauris + sem dano.
- Código bónus: `SAARA8000`.

### Paleta (override de P global)

```js
P = {
  lt: 0x7eb4d4,  // sky húmido
  ea: 0xc4a26a,  // areia ocre
  wt: 0x3a6a7a,  // lago raso
  pl: 0x4a6b3a,  // palmeira
  // ... resto reusa 1.1
}
```

### Audio

- BG: tambor + flauta tuareg, BPM ~85, loop ~60s.
- SFX: `soprar.mp3` (vento curto), `agua-passo.mp3` (chapinhar).
- Griot: `bovino.mp3`, `mao.mp3`, `caca.mp3` (15–25s cada).

### Assets novos

- `assets/world1-2/pastor.png`, `pintora.png`, `hipopotamo.png`, `crocodilo.png`
- `assets/world1-2/areia-wall.png` (tile), `pintura-bovino.png`, `pintura-mao.png`, `pintura-caca.png`
- `assets/world1-2/palmeira.png` (parallax)
- `assets/world1-2/bg-music.mp3`

---

## Fase 1.3 — Forja Bantu

**Período**: ~3000–2000 anos atrás. Vol.I, cap. expansão Bantu + metalurgia do ferro.

**Story beat**: Lúcia desce em clareira de floresta Camarões/Nigéria. Vovó: "O ferro mudou tudo — quem soube forjar, viajou longe."

### Learning objectives

- Bantu = família linguística (~500 línguas hoje)
- Origem: Camarões/Nigéria, ~3k anos
- Migração levou metalurgia + agricultura por sub-Sahara
- Ferro forjado = ferramenta + canoa + machado

### Layout (x: -5 → 50, vertical mais denso)

- Setor 1 (x:-5 → 15): clareira com forja central.
- Setor 2 (x:15 → 30): trilho floresta — plataformas em troncos altos (y:3–8), copas escurecem (fog mais densa).
- Setor 3 (x:30 → 50): rio — canoa-plataforma móvel x oscilando ±3.

### Mecânica nova — "Forjar"

- Bigorna interativa em x:5 (chão). Aproximar + E = mini-QTE: 3 toques ritmados (visual: martelo cai, barra de timing).
- Sucesso forja "machado de ferro" (item visual no HUD, ícone 🪓).
- Sem machado: trilho da floresta tem cipós bloqueando em x:18, x:24 (sprite verde). Com machado: B (scan reaproveita) corta cipó.
- Recompensa: machado também derruba 1 árvore decorativa por fase (descobre cauri escondido).

### Hazards

- Cobra em x:20 patrulha vertical y:1↔3, toque = -1 vida.
- Rio em x:35 → 48: cair sem canoa = -1 vida. Canoa só anda x:35–45 (oscilação automática).

### Cauris

15 unidades. Mais densos no setor floresta (recompensa exploração vertical).

### NPCs (3 — primeiro mundo com 3 NPCs)

**NPC 1 — Ferreiro Nok** 🧑🏿‍🏭 (x:3, fácil, unlock:0)

- Role: "Bate no ferro enquanto quente — primeira tecnologia que mudou África."
- Q: "Que povo dominou ferro cedo no Níger/Nigéria?"
- O: ["Cultura Nok", "Romanos", "Vikings"]
- C: 0
- R: "ensina forja" (rfn habilita bigorna)
- OK: "Nok — séc. V a.C., terracotas + ferro."

**NPC 2 — Linguista Bantu** 👨🏿‍🏫 (x:22, médio, unlock:1)

- Role: "Uma língua, mil filhas — sigo as palavras pela floresta."
- Q: "Quantas línguas Bantu existem hoje?"
- O: ["Cerca de 500", "2", "20", "5000"]
- C: 0
- R: "+10 cauris"
- OK: "Suaíli, Quicongo, Zulu, Xhosa — todas filhas Bantu."

**NPC 3 — Pescador Canoeiro** 🧑🏿‍🌾 (x:42, difícil, unlock:2)

- Role: "Machado fez canoa, canoa levou-nos a sul."
- Q: "Como Bantu se espalharam sub-Sahara?"
- O: ["Migração com ferro e agricultura", "Cavalos", "Navios mercantes europeus", "Não migraram"]
- C: 0
- R: "+2 vidas (cap 5)"
- OK: "~3000 anos atrás, dos Camarões para sul/leste."

### Memórias

| Tipo      | Posição     | Griot                                                              |
| --------- | ----------- | ------------------------------------------------------------------ |
| `forno`   | x:8, y:2    | "Argila + foles — temperatura derrete pedra-ferro."                |
| `enxada`  | x:26, y:6   | "Ferro lavra terra mais funda — colheita maior, aldeia cresce."    |
| `canoa`   | x:45, y:2.5 | "Um tronco, um machado, um rio — três continentes ligados."        |

**Reveal**: scan revela como antes. Machado também conta como "ferramenta de descoberta" — derrubar árvore específica em x:30 revela memória bónus opcional (`bantu-arvore`, +5 cauris).

### Win

- Base: 3 memórias + 2 NPCs mín.
- Perfect: 3 mem + 3 NPCs + machado forjado + todos cauris.
- Código bónus: `BANTU3000`.

### Paleta

```js
P = {
  lt: 0x2b3a2a,  // canopy escuro
  ea: 0x3d2818,  // solo floresta
  fo: 0x5a8a3a,  // folha
  fe: 0x8a8a8a,  // ferro
  br: 0xff6a2a,  // brasa
  // ... resto reusa 1.1
}
```

### Audio

- BG: mbira + tambor de tronco, BPM ~95, loop ~70s.
- SFX: `martelo.mp3` (bater ferro), `cipo-corte.mp3`, `canoa-agua.mp3`.
- Griot: `forno.mp3`, `enxada.mp3`, `canoa.mp3`.

### Assets novos

- `assets/world1-3/ferreiro.png`, `linguista.png`, `pescador.png`
- `assets/world1-3/bigorna.png`, `forno-icon.png`, `enxada-icon.png`, `canoa.png`
- `assets/world1-3/cipo.png`, `arvore-floresta.png` (parallax denso)
- `assets/world1-3/machado-hud.png` (ícone 16x16 HUD)
- `assets/world1-3/bg-music.mp3`

---

## Sistema de fases (transversal)

### Selector

Substituir `intro` por menu pós-clique com 3 botões:

```
1.1 Rift Memories
1.2 Saara Verde       (bloqueado até 1.1 done)
1.3 Forja Bantu       (bloqueado até 1.2 done)
```

### Persistência

```js
// localStorage key: sankofa_kids_progress
{
  phases: {
    "1.1": { done: true,  perfect: false },
    "1.2": { done: false },
    "1.3": { done: false }
  }
}
```

### Refactor mínimo

- Extrair `NPCS`, `memDefs`, `cauriPositions`, `plats`, paleta `P`, tutorial strings → `phases/1-1.js`, `1-2.js`, `1-3.js`.
- `game.js` aceita `?phase=1.2` ou lê do localStorage.
- HUD ganha label fase ("1.2 · SAARA VERDE").

### Estimativa

| Item                         | Esforço |
| ---------------------------- | ------- |
| 1.2 código                   | ~6h     |
| 1.2 assets (4 sprite + 4 pintura + 3 griot + 1 música) | ~12h |
| 1.3 código (forja + canoa)   | ~8h     |
| 1.3 assets                   | ~14h    |
| Refactor selector + persist  | ~3h     |
| **Total**                    | **~43h**|

---

## Status (atualizado 2026-05-11)

### Feito

- [x] Scaffolding `phases/1-1.js`, `1-2.js`, `1-3.js` — data layer completa.
- [x] Refactor `game.js` para consumir `window.PHASE_X_Y` dinamicamente.
- [x] Loader: `?phase=1.2` query → localStorage `sankofa_kids_progress` → fallback `1.1`.
- [x] `markPhaseDone()` persiste win + perfect em localStorage.
- [x] Selector UI no `#intro` (3 cards: current/done/locked/available).
- [x] Click em card unlocked recarrega com `?phase=X.Y`.
- [x] `setupPhaseSelector()` lê progress + bloqueia phases conforme `prevDone`.
- [x] Renderer enigma com `scene` + `diff` + `type` (`.e-meta`, `.e-scene`).
- [x] Renderer NPC com `scene` (`.nd-scene`).
- [x] `shuffledOptions(o, c)` randomiza alternativas em runtime (enigma + NPC).
- [x] `escapeHTML()` em texto user-supplied.
- [x] 4+ alternativas suportadas.
- [x] Enigmas reescritos formato game-first em 1.1/1.2/1.3 (cena → pergunta interpretativa).

### Pendente

- [x] ~~Mecânica **soprar areia** (1.2)~~ — `buildSandWalls()` cria placas sand color em z:+0.3; `triggerScan` chama `clearSandWall(type)` quando revela mem do mesmo type; fade 800ms + bonus +3 cauris + dust. Posições alinhadas com mems em phase data.
- [x] ~~Mecânica **forja QTE** (1.3)~~ — `buildInteractables()` cria mesh bigorna (base+top+horn+ring pulsante); `triggerInteract` perto da bigorna abre `#forgeQTE` overlay (3 toques no ritmo, marker slide 1.2s, zona central 20%); 3 hits → `S.axe=true` + showStage; bloqueado se Ferreiro Nok ainda não falado (`S.anvilUnlocked`).
- [x] ~~Mecânica **corte cipó** (1.3)~~ — `buildVines()` cria cipó mesh (stem + 3 leaves); `triggerScan` com `S.axe` chama `cutNearbyVine()` (fade + drop + rotação 600ms + 2 cauris).
- [x] ~~**Bonus mem** "Árvore Bantu" (1.3)~~ — `buildBonusMems()` cria árvore mesh (trunk + canopy + anel dourado pulsante) para `bonusMems[]` com `requires:'axe'`; `chopNearbyTree()` derruba (rotação fall + opacity) + cauris bonus + griot.
- [x] ~~**Canoa móvel** (1.3)~~ — `buildMovingPlats()` cria mesh canoa (hull + deck) + push em `plats[]` para AABB collision; `updateMovingPlats()` oscila no eixo `range[0..1]` sin com `speed`; sticky platform shift player.x pelo delta quando S.gnd em cima.
- [x] ~~**Snake hazard** (1.3)~~ — `buildHazards()` cria sprite 🐍 oscilando y; collision com cooldown 1500ms causa `loseLife()`.
- [x] ~~**Hippo** (1.2)~~ — sprite 🦛 com cycle visible/submerged (default 4000ms each); blocking AABB empurra player de volta + toast hint. Mergulha → opacity .25 + y:-0.6.
- [x] ~~**Crocodile** (1.2)~~ — sprite 🐊 patrol horizontal `range[0..1]` a `speed`; flip scale.x conforme direção; collision em ground level (S.y<1.2) com cooldown 1500ms causa `loseLife()`.
- [ ] **Water-gap respawn** (1.2/1.3) — `waterGaps[]` precisa loop de detecção. Atualmente `S.y<-6` apanha quedas via void existente.
- [ ] **Bonus mem** "Árvore Bantu" (1.3) — `bonusMems[]` ainda não construído.
- [x] ~~`reward` switch em `showEnigma`~~ — `applyEnigmaReward(reward)` aplica efeito por tipo: `'vida'` (default — hp=1, respawn origem), `'cauris'` (+8 cauris, respawn lastSafe), `'passagem'` (S.passageOpen=true + respawn lastSafe), `'ferramenta'` (S.axe=true + S.anvilUnlocked=true + respawn). Prompt do enigma muda dinamicamente conforme `en.reward`. Enigmas sem campo `reward` continuam a comprar vida.
- [ ] `S.hpCap` consistente — Pintora hardcoda `< 3`, Pescador define cap 5.
- [x] ~~HUD label fase ("1.2 · SAARA VERDE")~~ — `#phase-label` pill top-center, fade-in após intro click via `showPhaseLabel()`. Lê `PHASE.id` + `PHASE.name` em uppercase.
- [x] ~~Strings hardcoded em `index.html` (`#title-card`, `#win-msg`)~~ — Agora vêm de `PHASE.strings { titleCard, winTitle, winMsg, winMsgPerfect, stageWin, stageWinPerfect }`. game.js setupPhaseSelector escreve title-card; bloco win consome strings com fallback genérico.
- [~] Mix dificuldade enigmas vs spec (drift residual, aceitável):
  - 1.1: atual 50/50/0 (spec 70/30/0) — 0% inferência alcançado; ratio obs/comp residual.
  - 1.2: atual 25/50/25 (spec 30/50/20) — próximo, drift mínimo.
  - 1.3: atual 25/25/50 (spec 20/40/40) — inferência dominante (apropriado tema causal Bantu).
- [x] ~~Rewards variados em enigmas (validação prática switch)~~ — 1.1 chopper enigma `reward:'cauris'`; 1.2 bovino obs `reward:'cauris'` + migração comp `reward:'passagem'`; 1.3 forja obs `reward:'ferramenta'` + ferramentas inf `reward:'passagem'`. Restantes ficam `vida` default.
- [ ] Assets 1.2 (4 sprite + 4 pintura + 3 griot + ~~bg-music~~). Sprites NPC: ver `NPC-ASSETS.md`. Griot voices: ver `musica/songs/griot-voices/README.md`. Fallback emoji automático em `buildNPCs()` (img 404 → emoji texture sem crash).
- [ ] Assets 1.3 (3 NPC + bigorna + forno/enxada/canoa + cipó + parallax + ~~bg-music~~). Idem.

### Notas técnicas

- `S.axe` flag adicionado pelo `rfn` do Ferreiro Nok — pendente uso em corte cipó.
- `S.anvilUnlocked` flag pendente uso para abrir mini-QTE bigorna.
- `S.passageOpen` proposto para reward `'passagem'`.
- Phase scripts carregam sync antes de `game.js` (defer); ordem 1-1 → 1-2 → 1-3.
- SW precache em `sankofa-rift-v9` (bump cada vez que ficheiros mudam).
