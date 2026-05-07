-- Sankofa — adiciona coluna tag à tabela league_scores
-- Para a aba "Meu Grupo" da Liga Global (Fase 1 PR 3).
--
-- Idempotente: pode rodar múltiplas vezes sem efeito colateral.
-- Aplicar via:   supabase db push
-- ou painel SQL: cole este conteúdo em https://supabase.com/dashboard/project/_/sql

ALTER TABLE IF EXISTS public.league_scores
  ADD COLUMN IF NOT EXISTS tag TEXT;

CREATE INDEX IF NOT EXISTS league_scores_tag_week_idx
  ON public.league_scores (tag, week_start, cauris DESC)
  WHERE tag IS NOT NULL;

-- Após aplicar, define no league-config.js:
--   window.SANKOFA_LEAGUE_CONFIG = {
--     url: "https://jcfqlvzdmmkeehqvfdtb.supabase.co",
--     anonKey: "...",
--     hasTagColumn: true   // <- ativa a aba Meu Grupo
--   };

COMMENT ON COLUMN public.league_scores.tag IS
  'Tag de grupo opcional (ex: #Turma7A) para filtrar leaderboards de turma/escola/família.';
