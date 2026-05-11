# Notas — Forja Bantu (BG Sankofa Kids 1.3)

## Inspiração
Expansão Bantu dos Camarões/Nigéria para sub-Sahara (~3000–2000 anos atrás). Cultura Nok (séc. V a.C.) com terracotas e ferro. Forjar não foi só técnica — foi mudança de civilização. A faixa precisa soar como uma comunidade que trabalha, canta baixinho, anda em frente.

## Referências musicais
- **Stella Chiweshe** — mbira Zimbabwe, hipnose lenta.
- **Hukwe Zawose** — Tanzania, mbira raíz.
- **Francis Bebey** — pygmy/Camarões minimalismo.
- **Konono Nº1** — Congo, mbira amplificada (referência rítmica).
- **Kasai Allstars** — Congo, polirritmia coletiva.
- **Mulatu Astatke** — ethio-jazz, espaço e ar.

## Decisões criativas
- **Mbira (não kora)** — kora é west-africana (Mali/Senegal), Bantu = central-africana. Distinção importante.
- **Log drum / slit drum (não djembe)** — djembe é west-africano. Slit drum central-africano (Camarões, Congo).
- **Martelo de ferro como percussão** — referência direta à forja Nok. Não dominar a mix, só pontuar.
- **Humming masculino grave wordless** — comunidade que trabalha, presença sem palavras.
- **6/8 polirrítmico** — padrão Bantu clássico.
- **Sem letra** — game loop precisa de respiração para SFX (martelo na bigorna, corte cipó, NPC dialogs).

## Instrumentos validados
- Mbira (thumb piano) — instrumento Bantu por excelência.
- Log drum / slit drum — Camarões/Congo.
- Anvil hit (martelo de ferro) — Nok/forja.
- Udu drone — Nigéria, barro.
- Humming wordless masculino — comunidade.

## Anti-padrões
- **Não djembe** — west-africano errado.
- **Não kora** — west-africano errado.
- **Não talking drum** — west-africano errado.
- **Não synths** — orgânico apenas.
- **Não drum kit moderno** — anula contexto.

## Pipeline
1. Gerar 2-3 takes no Suno v5 (Instrumental ON).
2. Escolher take mais arejado (que respira).
3. Cortar para 70s, loop seamless (crossfade 200ms).
4. Export `.mp3` → `kids/game/assets/world1-3/bg-music.mp3`.
5. Atualizar `kids/game/sw.js` precache + bump versão.
6. Testar in-game: jogo `?phase=1.3`, deixar rodar 5 min, confirmar não cansa.

## Pendente
- [ ] Gerar no Suno.
- [ ] Cortar/loop em editor.
- [ ] Export `mp3` para `kids/game/assets/world1-3/`.
- [ ] Adicionar ao SW precache (cache key bump).
- [ ] Teste in-game.

## Diferença vs Saara Verde (1.2)
| Aspecto         | Saara Verde 1.2          | Forja Bantu 1.3              |
| --------------- | ------------------------ | ---------------------------- |
| Instrumento líder | Kalimba + ney flute    | Mbira + log drum             |
| Origem regional | Norte-africana / Magrebe | Central-africana / Bantu     |
| BPM             | 85                       | 95                           |
| Duração         | 60s                      | 70s                          |
| Mood            | Húmido, ar, descoberta   | Floresta densa, trabalho, fogo |
| Métrica         | 6/8 lento                | 6/8 polirrítmico              |
| Humming         | Feminino                 | Masculino grave              |
| Percussão       | Frame drum bendir        | Log drum + anvil             |
