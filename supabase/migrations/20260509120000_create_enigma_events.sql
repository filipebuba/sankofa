-- Sankofa — telemetria pedagógica anônima (opt-in).
-- Cliente anônimo INSERTA. Não SELECT na tabela base (sem PII expostos).
-- Métricas para painel admin / editais / parceiros vão via VIEWS agregadas
-- (que SÃO públicas — só agregados, sem PII).

CREATE TABLE IF NOT EXISTS enigma_events (
  id            BIGSERIAL PRIMARY KEY,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id    TEXT NOT NULL,                 -- UUID local (sem PII)
  enigma_id     TEXT NOT NULL,                 -- ex "M2-05"
  world         SMALLINT NOT NULL,
  event_type    TEXT NOT NULL CHECK (event_type IN ('view','answer','hint','skip','emotion')),
  -- payload (sparse por tipo):
  attempt       SMALLINT,
  correct       BOOLEAN,
  ms_to_answer  INTEGER,
  hint_index    SMALLINT,
  emotion       TEXT CHECK (emotion IN ('happy','neutral','sad') OR emotion IS NULL),
  clarity       SMALLINT CHECK (clarity BETWEEN 1 AND 5 OR clarity IS NULL),
  -- contexto opt-in (sem PII):
  age_band      TEXT,
  house         TEXT,
  app_version   TEXT
);

CREATE INDEX IF NOT EXISTS enigma_events_enigma_idx  ON enigma_events (enigma_id);
CREATE INDEX IF NOT EXISTS enigma_events_world_idx   ON enigma_events (world, event_type);
CREATE INDEX IF NOT EXISTS enigma_events_created_idx ON enigma_events (created_at DESC);
CREATE INDEX IF NOT EXISTS enigma_events_type_idx    ON enigma_events (event_type, created_at DESC);

ALTER TABLE enigma_events ENABLE ROW LEVEL SECURITY;

-- Insert público anônimo (anti-flood básico via constraints).
CREATE POLICY "enigma_events_insert_anon" ON enigma_events
  FOR INSERT
  WITH CHECK (
    length(session_id) BETWEEN 8 AND 64
    AND length(enigma_id) BETWEEN 1 AND 32
    AND world BETWEEN 1 AND 12
    AND event_type IN ('view','answer','hint','skip','emotion')
    AND (ms_to_answer IS NULL OR ms_to_answer BETWEEN 0 AND 600000)
  );

-- Sem SELECT policy = cliente nunca lê linhas individuais.

-- ==================================================================
-- VIEWS AGREGADAS (sem PII, podem ser lidas pelo painel via anon)
-- ==================================================================

-- Dificuldade por enigma (taxa de acerto por tentativa)
CREATE OR REPLACE VIEW v_enigma_difficulty AS
SELECT
  enigma_id,
  world,
  COUNT(*)                                                          AS tentativas,
  SUM(CASE WHEN attempt = 1 AND correct THEN 1 ELSE 0 END)::float
    / NULLIF(COUNT(*) FILTER (WHERE attempt = 1), 0)                AS acerto_1tent,
  SUM(CASE WHEN correct THEN 1 ELSE 0 END)::float
    / NULLIF(COUNT(*), 0)                                           AS acerto_total,
  COUNT(DISTINCT session_id)                                        AS sessoes_unicas
FROM enigma_events
WHERE event_type = 'answer'
GROUP BY enigma_id, world;

-- Tempo médio por enigma (1ª tentativa, em segundos)
CREATE OR REPLACE VIEW v_enigma_timing AS
SELECT
  enigma_id,
  world,
  COUNT(*)                                                                AS n,
  ROUND((AVG(ms_to_answer) / 1000.0)::numeric, 1)                          AS seg_medio,
  ROUND((PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ms_to_answer) / 1000.0)::numeric, 1) AS seg_mediana,
  ROUND((PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY ms_to_answer) / 1000.0)::numeric, 1) AS seg_p95
FROM enigma_events
WHERE event_type = 'answer' AND attempt = 1 AND ms_to_answer IS NOT NULL
GROUP BY enigma_id, world;

-- Emoção por enigma
CREATE OR REPLACE VIEW v_enigma_emotion AS
SELECT
  enigma_id,
  world,
  COUNT(*) FILTER (WHERE emotion = 'happy')   AS feliz,
  COUNT(*) FILTER (WHERE emotion = 'neutral') AS neutro,
  COUNT(*) FILTER (WHERE emotion = 'sad')     AS triste,
  COUNT(*)                                     AS total_respostas
FROM enigma_events
WHERE event_type = 'emotion'
GROUP BY enigma_id, world;

-- Clareza percebida por enigma (1..5)
CREATE OR REPLACE VIEW v_enigma_clarity AS
SELECT
  enigma_id,
  world,
  ROUND(AVG(clarity)::numeric, 2) AS clareza_media,
  COUNT(*)                        AS n
FROM enigma_events
WHERE event_type = 'emotion' AND clarity IS NOT NULL
GROUP BY enigma_id, world;

-- Funil de uso de dicas por mundo
CREATE OR REPLACE VIEW v_hints_funnel AS
SELECT
  world,
  COUNT(*) FILTER (WHERE hint_index = 0) AS dica_1,
  COUNT(*) FILTER (WHERE hint_index = 1) AS dica_2,
  COUNT(*) FILTER (WHERE hint_index = 2) AS dica_3
FROM enigma_events
WHERE event_type = 'hint'
GROUP BY world
ORDER BY world;

-- Visão geral: KPIs do projeto (ideal para editais)
CREATE OR REPLACE VIEW v_overview AS
SELECT
  COUNT(DISTINCT session_id)                                               AS sessoes_unicas_total,
  COUNT(*) FILTER (WHERE event_type = 'view')                              AS enigmas_abertos,
  COUNT(*) FILTER (WHERE event_type = 'answer')                            AS respostas_totais,
  COUNT(*) FILTER (WHERE event_type = 'answer' AND correct)                AS acertos_totais,
  COUNT(*) FILTER (WHERE event_type = 'hint')                              AS dicas_pedidas,
  COUNT(*) FILTER (WHERE event_type = 'skip')                              AS pulos_totais,
  COUNT(*) FILTER (WHERE event_type = 'emotion' AND emotion = 'happy')     AS reacoes_felizes,
  COUNT(*) FILTER (WHERE event_type = 'emotion' AND emotion = 'sad')       AS reacoes_tristes,
  ROUND(AVG(clarity) FILTER (WHERE event_type = 'emotion' AND clarity IS NOT NULL)::numeric, 2)
                                                                            AS clareza_media_geral,
  MIN(created_at)                                                          AS primeira_atividade,
  MAX(created_at)                                                          AS ultima_atividade
FROM enigma_events;

-- Engajamento por dia (últimos 30 dias)
CREATE OR REPLACE VIEW v_daily_engagement AS
SELECT
  DATE(created_at)                                                AS dia,
  COUNT(DISTINCT session_id)                                      AS sessoes,
  COUNT(*) FILTER (WHERE event_type = 'view')                     AS enigmas_abertos,
  COUNT(*) FILTER (WHERE event_type = 'answer' AND correct)       AS acertos
FROM enigma_events
WHERE created_at > now() - interval '30 days'
GROUP BY DATE(created_at)
ORDER BY dia DESC;

-- Faixa etária — útil para relatórios pedagógicos
CREATE OR REPLACE VIEW v_age_breakdown AS
SELECT
  COALESCE(age_band, 'nao_informado')               AS faixa,
  COUNT(DISTINCT session_id)                        AS sessoes_unicas,
  COUNT(*) FILTER (WHERE event_type = 'answer')     AS respostas,
  ROUND(
    100.0 * SUM(CASE WHEN event_type='answer' AND correct THEN 1 ELSE 0 END)
    / NULLIF(COUNT(*) FILTER (WHERE event_type='answer'), 0),
    1
  )                                                 AS taxa_acerto_pct
FROM enigma_events
GROUP BY COALESCE(age_band, 'nao_informado')
ORDER BY sessoes_unicas DESC;

-- Permite leitura anônima das views agregadas (sem PII).
-- Postgres: views herdam permissões da tabela base por padrão, então
-- precisamos GRANT explícito.
GRANT SELECT ON v_enigma_difficulty   TO anon;
GRANT SELECT ON v_enigma_timing       TO anon;
GRANT SELECT ON v_enigma_emotion      TO anon;
GRANT SELECT ON v_enigma_clarity      TO anon;
GRANT SELECT ON v_hints_funnel        TO anon;
GRANT SELECT ON v_overview            TO anon;
GRANT SELECT ON v_daily_engagement    TO anon;
GRANT SELECT ON v_age_breakdown       TO anon;
