# Sankofa — Fragmentos da África

Jogo digital educativo de enigmas sobre a **História Geral da África** (HGA, UNESCO).
Recupere fragmentos de memória histórica resolvendo desafios curtos, com pistas
progressivas, mosaicos visuais e sonoridade africana sintetizada.

> *"Se quã wo werε fi na wo sankofa a yenkyi" — Não é errado voltar e buscar o que ficou.*

## Como abrir

Abra `index.html` no navegador. Sem instalação, sem servidor, sem banco de dados.
O progresso fica salvo no `localStorage`.

## Estado atual (v1.3.9-dev — 8 mundos, 71 enigmas)

- Fluxo completo: landing → registro (modal HGA) → mapa de mundos → mundo → enigma → resultado → mosaico → perfil → conquistas → desafio diário → caderno de revisão.
- **71 enigmas** validados em 8 mundos (Vol. I 15 + Vols. II–VIII 8 cada), cobrindo toda a HGA UNESCO.
- 3 dicas progressivas por enigma (com custo em pontos).
- 10 níveis (Aprendiz → Herdeiro de Sankofa) e 10 conquistas.
- 8 patentes/títulos (Caçador → Soberano Pan-Africano) com avaliação por mundos+cauris+casa.
- Mosaico de fragmentos com gradientes próprios + 24 PNGs.
- Persistência local com migração automática de chaves antigas (`sankofa_v5_<profileId>`).
- **Pedagogia liberal**: próximo mundo abre a 70%, não 100%. Mestria 100% +100 cauris, Mestria Perfeita (100% com ≥80% em 1ª tentativa) +250 cauris.
- **Caderno de Revisão**: enigmas errados ficam pendentes para reforço sem cauris extras.
- **Karma + Skip**: >50% pendente bloqueia avançar (custa 50 cauris pular); >20% gera toast de aviso. Skip após 2 erros: +5 pts piedade.
- **HGA Royalty**: 9 Casas Reais com perks, 9 Súditos com gifts, genealogia em 9 árvores, 4 festivais com multiplicador ×1.5–2.0, Selo Real exportável (PNG 1080²) com casa+título+mosaico.
- **Áudio sintetizado de instrumentos africanos** (djembe, dùndún, kalimba, balafon, agogô, shaker) via Web Audio API. Toggle global 🔊 e tambor ambiente 🥁.
- **Acessibilidade**: TTS via Web Speech API (PT-BR), tema claro/escuro (papiro/dark), fonte Atkinson Hyperlegible.
- **Liga local** multi-perfil + **Liga Global** Supabase opt-in com tiers semanais e abas `🌍 Global | #MinhaTag`.
- **Torneio Assíncrono Semanal**: 5 enigmas/sem, anti-cheat server-side via Edge Function (`MIN_MS=1500`, ≤3 tentativas).
- **PWA** instalável, offline-first, auto-update com `controllerchange`.
- 8 capas de mundo (PNG) integradas nos cartões e na tela do mundo.
- **Compartilhamento**: WhatsApp deeplink + Web Share API + clipboard.

## Estrutura

```
sankofa/
├── index.html              # entrada
├── styles.css              # tema papiro/dark ouro/terra/verde/índigo
├── sw.js                   # Service Worker (PWA, auto-update)
├── manifest.webmanifest    # PWA manifest
├── src/
│   ├── app.js              # state machine, loop core, karma, caderno, mestria
│   ├── audio.js            # motor de instrumentos africanos (Web Audio API)
│   ├── royalty.js          # casas, títulos, festivais, perks, selo PNG
│   ├── league.js           # Liga Global + abas por tag (Supabase REST)
│   ├── league-config.js    # config Supabase (anon key pública por design)
│   ├── tournament.js       # Torneio semanal (Edge Function + RPC)
│   ├── profiles.js         # multi-perfil localStorage
│   ├── profile-modal.js    # modal de criação rico (HGA + idade + tag)
│   ├── onboarding.js       # carrossel 4 slides (1ª visita)
│   ├── share.js            # WhatsApp + Web Share API + clipboard
│   └── accessibility.js    # TTS via Web Speech API
├── data/
│   ├── worlds.js           # 8 mundos da HGA
│   ├── enigmas.js          # 71 enigmas (Vols I-VIII)
│   ├── levels.js           # 10 níveis
│   ├── achievements.js     # 10 conquistas
│   ├── titles.js           # 8 patentes
│   ├── houses.js           # 9 casas reais + perks + questIds
│   ├── suditos.js          # 9 NPCs com gifts
│   ├── genealogy.js        # ancestrais por casa
│   ├── festivals.js        # 4 festivais com multiplier
│   ├── leagues.js          # 6 tiers semanais
│   ├── hga-names.js        # 60 nomes históricos para gerador
│   ├── blocklist.js        # vocabulário vetado em nicks/tags
│   ├── tournament-config.js# regras semanais (5 enigmas, ≤3 tentativas)
│   └── version.js          # versão + build date
├── supabase/
│   ├── SETUP_TOURNAMENT.sql# schema + RPC + view + seed gabarito
│   ├── seed_enigma_answers.sql
│   ├── migrations/
│   └── functions/submit_tournament_answer/  # Edge Function
├── assets/
│   ├── logo.png · favicon.png
│   ├── world-1..8-*.png    # capas dos 8 mundos
│   └── frag_*.png          # 24 fragmentos com arte
├── docs/                   # CONCEITO, ROADMAP, AUDIO, LIGA, MONETIZACAO,
│                           # PITCH-DECK, CARTAS, ONE-PAGER, MULTIPLAYER-SOCIAL,
│                           # UNIVERSO-TRANSMIDIA, CAMPANHA-LANCAMENTO, EDITAL-04
├── word/                   # versão .docx de cada doc
└── .claude/skills/         # sankofa-add-enigma, -add-world, -tune-audio
```

## Skills disponíveis

Quando trabalhar neste repo no Claude Code, três skills facilitam edições recorrentes:

- `sankofa-add-enigma` — scaffold validado de novo enigma com fonte HGA.
- `sankofa-add-world` — destravar/adicionar mundo com arte e conquista de conclusão.
- `sankofa-tune-audio` — ajustar timbre, decay, eventos e tambor ambiente.

Detalhes em `.claude/skills/README.md`.

## Documentação em Word

Todos os docs disponíveis em `.docx` na pasta **`word/`**:

```
word/00-README.docx
word/01-Conceito.docx
word/02-Roadmap.docx
word/03-Audio.docx
word/04-Liga.docx
word/05-Monetizacao.docx
word/06-Pitch-Deck.docx
word/07-Cartas.docx
word/08-One-Pager.docx
word/09-Documentacao-Completa.docx   ← volume único, com sumário
```

Para regenerar (precisa pandoc 2.0+):

```bash
bash scripts/build-docx.sh
```

Detalhe em `word/README.md`.

## Deploy (Vercel)

Site é estático puro — sem build step, sem dependências.

### 1ª vez (CLI)

```bash
npm i -g vercel
cd sankofa
vercel        # preview
vercel --prod # produção
```

Escolhe **Other** como framework. `vercel.json` na raiz já configura cache e headers de segurança.

### Auto-deploy via GitHub

1. Push pro GitHub
2. https://vercel.com/new → importa repo
3. Cada push em `main` → deploy de produção; cada PR → preview URL

### Liga global (Supabase) no Vercel

Para ativar a Liga dos Griôs em produção sem expor chaves no repo:

1. **Vercel → Project → Settings → Environment Variables**:
   - `SUPABASE_URL` = `https://xxx.supabase.co`
   - `SUPABASE_ANON_KEY` = `eyJ...` (chave pública, RLS protege)
2. **Settings → Build & Development → Build Command**:
   ```bash
   echo "window.SANKOFA_LEAGUE_CONFIG={url:'$SUPABASE_URL',anonKey:'$SUPABASE_ANON_KEY'};" > src/league-config.js
   ```
3. Re-deploy. Schema da tabela em `docs/LIGA.md`.

Localmente, copia `src/league-config.example.js` → `src/league-config.js` e preenche. Ficheiro real está no `.gitignore`.

## Próximos passos recomendados

1. Validar 71 enigmas com especialista em HGA / educação básica.
2. Modo Sala de Aula (Kahoot-style) — Fase 2 do `MULTIPLAYER-SOCIAL.md`.
3. Paleta sonora regional por mundo (kora no Sahel, ney no Nilo, etc.).
4. Tradução EN/FR/ES.
5. Painel do professor com relatório PNG/PDF.
6. Cumprir as quests por casa (`HOUSES[i].questIds` hoje data-only).
7. Distribuir gifts recorrentes dos súditos (`SUDITOS[i].gift` hoje só display).

## Licenças planejadas

- **Código-fonte**: MIT.
- **Conteúdo textual e dados educacionais**: Creative Commons BY-SA 4.0.
- **Imagens, sons sintetizados e ilustrações**: a definir conforme autoria; o motor de áudio é original e nasce livre.

## Autor

**Filipe Buba N'hada** (PCD)
Engenheiro de Software · UNILAB · Impacta · XP Educação

- 3 anos como Software Engineer no **Mercado Livre** (2022–2024)
- Estágio de Análise de Dados na **Telefônica/Vivo** (2022)
- Graduado em **Ciência da Computação** (Faculdade Impacta, 2024)
- **Licenciatura em Ciências Sociais** (UNILAB, 2021)
- **Bacharelado em Humanidades** (UNILAB, 2017)
- Cursando Pós em **Ciência de Dados e IA** (XP Educação, prev. dez/2025)

📧 flifnhada@hotmail.com · 📱 +55 11 98483-7997
🔗 [linkedin.com/in/filipe-buba](https://www.linkedin.com/in/filipe-buba/)
📂 Currículo completo: `empresa/CURRICULO.md`

## Todos os volumes da História Geral da África

- [Volume I – Metodologia e pré-história da África](https://unesdoc.unesco.org/ark:/48223/pf0000190249)
- [Volume II – África antiga](https://unesdoc.unesco.org/ark:/48223/pf0000190250)
- [Volume III – África medieval](https://unesdoc.unesco.org/ark:/48223/pf0000190251)
- [Volume IV – África bloqueada](https://unesdoc.unesco.org/ark:/48223/pf0000190252)
- [Volume V – África e diáspora](https://unesdoc.unesco.org/ark:/48223/pf0000190253)
- [Volume VI – África contemporânea (1884-1935)](https://unesdoc.unesco.org/ark:/48223/pf0000190254)
- [Volume VII – África contemporânea (1935-1975)](https://unesdoc.unesco.org/ark:/48223/pf0000190255)
- [Volume VIII – África contemporânea (1975-2000)](https://unesdoc.unesco.org/ark:/48223/pf0000190256)
