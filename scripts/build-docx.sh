#!/bin/bash
#
# Sankofa — gera documentação em .docx (Microsoft Word 2007+) usando pandoc.
#
# Saídas:
#   word/00-README.docx ... word/08-One-Pager.docx (docs individuais)
#   word/09-Documentacao-Completa.docx (volume único)
#   docs/Sankofa-Documentacao-Completa.docx (cópia de referência)
#
# Requisitos: pandoc 2.0+
#
set -e
cd "$(dirname "$0")/.."

mkdir -p word

echo "Gerando docs individuais em word/ ..."
pandoc README.md                       -o word/00-README.docx                       --from markdown --to docx --standalone
pandoc docs/CONCEITO.md                -o word/01-Conceito.docx                     --from markdown --to docx --standalone
pandoc docs/ROADMAP.md                 -o word/02-Roadmap.docx                      --from markdown --to docx --standalone
pandoc docs/AUDIO.md                   -o word/03-Audio.docx                        --from markdown --to docx --standalone --toc --toc-depth=2
pandoc docs/LIGA.md                    -o word/04-Liga.docx                         --from markdown --to docx --standalone
pandoc docs/MONETIZACAO.md             -o word/05-Monetizacao.docx                  --from markdown --to docx --standalone --toc --toc-depth=2
pandoc docs/PITCH-DECK.md              -o word/06-Pitch-Deck.docx                   --from markdown --to docx --standalone --toc --toc-depth=2
pandoc docs/CARTAS.md                  -o word/07-Cartas.docx                       --from markdown --to docx --standalone --toc --toc-depth=2
pandoc docs/ONE-PAGER.md               -o word/08-One-Pager.docx                    --from markdown --to docx --standalone

echo "Gerando docs adicionais (universo, música, podcast, kids, empresa, edital) ..."
pandoc docs/UNIVERSO-TRANSMIDIA.md     -o word/10-Universo-Transmidia.docx          --from markdown --to docx --standalone --toc --toc-depth=2
pandoc musica/LETRAS.md                -o word/11-Musica-Letras.docx                --from markdown --to docx --standalone --toc --toc-depth=2
pandoc podcast/EPISODIOS.md            -o word/12-Podcast-Episodios.docx            --from markdown --to docx --standalone --toc --toc-depth=2
pandoc kids/STORYBOARD-EP1.md          -o word/13-Kids-Storyboard-Ep1.docx          --from markdown --to docx --standalone
pandoc musica/ACAPELLA.md              -o word/14-Musica-Acapella.docx              --from markdown --to docx --standalone --toc --toc-depth=2
pandoc podcast/EPISODIOS-5-12.md       -o word/15-Podcast-Eps-5-12.docx             --from markdown --to docx --standalone --toc --toc-depth=2
pandoc kids/STORYBOARDS-EP2-8.md       -o word/16-Kids-Storyboards-Ep2-8.docx       --from markdown --to docx --standalone --toc --toc-depth=2
pandoc docs/CAMPANHA-LANCAMENTO.md     -o word/17-Campanha-Lancamento.docx          --from markdown --to docx --standalone --toc --toc-depth=2
pandoc empresa/ALTERACAO-CONTRATUAL.md -o word/18-Empresa-Alteracao-Contratual.docx --from markdown --to docx --standalone
pandoc empresa/CURRICULO.md            -o word/19-Curriculo-Filipe.docx             --from markdown --to docx --standalone
pandoc musica/SUNO-PROMPTS.md          -o word/20-Musica-Suno-Prompts.docx          --from markdown --to docx --standalone --toc --toc-depth=2
pandoc musica/CANCOES-EDUCATIVAS.md      -o word/21-Musica-Cancoes-Educativas.docx       --from markdown --to docx --standalone --toc --toc-depth=2
pandoc musica/CANCOES-EDUCATIVAS-SUNO.md -o word/22-Musica-Cancoes-Educativas-Suno.docx  --from markdown --to docx --standalone --toc --toc-depth=2
pandoc musica/CANCOES-VOLUME-2.md        -o word/23-Musica-Cancoes-Volume-2.docx         --from markdown --to docx --standalone --toc --toc-depth=2
pandoc musica/CANCOES-VOLUME-2-SUNO.md   -o word/24-Musica-Cancoes-Volume-2-Suno.docx    --from markdown --to docx --standalone --toc --toc-depth=2
pandoc musica/CIFRAS.md                  -o word/25-Musica-Cifras.docx                   --from markdown --to docx --standalone --toc --toc-depth=2
pandoc musica/CIFRAS-VOLUME-2.md         -o word/26-Musica-Cifras-Volume-2.docx          --from markdown --to docx --standalone --toc --toc-depth=2
pandoc docs/EDITAL-04-SP-PNAB.md       -o word/Edital-04-SP-PNAB.docx               --from markdown --to docx --standalone --toc --toc-depth=2
pandoc docs/EMAIL-UNESCO-COMISSAO-NACIONAL.md -o word/Email-UNESCO-Comissao-Nacional.docx --from markdown --to docx --standalone

# Cópias docx em pastas-irmãs com nomes alternativos (para envios diretos)
pandoc empresa/ALTERACAO-CONTRATUAL.md -o empresa/Alteracao-Contratual-Datacenter-Vision.docx --from markdown --to docx --standalone
pandoc empresa/CURRICULO.md            -o empresa/Curriculo-Filipe-Buba-Nhada.docx           --from markdown --to docx --standalone
pandoc edital-04/CARTAS-APOIO.md       -o edital-04/CARTAS-APOIO.docx                        --from markdown --to docx --standalone --toc --toc-depth=2
pandoc edital-04/VIDEO-DEMO.md         -o edital-04/VIDEO-DEMO.docx                          --from markdown --to docx --standalone

# Cópia docx ao lado dos .md em musica/ para envio direto
pandoc musica/ACAPELLA.md                -o musica/ACAPELLA.docx                --from markdown --to docx --standalone --toc --toc-depth=2
pandoc musica/LETRAS.md                  -o musica/LETRAS.docx                  --from markdown --to docx --standalone --toc --toc-depth=2
pandoc musica/SUNO-PROMPTS.md            -o musica/SUNO-PROMPTS.docx            --from markdown --to docx --standalone --toc --toc-depth=2
pandoc musica/CANCOES-EDUCATIVAS.md      -o musica/CANCOES-EDUCATIVAS.docx      --from markdown --to docx --standalone --toc --toc-depth=2
pandoc musica/CANCOES-EDUCATIVAS-SUNO.md -o musica/CANCOES-EDUCATIVAS-SUNO.docx --from markdown --to docx --standalone --toc --toc-depth=2
pandoc musica/CANCOES-VOLUME-2.md        -o musica/CANCOES-VOLUME-2.docx        --from markdown --to docx --standalone --toc --toc-depth=2
pandoc musica/CANCOES-VOLUME-2-SUNO.md   -o musica/CANCOES-VOLUME-2-SUNO.docx   --from markdown --to docx --standalone --toc --toc-depth=2
pandoc musica/CIFRAS.md                  -o musica/CIFRAS.docx                  --from markdown --to docx --standalone --toc --toc-depth=2
pandoc musica/CIFRAS-VOLUME-2.md         -o musica/CIFRAS-VOLUME-2.docx         --from markdown --to docx --standalone --toc --toc-depth=2

echo "Gerando volume completo ..."
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
  -o word/09-Documentacao-Completa.docx \
  --from markdown --to docx \
  --toc --toc-depth=2 \
  --standalone

# Mantém cópia em docs/ como referência rápida
cp word/09-Documentacao-Completa.docx docs/Sankofa-Documentacao-Completa.docx

rm -rf "$TMP"

echo ""
echo "✓ Pasta word/:"
ls -lh word/
