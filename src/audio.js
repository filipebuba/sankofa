/*
  Sankofa Audio Engine
  --------------------
  Synthesizes African-inspired instruments with the Web Audio API.
  No external samples. Everything is generated on the fly.

  Instruments
    djembe       — membrane drum (low slap / open tone). Sine + filtered noise burst.
    talkingDrum  — pitch-bending tone (dùndún). Sine with fast freq slide + body resonance.
    kalimba      — plucked tine (mbira). FM sine with quick decay, metallic shimmer.
    shaker       — caxixi/ganzá. Filtered noise with short attack envelope.
    balafon      — wooden marimba. Triangle + sine partial with woody decay.
    bell         — agogô. Two pitched metal partials with slow decay.

  Public API
    SankofaAudio.unlock()         resume AudioContext on first user gesture
    SankofaAudio.setMuted(bool)   global mute
    SankofaAudio.isMuted()
    SankofaAudio.play(name, opts) one-shot effect by event name
        names: click, correct, wrong, hint, fragment, achievement,
               levelUp, navigate, select, dailyOpen
    SankofaAudio.startAmbient()   slow djembe heartbeat + shaker
    SankofaAudio.stopAmbient()
    SankofaAudio.isAmbient()
*/
(function () {
  var ctx = null;
  var master = null;
  var muted = false;
  var ambientTimer = null;
  var ambientStep = 0;

  function ensure() {
    if (ctx) return ctx;
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    ctx = new Ctx();
    master = ctx.createGain();
    master.gain.value = 0.85;
    master.connect(ctx.destination);
    return ctx;
  }

  function unlock() {
    var c = ensure();
    if (c && c.state === "suspended") c.resume();
  }

  function now() { return ctx ? ctx.currentTime : 0; }

  function envGain(start, peak, attack, decay) {
    var g = ctx.createGain();
    var t = now();
    g.gain.setValueAtTime(start, t);
    g.gain.linearRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    return g;
  }

  function noiseBuffer(seconds) {
    var len = Math.max(1, Math.floor(ctx.sampleRate * seconds));
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  /* ---------------- INSTRUMENTS ---------------- */

  // Djembe: membrane drum. Slap = high tight, tone = low open, bass = deep open.
  function djembe(opts) {
    if (!ensure() || muted) return;
    opts = opts || {};
    var variant = opts.variant || "tone"; // slap | tone | bass
    var t = now();
    var freq = variant === "bass" ? 70 : variant === "slap" ? 320 : 130;
    var decay = variant === "bass" ? 0.55 : variant === "slap" ? 0.18 : 0.42;
    var vol = (opts.vol == null ? 0.55 : opts.vol);

    // Body
    var osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq * 2.4, t);
    osc.frequency.exponentialRampToValueAtTime(freq, t + 0.05);

    var bodyGain = ctx.createGain();
    bodyGain.gain.setValueAtTime(0.0001, t);
    bodyGain.gain.exponentialRampToValueAtTime(vol, t + 0.005);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, t + decay);

    osc.connect(bodyGain).connect(master);
    osc.start(t);
    osc.stop(t + decay + 0.05);

    // Skin transient (filtered noise)
    var n = ctx.createBufferSource();
    n.buffer = noiseBuffer(0.12);
    var bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = variant === "slap" ? 2400 : 900;
    bp.Q.value = variant === "slap" ? 1.4 : 0.9;
    var nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.0001, t);
    nGain.gain.exponentialRampToValueAtTime(vol * (variant === "slap" ? 0.85 : 0.4), t + 0.004);
    nGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
    n.connect(bp).connect(nGain).connect(master);
    n.start(t);
    n.stop(t + 0.12);
  }

  // Talking drum (dùndún): single tone with fast pitch bend.
  function talkingDrum(opts) {
    if (!ensure() || muted) return;
    opts = opts || {};
    var t = now();
    var startF = opts.startF || 220;
    var endF = opts.endF || 360;
    var dur = opts.dur || 0.32;
    var vol = (opts.vol == null ? 0.5 : opts.vol);

    var osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(startF, t);
    osc.frequency.exponentialRampToValueAtTime(endF, t + dur * 0.55);

    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(master);
    osc.start(t);
    osc.stop(t + dur + 0.05);

    // Body resonance
    var sub = ctx.createOscillator();
    sub.type = "sine";
    sub.frequency.setValueAtTime(startF * 0.5, t);
    sub.frequency.exponentialRampToValueAtTime(endF * 0.5, t + dur * 0.55);
    var sg = ctx.createGain();
    sg.gain.setValueAtTime(0.0001, t);
    sg.gain.exponentialRampToValueAtTime(vol * 0.35, t + 0.015);
    sg.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    sub.connect(sg).connect(master);
    sub.start(t);
    sub.stop(t + dur + 0.05);
  }

  // Kalimba / mbira: FM-style tine pluck with metallic shimmer.
  function kalimba(opts) {
    if (!ensure() || muted) return;
    opts = opts || {};
    var t = now();
    var f = opts.freq || 880;
    var dur = opts.dur || 0.8;
    var vol = (opts.vol == null ? 0.35 : opts.vol);

    var car = ctx.createOscillator();
    car.type = "sine";
    car.frequency.value = f;

    var mod = ctx.createOscillator();
    mod.type = "sine";
    mod.frequency.value = f * 2.01;

    var modGain = ctx.createGain();
    modGain.gain.setValueAtTime(f * 1.6, t);
    modGain.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.25);
    mod.connect(modGain).connect(car.frequency);

    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    car.connect(g).connect(master);
    car.start(t); mod.start(t);
    car.stop(t + dur + 0.05); mod.stop(t + dur + 0.05);
  }

  // Shaker (caxixi / ganzá).
  function shaker(opts) {
    if (!ensure() || muted) return;
    opts = opts || {};
    var t = now();
    var dur = opts.dur || 0.12;
    var vol = (opts.vol == null ? 0.35 : opts.vol);
    var n = ctx.createBufferSource();
    n.buffer = noiseBuffer(dur + 0.05);
    var hp = ctx.createBiquadFilter();
    hp.type = "highpass"; hp.frequency.value = 4500;
    var bp = ctx.createBiquadFilter();
    bp.type = "bandpass"; bp.frequency.value = 7200; bp.Q.value = 1.2;
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.connect(hp).connect(bp).connect(g).connect(master);
    n.start(t);
    n.stop(t + dur + 0.05);
  }

  // Balafon: wooden marimba. Triangle fundamental + sine 4th partial, woody decay.
  function balafon(opts) {
    if (!ensure() || muted) return;
    opts = opts || {};
    var t = now();
    var f = opts.freq || 523;
    var dur = opts.dur || 0.55;
    var vol = (opts.vol == null ? 0.4 : opts.vol);

    var o1 = ctx.createOscillator();
    o1.type = "triangle"; o1.frequency.value = f;
    var o2 = ctx.createOscillator();
    o2.type = "sine"; o2.frequency.value = f * 4.01;

    var g1 = ctx.createGain();
    g1.gain.setValueAtTime(0.0001, t);
    g1.gain.exponentialRampToValueAtTime(vol, t + 0.004);
    g1.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    var g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.0001, t);
    g2.gain.exponentialRampToValueAtTime(vol * 0.18, t + 0.003);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.45);

    o1.connect(g1).connect(master);
    o2.connect(g2).connect(master);
    o1.start(t); o2.start(t);
    o1.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
  }

  // Agogô / metal bell.
  function bell(opts) {
    if (!ensure() || muted) return;
    opts = opts || {};
    var t = now();
    var f = opts.freq || 880;
    var dur = opts.dur || 0.9;
    var vol = (opts.vol == null ? 0.3 : opts.vol);
    var partials = [1, 2.76, 5.4];
    for (var i = 0; i < partials.length; i++) {
      var o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = f * partials[i];
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol / (i + 1), t + 0.002);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur / (i + 1));
      o.connect(g).connect(master);
      o.start(t);
      o.stop(t + dur + 0.05);
    }
  }

  /* ---------------- EVENT MAPPING ---------------- */

  // Pentatonic minor (A) — common in West African mbira tunings.
  var SCALE = [440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5];

  function play(name, opts) {
    if (!ensure() || muted) return;
    unlock();
    opts = opts || {};
    switch (name) {
      case "click":
        kalimba({ freq: SCALE[5], dur: 0.25, vol: 0.18 });
        break;
      case "navigate":
        kalimba({ freq: SCALE[3], dur: 0.35, vol: 0.22 });
        setTimeout(function () { kalimba({ freq: SCALE[5], dur: 0.4, vol: 0.18 }); }, 70);
        break;
      case "select":
        balafon({ freq: SCALE[4], dur: 0.35, vol: 0.28 });
        break;
      case "hint":
        shaker({ dur: 0.14, vol: 0.32 });
        setTimeout(function () { shaker({ dur: 0.18, vol: 0.26 }); }, 120);
        break;
      case "wrong":
        djembe({ variant: "bass", vol: 0.6 });
        setTimeout(function () { djembe({ variant: "tone", vol: 0.35 }); }, 150);
        break;
      case "correct":
        // Talking drum ascending phrase + djembe accent + balafon shimmer.
        talkingDrum({ startF: 220, endF: 360, dur: 0.28, vol: 0.5 });
        setTimeout(function () { djembe({ variant: "tone", vol: 0.4 }); }, 70);
        setTimeout(function () { balafon({ freq: SCALE[4], dur: 0.4, vol: 0.32 }); }, 180);
        setTimeout(function () { balafon({ freq: SCALE[6], dur: 0.55, vol: 0.34 }); }, 320);
        break;
      case "fragment":
        // Balafon arpeggio ascending with djembe heartbeat.
        djembe({ variant: "bass", vol: 0.45 });
        balafon({ freq: SCALE[2], dur: 0.4, vol: 0.32 });
        setTimeout(function () { balafon({ freq: SCALE[4], dur: 0.45, vol: 0.34 }); }, 130);
        setTimeout(function () { balafon({ freq: SCALE[5], dur: 0.5, vol: 0.36 }); }, 260);
        setTimeout(function () { balafon({ freq: SCALE[6], dur: 0.7, vol: 0.4 }); }, 400);
        setTimeout(function () { djembe({ variant: "tone", vol: 0.45 }); }, 480);
        break;
      case "achievement":
        // Bell + balafon + djembe roll.
        bell({ freq: 880, dur: 1.1, vol: 0.32 });
        setTimeout(function () { balafon({ freq: SCALE[3], dur: 0.4, vol: 0.32 }); }, 120);
        setTimeout(function () { balafon({ freq: SCALE[5], dur: 0.45, vol: 0.34 }); }, 260);
        setTimeout(function () { balafon({ freq: SCALE[6], dur: 0.55, vol: 0.36 }); }, 420);
        setTimeout(function () { djembe({ variant: "slap", vol: 0.4 }); }, 600);
        setTimeout(function () { djembe({ variant: "slap", vol: 0.45 }); }, 720);
        setTimeout(function () { djembe({ variant: "tone", vol: 0.55 }); }, 840);
        break;
      case "levelUp":
        // Three talking drums + balafon cadence.
        talkingDrum({ startF: 200, endF: 320, dur: 0.28, vol: 0.5 });
        setTimeout(function () { talkingDrum({ startF: 240, endF: 380, dur: 0.28, vol: 0.5 }); }, 200);
        setTimeout(function () { talkingDrum({ startF: 280, endF: 440, dur: 0.32, vol: 0.5 }); }, 400);
        setTimeout(function () { balafon({ freq: SCALE[6], dur: 0.6, vol: 0.4 }); }, 620);
        break;
      case "dailyOpen":
        bell({ freq: 660, dur: 0.8, vol: 0.28 });
        setTimeout(function () { kalimba({ freq: SCALE[4], dur: 0.6, vol: 0.25 }); }, 180);
        break;
      default: break;
    }
  }

  /* ---------------- AMBIENT ---------------- */
  // Slow djembe heartbeat with shaker offbeats. Loops while active.

  function ambientTick() {
    if (!ctx || muted) return;
    var step = ambientStep % 8;
    if (step === 0) djembe({ variant: "bass", vol: 0.32 });
    else if (step === 4) djembe({ variant: "tone", vol: 0.28 });
    if (step === 2 || step === 6) shaker({ dur: 0.1, vol: 0.16 });
    if (step === 7 && (ambientStep / 8) % 2 === 0) {
      kalimba({ freq: SCALE[Math.floor(Math.random() * 4) + 1], dur: 0.7, vol: 0.14 });
    }
    ambientStep++;
  }

  function startAmbient() {
    if (!ensure()) return;
    if (ambientTimer) return;
    unlock();
    ambientStep = 0;
    ambientTick();
    ambientTimer = setInterval(ambientTick, 360);
  }

  function stopAmbient() {
    if (ambientTimer) {
      clearInterval(ambientTimer);
      ambientTimer = null;
    }
  }

  function setMuted(m) {
    muted = !!m;
    if (master) master.gain.value = muted ? 0 : 0.85;
    if (muted) stopAmbient();
  }

  window.SankofaAudio = {
    unlock: unlock,
    play: play,
    setMuted: setMuted,
    isMuted: function () { return muted; },
    startAmbient: startAmbient,
    stopAmbient: stopAmbient,
    isAmbient: function () { return !!ambientTimer; }
  };
})();
