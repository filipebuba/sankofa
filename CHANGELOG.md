# Changelog

Todas as mudanças notáveis do Sankofa. Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e versionamento [SemVer](https://semver.org/lang/pt-BR/).

## [Unreleased]

## [1.0.0] — 2026-05-06

### Lançamento inicial — MVP completo

#### Adicionado

- **Conteúdo**: 23 enigmas (Mundo 1 com 15, Mundo 2 com 8) baseados nos Volumes I e II da HGA UNESCO
- **8 Mundos** definidos (Origens → Luta e Liberdade)
- **9 Casas Reais Africanas**: Faraós de Kemet, Kandakes de Kush, Mansas do Mali, Negus de Aksum, Asantehene, Obas do Benin, Manikongo, Mwami do Ruanda, Linhagem Quilombola
- **9 Súditos NPC** rotativos (Lucy, Mansa Musa, Amanirenas, Nzinga, Dandara, Sundiata, Biko…)
- **8 patentes** (Caçador → Soberano Pan-Africano)
- **35+ ancestrais** em 9 árvores genealógicas

#### Mecânicas

- Loop core: enigma → 4 opções → 3 dicas → fragmento → mosaico
- Economia de **cauris** (5 base + 5 firstTry + 5 noHints + 5 fast + 25 daily + 50 worldComplete)
- **Trono** com 5 fases de coroa (Cocar → Coroa de Ouro Real)
- **Audiência Diária** com súdito do dia
- **Festivais** (Dia da África 25/05, Consciência Negra 20/11, Lua Nova, Festa Sankofa) com multiplicador
- **Selo Real PNG** exportável (1080×1080) com casa, título, mosaico
- **Liga Local** multi-perfil
- **Liga Global** Supabase opt-in com tiers semanais (reset domingo UTC)

#### Áudio

- Motor sintetizado em Web Audio API — sem amostras externas
- **6 instrumentos**: djembe, dùndún (talking drum), kalimba/mbira, balafon, agogô, shaker
- Escala pentatônica menor em Lá
- 10 eventos mapeados (click, correct, wrong, hint, fragment, achievement, levelUp, etc.)
- Loop ambiente toggleável

#### UI / UX

- **Tema dark** (preto + ouro) e **light** (papiro + tinta âmbar) com fibras
- **Modo automático** via `prefers-color-scheme`
- Fonte **Atkinson Hyperlegible** (criada para baixa visão)
- **Acessibilidade WCAG AA** em ambos os temas (text 14:1, dim 8.6:1, muted 5.1:1)
- **PWA** instalável + offline-first (network-first HTML, cache-first imagens)
- Mobile-first (max 580px), suporte iOS + Android
- Botão Instalar via `beforeinstallprompt`
- Shortcuts do PWA: `?action=resume`, `?action=daily`

#### Conteúdo aberto

- 8 capas de mundo (1024×1024 PNG)
- 8 fragmentos do Mundo 2
- Logo + favicon próprios
- Open source (MIT) + conteúdo CC BY-SA 4.0

#### Documentação

- `README.md`, `CONCEITO.md`, `ROADMAP.md`, `AUDIO.md`, `LIGA.md`
- `MONETIZACAO.md` — 15 secções, nacional e internacional
- `PITCH-DECK.md` — 10 slides
- `CARTAS.md` — 9 templates (ESG, UNESCO, Prefeitura, Escola, Editais)
- `ONE-PAGER.md` — frente/verso para distribuição
- Volume único `.docx` + 9 individuais em `word/`

#### Infraestrutura

- Deploy Vercel (`https://sankofa-eosin.vercel.app`)
- `vercel.json` com cache + headers de segurança + clean URLs
- Service Worker `sw.js` v1.0.1
- 3 skills `.claude/skills/`: add-enigma, add-world, tune-audio

### Corrigido (1.0.1, mesmo dia)

- Ícones eram JPEG com extensão `.png`. Vercel + nosniff bloqueava install do PWA. Re-encode real para PNG + tamanhos 192 e 512 canônicos.
- Word lock files `~$*.docx` removidos do tracking.

### Sabido / pendente

- Mundos 3–8 ainda não têm enigmas
- Tradução EN/FR/ES não iniciada
- Liga Global precisa Supabase configurado (opcional, oculta automaticamente)
- Painel do Professor ainda não existe
- Trade chains (sal → ouro → manilhas) descritas em `MONETIZACAO.md` mas não implementadas

---

## Convenções

- **MAJOR** muda quando: estrutura de save quebra, fluxo de UI rebuild, conteúdo HGA reformulado
- **MINOR** muda quando: novo mundo, nova mecânica não-quebrável, novo tema
- **PATCH** muda quando: bug fix, conteúdo extra, ajuste de balanceamento, polish

## Como bumpar versão

```bash
npm run version:patch    # 1.0.0 → 1.0.1
npm run version:minor    # 1.0.0 → 1.1.0
npm run version:major    # 1.0.0 → 2.0.0
```

Cada bump:
1. Atualiza `package.json`
2. Atualiza `VERSION` em `sw.js` e em `data/version.js`
3. Adiciona entrada `[Unreleased]` ao `CHANGELOG.md`
4. Cria commit + tag `vX.Y.Z`
5. Sugere `git push --follow-tags`
