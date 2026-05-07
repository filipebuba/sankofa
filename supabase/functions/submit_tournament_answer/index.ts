// Sankofa — Edge Function: submit_tournament_answer
// ----------------------------------------------------
// Anti-cheat server-side. Cliente envia (week_iso, profile_uid, nick, enigma_id,
// picked, ms_to_answer, hints_used, attempt, tag, age_band, house). Função:
//   1. Carrega semana atual e valida janela temporal.
//   2. Confirma enigma_id ∈ enigma_ids da semana.
//   3. Confirma attempt 1..3 e ms_to_answer >= 1500.
//   4. Lê gabarito de public.enigma_answers (cliente nunca vê).
//   5. Calcula score server-side (correto + dicas + velocidade).
//   6. Insere via service role (RLS bloqueia INSERT direto pelo cliente).
//
// Deploy:
//   supabase functions deploy submit_tournament_answer --no-verify-jwt
//
// Env esperadas (Supabase preenche automaticamente):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// CORS: aberto. Sem JWT (cliente sem auth no v1).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Payload {
  week_iso?: string;
  profile_uid?: string;
  nick?: string;
  tag?: string | null;
  age_band?: string | null;
  house?: string | null;
  enigma_id?: string;
  picked?: number;
  ms_to_answer?: number;
  hints_used?: number;
  attempt?: number;
}

function bad(message: string, status = 400) {
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status,
    headers: { "content-type": "application/json", ...CORS },
  });
}

function ok(body: Record<string, unknown>) {
  return new Response(JSON.stringify({ ok: true, ...body }), {
    status: 200,
    headers: { "content-type": "application/json", ...CORS },
  });
}

function score(correct: boolean, attempt: number, hintsUsed: number, ms: number): number {
  if (!correct) return 0;
  // Base por tentativa
  const baseAttempt = attempt === 1 ? 1000 : attempt === 2 ? 500 : 250;
  // Penalidade por dicas usadas (dentro da tentativa)
  const hintPenalty = Math.min(3, Math.max(0, hintsUsed)) * 200;
  const base = Math.max(100, baseAttempt - hintPenalty);
  // Bônus de velocidade (até +200 se respondeu em < 5 s)
  const speedBonus = Math.max(0, Math.round(200 - ms / 150));
  return base + Math.min(200, speedBonus);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return bad("Method not allowed", 405);

  let payload: Payload;
  try { payload = await req.json(); }
  catch { return bad("invalid json"); }

  const {
    week_iso, profile_uid, nick, enigma_id, picked, ms_to_answer,
    attempt = 1, hints_used = 0, tag = null, age_band = null, house = null
  } = payload;

  if (!week_iso || !profile_uid || !nick || !enigma_id) return bad("missing fields");
  if (typeof picked !== "number" || picked < 0 || picked > 9) return bad("bad picked");
  if (typeof ms_to_answer !== "number" || ms_to_answer < 1500) return bad("too fast (anti-bot)");
  if (typeof attempt !== "number" || attempt < 1 || attempt > 3) return bad("bad attempt");
  if (String(profile_uid).length > 64) return bad("uid too long");
  if (String(nick).length === 0 || String(nick).length > 32) return bad("bad nick");

  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return bad("server not configured", 500);

  const supa = createClient(url, key, { auth: { persistSession: false } });

  // 1. Semana atual
  const { data: week, error: wErr } = await supa
    .from("sankofa_tournament_week")
    .select("id, week_iso, enigma_ids, starts_at, ends_at")
    .eq("week_iso", week_iso)
    .maybeSingle();

  if (wErr) return bad("week query failed: " + wErr.message, 500);
  if (!week) return bad("week not found");

  const now = Date.now();
  const startMs = new Date(week.starts_at).getTime();
  const endMs   = new Date(week.ends_at).getTime();
  if (now < startMs || now > endMs) return bad("outside tournament window");

  // 2. Enigma na lista
  const ids: string[] = Array.isArray(week.enigma_ids) ? week.enigma_ids : [];
  if (!ids.includes(enigma_id)) return bad("enigma not in this week");

  // 3. Gabarito server-side
  const { data: ans, error: aErr } = await supa
    .from("enigma_answers")
    .select("correct_idx, options_n")
    .eq("enigma_id", enigma_id)
    .maybeSingle();

  if (aErr || !ans) return bad("no gabarito for enigma");
  if (picked >= (ans.options_n ?? 4)) return bad("picked out of range");

  const isCorrect = picked === ans.correct_idx;
  const sc = score(isCorrect, attempt, hints_used, ms_to_answer);

  // 4. Insere (RLS bloqueia direto pelo cliente; service role aqui passa)
  const { error: iErr } = await supa
    .from("sankofa_tournament_score")
    .insert({
      week_id: week.id,
      profile_uid: String(profile_uid).slice(0, 64),
      nick: String(nick).slice(0, 32),
      tag: tag ? String(tag).slice(0, 24) : null,
      age_band: age_band ? String(age_band).slice(0, 8) : null,
      house: house ? String(house).slice(0, 24) : null,
      enigma_id,
      attempt,
      picked,
      correct: isCorrect,
      ms_to_answer,
      hints_used,
      score: sc,
    });

  if (iErr) {
    if (iErr.code === "23505") return bad("attempt already submitted", 409);
    return bad("insert failed: " + iErr.message, 500);
  }

  return ok({ correct: isCorrect, score: sc, week_id: week.id });
});
