-- Sankofa — feedback público.
-- Cliente anônimo INSERTA (RLS open insert).
-- Cliente NÃO LÊ — sem SELECT policy → tabela é write-only do lado público.
-- Service Role (Edge Function ou painel) é quem lê + responde.

CREATE TABLE IF NOT EXISTS feedback (
  id            BIGSERIAL PRIMARY KEY,
  type          TEXT NOT NULL CHECK (type IN ('bug','suggestion','praise','question','enigma')),
  message       TEXT NOT NULL CHECK (length(message) BETWEEN 5 AND 4000),
  screen        TEXT,
  contact       TEXT,                       -- e-mail/whatsapp opcional, opt-in
  age_band      TEXT,                       -- 8-12, 13-17, 18+, skip
  app_version   TEXT,
  ua            TEXT,                       -- user-agent abreviado, sem IP
  url_ref       TEXT,                       -- de onde veio (?ref=)
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS feedback_created_idx ON feedback (created_at DESC);
CREATE INDEX IF NOT EXISTS feedback_type_idx    ON feedback (type, created_at DESC);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Insert público (anon). Sem SELECT policy = cliente nunca lê.
CREATE POLICY "feedback_insert_anon" ON feedback
  FOR INSERT
  WITH CHECK (
    length(message) >= 5
    AND length(message) <= 4000
    AND type IN ('bug','suggestion','praise','question','enigma')
  );

-- Anti-flood básico: limita 1 inserção por IP a cada 10s via constraint? Sem IP no schema.
-- Mitigação real fica em Edge Function se virar problema. Por agora, RLS + length é suficiente.
