# Sankofa — Fragmentos da África

Jogo digital educativo de enigmas sobre a **História Geral da África** (HGA, UNESCO).
Recupere fragmentos de memória histórica resolvendo desafios curtos, com pistas
progressivas, mosaicos visuais e sonoridade africana sintetizada.

> *"Se quã wo werε fi na wo sankofa a yenkyi" — Não é errado voltar e buscar o que ficou.*

## Como abrir

Abra `index.html` no navegador. Sem instalação, sem servidor, sem banco de dados.
O progresso fica salvo no `localStorage`.

## Estado atual (MVP — Mundo 1)

- Fluxo completo: landing → registro → mapa de mundos → mundo → enigma → resultado → mosaico → perfil → conquistas → desafio diário.
- 5 enigmas jogáveis baseados no Volume I da HGA.
- 3 dicas progressivas por enigma (com custo em pontos).
- 10 níveis (Aprendiz → Herdeiro de Sankofa) e 10 conquistas.
- Mosaico de fragmentos com gradientes próprios.
- Persistência local com migração automática de chaves antigas.
- **Áudio sintetizado de instrumentos africanos** (djembe, dùndún, kalimba, balafon, agogô, shaker) via Web Audio API. Toggle global 🔊 e tambor ambiente 🥁.
- 8 capas de mundo (PNG) integradas nos cartões e na tela do mundo.

## Estrutura

```
sankofa/
├── index.html              # entrada
├── styles.css              # tema escuro ouro/terra/verde/índigo
├── src/
│   ├── app.js              # state machine de telas, lógica de enigma, conquistas
│   └── audio.js            # motor de instrumentos africanos (Web Audio API)
├── data/
│   ├── worlds.js           # 8 mundos da HGA
│   ├── enigmas.js          # enigmas (Mundo 1 = 5 entradas)
│   ├── levels.js           # 10 níveis
│   └── achievements.js     # 10 conquistas
├── assets/
│   ├── logo.png · favicon.png
│   └── world-1..8-*.png    # capas dos 8 mundos
├── docs/
│   ├── CONCEITO.md         # tese, problema, princípios
│   ├── ROADMAP.md          # fases 0–4
│   ├── AUDIO.md            # mapa instrumento ↔ evento
│   └── raw/                # material original arquivado
└── .claude/
    └── skills/             # sankofa-add-enigma, -add-world, -tune-audio
```

## Skills disponíveis

Quando trabalhar neste repo no Claude Code, três skills facilitam edições recorrentes:

- `sankofa-add-enigma` — scaffold validado de novo enigma com fonte HGA.
- `sankofa-add-world` — destravar/adicionar mundo com arte e conquista de conclusão.
- `sankofa-tune-audio` — ajustar timbre, decay, eventos e tambor ambiente.

Detalhes em `.claude/skills/README.md`.

## Documentação em Word

Todos os docs disponíveis em `.docx` na pasta **`word/`**:

```
word/00-README.docx
word/01-Conceito.docx
word/02-Roadmap.docx
word/03-Audio.docx
word/04-Liga.docx
word/05-Monetizacao.docx
word/06-Pitch-Deck.docx
word/07-Cartas.docx
word/08-One-Pager.docx
word/09-Documentacao-Completa.docx   ← volume único, com sumário
```

Para regenerar (precisa pandoc 2.0+):

```bash
bash scripts/build-docx.sh
```

Detalhe em `word/README.md`.

## Deploy (Vercel)

Site é estático puro — sem build step, sem dependências.

### 1ª vez (CLI)

```bash
npm i -g vercel
cd sankofa
vercel        # preview
vercel --prod # produção
```

Escolhe **Other** como framework. `vercel.json` na raiz já configura cache e headers de segurança.

### Auto-deploy via GitHub

1. Push pro GitHub
2. https://vercel.com/new → importa repo
3. Cada push em `main` → deploy de produção; cada PR → preview URL

### Liga global (Supabase) no Vercel

Para ativar a Liga dos Griôs em produção sem expor chaves no repo:

1. **Vercel → Project → Settings → Environment Variables**:
   - `SUPABASE_URL` = `https://xxx.supabase.co`
   - `SUPABASE_ANON_KEY` = `eyJ...` (chave pública, RLS protege)
2. **Settings → Build & Development → Build Command**:
   ```bash
   echo "window.SANKOFA_LEAGUE_CONFIG={url:'$SUPABASE_URL',anonKey:'$SUPABASE_ANON_KEY'};" > src/league-config.js
   ```
3. Re-deploy. Schema da tabela em `docs/LIGA.md`.

Localmente, copia `src/league-config.example.js` → `src/league-config.js` e preenche. Ficheiro real está no `.gitignore`.

## Próximos passos recomendados

1. Validar enigmas com especialista em HGA / educação básica.
2. Acrescentar mais 10 enigmas para fechar o Mundo 1 com 15 desafios.
3. Iniciar Mundo 2 (Reinos do Nilo, Volume II) com 8 enigmas piloto.
4. Paleta sonora regional por mundo (kora no Sahel, ney no Nilo, etc.).
5. Auditoria de acessibilidade (contraste AAA, foco visível, leitor de tela).
6. Publicação online (GitHub Pages ou Vercel).

## Licenças planejadas

- **Código-fonte**: MIT.
- **Conteúdo textual e dados educacionais**: Creative Commons BY-SA 4.0.
- **Imagens, sons sintetizados e ilustrações**: a definir conforme autoria; o motor de áudio é original e nasce livre.

## Todos os volumes da História Geral da África

- [Volume I – Metodologia e pré-história da África](https://unesdoc.unesco.org/ark:/48223/pf0000190249)
- [Volume II – África antiga](https://unesdoc.unesco.org/ark:/48223/pf0000190250)
- [Volume III – África medieval](https://unesdoc.unesco.org/ark:/48223/pf0000190251)
- [Volume IV – África bloqueada](https://unesdoc.unesco.org/ark:/48223/pf0000190252)
- [Volume V – África e diáspora](https://unesdoc.unesco.org/ark:/48223/pf0000190253)
- [Volume VI – África contemporânea (1884-1935)](https://unesdoc.unesco.org/ark:/48223/pf0000190254)
- [Volume VII – África contemporânea (1935-1975)](https://unesdoc.unesco.org/ark:/48223/pf0000190255)
- [Volume VIII – África contemporânea (1975-2000)](https://unesdoc.unesco.org/ark:/48223/pf0000190256)
