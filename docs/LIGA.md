# Liga dos Griôs — Setup

Liga global é **opt-in** e usa Supabase. Sem ela, liga local entre perfis no mesmo dispositivo continua funcional.

## Tabela Supabase

```sql
create table league_scores (
  handle text primary key,
  cauris int not null default 0,
  title  text,
  house  text,
  tag    text,                          -- v1.2.0: filtro "Meu Grupo"
  week_start date not null,
  updated_at timestamptz not null default now()
);
create index league_scores_week_idx on league_scores(week_start, cauris desc);
create index league_scores_tag_week_idx
  on league_scores(tag, week_start, cauris desc) where tag is not null;

alter table league_scores enable row level security;
create policy "read all" on league_scores for select using (true);
create policy "upsert" on league_scores for insert with check (true);
create policy "update self" on league_scores for update using (true);
```

Migration idempotente para adicionar `tag` em bases já provisionadas:
`supabase/migrations/20260507120000_add_tag_to_league_scores.sql`.

## Configurar no jogo

Em `src/league-config.js` (ou via env injetada no build, ver README):

```js
window.SANKOFA_LEAGUE_CONFIG = {
  url: "https://<project-ref>.supabase.co",
  anonKey: "<anon-public-key>",
  hasTagColumn: true   // habilita aba "Meu Grupo"
};
```

A anon key é pública por design — o RLS é quem protege. **Nunca commit Service Role.**

Sem config = liga global e torneio escondidos automaticamente; o jogo continua 100% solo.

## Tiers (semanais)

| Tier                    | Posição (percentil) | Cor      |
|-------------------------|---------------------|----------|
| Caçador                 | bottom 50%          | cinza    |
| Griô do Sahel           | top 50%             | bronze   |
| Mercador de Tombuctu    | top 25%             | ouro     |
| Conselheiro Real        | top 10%             | terra    |
| Mansa da Semana         | top 3%              | ouro alto|
| Soberano Pan-Africano   | #1                  | branco   |

## Reset

Domingo 00:00 UTC. `week_start` recalculado a cada submit.

## Privacy

- Apenas `handle` (nome do jogador truncado a 20 chars), `cauris`, `title`, `house`.
- Sem email, sem foto, sem IP no schema.
- Player pode desativar via "Recomeçar do Zero" (limpa state, opt-out implícito).

## Liga local (sempre disponível)

`SankofaProfiles` permite múltiplos perfis no mesmo `localStorage`. Cada um tem cauris/state isolados. Útil para sala de aula. Nada vai para servidor.

UI tem abas `Todos | #MinhaTag` quando o perfil ativo tem tag definida.

---

# Torneio Semanal Assíncrono — Setup

Junto da Liga, um torneio semanal opt-in com 5 enigmas selecionados, anti-cheat server-side. Schema, RPC, view e Edge Function consolidados em `supabase/SETUP_TOURNAMENT.sql`.

## Schemas

```sql
-- Gabarito server-only (RLS bloqueia leitura ao cliente)
create table enigma_answers (
  enigma_id   text primary key,
  correct_idx int  not null,
  world       int  not null,
  options_n   int  not null
);
alter table enigma_answers enable row level security;
-- Sem policy de SELECT → cliente não lê. Edge Function usa service_role.

-- Semana ativa
create table sankofa_tournament_week (
  id          serial primary key,
  week_iso    text unique not null,         -- '2026-W19'
  enigma_ids  text[] not null,
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  created_at  timestamptz default now()
);

-- Tentativas (insert via Edge Function, leitura aberta)
create table sankofa_tournament_score (
  id            bigserial primary key,
  week_id       int references sankofa_tournament_week(id),
  profile_uid   text not null,
  nick          text not null,
  tag           text,
  age_band      text,
  house         text,
  enigma_id     text not null,
  picked        int  not null,
  correct       boolean not null,
  score         int  not null,
  ms_to_answer  int,
  hints_used    int,
  attempt       int  not null,
  submitted_at  timestamptz default now(),
  unique (week_id, profile_uid, enigma_id, attempt)
);
create index on sankofa_tournament_score (week_id, score desc);
create index on sankofa_tournament_score (week_id, tag, score desc);

alter table sankofa_tournament_score enable row level security;
create policy "score_read_public" on sankofa_tournament_score
  for select using (true);
-- INSERT direto bloqueado: Edge Function usa service_role.
```

## RPC e view

- `current_tournament_week()` → `{week_iso, enigma_ids, starts_at, ends_at}` para o cliente descobrir a semana ativa.
- `rotate_weekly_tournament()` (cron domingo 00:00 UTC) sorteia 5 enigmas distribuídos por mundo.
- View `sankofa_tournament_ranking` agrega melhor score por jogador/semana.
- View `sankofa_tournament_best` agrega melhor por enigma.

Seed do gabarito: `supabase/seed_enigma_answers.sql` com 71 enigmas. Auto-gerado por `scripts/build-tournament-answers.cjs`.

## Edge Function `submit_tournament_answer`

Caminho: `supabase/functions/submit_tournament_answer/`. Deploy via `supabase functions deploy submit_tournament_answer`.

Anti-cheat:

- Janela temporal: `now() between week.starts_at and week.ends_at`.
- `enigma_id ∈ week.enigma_ids`.
- `attempt ≤ 3` (`MAX_ATTEMPTS`).
- `ms_to_answer ≥ 1500` (`MIN_MS`) — tempo mínimo humano de leitura.
- Gabarito consultado server-side (cliente nunca vê `correct_idx`).

Score: tentativa × dicas × velocidade. Cliente recebe `{ok, correct, score}`.

## Configuração do cliente

`data/tournament-config.js`:

```js
window.SANKOFA_TOURNAMENT = {
  ENIGMAS_PER_WEEK: 5,
  MAX_ATTEMPTS: 3,
  MIN_MS: 1500,
  REWARDS: { weekChampion: 100 }   // distribuição manual no momento
};
```

`src/tournament.js` expõe:

- `loadWeek()` — cacheia semana atual via RPC.
- `isInCurrentWeek(eid)` — checa se enigma jogado conta para o torneio.
- `submit({eid, picked, hintsUsed, msToAnswer, attempt})` — POST para Edge Function.
- `attemptsUsed(eid)`, `localBest(eid)`, `recordAttempt(...)`, `totalLocalScore()` — em localStorage `sankofa_tournament_local_v1`.
- `fetchRanking(weekId, {tag, limit})` — lê view ranking.

Integração: `submitToTournamentIfApplicable()` em `app.js` dispara fire-and-forget após cada `handlePick` em enigma da semana corrente.

## UI

- Banner do Torneio na home (`rMap`) mostra progresso e dias restantes.
- Tela `tournament` lista os 5 enigmas com status (novo / wip / feito / esgotado).
- Botão "🥇 Torneio" no menu inferior.
- Toast pós-acerto: "🏆 Torneio: +X pontos".

## Reset

Domingo 00:00 UTC. Cron `rotate_weekly_tournament` cria nova semana com 5 enigmas sorteados.

## Privacy

Mesmo nível da Liga. `profile_uid` é UUID local, sem PII.
