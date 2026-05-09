# Pedagogia — Diversificação de Mecânicas (Fase 2)

> Documento de especificação. Não é roadmap nem promessa de release.
> Origem: feedback consolidado de educadores em formação, recebido em
> **09/05/2026** via grupo de WhatsApp da faculdade.
> Princípio: o **quiz** continua sendo o esqueleto pedagógico (intro →
> contexto → pergunta → opções → dicas progressivas → explicação →
> fragmento). As mecânicas abaixo **intercalam** entre quizzes para
> reduzir fadiga de formato único e atender estilos cognitivos
> distintos (visual, cinestésico, auditivo, escrito).

---

## Princípios de design

1. **Mesmo schema-base.** Toda mecânica produz o mesmo resultado
   estrutural: `correct: boolean`, `cauris: number`, `fragment unlocked`,
   `entrada no Caderno de Revisão se errar`. O motor de progressão
   (`app.js → handlePick`-equivalente) não muda.
2. **1 mecânica = 1 enigma.** Não misturar formatos dentro do mesmo
   enigma. Variação acontece entre enigmas.
3. **Distribuição leve.** Por mundo, ~70% quiz clássico, ~30%
   mecânicas alternativas. O quiz garante consistência; as alternativas
   garantem respiro.
4. **Fallback obrigatório.** Toda mecânica visual/cinestésica deve ter
   versão acessível por teclado (setas, Tab, Enter, Espaço) e por
   leitor de tela (`aria-label`, `aria-describedby`, `role`).
5. **Sem hardware extra.** Nada que exija microfone, câmera,
   geolocalização, acelerômetro. Mouse + teclado + toque.
6. **Implementação faseada.** Uma mecânica por sprint. Lançar a
   primeira (linha do tempo) antes de iniciar a segunda.

---

## 1. Linha do Tempo Arrastável (Cronologia)

### Objetivo pedagógico

Internalizar **ordem temporal** de eventos da HGA. Combate o erro
mais comum em provas escolares: trocar séculos / dinastias /
sucessões.

### Formato

Tela apresenta 4–6 cartões com eventos em ordem aleatória. Usuário
arrasta para reorganizar em ordem cronológica (mais antigo → mais
recente). Após confirmar, o sistema mostra a ordem correta com
datas reveladas.

### Dados necessários no `data/enigmas.js`

```js
{
  id: "M3-T01",
  world: 3,
  type: "timeline",                 // novo campo
  title: "Reinos do Sahel",
  intro: "Ordene os reinos pela ordem em que dominaram o Sahel.",
  items: [
    { id: "gana",    label: "Império de Gana",    date: "c. 700–1240" },
    { id: "mali",    label: "Império do Mali",     date: "c. 1235–1670" },
    { id: "songhai", label: "Império Songhai",     date: "c. 1464–1591" },
    { id: "sokoto",  label: "Califado de Sokoto",  date: "1804–1903" },
  ],
  // ordem correta = ordem do array acima
  hints: [...],                     // 3 dicas, mesmo schema
  fragment: { ... },
  curiosity: "...",
  source: "HGA Vol. IV, cap. 6"
}
```

### UX / acessibilidade

- Drag-and-drop nativo HTML5 (`draggable`, `dragstart`, `dragover`,
  `drop`).
- Versão por teclado: cartão com foco + setas ↑/↓ reordena, `Enter`
  confirma, `Esc` cancela movimento.
- Leitor de tela: `aria-label="Item 2 de 4: Império do Mali. Use setas
  para reordenar."`.
- Mobile: arrastar com `touch`, ou tap-tap (toca no cartão A, depois no
  destino B = troca posição).
- Pontuação parcial: cada par adjacente correto vale fração do total.
  Não é tudo-ou-nada — incentiva tentativa.

### Esforço estimado

3–5 dias. Componente `<TimelineEnigma>` novo, schema novo, render no
`mainBoard`/`enigma` route, salvar no `caderno` se errar.

---

## 2. Mapa Interativo (Geografia + Rotas)

### Objetivo pedagógico

Localizar **lugares, povos, rotas comerciais e fronteiras** no
continente africano. Combate o apagamento geográfico — muitos
estudantes brasileiros não localizam Mali, Núbia, Grandes Lagos.

### Formato

Imagem SVG do continente africano (silhueta estilizada, sem nomes).
Pergunta apresenta: "Onde ficava o Reino do Congo?" ou "Marque a
rota transaariana do sal e do ouro." Usuário clica em uma região
(modo ponto) ou desenha uma linha entre 2–3 pontos (modo rota).

### Dados

```js
{
  id: "M2-G05",
  world: 2,
  type: "map",
  mode: "point",                    // ou "route"
  title: "Reino do Congo",
  intro: "Clique no atual território aproximado do Reino do Congo.",
  context: "...",
  target: { x: 0.52, y: 0.62, radius: 0.06 },   // coords normalizadas SVG
  // ou para rota:
  // route: [{x,y}, {x,y}, {x,y}], tolerance: 0.08
  hints: [...],
  fragment: { ... },
  source: "HGA Vol. V, cap. 18"
}
```

### UX / acessibilidade

- SVG inline com `viewBox` 0–1 (responsivo). Coordenadas normalizadas.
- Click/tap registra ponto. Visual: marcador animado.
- Versão por teclado: grid invisível 10×10, setas movem cursor,
  `Enter` marca. Indicador "Linha 5, Coluna 7" lido por leitor de
  tela. Pode ser frustrante — alternativa: oferecer mecânica
  diferente quando teclado-only detectado.
- Acerto = ponto dentro do raio do alvo. Erro = mostra resposta
  correta + distância em km estimada (educa enquanto corrige).

### Esforço estimado

5–8 dias. Asset SVG do continente (já existe? checar `assets/`),
componente `<MapEnigma>`, math de distância normalizada, fallback
teclado.

---

## 3. Áudio-Quiz (Reconhecer instrumento ou idioma)

### Objetivo pedagógico

Conectar o **patrimônio sonoro** africano (instrumentos, idiomas,
ritmos) ao conteúdo histórico. Aproveita o motor de áudio
sintetizado já existente (`docs/AUDIO.md`).

### Formato

Toca um clip curto (3–6s) — kalimba, kora, djembe, balafon, ney,
agogô — e pergunta "Qual instrumento é este?" 4 opções. OU toca
amostra de idioma sintetizado / TTS em iorubá, kiswahili, wolof,
amárico — "Qual idioma?". OU toca padrão rítmico — "Que região?".

### Dados

```js
{
  id: "M4-A02",
  world: 4,
  type: "audio",
  variant: "instrument",            // "instrument" | "language" | "rhythm"
  title: "O som do Mali",
  intro: "Escute e identifique.",
  audio: { synth: "kora", durationMs: 4000 },   // usa motor já existente
  // OU: audio: { url: "/audio/wolof-sample.mp3" } se externo
  options: ["Kora", "Balafon", "Ngoni", "Ud"],
  correct: 0,
  hints: [...],
  fragment: { ... },
  source: "HGA Vol. V"
}
```

### UX / acessibilidade

- Botão "▶ Tocar" grande e claro. "🔁 Repetir" disponível.
- Auto-play **desligado por padrão** (WCAG 1.4.2).
- Transcrição visual obrigatória: "Som percussivo de cordas
  pinçadas, padrão pentatônico" — para usuários surdos.
- Volume respeita o slider global do drawer.
- Se motor de áudio não inicializou (políticas de browser), oferece
  versão texto: "Este instrumento tem 21 cordas, é tocado pelos
  griots do Mali..."

### Esforço estimado

2–4 dias para variant `instrument` (motor existe). +3 dias para
`language` (precisa amostras ou TTS multi-idioma). +5 dias para
`rhythm` (gerador rítmico novo).

---

## 4. Micro-Escrita (Resposta Curta)

### Objetivo pedagógico

Romper o **viés de reconhecimento** dos quizzes de múltipla escolha.
Forçar **evocação ativa** — o aluno precisa lembrar a palavra, não
só reconhecê-la entre 4 opções. Gera engajamento mais profundo.

### Formato

Pergunta aberta com resposta curta (1–4 palavras). Validação por
**lista de palavras-chave aceitas** + normalização (lowercase, sem
acentos, trim, sinônimos comuns).

### Dados

```js
{
  id: "M1-W03",
  world: 1,
  type: "writeShort",
  title: "Faraó construtor de Karnak",
  intro: "Que faraó iniciou a expansão do templo de Karnak?",
  context: "...",
  accept: [
    "tutmosis i", "tutmés i", "thutmose i",
    "thutmes i", "tutmosis 1", "tutmes 1"
  ],
  caseSensitive: false,             // default false
  maxLength: 40,
  hints: [...],
  fragment: { ... },
  source: "HGA Vol. II, cap. 4"
}
```

### UX / acessibilidade

- `<input type="text">` com label clara, `autocomplete="off"`,
  `autocapitalize="off"`, `spellcheck="false"`.
- Normalização: `.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").trim()`.
- Tolerância a erros de digitação: distância de Levenshtein ≤ 2 em
  palavras com ≥ 6 chars (opcional, ativável por enigma).
- Feedback construtivo no erro: "Você escreveu 'Tutankamon' — está
  no Egito mas não é este faraó. Dica: viveu antes." (já é o sistema
  de hints existente, só ativa após errar).
- Evita armadilha de só aceitar 1 grafia: lista `accept` deve incluir
  variantes ortográficas razoáveis (BR/PT, anglo, francês).

### Esforço estimado

2–3 dias. Componente `<WriteShortEnigma>`, função de normalização,
revisão pedagógica de cada lista `accept` (trabalho de conteúdo, não
código).

### Risco

Falsos negativos. Aluno acerta mas grafou diferente → frustração.
Mitigação: lista `accept` generosa + botão "Acho que acertei,
revisar" que envia para fila de revisão manual (Supabase tabela
`enigma_feedback`, opt-in).

---

## 5. Associação Imagem-Conceito (Pares)

### Objetivo pedagógico

Conectar **símbolo visual** a **nome / conceito / período**.
Trabalha memória associativa visual, útil para arte africana
(máscaras, estatuária Nok, tecidos kente, adinkra, hieróglifos).

### Formato

Grid 2×4 ou 3×3: metade dos cartões mostra imagem (símbolo adinkra,
máscara, mapa de reino), metade mostra nomes/conceitos. Usuário
forma pares. Pode ser estilo "memória" (vira cartão) ou estilo
"arrastar-conectar" (linha entre dois).

### Dados

```js
{
  id: "M6-P01",
  world: 6,
  type: "matchPairs",
  title: "Símbolos Adinkra",
  intro: "Conecte cada símbolo ao seu significado.",
  pairs: [
    { id: "sankofa",  image: "assets/adinkra/sankofa.svg",  label: "Volta e busca o que ficou" },
    { id: "gye-nyame", image: "assets/adinkra/gye-nyame.svg", label: "Supremacia de Deus" },
    { id: "duafe",    image: "assets/adinkra/duafe.svg",    label: "Beleza e cuidado feminino" },
    { id: "dwennimmen", image: "assets/adinkra/dwennimmen.svg", label: "Força e humildade" },
  ],
  hints: [...],
  fragment: { ... },
  source: "HGA Vol. VI"
}
```

### UX / acessibilidade

- Cartões com `role="button"`, `tabindex="0"`, `aria-label` descritivo
  da imagem ("Símbolo adinkra Sankofa: pássaro com cabeça voltada
  para trás").
- Modo memória: 2 cliques = par. Pares corretos ficam abertos e
  esmaecidos. Errados viram de volta.
- Modo conectar: clica origem → clica destino → desenha linha.
- Pontuação parcial por par correto.
- Imagens precisam de `alt` text histórico-cultural, não apenas
  descritivo formal.

### Esforço estimado

3–4 dias + custo de **assets**. Símbolos adinkra são CC ou domínio
público (verificar fonte caso a caso). Pode começar com SVGs simples
desenhados internamente.

---

## Pontuação e progressão

Todas as mecânicas alimentam o mesmo sistema de cauris e fragmentos:

| Resultado            | Cauris (1ª tent.) | Cauris (2ª) | Cauris (3ª+) |
|----------------------|------------------|-------------|--------------|
| Acerto pleno         | 50               | 25          | 10           |
| Acerto parcial ≥ 70% | 35               | 18          | 7            |
| Acerto parcial < 70% | 15               | 8           | 3            |
| Skip pós-2 erros     | -50 (ou 5 piedade se >50% pendente) |

Mestria 100% e Mestria Perfeita continuam valendo — basta o aluno
acertar o mundo inteiro independente do tipo de mecânica.

---

## Ordem de implementação sugerida

1. **Micro-escrita** (menor esforço técnico, maior ganho pedagógico).
2. **Linha do tempo** (alto ROI, didaticamente potente).
3. **Áudio-quiz instrumento** (motor de som já existe).
4. **Associação por pares** (precisa assets adinkra).
5. **Mapa interativo** (mais complexo, requer SVG + lógica espacial).

Cada mecânica entra primeiro como **piloto em 1 enigma** por mundo.
Após 2 semanas de uso real e telemetria, decide-se se expande para
mais enigmas ou se ajusta o formato.

---

## Telemetria mínima (Supabase, opt-in)

Para cada mecânica nova, registrar:

- `enigma_id`, `mechanic_type`, `attempts`, `time_ms`, `correct`.
- Sem PII. Apenas `house`, `age_band`, `tag` se opt-in à liga.
- Painel em SQL: taxa de acerto por mecânica, tempo médio,
  abandono. Decide se mecânica fica, ajusta ou volta para quiz.

---

## Não-objetivos (fora do escopo desta fase)

- Multiplayer real-time nas novas mecânicas (fica para Fase 3).
- Geração procedural de enigmas por IA. Conteúdo continua curado
  manualmente, com fonte HGA citada.
- Editor visual no jogo para professor criar enigmas. Possível
  Fase 4.
- Integração com LMS (Moodle, Google Classroom). Possível Fase 4.

---

## Referências internas

- `docs/CONCEITO.md` — princípios pedagógicos do projeto.
- `docs/ROADMAP.md` §Fase 2 — onde estas mecânicas estão alocadas.
- `docs/AUDIO.md` — motor de áudio sintetizado (base para áudio-quiz).
- `docs/DOSSIER-UNESCO.md` §4.3 — origem do feedback docente.
- `data/enigmas.js` — schema atual a ser estendido com `type`.
