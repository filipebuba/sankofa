# Prompt Suno v5 — Saara Verde (BG Sankofa Kids 1.2)

## Style prompt (cole no campo "Style" do Suno)
african ambient cinematic, tuareg desert blues instrumental, kalimba and ney flute lead, frame drum bendir slow 6/8, wordless female humming far in background, modal pentatonic, drone bass bordon, warm reverb, organic acoustic, no vocals, no lyrics, 85 BPM, seamless loop, gentle dynamics, low headroom for game SFX, nostalgic ancestral mood, rock paintings emerging from sand

## Persona vocal (opcional — campo "Persona")
None. Instrumental piece. Wordless female humming optional in far background only — no melodic vocal lead.

## Negative tags (campo "Exclude Styles")
lyrics, vocals lead, lead singing, autotune, electronic, EDM, dubstep, trap, modern pop, heavy bass drop, distortion, build-up drop, dramatic crescendo, orchestral hits, brass section, drum kit rock, fast tempo, synthesizer pads modern

## Iterações
- v1: prompt completo acima — gerar 2 takes, escolher mais "respiratório" (espaço para SFX).
- v2: se ficar denso, adicionar `sparse arrangement, minimalist, lots of air, silence between phrases`.
- v3: se kalimba pouco audível, reforçar `prominent kalimba motif, mbira melody up front`.
- v4: se flauta soar moderna, especificar `ancient ney flute, breathy, tuareg desert tradition`.

## Notas Suno v5
- Cole letra completa (com tag `[Instrumental]`) no campo "Lyrics" — Suno respeita instrumental quando lyrics field só contém tag.
- Style prompt no campo "Style".
- **Modo Instrumental ON** no Suno (toggle "Instrumental" antes de gerar).
- Duração alvo 60s — pedir track curta (Suno default 3min, depois cortar/recortar para loop perfeito em editor).

## Loop seamless
Após geração, no editor (Audacity / Reaper):
1. Localizar última pancada de bendir antes do fade.
2. Cortar cauda + colar onset no início.
3. Crossfade 200ms entre fim e início para emendar.
4. Export `.mp3` 128kbps mono ou stereo light → `kids/game/assets/world1-2/bg-music.mp3`.

## Referências sonoras
- Tinariwen — "Toumast Tincha" (instrumental sections)
- Ali Farka Touré + Toumani Diabaté — "Ai Du" (modal flow)
- Tuareg desert blues — ney + tehardent
- Cinematic Africa scoring — Hans Zimmer "Lion King" intro motifs (without orchestra bombast)
- Kalimba ambient — Laraaji style
