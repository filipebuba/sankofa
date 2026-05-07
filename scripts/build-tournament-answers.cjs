#!/usr/bin/env node
/*
  Sankofa — extrai gabarito de data/enigmas.js e gera SQL de seed.
  Output: supabase/seed_enigma_answers.sql
*/
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const enigmasFile = path.join(root, "data/enigmas.js");
const outFile = path.join(root, "supabase/seed_enigma_answers.sql");

const code = fs.readFileSync(enigmasFile, "utf8");

// Stub window/globals for sandboxed eval
const sandbox = { window: {}, document: {} };
const fn = new Function("window", "document", code + "\nreturn window.SANKOFA_ENIGMAS;");
const enigmas = fn(sandbox.window, sandbox.document);

if (!Array.isArray(enigmas)) {
  console.error("Could not parse ENIGMAS array.");
  process.exit(1);
}

const rows = enigmas.map(e => {
  if (typeof e.id !== "string" || typeof e.correct !== "number" || typeof e.world !== "number") {
    throw new Error("Invalid enigma: " + JSON.stringify(e).slice(0, 120));
  }
  const optsN = Array.isArray(e.options) ? e.options.length : 4;
  return `('${e.id.replace(/'/g, "''")}', ${e.correct}, ${e.world}, ${optsN})`;
});

const sql = `-- ============================================================
-- Sankofa — Seed do gabarito (auto-gerado por scripts/build-tournament-answers.js).
-- ${enigmas.length} enigmas. Não editar à mão; rerun o script.
-- ============================================================
-- Cole no SQL editor do Supabase APÓS rodar SETUP_TOURNAMENT.sql.
-- Painel: https://supabase.com/dashboard/project/jcfqlvzdmmkeehqvfdtb/sql/new
-- ============================================================

INSERT INTO public.enigma_answers (enigma_id, correct_idx, world, options_n) VALUES
${rows.join(",\n")}
ON CONFLICT (enigma_id) DO UPDATE SET
  correct_idx = EXCLUDED.correct_idx,
  world       = EXCLUDED.world,
  options_n   = EXCLUDED.options_n;

SELECT count(*) AS gabarito_total FROM public.enigma_answers;
`;

fs.writeFileSync(outFile, sql);
console.log("Wrote", outFile, "with", enigmas.length, "rows");
