# Roadmap

## Fase 0 — Fundação ✅

- Documento conceitual lapidado (`docs/CONCEITO.md`).
- Recorte do MVP definido (Mundo 1: Origens, 5 enigmas).
- Estrutura inicial do projeto.
- Primeiros 5 enigmas escritos (Volume I da HGA).
- Protótipo navegável em HTML/CSS/JS estático.

## Fase 1 — Protótipo jogável ✅

- Fluxo completo: landing → registro → mapa → mundo → enigma → resultado → mosaico.
- Pontuação, dicas progressivas, conquistas, níveis, desafio diário.
- Mosaico visual com fragmentos desbloqueados.
- Persistência local (`localStorage`).
- Visual em paleta ouro/terra/verde/índigo, fontes Playfair Display + Lora (depois Atkinson Hyperlegible).
- **Áudio sintetizado de instrumentos africanos** (djembe, dùndún, kalimba, balafon,
  agogô, shaker) via Web Audio API. Toggle de som e tambor ambiente.
- Arte de capa de mundos (8 ilustrações) integrada nos cartões e na tela do mundo.
- **Fluxo "continue-first"**: landing oferece *Continuar Jornada* quando há progresso;
  mapa traz banner "Continuar onde paraste"; cada mundo tem CTA *Continuar/Começar*;
  tela de resultado avança automaticamente para o próximo enigma sem voltar à lista.

## Fase 1.1 — Conteúdo completo ✅ (v1.1.0 → v1.3.9-dev)

- **71 enigmas** validados (Mundo 1 = 15, Mundos 2–8 = 8 cada), cobrindo Vols. I–VIII.
- 71 fragmentos visuais (24 com PNG, restantes em CSS gradient).
- 8 patentes/títulos por mundos+cauris+casa.
- **9 Casas Reais Africanas** com perks por casa (cauris bônus, firstTry, contextRead, etc.).
- **9 Súditos NPC** rotativos com unlock por mundo / casa / contagem.
- **35+ ancestrais** em 9 árvores genealógicas.
- **4 festivais** (Dia da África 25/05, Consciência Negra 20/11, Lua Nova, Festa Sankofa) com multiplier ×1.5–2.0.
- **Selo Real PNG** (1080×1080) exportável.
- **Audiência Diária** com súdito do dia.
- Tema claro (papiro) + escuro (dark) com `prefers-color-scheme`.
- **PWA** instalável + offline-first com auto-update via `controllerchange`.

## Fase 1.2 — Pedagogia ✅ (branch `dev`)

- **Avanço liberal**: próximo mundo abre a 70% (`WORLD_UNLOCK_THRESHOLD=0.70`).
- **Mestria 100%** (+100 cauris) e **Mestria Perfeita** (100% + ≥80% em 1ª tent.) (+250 cauris).
- **Caderno de Revisão** com abas "🔴 A Revisar" e "✓ Superados", banner no mapa, indicadores no enigma.
- **Karma + Skip**: >50% pendente bloqueia avançar (50 cauris pular); >20% toast leve; skip pós-2 erros = +5 pts piedade.
- TTS (Web Speech API) para pergunta + contexto.
- Onboarding de 30s (4 slides) na 1ª visita.

## Fase 1.3 — Multiplayer leve ✅ (branch `dev`)

- **Modal HGA**: gerador de nome (60 figuras curadas), faixa etária LGPD, tag de grupo, casa real.
- **Compartilhamento social**: WhatsApp deeplink + Web Share API + clipboard.
- **Liga Local multi-perfil** com abas `Todos | #MinhaTag`.
- **Liga Global Supabase opt-in**: schema `league_scores` (com coluna `tag` + índice parcial), tiers semanais, reset domingo 00:00 UTC.
- Hospedagem: Vercel (`https://www.sankofahga.com`) + Supabase prod.

## Fase 1.5 — Torneio Semanal Assíncrono ✅ (branch `dev`)

- Schema Supabase: `enigma_answers` (gabarito server-only), `sankofa_tournament_week`, `sankofa_tournament_score`, views `_best` / `_ranking`.
- Função PL/pgSQL `rotate_weekly_tournament()` (sorteia 5 enigmas distribuídos por mundo).
- **Edge Function `submit_tournament_answer`** (Deno + TypeScript) com anti-cheat:
  janela temporal, ≤3 tentativas, `ms_to_answer ≥ 1500`, gabarito server-side.
- Cliente: banner home, tela `tournament` com 5 enigmas, integração fire-and-forget no `handlePick`.
- Premiação `weekChampion=100` declarada — distribuição automática pendente.

## Fase 2 — Validação 🟡 (em andamento)

- Testar com 5 a 10 pessoas (estudantes 10–17 e professores).
- Coletar dificuldades, emoção, clareza e tempo médio por enigma.
- Revisar 71 enigmas com especialista em HGA / educação.
- Ajustar linguagem, ritmo das dicas e curva de pontos.
- Auditoria de acessibilidade (contraste AAA, foco visível, leitor de tela).

## Fase 3 — Sala de Aula (Kahoot-style) 🔜

Plano detalhado em `docs/MULTIPLAYER-SOCIAL.md` §6.

- Schemas `sankofa_rooms` / `_players` / `_answers` + RLS.
- Edge Function `score_answer` (anti-cheat server-side).
- Realtime via Supabase WebSockets.
- Reconexão por PIN (sessão sobrevive 30 min).
- Relatório do professor em Canvas → PNG/PDF.
- Mosaico Coletivo da Turma (cooperação além de competição).

## Fase 4 — Expansão e abertura 🔜

- Tradução EN / FR / ES.
- Paleta sonora regional por mundo (kora no Sahel, ney no Nilo, etc.).
- Separar dados em JSON puro para abrir contribuição externa (planejado para
  depois do 1º piloto pedagógico — ver `CONTRIBUTING.md`).
- Distribuir gifts recorrentes dos súditos (`SUDITOS[i].gift` hoje só display).
- Implementar quests por casa (`HOUSES[i].questIds` hoje data-only).
- Painel do Professor web (`/professor`).
- Versão Sankofa Kids (4-9 anos) + tabuleiro físico (ver `docs/UNIVERSO-TRANSMIDIA.md`).

## Decisões em vigor

- Mobile-first, máx. 580px no `#app` (até 620px em desktop).
- Conteúdo em PT-BR, com tolerância a variantes lusófonas.
- Sem amostras de áudio externas: tudo sintetizado.
- Liga Global e Torneio são opt-in. Sem config Supabase, jogo continua 100% solo offline.
- `league-config.js` carrega anon key pública (RLS protege) — Service Role só em Edge Functions.

## Bugs/dívidas conhecidas

- `scripts/bump-version.sh` só atualiza `data/version.js` e `sw.js` — `package.json` precisa ser sincronizado manualmente.
- Achievements `explorer` (☀) e `collector` (◆) têm a mesma condição (`solved.w1 ≥ 15`) — disparam juntos.
- Casa Kush tem `freeHint:true` declarado mas `royalty.applyHousePerk` não consome.
- Quests por casa (27 IDs) sem código consumidor.
- Súditos `gift.cauris/daily/weekly/perkId` não distribuídos automaticamente.
- Liga Global: editar nome do perfil cria linha órfã na semana corrente (resolve no domingo). Fix definitivo exige `handle = uid6` + coluna `nick`.
