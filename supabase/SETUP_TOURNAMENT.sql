-- ============================================================
-- Sankofa — Setup do Torneio Assíncrono Semanal (Fase 1.5).
-- ============================================================
-- Cole TUDO num único editor SQL do Supabase e clique Run.
-- Idempotente. Pode rodar várias vezes.
--
-- Painel: https://supabase.com/dashboard/project/jcfqlvzdmmkeehqvfdtb/sql/new
-- ============================================================

-- 1. Tabela de gabarito (alimenta Edge Function de validação)
CREATE TABLE IF NOT EXISTS public.enigma_answers (
  enigma_id    TEXT PRIMARY KEY,
  correct_idx  INT NOT NULL,
  world        INT NOT NULL,
  options_n    INT NOT NULL DEFAULT 4
);

-- 2. Tabela das semanas do torneio
CREATE TABLE IF NOT EXISTS public.sankofa_tournament_week (
  id          SERIAL PRIMARY KEY,
  week_iso    TEXT UNIQUE NOT NULL,
  enigma_ids  TEXT[] NOT NULL,
  starts_at   TIMESTAMPTZ NOT NULL,
  ends_at     TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sankofa_tournament_week_active_idx
  ON public.sankofa_tournament_week (starts_at, ends_at);

-- 3. Tabela de scores
CREATE TABLE IF NOT EXISTS public.sankofa_tournament_score (
  id            BIGSERIAL PRIMARY KEY,
  week_id       INT REFERENCES public.sankofa_tournament_week(id) ON DELETE CASCADE,
  profile_uid   TEXT NOT NULL,
  nick          TEXT NOT NULL,
  tag           TEXT,
  age_band      TEXT,
  house         TEXT,
  enigma_id     TEXT NOT NULL,
  attempt       INT  NOT NULL,
  picked        INT,
  correct       BOOLEAN NOT NULL DEFAULT false,
  ms_to_answer  INT,
  hints_used    INT DEFAULT 0,
  score         INT NOT NULL DEFAULT 0,
  submitted_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (week_id, profile_uid, enigma_id, attempt)
);

CREATE INDEX IF NOT EXISTS sankofa_tournament_score_week_total_idx
  ON public.sankofa_tournament_score (week_id, profile_uid, score DESC);

CREATE INDEX IF NOT EXISTS sankofa_tournament_score_tag_idx
  ON public.sankofa_tournament_score (week_id, tag, score DESC)
  WHERE tag IS NOT NULL;

-- 4. View: melhor score por jogador por enigma na semana
CREATE OR REPLACE VIEW public.sankofa_tournament_best AS
SELECT
  week_id,
  profile_uid,
  MAX(nick)      AS nick,
  MAX(tag)       AS tag,
  MAX(house)     AS house,
  enigma_id,
  MAX(score)     AS best_score
FROM public.sankofa_tournament_score
GROUP BY week_id, profile_uid, enigma_id;

-- 5. View: ranking total por jogador na semana
CREATE OR REPLACE VIEW public.sankofa_tournament_ranking AS
SELECT
  week_id,
  profile_uid,
  MAX(nick)              AS nick,
  MAX(tag)               AS tag,
  MAX(house)             AS house,
  COUNT(DISTINCT enigma_id) AS enigmas_played,
  SUM(best_score)        AS total_score
FROM public.sankofa_tournament_best
GROUP BY week_id, profile_uid;

-- 6. RLS
ALTER TABLE public.enigma_answers              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sankofa_tournament_week     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sankofa_tournament_score    ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "answers_no_read"            ON public.enigma_answers;
DROP POLICY IF EXISTS "week_read_all"              ON public.sankofa_tournament_week;
DROP POLICY IF EXISTS "score_read_all"             ON public.sankofa_tournament_score;
DROP POLICY IF EXISTS "score_no_direct_insert"     ON public.sankofa_tournament_score;

-- enigma_answers: NUNCA exposto ao cliente. Service Role only (Edge Function).
CREATE POLICY "answers_no_read"
  ON public.enigma_answers
  FOR SELECT
  USING (false);

-- sankofa_tournament_week: leitura pública (frontend mostra os 5 enigmas da semana)
CREATE POLICY "week_read_all"
  ON public.sankofa_tournament_week
  FOR SELECT
  USING (true);

-- sankofa_tournament_score: leitura pública para rankings
CREATE POLICY "score_read_all"
  ON public.sankofa_tournament_score
  FOR SELECT
  USING (true);

-- INSERT direto bloqueado. Apenas Edge Function (Service Role) pode inserir.
CREATE POLICY "score_no_direct_insert"
  ON public.sankofa_tournament_score
  FOR INSERT
  WITH CHECK (false);

-- 7. Função PL/pgSQL para rotação semanal (chamada via pg_cron domingo 00:00 UTC)
CREATE OR REPLACE FUNCTION public.rotate_weekly_tournament()
RETURNS public.sankofa_tournament_week
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_week_iso  TEXT;
  v_starts_at TIMESTAMPTZ;
  v_ends_at   TIMESTAMPTZ;
  v_ids       TEXT[];
  v_existing  public.sankofa_tournament_week;
BEGIN
  -- ISO week 'YYYY-WnnX' formato: 2026-W19
  v_week_iso := to_char(now(), 'IYYY-"W"IW');
  v_starts_at := date_trunc('week', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC';
  v_ends_at   := v_starts_at + interval '7 days';

  -- Já existe? Retorna a semana atual sem recriar.
  SELECT * INTO v_existing
  FROM public.sankofa_tournament_week
  WHERE week_iso = v_week_iso;

  IF FOUND THEN
    RETURN v_existing;
  END IF;

  -- Sorteia 5 enigmas distribuídos: prioriza mundos diferentes.
  WITH ranked AS (
    SELECT
      enigma_id,
      world,
      row_number() OVER (PARTITION BY world ORDER BY random()) AS rn_in_world,
      random() AS r
    FROM public.enigma_answers
  ),
  picked AS (
    SELECT enigma_id
    FROM ranked
    WHERE rn_in_world <= 1
    ORDER BY r
    LIMIT 5
  )
  SELECT array_agg(enigma_id) INTO v_ids FROM picked;

  -- Fallback: se houver menos de 5 mundos com gabarito, completa aleatório.
  IF coalesce(array_length(v_ids, 1), 0) < 5 THEN
    SELECT array_agg(enigma_id) INTO v_ids
    FROM (
      SELECT enigma_id FROM public.enigma_answers ORDER BY random() LIMIT 5
    ) q;
  END IF;

  INSERT INTO public.sankofa_tournament_week (week_iso, enigma_ids, starts_at, ends_at)
  VALUES (v_week_iso, v_ids, v_starts_at, v_ends_at)
  RETURNING * INTO v_existing;

  RETURN v_existing;
END $$;

-- 8. Helper: semana corrente (chamável pelo cliente para descobrir os 5 enigmas)
CREATE OR REPLACE FUNCTION public.current_tournament_week()
RETURNS public.sankofa_tournament_week
LANGUAGE sql
STABLE
AS $$
  SELECT * FROM public.sankofa_tournament_week
  WHERE now() BETWEEN starts_at AND ends_at
  ORDER BY starts_at DESC
  LIMIT 1
$$;

COMMENT ON TABLE public.enigma_answers IS
  'Gabarito (server-side only). Cliente nunca lê. Edge Function valida acertos.';
COMMENT ON TABLE public.sankofa_tournament_week IS
  'Semanas do Torneio Assíncrono. 1 linha por ISO week. Rotação aos domingos 00:00 UTC.';
COMMENT ON TABLE public.sankofa_tournament_score IS
  'Tentativas dos jogadores. Inserção exclusiva via Edge Function submit_tournament_answer.';

-- 9. Verificação
SELECT 'enigma_answers' AS tabela, count(*) FROM public.enigma_answers
UNION ALL SELECT 'sankofa_tournament_week', count(*) FROM public.sankofa_tournament_week
UNION ALL SELECT 'sankofa_tournament_score', count(*) FROM public.sankofa_tournament_score;
