-- Sankofa — proteger painel admin com Supabase Auth.
-- Anteriormente as views agregadas eram lidas por anon (gate cosmético).
-- Agora exigem JWT de usuário autenticado (role = authenticated).
-- A tabela base enigma_events continua INSERT-only para anon (telemetria opt-in).
-- SELECT na tabela base permanece bloqueado para todos exceto service_role.

REVOKE SELECT ON v_enigma_difficulty FROM anon;
REVOKE SELECT ON v_enigma_timing     FROM anon;
REVOKE SELECT ON v_enigma_emotion    FROM anon;
REVOKE SELECT ON v_enigma_clarity    FROM anon;
REVOKE SELECT ON v_hints_funnel      FROM anon;
REVOKE SELECT ON v_overview          FROM anon;
REVOKE SELECT ON v_daily_engagement  FROM anon;
REVOKE SELECT ON v_age_breakdown     FROM anon;

GRANT SELECT ON v_enigma_difficulty TO authenticated;
GRANT SELECT ON v_enigma_timing     TO authenticated;
GRANT SELECT ON v_enigma_emotion    TO authenticated;
GRANT SELECT ON v_enigma_clarity    TO authenticated;
GRANT SELECT ON v_hints_funnel      TO authenticated;
GRANT SELECT ON v_overview          TO authenticated;
GRANT SELECT ON v_daily_engagement  TO authenticated;
GRANT SELECT ON v_age_breakdown     TO authenticated;

-- Defesa em profundidade: garante que mesmo se algum app conceder anon
-- futuramente, RLS na tabela base bloqueia SELECT.
-- (Já estava — sem SELECT policy = ninguém lê linhas individuais.)

-- Nota operacional:
-- 1. Em Studio → Authentication → Users → criar usuário com email/senha forte.
-- 2. Ativar "Confirm email" se quiser confirmação por e-mail.
-- 3. Desativar self-signup em Authentication → Providers → Email → Disable signups.
--    (impede que qualquer um crie conta e veja o painel)
