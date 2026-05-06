---
name: sankofa-add-world
description: Use when unlocking, renaming, or extending the eight Sankofa worlds. Updates data/worlds.js, optional cover art in assets/, and the achievements that gate world completion. Trigger on "novo mundo", "destravar mundo", "abrir mundo X", "Mundo 2 já vai".
---

# Add or unlock a Sankofa world

The 8 worlds are defined upfront in `data/worlds.js`. Each has `id`, `name`, `period`,
`vol`, `unlocked` and `art`. The MVP ships with only `id: 1` unlocked.

When the user asks to add/unlock a world:

1. **Read `data/worlds.js`**. Confirm whether the target world already exists.

2. **Unlock**: flip `unlocked: false` → `true` for that world. Do **not** touch other
   worlds unless asked.

3. **New world** (id 9+): append following the existing format.

4. **Cover art**: 8 PNGs already exist in `assets/world-N-<slug>.png`. If adding a new
   id, ask the user for an asset or set `art: null` and skip the field.

5. **Add the world's enigmas** *before* unlocking it for players (an unlocked world
   with 0 enigmas shows `0/0 fragmentos` and confuses the UI). Use the
   `sankofa-add-enigma` skill for each.

6. **Achievements**: if the user wants a "complete world N" achievement, append to
   `data/achievements.js` mirroring `explorer`:

```js
{
  id: "world_<N>_done",
  name: "<Nome>",
  desc: "Complete o Mundo <N>",
  icon: "<glyph>",
  c: function (s) {
    return s.solved.filter(function (e) { return e.indexOf("w<N>") === 0; }).length >= <ENIGMA_COUNT>;
  }
}
```

7. **Sanity check**: open `index.html` in a browser. The new world should appear in the
   map grid; if locked, it must show the 🔒 icon and 0% bar.

8. **Period and Volume strings** must match HGA UNESCO conventions. Don't invent dates.

Report back with: world id, new state (locked/unlocked), enigma count in that world,
and any new achievement registered.
