# Vovó Sankofa — Model Sheet

> Pássaro narrador da série. Modelo do **logo do jogo Sankofa**.
> Símbolo Adinkra Sankofa (Akan, Gana): pássaro que voa para frente olhando para trás.
> "Não há mal em voltar para buscar o que ficou."
> Aparece em **todos os 8 episódios** como guia narrativa.

---

## Conceito

- **Espécie**: pássaro estilizado (não-realista) — mistura de garça + íbis sagrado + ave de fantasia
- **Personalidade**: sábia, calma, carinhosa, levemente brincalhona, voz materna
- **Ação-chave**: voa de frente mas pescoço gira 180° pra olhar pra trás (movimento característico Sankofa)
- **Tamanho narrativo**: do tamanho de uma criança de 4 anos (proporção fantasia)

---

## Anatomia estilizada

- **Corpo**: ovoide, robusto, em proporção 1:1.3 (largura:altura)
- **Pescoço**: longo, flexível (capaz de virar 180°)
- **Cabeça**: arredondada, olhos grandes expressivos
- **Bico**: longo curvado para baixo (estilo íbis), fino
- **Asas**: grandes, 2x o corpo quando abertas, com 4 camadas de penas visíveis
- **Cauda**: leque de 5 penas longas, curvadas pra cima
- **Patas**: 3 dedos frente + 1 atrás, finas
- **Detalhe icônico**: penas da testa formam uma "coroa" pequena (link Akan)

---

## Cores (paleta `sankofa-kids.ase`)

| Parte | Cor | Hex |
|---|---|---|
| Penas corpo | gold | `#C9A84C` |
| Penas asas externas | terracotta | `#B85A3A` |
| Penas peito | ochre | `#D9B95A` |
| Penas cauda | gold + terracotta alternadas | — |
| Bico | bone-white | `#EDE5D5` |
| Patas | sky-earth | `#A8693D` |
| Olhos íris | line-black | `#1F1408` |
| Olhos brilho | bone-white | `#EDE5D5` |
| Coroa testa | terracotta | `#B85A3A` |
| Outline | line-black | `#1F1408` |

---

## Turnaround — 5 vistas (PNG 2048x2048, fundo transparente)

Salvar em `art/characters/vovo-sankofa/turnaround/`:

1. `01-frente-pousada.png` — frontal pousada, asas dobradas
2. `02-tres-quartos-pousada.png` — 3/4 pousada
3. `03-perfil-pousada.png` — perfil lateral
4. `04-frente-voando.png` — voo de frente, asas abertas
5. `05-perfil-voando-olhando-tras.png` — **POSE ICÔNICA**: voa para frente (perfil), pescoço dobrado 180°, olhando para trás (símbolo Sankofa)

---

## Expressões (6 mínimas)

Salvar em `art/characters/vovo-sankofa/expressoes/`:

1. `01-neutra.png` — calma, olhar atento
2. `02-sorrindo.png` — bico levemente curvado pra cima, olhos cerrados de alegria
3. `03-piscando.png` — frame de piscar (1 olho fechado)
4. `04-pensativa.png` — olhar para cima, cabeça inclinada
5. `05-surpresa.png` — olhos arregalados, asas levemente abertas
6. `06-cantando.png` — bico aberto, vibração (uso para narração musicada)

---

## Poses-chave (recorrentes em todos os episódios)

Salvar em `art/characters/vovo-sankofa/poses/`:

1. `pose-voando-olhando-tras.png` — **assinatura visual da série**
2. `pose-pousando.png` — aterrissando, asas semi-abertas
3. `pose-asas-abertas-frente.png` — frontal asas totalmente abertas (intro)
4. `pose-narrando.png` — pousada, levemente inclinada, "falando" pra criança
5. `pose-apontando-asa.png` — asa estendida apontando algo na cena

---

## Animação — rig Moho

- **Bones**: corpo, pescoço (3 segmentos para rotação suave), cabeça, bico, asa-esq (4 bones), asa-dir (4 bones), cauda (3 bones), pata-esq, pata-dir
- **Smart bones**: rotação pescoço (-180° a +180°), bater asas (loop), abrir/fechar bico
- **Switch layer**: olhos (aberto, piscando, fechado, surpreso)
- **Animação loop assinatura**: voo + olhar pra trás (1.5s loop, usar em transições de cena)

---

## Loop de voo (16 frames @ 24fps = 0.66s)

Sequência de bater asas:
1. Frames 1–4: asas para baixo (downbeat)
2. Frames 5–8: asas voltando ao centro
3. Frames 9–12: asas para cima (upstroke)
4. Frames 13–16: asas voltando ao centro
5. Loop perfeito

Salvar em `animation/moho/loops/vovo-sankofa-voo.moho`.

---

## Som assinatura

- Toque suave de **kalimba** (3 notas: G–C–E) sempre que aparece
- Som de bater de asas: papel de seda ou folhas secas (gravar em `audio/sfx/asas-vovo.wav`)
- Voz: feminina suave, materna, ~35–50 anos, dicção pausada

---

## Símbolo Sankofa — referência

```
Glifo Adinkra: 🪶 (pássaro com cabeça virada para trás carregando ovo no bico)
Tradução: "Se san kofa a yenkyi" — "Não há mal em voltar e buscar"
Origem: povo Akan, Gana
Significado pedagógico da série: aprender com o passado para construir o futuro
```

---

CC BY-SA 4.0 — Sankofa Educa.
