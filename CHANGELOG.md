# Changelog

Todas as mudanças notáveis do Sankofa. Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e versionamento [SemVer](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Fase 1.5 — Torneio Assíncrono Semanal (em desenvolvimento na branch `dev`)

#### Adicionado

- **Schema Supabase** consolidado (`supabase/SETUP_TOURNAMENT.sql`):
  - `enigma_answers` (gabarito server-only, RLS bloqueia leitura)
  - `sankofa_tournament_week` (semanas com 5 enigmas selecionados)
  - `sankofa_tournament_score` (tentativas + scores)
  - Views `sankofa_tournament_best` e `sankofa_tournament_ranking`
  - Função PL/pgSQL `rotate_weekly_tournament()` (sorteia 5 enigmas distribuídos
    por mundo, prioriza variedade)
  - Função `current_tournament_week()` para o cliente descobrir a semana ativa
  - RLS: read aberto, INSERT bloqueado direto (Edge Function via service_role)
- **Seed do gabarito** (`supabase/seed_enigma_answers.sql`): 71 enigmas com
  `correct_idx`, `world`, `options_n`. Auto-gerado por
  `scripts/build-tournament-answers.cjs`.
- **Edge Function `submit_tournament_answer`** (Deno + TypeScript):
  - Valida janela temporal, attempt 1..3, ms_to_answer >= 1500.
  - Consulta gabarito server-side (cliente nunca vê).
  - Calcula score: tentativa × dicas × velocidade.
  - Insere via service role (RLS bloqueia INSERT direto).
  - CORS aberto. Sem JWT.
- **Cliente** (`data/tournament-config.js` + `src/tournament.js`):
  - `loadWeek()` cacheia a semana atual; `isInCurrentWeek(eid)`.
  - `submit()` POST para Edge Function.
  - `attemptsUsed`, `localBest`, `recordAttempt`, `totalLocalScore` em localStorage.
  - `fetchRanking(weekId, {tag, limit})` lê view `sankofa_tournament_ranking`.
- **UI**:
  - Banner do Torneio na home (rMap) mostra progresso e dias restantes.
  - Tela `tournament` lista os 5 enigmas da semana com status (novo / wip /
    feito / esgotado) e total de pontos.
  - Botão "🥇 Torneio" no menu inferior.
  - Toast pós-acerto: "🏆 Torneio: +X pontos".
- **Integração com handlePick**: toda tentativa em enigma da semana corrente
  submete também ao Torneio (fire-and-forget). Atinge MIN_MS automaticamente.

### Fase 1 — Multiplayer/Social (em desenvolvimento na branch `dev`)

#### PR 1 — Modal de Perfil + LGPD

- **Banco de nomes históricos da HGA** (`data/hga-names.js`): 60 figuras curadas
  de Volumes I-VIII com período, casa real e descrição educativa.
  Helper `window.HGAName.random({sex, world, casa})`.
- **Blocklist** (`data/blocklist.js`): vocabulário básico vetado em nicks/tags.
  Função `sankofaCensor(text)` com normalização NFD.
- **Modal de Criação de Perfil** (`src/profile-modal.js`): substitui prompt simples.
  - Botão "🌍 Gerar Nome Histórico" sorteia da HGA com mini-card educativo.
  - Faixa etária (8-12, 13-17, 18+, prefiro não dizer) — LGPD by design.
  - Tag de grupo opcional (#Turma7A, normalizada).
  - Casa Real opcional, aceite curto sem PII.
- **`SankofaProfiles.createRich(opts)`**: payload completo, retrocompatível.
- **`SankofaProfiles.normalizeTag(raw)`** e **`isFresh()`** helpers.
- **Supabase scaffold local** (`supabase/config.toml`).

#### PR 2 — Share + TTS + Onboarding

- **Compartilhamento social** (`src/share.js`):
  - `whatsapp(profile)` — abre `wa.me/?text=...` com mensagem-desafio pronta
    incluindo nome, casa, cauris, fragmentos e link `?ref=<id>` para tracking.
  - `generic(profile)` — fallback Web Share API quando disponível.
  - `copyLink(profile)` — copia link de convite ao clipboard.
  - Botões 📲 "Desafiar no WhatsApp" e 🔗 "Copiar link" no Perfil.
- **Acessibilidade — Text-to-Speech** (`src/accessibility.js`):
  - `SankofaTTS.speak(text)` via Web Speech API nativa, zero custo.
  - Botão 🔊 ao lado de cada pergunta lê em voz alta.
  - Toggle "Voz: Ligada/Desligada" no Perfil.
  - Auto-leitura opcional ao abrir cada enigma quando ativado.
  - Detecta voz pt-BR / pt-PT / fallback automaticamente.
- **Onboarding 30 segundos** (`src/onboarding.js`):
  - Carrossel de 4 slides na 1ª visita: "Sou Sankofa", "Resolva enigmas",
    "Cauris compram coroas", "Pronto para começar?".
  - Setas ←/→ + Esc + skip + tap nos dots.
  - Marca visualizado em `localStorage` (`sankofa_onboarding_seen_v1`).
  - Não bloqueia gameplay; só aparece se nunca viu antes.

#### PR 3 — Liga "Meu Grupo" (filtro por tag)

- **Liga Local com abas** (`Todos | #MinhaTag`):
  - `SankofaProfiles.list()` agora retorna `tag`, `ageBand`, `hgaName`, `house`.
  - rProfiles renderiza tabs e filtra perfis locais pela tag ativa.
  - Estado vazio mostra CTA "📲 Convidar no WhatsApp".
- **Liga Global com abas** (`🌍 Global | #MinhaTag`):
  - Aba "Meu Grupo" só aparece se `cfg.hasTagColumn = true` no league-config.
  - `LEAGUE.refreshGroup(tag)` busca top 50 da semana com `tag=eq.<tag>`.
  - `LEAGUE.topRowsByTag(tag, limit)` query direta com índice parcial.
  - `LEAGUE.submit()` envia `tag` quando coluna existe (opt-in seguro).
  - `tag-chip` visível nas linhas do leaderboard.
- **Migration Supabase** (`supabase/migrations/20260507120000_add_tag_to_league_scores.sql`):
  - `ALTER TABLE league_scores ADD COLUMN IF NOT EXISTS tag TEXT;`
  - Índice parcial `(tag, week_start, cauris DESC) WHERE tag IS NOT NULL`.
  - Idempotente. Aplicar via `supabase db push` ou painel SQL.
- **CSS**: `.tabs`, `.tab`, `.tab-disabled`, `.tag-chip`, `.group-empty`.

#### Documentação

- `docs/MULTIPLAYER-SOCIAL.md` — plano completo das 3 fases com schemas SQL,
  RLS, edge functions, métricas, riscos e cronograma.

## [1.1.1] — 2026-05-07

### Corrigido

- **PWA não atualizava no celular** mesmo com novas versões deployadas.
  Causa: `navigator.serviceWorker.register` sem `updateViaCache:"none"`
  fazia o browser cachear o próprio `sw.js` por até 24 h; sem
  `reg.update()` no foco/visibilitychange, o app instalado nunca
  consultava o backend; sem listener de `controllerchange`, mesmo
  quando o novo SW tomava controlo, a página ficava com bytes velhos
  até reload manual.
- **Registo robusto**: `updateViaCache:"none"`, `reg.update()` no
  load + visibilitychange + focus + intervalo de 1 h.
- **Update automático**: `updatefound` → `SKIP_WAITING` → SW novo
  ativa → `controllerchange` → `location.reload()` (1×).
- **Headers Vercel**: `/`, `/index.html` e `/data/version.js` agora
  com `Cache-Control: public, max-age=0, must-revalidate` para
  garantir HTML sempre fresh.
- **Cache bust**: `VERSION` em `sw.js` e `data/version.js` →
  `v1.1.1` para forçar reinstall do precache em todos os clientes.

## [1.1.0] — 2026-05-07

### Adicionado

- **48 enigmas novos** distribuídos pelos Mundos 3–8 (8 cada).
  Total agora: **71 enigmas** (HGA Vols I–VIII completos).

- **Mundo 3 — Impérios do Sahel**: Mansa Musa, Sundiata, Tombuctu,
  Songhai, sal-ouro, Ibn Battuta, Ahmed Baba, Império de Gana.
- **Mundo 4 — Costas e Rotas**: Kilwa, Grande Zimbabwe, suaíli,
  Zanzibar, Sofala, monção, Madagáscar, destruição portuguesa.
- **Mundo 5 — Florestas e Reinos**: Bronzes do Benin, Reino do Kongo,
  Ifé, Yaa Asantewaa, Oyo Mesi, Lunda, Nzinga, Kimpa Vita.
- **Mundo 6 — Resistência**: Palmares, Zumbi, Dandara, Aqualtune,
  Haiti, Tereza de Benguela, Carlota Lucumí, Revolta dos Malês.
- **Mundo 7 — O Encontro Forçado**: Candomblé/Mãe Aninha, capoeira,
  samba, terreiros, africanismos, acarajé, jongo, Pixinguinha.
- **Mundo 8 — Luta e Liberdade**: Conferência de Berlim, Lumumba,
  Cabral, Nkrumah, Agostinho Neto, Steve Biko, Mandela, Agenda 2063.

- **48 fragments visuais novos** (gradientes únicos por mundo
  cobrindo `fp-mansa`, `fp-sundiata`, `fp-tombuctu`, `fp-kilwa`,
  `fp-zimbabwe`, `fp-benin`, `fp-kongo`, `fp-palmares`, `fp-zumbi`,
  `fp-dandara`, `fp-candomble`, `fp-capoeira`, `fp-mandela`,
  `fp-cabral`, `fp-nkrumah`, etc.).

### Validado

- Schema 100%: 71/71 enigmas com 4 opções + 3 dicas + correct
  index válido + fonte HGA citada.
- CSS coverage 100%: todos os 71 fragment patterns têm regra.
- Progressão sequencial Mundo 1 → 8 funciona com lock dinâmico.

## [1.0.1] — 2026-05-06

### Corrigido

- **Progressão**: Mundo 2 estava aberto desde o início; agora destrava
  somente após Mundo 1 atingir 100% (15/15 enigmas resolvidos).
- Helper `isWorldUnlocked(wid)` — Mundo 1 sempre disponível; demais
  abrem quando o anterior fecha.
- Map mostra dica "Conclua o Mundo N (X/Y)" em cards locked.
- Toast 🗝️ "Mundo destravado" no momento da abertura.
- Defesa em `open-world`, `open-enigma` e `continue-next` contra
  acesso direto a mundos bloqueados.

### Anterior (lançamento inicial)

- Ícones PWA eram JPEG com extensão `.png`; re-encode real para
  PNG + tamanhos 192 e 512 canônicos.
- Word lock files `~$*.docx` removidos do tracking.

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
