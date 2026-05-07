-- ============================================================
-- Sankofa — Setup completo da Liga dos Griôs (consolidado).
-- ============================================================
-- Cole TUDO num único editor SQL do Supabase e clique Run.
-- Idempotente: rodar várias vezes não causa erro nem duplica nada.
--
-- Painel: https://supabase.com/dashboard/project/jcfqlvzdmmkeehqvfdtb/sql/new
-- ============================================================

-- 1. Tabela base
CREATE TABLE IF NOT EXISTS public.league_scores (
  handle      TEXT PRIMARY KEY,
  cauris      INT  NOT NULL DEFAULT 0,
  title       TEXT,
  house       TEXT,
  week_start  DATE NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Coluna tag (Fase 1 PR 3)
ALTER TABLE public.league_scores
  ADD COLUMN IF NOT EXISTS tag TEXT;

-- 3. Indices
CREATE INDEX IF NOT EXISTS league_scores_week_idx
  ON public.league_scores (week_start, cauris DESC);

CREATE INDEX IF NOT EXISTS league_scores_tag_week_idx
  ON public.league_scores (tag, week_start, cauris DESC)
  WHERE tag IS NOT NULL;

-- 4. RLS — leitura aberta, upsert público
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
COMMENT ON COLUMN public.league_scores.tag IS
  'Tag de grupo opcional (#Turma7A) para filtros de turma/escola/família.';

-- 5. Verificação
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'league_scores'
ORDER BY ordinal_position;
