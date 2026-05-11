# Prompt Suno v5 — Forja Bantu (BG Sankofa Kids 1.3)

## Style prompt (cole no campo "Style" do Suno)
african forest cinematic instrumental, central african mbira thumb piano polyrhythmic, log slit drum 6/8, distant anvil iron hammer rhythmic, udu drone bass, wordless deep male humming far in background, dense forest reverb, organic acoustic, no vocals, no lyrics, 95 BPM, seamless loop, modal pentatonic, gentle dynamics, low headroom for game SFX, bantu migration mood, ironworking nok culture vibe

## Persona vocal (opcional — campo "Persona")
None. Instrumental piece. Optional wordless deep male humming in far background only — adds presence without lead vocal.

## Negative tags (campo "Exclude Styles")
lyrics, lead vocals, lead singing, autotune, electronic, EDM, dubstep, trap, modern pop, heavy bass drop, distortion, build-up drop, dramatic crescendo, orchestral hits, brass section, drum kit rock, fast tempo, synthesizer pads modern, djembe west african (use central african)

## Iterações
- v1: prompt completo acima — gerar 2 takes, escolher mais arejado (espaço para SFX).
- v2: se ficar denso, adicionar `sparse arrangement, minimalist, lots of air, silence between phrases`.
- v3: se mbira pouco audível, reforçar `prominent mbira motif, central african thumb piano up front, hypnotic loop`.
- v4: se martelo soar moderno/percussivo demais, especificar `distant anvil hit, blacksmith iron strike, soft metallic resonance, not drum`.
- v5: se log drum soar como djembe, especificar `slit drum, log drum, hollow wood, central african, not west african djembe`.

## Notas Suno v5
- Cole letra completa (com tag `[Instrumental]`) no campo "Lyrics" — Suno respeita instrumental quando lyrics field só contém tag.
- Style prompt no campo "Style".
- **Modo Instrumental ON** no Suno (toggle "Instrumental" antes de gerar).
- Duração alvo 70s — pedir track curta (Suno default 3min, depois cortar/recortar para loop perfeito em editor).

## Loop seamless
Após geração, no editor (Audacity / Reaper):
1. Localizar última batida de log drum antes do fade.
2. Cortar cauda + colar onset no início.
3. Crossfade 200ms entre fim e início para emendar.
4. Export `.mp3` 128kbps mono ou stereo light → `kids/game/assets/world1-3/bg-music.mp3`.

## Referências sonoras
- **Stella Chiweshe** — mbira music Zimbabwe (raiz central-africana).
- **Hukwe Zawose** — Tanzania mbira + voice (sem voice aqui).
- **Konono Nº1** — eletro-mbira congolesa (referência rítmica, não eletrónica).
- **Francis Bebey** — pygmy minimalism + mbira ambient.
- **Kasai Allstars** — Congo polirritmia.
- **Mulatu Astatke** — ethio-jazz (espaço, mood ambient).
- Evitar djembe ou kora — instrumentos west-africanos, contexto errado.
