#!/bin/bash
#
# Sankofa — gera documentação completa em .docx (Microsoft Word 2007+)
# usando pandoc. Reúne README + 8 docs em docs/ num único ficheiro.
#
# Requisitos: pandoc 2.0+
# Saída: docs/Sankofa-Documentacao-Completa.docx
#
set -e
cd "$(dirname "$0")/.."

OUT=docs/Sankofa-Documentacao-Completa.docx
TMP=$(mktemp -d)

cat > "$TMP/cover.md" << 'COVER'
---
title: "Sankofa — Documentação Completa"
subtitle: "Fragmentos da África · Jogo educativo de enigmas sobre a HGA UNESCO"
author: "Filipe Buba"
date: "Versão 1.0"
lang: pt-BR
---

# Sumário do volume

1. **README** — Visão geral e estrutura do projeto
2. **Conceito** — Tese, problema, princípios de design
3. **Roadmap** — Fases 0–4 do desenvolvimento
4. **Áudio** — Motor de instrumentos africanos sintetizados
5. **Liga** — Setup do leaderboard Supabase
6. **Monetização** — Estratégia nacional e internacional (15 secções)
7. **Pitch Deck** — 10 slides para apresentação
8. **Cartas-modelo** — Templates ESG, UNESCO, Prefeitura, Escola, Editais
9. **One-Pager** — Material para distribuição em rua

\newpage
COVER

# Concatena todos os docs com quebras de página e demove títulos H1 para H2
{
  cat "$TMP/cover.md"
  echo -e "\n\\newpage\n# 1. README do projeto\n"
  sed 's/^# /## /' README.md
  echo -e "\n\\newpage\n# 2. Conceito\n"
  sed 's/^# /## /' docs/CONCEITO.md
  echo -e "\n\\newpage\n# 3. Roadmap\n"
  sed 's/^# /## /' docs/ROADMAP.md
  echo -e "\n\\newpage\n# 4. Motor de Áudio\n"
  sed 's/^# /## /' docs/AUDIO.md
  echo -e "\n\\newpage\n# 5. Liga dos Griôs\n"
  sed 's/^# /## /' docs/LIGA.md
  echo -e "\n\\newpage\n# 6. Estratégias de Monetização\n"
  sed 's/^# /## /' docs/MONETIZACAO.md
  echo -e "\n\\newpage\n# 7. Pitch Deck\n"
  sed 's/^# /## /' docs/PITCH-DECK.md
  echo -e "\n\\newpage\n# 8. Cartas-modelo\n"
  sed 's/^# /## /' docs/CARTAS.md
  echo -e "\n\\newpage\n# 9. One-Pager\n"
  sed 's/^# /## /' docs/ONE-PAGER.md
} > "$TMP/all.md"

pandoc "$TMP/all.md" \
  -o "$OUT" \
  --from markdown \
  --to docx \
  --toc \
  --toc-depth=2 \
  --standalone

rm -rf "$TMP"

echo "✓ Gerado: $OUT"
ls -lh "$OUT"
