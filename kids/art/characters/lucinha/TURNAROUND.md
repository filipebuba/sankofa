# Lucinha — Model Sheet

> Inspirada em **Lucy** (Australopithecus afarensis, 3.2 milhões de anos, vale do Awash, Etiópia).
> Humanizada para 4–9 anos: menina pré-humana caminhando ereta.
> Personagem-protagonista do EP1.

---

## Conceito de personagem

- **Idade narrativa**: 4 anos
- **Espécie**: Australopithecus afarensis (humanizada, sem proporções estritamente científicas — escolhas artísticas para empatia infantil)
- **Personalidade**: curiosa, brincalhona, corajosa, pioneira
- **Ação-chave**: caminha ereta sobre dois pés (primeira da espécie no episódio)
- **Objeto recorrente**: fruta colhida (fig do baobá) na mão

---

## Proporções (estilo cartoon-friendly)

- **Altura total**: 4 cabeças (proporção infantil cartoon)
- **Cabeça**: arredondada, ligeiramente maior que humano moderno
- **Olhos**: grandes, expressivos, sobrancelha mais alta que humano adulto
- **Nariz**: pequeno, achatado
- **Boca**: larga sorridente, lábios cheios
- **Maxilar**: ligeiramente mais projetado (referência arqueológica suavizada)
- **Tronco**: compacto, robusto
- **Braços**: ligeiramente longos (referência afarensis), terminam ao meio da coxa
- **Mãos**: 5 dedos, polegar oponível visível
- **Pernas**: curtas mas retas (chave: ereta!)
- **Pés**: descalços, arco visível, polegar não-oponível (já adaptado a caminhar)

---

## Cores (referência paleta `sankofa-kids.ase`)

| Parte | Cor | Hex |
|---|---|---|
| Pele base | skin-3 | `#7D5535` |
| Pele sombra | skin-1 | `#3A2010` |
| Pele highlight | skin-5 | `#BF9268` |
| Cabelo crespo | line-black | `#1F1408` |
| Brilho cabelo | terracotta | `#B85A3A` (sutil) |
| Olhos íris | line-black | `#1F1408` |
| Olhos brilho | bone-white | `#EDE5D5` |
| Dentes | bone-white | `#EDE5D5` |
| Tanga simples (folha) | savana | `#6A8530` |
| Outline | line-black | `#1F1408` (traço grosso 4–6px) |

---

## Turnaround — 5 vistas (gerar PNG 2048x2048 cada, fundo transparente)

Salvar em `art/characters/lucinha/turnaround/`:

1. `01-frente.png` — vista frontal completa
2. `02-tres-quartos.png` — 3/4 frente direita
3. `03-perfil.png` — perfil lateral direita (mostra postura ereta nítida)
4. `04-tres-quartos-costas.png` — 3/4 costas direita
5. `05-costas.png` — vista costas completa

**Pose neutra**: parada, braços levemente afastados do corpo, peso distribuído, olhar para frente.

---

## Folha de expressões (8 expressões mínimas)

Salvar em `art/characters/lucinha/expressoes/`:

1. `01-neutra.png` — calma, leve sorriso
2. `02-feliz.png` — sorriso largo, dentes visíveis, olhos fechados de alegria
3. `03-curiosa.png` — sobrancelhas levantadas, cabeça levemente inclinada, boca aberta pequena
4. `04-surpresa.png` — olhos arregalados, boca em "O" pequeno
5. `05-pensativa.png` — olhar para cima, dedo no queixo
6. `06-corajosa.png` — sobrancelhas firmes, queixo erguido, mãos na cintura
7. `07-triste.png` — sobrancelhas caídas, lábio inferior projetado (uso pontual)
8. `08-rindo.png` — boca bem aberta gargalhada, olhos fechados

---

## Poses-chave EP1

Salvar em `art/characters/lucinha/poses/`:

1. `pose-andando-ereta.png` — caminhando lateral, peso transferido (frame-chave da história)
2. `pose-colhendo-fruta.png` — em pé, braço estendido pra cima alcançando fig
3. `pose-olhando-camera.png` — frontal, sorriso, fruta na mão, olhar pra câmera
4. `pose-correndo.png` — corrida lateral
5. `pose-deitada-dormindo.png` — perfil, dormindo perto da árvore (cena final)

---

## Estilo de linha

- Outline preto 4–6px, levemente irregular (mão livre, não vetor perfeito)
- Sombra: 1 tom só (skin-1) em zonas chave (sob queixo, axila, joelho)
- Highlight: 1 tom só (skin-5) em testa, malar, ombro, joelho
- **NÃO** usar gradientes complexos (estilo simples 2D flat com 3 tons por superfície)

---

## Animação — rig Moho (recomendado)

- **Bones**: cabeça, pescoço, tronco superior, tronco inferior, braço-esq (3 bones), braço-dir (3 bones), perna-esq (3 bones), perna-dir (3 bones), pés (2 bones cada)
- **Smart bones** para: rotação cabeça, abrir/fechar boca, piscar
- **Switch layer** para: 8 expressões boca, 4 expressões olhos
- **Lip-sync**: 9 fonemas (A, E, I, O, U, M, F/V, L, rest)

---

## Inspiração visual

- Estilo **Cocoricó** (Brasil) — cartoon afetivo
- **Kirikou** (Michel Ocelot) — paleta africana, traço limpo
- **Liyana** (animação suazi) — proporções cartoon
- **NÃO** copiar estilo Disney/Pixar 3D — manter 2D flat afro-brasileiro

---

CC BY-SA 4.0 — Sankofa Educa.
