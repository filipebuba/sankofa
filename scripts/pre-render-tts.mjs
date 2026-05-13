#!/usr/bin/env node
/*
  Pre-render TTS para enigmas do Sankofa.
  ---------------------------------------
  Engines:
    - piper  (local, offline, grátis): voz masculina pt-BR. Requer piper.exe + modelo .onnx
    - edge   (Microsoft Edge Read Aloud via msedge-tts npm, grátis, online): vozes femininas
             e masculinas pt-BR (FranciscaNeural, AntonioNeural, ThalitaMultilingualNeural...)

  Saída: assets/audio/tts/<enigmaId>.mp3
  Manifesto: assets/audio/tts/_manifest.json (rastreia hash+engine+voz)
  Idempotente: pula se nada mudou. --force regera tudo.

  Uso:
    # Tudo com piper faber masculino
    PIPER_BIN=/path/piper.exe node scripts/pre-render-tts.mjs

    # Tudo com edge Francisca feminino
    node scripts/pre-render-tts.mjs --engine=edge --voice=pt-BR-FranciscaNeural

    # Alternar: voz primária (piper faber M) e secundária (edge Francisca F)
    PIPER_BIN=/path/piper.exe node scripts/pre-render-tts.mjs \
      --alternate-engine=edge --alternate-voice=pt-BR-FranciscaNeural

    # Só alguns
    node scripts/pre-render-tts.mjs --only=w1e1,w2e3 --engine=edge --voice=pt-BR-FranciscaNeural

    # Voz feminina alternativa Thalita Multilingual
    node scripts/pre-render-tts.mjs --engine=edge --voice=pt-BR-ThalitaMultilingualNeural
*/
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "assets", "audio", "tts");
const MANIFEST = path.join(OUT_DIR, "_manifest.json");
const ENIGMAS_FILE = path.join(ROOT, "data", "enigmas.js");
const TMP_DIR = path.join(ROOT, ".tmp-piper");

const args = parseArgs(process.argv.slice(2));
const FORCE = !!args.force;
const ONLY = args.only ? String(args.only).split(",") : null;
const BITRATE = args.bitrate || "80k";

// Engine primário (default piper)
const ENGINE = args.engine || "piper";
const MODEL = args.model || path.join(ROOT, "models", "piper", "pt_BR-faber-medium.onnx");
const PIPER_BIN = args.piper || process.env.PIPER_BIN || "piper";
const SPEAKER = args.speaker != null ? String(args.speaker) : null;
const LENGTH_SCALE = args.length || "1.05";
const EDGE_VOICE = args.voice || "pt-BR-FranciscaNeural";
const EDGE_RATE = args.rate || "-5%";       // -50% a +100%
const EDGE_PITCH = args.pitch || "-2Hz";

// Alternância simples (2 vozes, retrocompat).
const ALT_ENGINE = args["alternate-engine"] || null;
const ALT_VOICE = args["alternate-voice"] || (ALT_ENGINE === "edge" ? "pt-BR-FranciscaNeural" : null);
const ALT_MODEL = args["alternate-model"] || null;
const ALTERNATE = !!ALT_ENGINE || !!ALT_VOICE;

// Rotação N-vozes. Override do modo --alternate-*.
// Formato: --rotate=piper:default,edge:pt-BR-FranciscaNeural,edge:pt-BR-AntonioNeural?rate=-15%
// Sufixo ?rate=-15%&pitch=-2Hz&length=1.15 sobrescreve defaults por entrada.
const ROTATE_RAW = args.rotate || null;
function parseRotationEntry(s) {
  const [main, qs] = s.split("?");
  const [eng, ...rest] = main.split(":");
  const id = rest.join(":");
  const opts = {};
  if (qs) for (const kv of qs.split("&")) { const [k, v] = kv.split("="); opts[k] = v; }
  if (eng === "piper") {
    const model = (id === "default" || !id) ? MODEL : (path.isAbsolute(id) ? id : path.join(ROOT, id));
    return { engine: "piper", model, voice: null, opts };
  }
  return { engine: eng, voice: id, model: null, opts };
}
const ROTATION = ROTATE_RAW ? ROTATE_RAW.split(",").map(parseRotationEntry) : null;

// Fallback: usado quando engine primária (geralmente edge) falha.
// Default: se rotação tem piper, usa essa config como fallback.
const FALLBACK_RAW = args.fallback || null;
const FALLBACK = FALLBACK_RAW
  ? parseRotationEntry(FALLBACK_RAW)
  : (ROTATION ? ROTATION.find(r => r.engine === "piper") : null);

function parseArgs(argv) {
  const out = {};
  for (const a of argv) {
    if (a.startsWith("--")) {
      const rest = a.slice(2);
      const eq = rest.indexOf("=");
      if (eq === -1) out[rest] = true;
      else out[rest.slice(0, eq)] = rest.slice(eq + 1);
    }
  }
  return out;
}

async function loadEnigmas() {
  const src = await fs.readFile(ENIGMAS_FILE, "utf8");
  const wrap = `(function(window){ ${src} ; return window.SANKOFA_ENIGMAS; })`;
  const fn = new Function("return " + wrap)();
  const arr = fn({});
  if (!Array.isArray(arr)) throw new Error("SANKOFA_ENIGMAS não é array");
  return arr;
}

function stripHTML(s) {
  return String(s || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

const ORDINALS = ["primeira", "segunda", "terceira", "quarta", "quinta", "sexta"];
function buildSpeechText(e) {
  const parts = [];
  if (e.title) parts.push(stripHTML(e.title) + ".");
  if (e.intro) parts.push(stripHTML(e.intro));
  if (e.question) parts.push(stripHTML(e.question));
  if (Array.isArray(e.options) && e.options.length) {
    parts.push("Opções de resposta.");
    e.options.forEach((o, i) => {
      const label = ORDINALS[i] ? `Opção ${ORDINALS[i]}` : `Opção ${i + 1}`;
      parts.push(`${label}. ${stripHTML(o)}.`);
    });
  }
  return parts.join(" ");
}

function hash(s, salt) {
  return crypto.createHash("sha1").update(salt + "|" + s).digest("hex").slice(0, 12);
}

async function loadManifest() {
  try { return JSON.parse(await fs.readFile(MANIFEST, "utf8")); }
  catch { return {}; }
}
async function saveManifest(m) { await fs.writeFile(MANIFEST, JSON.stringify(m, null, 2)); }

function run(cmd, argv, stdinText) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, argv, { stdio: ["pipe", "pipe", "pipe"] });
    const out = [], err = [];
    p.stdout.on("data", d => out.push(d));
    p.stderr.on("data", d => err.push(d));
    p.on("error", reject);
    p.on("close", code => {
      if (code !== 0) return reject(new Error(`${cmd} exit ${code}: ${Buffer.concat(err).toString()}`));
      resolve(Buffer.concat(out));
    });
    if (stdinText != null) p.stdin.end(stdinText); else p.stdin.end();
  });
}

/* ----- Piper ----- */
const PIPER_IS_WIN = /\.exe$/i.test(PIPER_BIN);
const HAS_WSLPATH = (() => {
  try { return spawnSync("wslpath", ["-w", "/"], { encoding: "utf8" }).status === 0; }
  catch { return false; }
})();
async function toWinPath(p) {
  if (!PIPER_IS_WIN || !HAS_WSLPATH) return p;
  const out = await run("wslpath", ["-w", p]);
  return out.toString().trim();
}

async function synthPiper(text, wavPath, modelOverride, optsOverride) {
  const model = modelOverride || MODEL;
  const opts = optsOverride || {};
  const len = opts.length || LENGTH_SCALE;
  const mPath = await toWinPath(model);
  const fPath = await toWinPath(wavPath);
  const piperArgs = ["-m", mPath, "-f", fPath, "--length_scale", len];
  if (SPEAKER != null) piperArgs.push("-s", SPEAKER);
  await run(PIPER_BIN, piperArgs, text);
}

/* ----- Edge (msedge-tts) ----- */
let edgeTtsLib = null;
async function getEdgeTts() {
  if (edgeTtsLib) return edgeTtsLib;
  try { edgeTtsLib = await import("msedge-tts"); return edgeTtsLib; }
  catch (e) { throw new Error("msedge-tts não instalado. Roda: npm install msedge-tts"); }
}

async function synthEdge(text, wavPath, voice, optsOverride) {
  const lib = await getEdgeTts();
  const tts = new lib.MsEdgeTTS();
  const opts = optsOverride || {};
  const rate = opts.rate || EDGE_RATE;
  const pitch = opts.pitch || EDGE_PITCH;
  await tts.setMetadata(voice, lib.OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  return await new Promise((resolve, reject) => {
    const chunks = [];
    const stream = tts.toStream(text, { voice, rate, pitch });
    const audioStream = stream.audioStream || stream;
    audioStream.on("data", c => chunks.push(c));
    audioStream.on("end", async () => {
      try { await fs.writeFile(wavPath, Buffer.concat(chunks)); resolve(); }
      catch (e) { reject(e); }
    });
    audioStream.on("error", reject);
  });
}

async function toMp3(srcPath, mp3Path) {
  await run("ffmpeg", [
    "-y", "-loglevel", "error",
    "-i", srcPath,
    "-ac", "1", "-ar", "22050", "-b:a", BITRATE,
    "-af", "loudnorm=I=-18:TP=-1.5:LRA=8,afade=t=in:st=0:d=0.05,afade=t=out:st=999:d=0.4",
    mp3Path
  ]);
}

function pickEngineFor(index) {
  if (ROTATION && ROTATION.length) return ROTATION[index % ROTATION.length];
  if (!ALTERNATE) return { engine: ENGINE, voice: ENGINE === "edge" ? EDGE_VOICE : null, model: MODEL };
  return (index % 2 === 0)
    ? { engine: ENGINE, voice: ENGINE === "edge" ? EDGE_VOICE : null, model: MODEL }
    : { engine: ALT_ENGINE || ENGINE, voice: ALT_VOICE, model: ALT_MODEL || MODEL };
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(TMP_DIR, { recursive: true });

  // Validações por engine que vai ser usado
  const enginesUsed = new Set([ENGINE]);
  if (ALTERNATE && ALT_ENGINE) enginesUsed.add(ALT_ENGINE);
  if (ROTATION) for (const r of ROTATION) enginesUsed.add(r.engine);
  if (enginesUsed.has("piper")) {
    const piperModels = ROTATION
      ? ROTATION.filter(r => r.engine === "piper").map(r => r.model)
      : [MODEL];
    for (const m of piperModels) {
      try { await fs.access(m); }
      catch { throw new Error(`Modelo piper não encontrado: ${m}\nBaixa em https://huggingface.co/rhasspy/piper-voices/tree/main/pt/pt_BR`); }
    }
  }

  const enigmas = await loadEnigmas();
  const manifest = await loadManifest();
  const targets = ONLY ? enigmas.filter(e => ONLY.includes(e.id)) : enigmas;

  console.log(`Pré-render ${targets.length}/${enigmas.length} enigmas`);
  if (ROTATION && ROTATION.length) {
    console.log(`  Rotação ${ROTATION.length} vozes:`);
    ROTATION.forEach((r, i) => console.log(`    [${i}] ${r.engine}/${r.voice || path.basename(r.model || "")}`));
  } else if (ALTERNATE) {
    const a = pickEngineFor(0), b = pickEngineFor(1);
    console.log(`  Alternando: par=${a.engine}/${a.voice || path.basename(a.model)}  ímpar=${b.engine}/${b.voice || path.basename(b.model)}`);
  } else {
    const cfg = pickEngineFor(0);
    console.log(`  Engine=${cfg.engine} ${cfg.engine === "edge" ? "voz=" + cfg.voice : "modelo=" + path.basename(cfg.model)}`);
  }

  function cfgTag(c) { return c.engine === "edge" ? c.voice : path.basename(c.model, ".onnx"); }
  function cfgSalt(c) {
    const o = c.opts || {};
    return `${c.engine}:${cfgTag(c)}:speaker=${SPEAKER || "default"}:len=${o.length || LENGTH_SCALE}:rate=${o.rate || EDGE_RATE}:pitch=${o.pitch || EDGE_PITCH}`;
  }
  async function trySynth(cfg, text, tmpPath) {
    if (cfg.engine === "edge") return synthEdge(text, tmpPath, cfg.voice, cfg.opts);
    return synthPiper(text, tmpPath, cfg.model, cfg.opts);
  }

  let done = 0, skipped = 0, failed = 0, fellBack = 0;
  for (let i = 0; i < targets.length; i++) {
    const e = targets[i];
    const text = buildSpeechText(e);
    if (!text) { skipped++; continue; }
    const cfg = pickEngineFor(i);
    const tag = cfgTag(cfg);
    const h = hash(text, cfgSalt(cfg));
    const out = path.join(OUT_DIR, `${e.id}.mp3`);
    const prev = manifest[e.id];
    if (!FORCE && prev && prev.hash === h && prev.engine === cfg.engine && (prev.voice || prev.model) === tag) {
      try { await fs.access(out); skipped++; continue; } catch {}
    }
    let used = cfg;
    let tmp = path.join(TMP_DIR, `${e.id}.${cfg.engine === "edge" ? "mp3" : "wav"}`);
    try {
      process.stdout.write(`  ${e.id} (${text.length}c) [${cfg.engine}/${tag}]… `);
      try {
        await trySynth(cfg, text, tmp);
      } catch (primaryErr) {
        if (!FALLBACK) throw primaryErr;
        console.log(`\n    ↳ falha (${primaryErr.message.split("\n")[0]}), fallback → ${FALLBACK.engine}/${cfgTag(FALLBACK)}`);
        used = FALLBACK;
        tmp = path.join(TMP_DIR, `${e.id}.${used.engine === "edge" ? "mp3" : "wav"}`);
        await trySynth(used, text, tmp);
        fellBack++;
      }
      await toMp3(tmp, out);
      const stat = await fs.stat(out);
      const usedTag = cfgTag(used);
      const usedHash = used === cfg ? h : hash(text, cfgSalt(used));
      manifest[e.id] = {
        hash: usedHash, engine: used.engine,
        ...(used.engine === "edge" ? { voice: usedTag } : { model: usedTag }),
        ...(used !== cfg ? { fallbackFrom: `${cfg.engine}/${tag}` } : {}),
        bytes: stat.size, chars: text.length
      };
      done++;
      console.log(`✓ ${(stat.size / 1024).toFixed(1)}KB${used !== cfg ? " (fallback)" : ""}`);
      await saveManifest(manifest);
    } catch (err) {
      failed++;
      console.log(`✗ ${err.message.split("\n")[0]}`);
    } finally {
      try { await fs.unlink(tmp); } catch {}
    }
  }

  try { await fs.rmdir(TMP_DIR); } catch {}
  console.log(`\nFeito: ${done} gerados, ${skipped} pulados, ${failed} falhas${fellBack ? `, ${fellBack} via fallback` : ""}.`);
}

main().catch(e => { console.error("ERRO:", e.message); process.exit(1); });
