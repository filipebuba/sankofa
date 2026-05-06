---
name: sankofa-tune-audio
description: Use when adjusting Sankofa's African instrument audio engine. Covers timbre, decay, volume, event mapping, ambient loop tempo, and adding new instruments. Triggers on "ajustar som", "tambor mais grave", "kalimba mais aguda", "som de errado está alto", "trocar instrumento", "pad de fundo".
---

# Tune Sankofa's audio engine

All audio lives in `src/audio.js`. There are no external sample files. Reference doc:
`docs/AUDIO.md`.

## Where to change what

| Change                              | Where                                                       |
|-------------------------------------|-------------------------------------------------------------|
| Master volume                       | `master.gain.value` in `ensure()`                           |
| Per-instrument volume default       | `vol` parameter inside the instrument function              |
| Decay length                        | `decay` / `dur` in the instrument function                  |
| Pitch (kalimba/balafon/bell)        | `freq` parameter — defaults exist; scale lives in `SCALE`   |
| Event sound (e.g. "correct")        | `play()` switch case in `src/audio.js`                      |
| Ambient pattern                     | `ambientTick()` (8-step pattern, `setInterval` 360 ms)      |
| New instrument                      | Add a new function modelled after `kalimba()` / `djembe()`  |

## Rules

1. **Never use external files**. Synthesize. Adding `<audio>` tags or `fetch()` of a
   sample is a regression — keeps the project license-clean and offline-friendly.

2. **Keep the public API stable**:
   `unlock`, `play`, `setMuted`, `isMuted`, `startAmbient`, `stopAmbient`, `isAmbient`.
   `src/app.js` calls these — don't rename without updating call sites.

3. **Volumes**: stay between 0.05 and 0.7 per voice. Sum of simultaneous voices should
   not exceed ~1.2 to avoid clipping.

4. **Decay**: keep djembe slap < 0.25s; kalimba/balafon < 1s; bell up to ~1.2s.
   Anything longer should justify itself (level-up cadence is fine).

5. **Pentatonic minor in A** (`SCALE = [440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5]`)
   is the project default. Do not break this without discussing with the user — it
   ties the audio to a coherent African mbira/balafon tuning.

6. **Mute first**: every instrument function must early-return on `muted === true`
   AND when `ensure()` returns null (browser without Web Audio).

7. **Ambient pattern** is intentionally minimal (4-on-the-floor djembe with shaker
   offbeat and rare kalimba). If asked to make it richer, layer additional voices
   on different `ambientStep` modulo positions — do not raise per-voice volume.

8. **Browser autoplay policy**: audio context must be unlocked on a user gesture.
   `unlock()` is already called on `app.js` first click — preserve that path.

## Quick recipe templates

**Make "wrong" softer:**
```js
case "wrong":
  djembe({ variant: "bass", vol: 0.4 });
  // remove the second hit, or drop its vol to 0.2
  break;
```

**Add a new "kora pluck" instrument** (West African harp, bright nylon-like):

```js
function kora(opts) {
  if (!ensure() || muted) return;
  opts = opts || {};
  var t = now();
  var f = opts.freq || 587;
  var dur = opts.dur || 1.2;
  var vol = (opts.vol == null ? 0.3 : opts.vol);
  var o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = f;
  var lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2400; lp.Q.value = 0.7;
  var g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(lp).connect(g).connect(master);
  o.start(t); o.stop(t + dur + 0.05);
}
```

After adding, expose it through a new `play()` case (e.g. `case "discover":`) and
update `docs/AUDIO.md` with the instrument and the event mapping.

## Sanity check before reporting done

- Open `index.html`, click around all screens, confirm no errors in DevTools.
- Toggle 🔇 then 🔊 — clicking after unmute should produce a kalimba pluck.
- Toggle 🥁 ambient on landing for 5 seconds, then off — must stop cleanly.
- Resolve any enigma — `correct` then `fragment` should play in sequence and not clip.
