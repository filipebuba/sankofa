-- Sankofa — cria tabela base da Liga dos Griôs.
-- Schema descrito originalmente em src/league.js.
-- Idempotente: pode rodar múltiplas vezes.
--
-- Aplicar via:   supabase db push
-- ou painel SQL: https://supabase.com/dashboard/project/_/sql

CREATE TABLE IF NOT EXISTS public.league_scores (
  handle      TEXT PRIMARY KEY,
  cauris      INT  NOT NULL DEFAULT 0,
  title       TEXT,
  house       TEXT,
  week_start  DATE NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index por semana + cauris desc (top da semana)
CREATE INDEX IF NOT EXISTS league_scores_week_idx
  ON public.league_scores (week_start, cauris DESC);

-- RLS: leitura aberta, upsert público (sem auth — handle = nick).
-- Trade-off conhecido: nick collision. Mitigação futura via x-profile-uid.
ALTER TABLE public.league_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read all"   ON public.league_scores;
DROP POLICY IF EXISTS "upsert own" ON public.league_scores;
DROP POLICY IF EXISTS "update own" ON public.league_scores;

CREATE POLICY "read all"
  ON public.league_scores
  FOR SELECT
  USING (true);

CREATE POLICY "upsert own"
  ON public.league_scores
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "update own"
  ON public.league_scores
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.league_scores IS
  'Liga dos Griôs (Sankofa). Reset semanal por week_start. Sem PII além do nick.';
