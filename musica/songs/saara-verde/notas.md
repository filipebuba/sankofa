# Notas — Saara Verde (BG Sankofa Kids 1.2)

## Inspiração
Pinturas rupestres de Tassili n'Ajjer (Argélia) e da depressão de Wadi Sora (Egipto). Hipopótamos, gente nadadora, vacas pastando — tudo onde hoje só há areia. A faixa precisa soar como uma memória viva da Terra: o vento ainda lembra os lagos.

## Referências musicais
- **Tinariwen** — guitarrismo tuareg, modal, hipnótico.
- **Ali Farka Touré** — Mali blues, raiz desértica.
- **Toumani Diabaté** — kora ambient (sub para kalimba).
- **Laraaji** — kalimba/zither minimalismo.
- **Bombino** — desert blues moderno.
- **Hans Zimmer ("Time")** — escala de mood ambient (sem o build dramático).

## Decisões criativas
- **Sem letra** — é BG de game loop, não pode competir com griot dialog/SFX.
- **6/8 lento** em vez de 4/4 — sensação de balanço, vento, andamento de caravana.
- **Pentatónica modal** — soa "ancestral" sem datar a região.
- **Dynamics planas** — game loop precisa ser audível mas não cansativo aos 60 segundos.
- **Wordless humming opcional** — adiciona presença humana sem palavra que possa parecer doutrinária. Pode ser cortada se distrair.

## Instrumentos validados
- Kalimba (mbira) — emoji do game já é ✦ / memória.
- Flauta tuareg / ney — autenticidade norte-africana.
- Frame drum bendir — North African vs sub-Saariano. Bendir certo aqui (Magrebe).
- Drone bordão grave — pode ser tehardent ou synth pad muito leve.

## Pipeline
1. Gerar 2-3 takes no Suno v5 (Instrumental ON).
2. Escolher take mais "arejado" (que respira).
3. Cortar para 60s, loop seamless (crossfade 200ms).
4. Export `.mp3` → `kids/game/assets/world1-2/bg-music.mp3`.
5. Atualizar `kids/game/sw.js` precache + bump versão.
6. Testar in-game: jogo `?phase=1.2`, deixar rodar 5 min, confirmar não cansa.

## Pendente
- [ ] Gerar no Suno.
- [ ] Cortar/loop em editor.
- [ ] Export `mp3` para `kids/game/assets/world1-2/`.
- [ ] Adicionar ao SW precache (cache key `sankofa-rift-v10`).
- [ ] Teste in-game.

## Próxima faixa
Após Saara Verde concluída → **Forja Bantu (1.3)** com mbira + tambor de tronco + martelo rítmico, BPM 95.
