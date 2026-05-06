---
name: sankofa-add-enigma
description: Use when adding a new enigma to Sankofa. Scaffolds an entry in data/enigmas.js with the project's exact schema (id, world, title, intro, context, question, options, correct, explanation, hints[3], fragment{pattern,name}, curiosity, source) and validates the surrounding world state. Trigger when the user says "adicionar enigma", "novo enigma", "criar pergunta", or asks to expand a world.
---

# Add a Sankofa enigma

When the user asks to add an enigma:

1. **Identify the world**. Ask which world (1–8) if not stated. Read `data/worlds.js` to confirm it exists and is `unlocked: true` if it should be reachable.

2. **Pick the next id**. Read `data/enigmas.js`. New id is `w<world>e<n>` where `n` is the next sequential index in that world. IDs must be globally unique.

3. **Source rigor**. Every enigma must cite a Volume of the HGA (UNESCO) in the `source` field. If the user does not give one, ask for the Volume number and a 1-line factual citation. Do NOT invent dates, names, or places.

4. **Required fields** — match this schema exactly (mirroring existing entries):

```js
{
  id: "w1e6",
  world: 1,
  title: "Curto e poético",
  intro: "Frase narrativa curta. 1–2 imagens fortes.",
  context: "Parágrafo opcional, podendo ter <strong>destaques</strong>. 50–110 palavras.",
  question: "Pergunta direta?",
  options: ["Resposta correta", "Distrator plausível", "Distrator", "Distrator"],
  correct: 0,
  explanation: "1–3 frases que explicam por que é a resposta certa.",
  hints: [
    "Dica geográfica/contextual.",
    "Dica mais específica.",
    "Dica quase entrega a resposta."
  ],
  fragment: { pattern: "fp-<slug>", name: "Nome curto" },
  curiosity: "Frase extra surpreendente, ligada ao tema.",
  source: "HGA UNESCO, Volume <N>"
}
```

5. **Fragment pattern** — reuse one of `fp-rift | fp-saara | fp-ferro | fp-bantu | fp-arte`, or define a new CSS class in `styles.css` following the existing `.fp-<slug>` gradient pattern. Always pair a new pattern with a CSS rule.

6. **Place the entry** at the end of the relevant world's group inside `data/enigmas.js`, preserving alphabetical/index order within that world.

7. **Sanity check** before reporting done:
   - `correct` index points to the actual correct string.
   - Exactly **3 hints** (the UI assumes this).
   - Exactly **4 options** (the UI rotates A–D and keyboard shortcuts a/b/c/d).
   - The first option in the array does NOT have to be the correct one — `correct` is the index. Shuffle distractors to avoid pattern bias.
   - No HTML in `intro`/`question`/`options`/`hints`. HTML is allowed only in `context` (limited to `<strong>`, `<em>`).

8. **Do not** modify achievements that count solved enigmas unless the user asks — the existing `explorer` and `collector` checks still target `>=5` solved in world 1.

9. **Report back** with: the new id, the title, the source citation, and confirmation that all 4 sanity checks above pass.
