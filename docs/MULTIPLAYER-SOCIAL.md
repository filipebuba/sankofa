# Sankofa — Plano de Multiplayer e Social

**Documento de planejamento técnico e produto.**
Versão: 1.0 — 2026-05-07
Autor: Filipe Buba N'hada

---

## 1. Visão

Sankofa hoje é experiência **individual e assíncrona**: cada jogador resolve enigmas no seu próprio ritmo, com Liga Local (multi-perfil no dispositivo) e Liga Global (Supabase opt-in).

Esta evolução adiciona três camadas:

1. **Identidade afro-histórica forte** — nomes da HGA, casas reais, narrativa de pertencimento.
2. **Engajamento social leve** — desafios de WhatsApp, grupos por tag (`#Turma7A`), torneio semanal.
3. **Modo Sala de Aula em tempo real** — professor lidera turma, alunos jogam síncrono ao estilo Kahoot, com cronômetro, leaderboard ao vivo e relatório pedagógico.

O objetivo final é transformar o Sankofa de "joguinho que aprende sozinho" em **ferramenta pedagógica massiva** alinhada com Lei 10.639/03 e PCNs de História da África.

---

## 2. Princípios

| Princípio | Implicação |
|-----------|------------|
| **Stealth education** | Toda mecânica nova ensina HGA. Sem tela "didática" pura |
| **Offline-first sempre** | Sala de Aula realtime existe, mas nunca substitui o jogo solo |
| **Custos variáveis baixos** | Nada de filas, mensagens push pagas, ou serviços que escalem com usuários sem receita |
| **LGPD by design** | Zero PII de menores. Idade-faixa, não data de nascimento |
| **Acessibilidade WCAG AA** | TTS, leitor de tela, modo sem cronômetro, daltonismo |
| **Frameworkless** | Vanilla JS continua. Sem React, Vue, frameworks. Mantém PWA leve |

---

## 3. Fases — Visão geral

```
[Fase 1]   Perfil HGA + Social leve              ✅ shipped  (v1.2.0)
   ↓
[Fase 1.5] Torneio Assíncrono Semanal            ✅ shipped  (v1.3.x-dev)
   ↓
[Fase 2]   Modo Sala de Aula (Kahoot-style)      🔜 próxima  (~12 dias)
   ↓
[Fase 3]   Painel Professor + Integrações        diferido
```

**Status real (2026-05-08)**: Fase 1 e 1.5 estão em produção. Documentação abaixo
mantida como referência histórica e plano de Fase 2 (Sala de Aula).

---

## 4. Fase 1 — Perfil HGA + Social leve ✅ SHIPPED

**Status**: em produção desde v1.2.0.
**Duração real**: ~5 dias.
**Custo infra**: zero (localStorage + Supabase REST free tier).

### 4.1 Modal de Criação de Perfil

Substitui o atual prompt simples por modal estruturado.

**Campos**:
- **Nome de jogo** (obrigatório, 2–24 chars, sem PII)
  - Botão **Gerar Nome Histórico** sorteia da HGA
  - Cada nome traz mini-card educativo (1 frase + período + casa real)
- **Avatar/Casa Real** (escolha ou auto pela jogada)
- **Faixa etária** (8–12, 13–17, 18+, "prefiro não dizer") — agrupa ranking
- **Tag de Grupo** opcional (ex: `#Turma7A`, `#Familia`, `#Escola-São-Paulo`)
- Aceite de termos curto (1 frase, linguagem simples)

**Privacidade**:
- Nada de e-mail, telefone, CPF, foto
- Faixa etária e tag salvos só localmente até opt-in da Liga Global
- Reset profile = wipe completo

### 4.2 Gerador de Nomes da HGA

Banco em `data/hga-names.js` com ~150 entradas curadas:

```js
window.HGA_NAMES = [
  {
    name: "Sundiata",
    sex: "M",
    period: "c. 1217-1255",
    casa: "Mali",
    desc: "Fundador do Império do Mali. Filho de Sogolon Kondé."
  },
  {
    name: "Nzinga",
    sex: "F",
    period: "1583-1663",
    casa: "Ndongo/Matamba",
    desc: "Rainha que resistiu ao avanço português em Angola por 40 anos."
  },
  {
    name: "Amanirenas",
    sex: "F",
    period: "c. 40-10 a.C.",
    casa: "Kush",
    desc: "Kandake (rainha guerreira) que enfrentou Roma e venceu."
  },
  // ... 147 outros
]
```

Sorteio respeita filtro de gênero (se utilizador escolher), sempre com mini-card antes de aceitar — **stealth education** no primeiro segundo.

### 4.3 Botão "Desafio no WhatsApp"

Localizado na tela de Perfil e Liga.

```js
function shareChallenge(profile) {
  const txt = encodeURIComponent(
    `Sou ${profile.title} ${profile.name}, da Casa ${profile.house}, com ${profile.cauris}🐚 cauris e ${profile.fragments}/71 fragmentos.\n\n` +
    `Te desafio em Sankofa — Fragmentos da África:\n` +
    `https://sankofa-eosin.vercel.app/?ref=${profile.id}`
  );
  window.open(`https://wa.me/?text=${txt}`, "_blank");
}
```

Suporte fallback Web Share API quando disponível (`navigator.share`).

UTM: `?ref=` permite atribuir crescimento orgânico.

### 4.4 Tag de Grupo no placar

Aba "Meu Grupo" na Liga Global filtra por `tag` igual à do perfil ativo.

Sem necessidade de criar sala, sem login, sem moderação. Quem digitar a mesma tag aparece junto.

**Limites**:
- Tag normalizada (`toLowerCase`, sem acentos, sem espaços, max 24 chars)
- Lista negra de palavras explícitas (`data/blocklist.js`)
- Anti-spam: máx 1 jogador por dispositivo na mesma tag

### 4.5 TTS — Voz para os enigmas (NOVO)

```js
function speak(text, lang = "pt-BR") {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.95;
  u.pitch = 1.0;
  speechSynthesis.speak(u);
}
```

- Botão 🔊 ao lado da pergunta lê em voz alta
- Toggle "leitura automática" no menu de acessibilidade
- Custo: zero (browser nativo)

### 4.6 Onboarding de 30 segundos (NOVO)

Carrossel de 4 slides na primeira abertura:

1. "Sou Sankofa. Conto a história que apagaram."
2. "Resolva enigmas. Ganhe fragmentos. Monte o mosaico."
3. "Cada acerto vale cauris 🐚. Cauris compram coroas, casas reais."
4. "Mude o avatar quando quiser. Bora começar?"

Skip a qualquer momento. Não bloqueia gameplay.

**Por que importa**: estudos de PWA educacionais mostram retention dia-2 dobrar com onboarding < 60 s.

### 4.7 LGPD age-band (NOVO)

```js
const AGE_BANDS = {
  "8-12":  { label: "8 a 12 anos",   min: 8,  max: 12 },
  "13-17": { label: "13 a 17 anos",  min: 13, max: 17 },
  "18+":   { label: "18 ou mais",    min: 18, max: 999 },
  "skip":  { label: "Prefiro não dizer", min: null, max: null }
};
```

- Crianças (`8-12` e `13-17`) NÃO entram em ranking público sem opt-in explícito do responsável
- Mensagem de consentimento visível antes de qualquer envio à Liga Global
- Botão "Apagar meus dados" no menu — wipe local + delete remoto via Supabase RLS

### 4.8 Entregáveis Fase 1

- [ ] `data/hga-names.js` (≥150 nomes curados)
- [ ] `data/blocklist.js` (palavras vetadas em tag)
- [ ] `src/profiles.js` — `createProfileModal()`, `generateHGAName()`
- [ ] `src/share.js` — `shareChallenge()`, `shareWebAPI()`
- [ ] `src/accessibility.js` — `speak()`, toggle TTS
- [ ] `src/onboarding.js` — carrossel 4 slides
- [ ] `styles.css` — `.modal-profile`, `.hga-card`, `.share-btn`, `.onboarding`
- [ ] `data/version.js` → `1.2.0` (minor: nova mecânica não-quebrável)
- [ ] `CHANGELOG.md` entrada `[1.2.0]`

---

## 5. Fase 1.5 — Torneio Assíncrono Semanal ✅ SHIPPED

**Status**: em produção (branch `dev`, v1.3.x-dev). Schema, RPC, Edge Function e UI integrados.
Documentação operacional completa em `docs/LIGA.md` — secção "Torneio Semanal Assíncrono".
**Duração real**: ~4 dias.
**Custo infra**: zero adicional (1 cron grátis no Supabase).

### 5.1 Por que primeiro

Realtime é caro de construir e manter. Antes de pagar esse custo, precisamos provar que **competição entre turmas/grupos engaja**.

O torneio assíncrono mostra isso com infra mínima: sem WebSocket, sem PIN, sem lobby — só 5 enigmas selecionados rodando 7 dias.

### 5.2 Mecânica

| Dia (UTC) | Evento |
|-----------|--------|
| **Domingo 00:00** | Backend escolhe 5 enigmas da semana (rotativo, prioriza Mundos com vols. menos resolvidos globalmente) |
| **Seg–Sáb** | Cada jogador joga os 5. Pode tentar 3× (melhor score conta). Tempo + acerto + dicas usadas = score |
| **Sábado 23:00** | Aviso "Torneio fecha em 1 h" |
| **Domingo 23:59** | Snapshot final. Top 10 global, top 3 por tag, top 1 por casa real |
| **Segunda 00:00** | Anúncio na home. Badge `Campeão da Semana #N`. Recompensa: 100 cauris + fragmento bônus |

### 5.3 Schema Supabase

```sql
CREATE TABLE sankofa_tournament_week (
  id           SERIAL PRIMARY KEY,
  week_iso     TEXT UNIQUE NOT NULL, -- '2026-W19'
  enigma_ids   TEXT[] NOT NULL,
  starts_at    TIMESTAMPTZ NOT NULL,
  ends_at      TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sankofa_tournament_score (
  id           BIGSERIAL PRIMARY KEY,
  week_id      INT REFERENCES sankofa_tournament_week(id),
  profile_uid  TEXT NOT NULL,
  nick         TEXT NOT NULL,
  tag          TEXT,
  age_band     TEXT,
  house        TEXT,
  enigma_id    TEXT NOT NULL,
  score        INT NOT NULL,
  ms_to_answer INT,
  hints_used   INT,
  attempt      INT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (week_id, profile_uid, enigma_id, attempt)
);

CREATE INDEX ON sankofa_tournament_score (week_id, score DESC);
CREATE INDEX ON sankofa_tournament_score (week_id, tag, score DESC);
```

### 5.4 RLS

```sql
ALTER TABLE sankofa_tournament_score ENABLE ROW LEVEL SECURITY;

CREATE POLICY "score_insert_own" ON sankofa_tournament_score
  FOR INSERT WITH CHECK (
    profile_uid = current_setting('request.headers')::json->>'x-profile-uid'
  );

CREATE POLICY "score_read_public" ON sankofa_tournament_score
  FOR SELECT USING (true);
```

Edge Function `submit_tournament_answer` valida:
- Janela temporal (`now() BETWEEN week.starts_at AND ends_at`)
- `enigma_id ∈ week.enigma_ids`
- `attempt ≤ 3`
- `ms_to_answer ≥ 1500` (tempo mínimo humano de leitura)

### 5.5 Entregáveis Fase 1.5

- [ ] `data/tournament-config.js` — regras semanais
- [ ] `src/tournament.js` — UI da semana, ranking, prêmios
- [ ] Migration Supabase + RLS
- [ ] Edge Function `submit_tournament_answer`
- [ ] Cron Edge Function `rotate_weekly_tournament` (domingo 00:00 UTC)
- [ ] `data/version.js` → `1.3.0`

---

## 6. Fase 2 — Modo Sala de Aula (Kahoot-style) 🔜 PRÓXIMA

**Status**: planejado, não iniciado.
**Duração estimada**: 12 dias.
**Custo infra**: Supabase Realtime (200 conexões simultâneas grátis, depois US$ 25/mês).

### 6.1 Arquitetura

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│  PROFESSOR  │ ←wss→   │ Supabase Realtime│  ←wss→  │   ALUNOS    │
│  (host)     │         │   + Postgres     │         │  (n=1..30)  │
└─────────────┘         └──────────────────┘         └─────────────┘
       ↓                         ↑
   cria sala                edge functions:
   gera PIN                 - score_answer
   inicia jogo              - cleanup_rooms
   próximo enigma
   encerra
```

### 6.2 Schema Supabase

```sql
CREATE TABLE sankofa_rooms (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code    TEXT UNIQUE NOT NULL,         -- '834912'
  host_uid     TEXT NOT NULL,
  status       TEXT NOT NULL CHECK (status IN ('waiting','playing','paused','finished')),
  enigma_set   TEXT[] NOT NULL,              -- ids dos enigmas escolhidos
  current_idx  INT DEFAULT -1,
  question_started_at TIMESTAMPTZ,
  question_seconds INT DEFAULT 30,
  max_players  INT DEFAULT 30,
  locale       TEXT DEFAULT 'pt-BR',
  expires_at   TIMESTAMPTZ DEFAULT now() + interval '24 hours',
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sankofa_room_players (
  id           BIGSERIAL PRIMARY KEY,
  room_id      UUID REFERENCES sankofa_rooms(id) ON DELETE CASCADE,
  profile_uid  TEXT NOT NULL,
  nick         TEXT NOT NULL,
  house        TEXT,
  age_band     TEXT,
  score        INT DEFAULT 0,
  status       TEXT DEFAULT 'waiting' CHECK (status IN ('waiting','playing','disconnected','finished')),
  joined_at    TIMESTAMPTZ DEFAULT now(),
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (room_id, profile_uid)
);

CREATE TABLE sankofa_room_answers (
  id           BIGSERIAL PRIMARY KEY,
  room_id      UUID REFERENCES sankofa_rooms(id) ON DELETE CASCADE,
  profile_uid  TEXT NOT NULL,
  enigma_id    TEXT NOT NULL,
  question_idx INT NOT NULL,
  picked       INT,
  ms_to_answer INT,
  correct      BOOLEAN,
  score_delta  INT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (room_id, profile_uid, question_idx)
);

CREATE INDEX ON sankofa_rooms (room_code) WHERE status != 'finished';
CREATE INDEX ON sankofa_room_players (room_id, score DESC);
```

### 6.3 RLS

```sql
ALTER TABLE sankofa_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE sankofa_room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE sankofa_room_answers ENABLE ROW LEVEL SECURITY;

-- Sala visível por código
CREATE POLICY "room_read_by_code" ON sankofa_rooms
  FOR SELECT USING (status != 'finished');

CREATE POLICY "room_insert_by_host" ON sankofa_rooms
  FOR INSERT WITH CHECK (
    host_uid = current_setting('request.headers')::json->>'x-profile-uid'
  );

CREATE POLICY "room_update_by_host" ON sankofa_rooms
  FOR UPDATE USING (
    host_uid = current_setting('request.headers')::json->>'x-profile-uid'
  );

-- Jogadores
CREATE POLICY "players_read_in_room" ON sankofa_room_players
  FOR SELECT USING (true);

CREATE POLICY "players_insert_self" ON sankofa_room_players
  FOR INSERT WITH CHECK (
    profile_uid = current_setting('request.headers')::json->>'x-profile-uid'
  );

-- Respostas: SOMENTE via Edge Function (anti-cheat)
CREATE POLICY "answers_no_direct_insert" ON sankofa_room_answers
  FOR INSERT WITH CHECK (false);
```

### 6.4 Anti-cheat — Edge Function `score_answer`

**Crítico**. Sem isto, qualquer cliente envia "acertei em 200 ms" e domina o ranking.

```ts
// supabase/functions/score_answer/index.ts
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const { room_id, profile_uid, picked } = await req.json();

  const supa = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // 1. Carrega sala (server-side)
  const { data: room } = await supa
    .from("sankofa_rooms")
    .select("*")
    .eq("id", room_id)
    .single();

  if (!room || room.status !== "playing") {
    return new Response("invalid room", { status: 400 });
  }

  // 2. Calcula latência server-side (não confia no cliente)
  const ms = Date.now() - new Date(room.question_started_at).getTime();
  if (ms < 0 || ms > room.question_seconds * 1000) {
    return new Response("late", { status: 400 });
  }

  // 3. Verifica resposta correta
  const enigma_id = room.enigma_set[room.current_idx];
  const correctIdx = ENIGMA_ANSWERS[enigma_id]; // tabela canónica server-side
  const correct = picked === correctIdx;

  // 4. Score: base 100 + bônus de velocidade (até +900)
  const speedBonus = correct ? Math.max(0, 900 - Math.floor(ms / 33)) : 0;
  const score_delta = correct ? 100 + speedBonus : 0;

  // 5. Idempotente (UNIQUE no schema)
  await supa.from("sankofa_room_answers").insert({
    room_id, profile_uid, enigma_id,
    question_idx: room.current_idx,
    picked, ms_to_answer: ms,
    correct, score_delta
  });

  // 6. Atualiza score do jogador
  await supa.rpc("increment_player_score", {
    p_room_id: room_id, p_uid: profile_uid, p_delta: score_delta
  });

  return Response.json({ correct, score_delta, ms });
});
```

Cliente nunca calcula score próprio. Apenas exibe o que servidor responde.

### 6.5 Reconexão com PIN

Sessão sobrevive 30 min de desconexão.

```js
// src/classroom.js — aluno
async function rejoin() {
  const stored = localStorage.getItem("sankofa_room_session");
  if (!stored) return null;
  const { room_code, profile_uid, expires_at } = JSON.parse(stored);
  if (Date.now() > expires_at) return null;
  const room = await fetchRoom(room_code);
  if (!room || room.status === "finished") return null;
  return resumeRoom(room, profile_uid);
}
```

Wifi escola pública cai 3-4× por aula. Sem reconexão, aluno desiste.

### 6.6 Relatório do Professor (PNG/PDF)

**Sem isto, professor não repete o uso na 2ª aula.**

Após `status='finished'`:

```
┌─────────────────────────────────────────┐
│  📜  TURMA 7º A — 7 Maio 2026          │
│  28 alunos jogaram 5 enigmas            │
│                                         │
│  ▓▓▓▓▓▓▓▓▓▓░░░░░ 68% acerto geral      │
│                                         │
│  TOP 3                                  │
│  🥇 Sundiata (Mali)         4520 pts   │
│  🥈 Nzinga (Ndongo)         4180 pts   │
│  🥉 Amanirenas (Kush)       3920 pts   │
│                                         │
│  REVISAR (mais erros)                  │
│  • Q3: Conferência de Berlim (43%)     │
│  • Q5: Quem foi Yaa Asantewaa (51%)    │
│                                         │
│  SUGESTÃO DE AULA                      │
│  → Mundo 8: Partilha da África         │
│  → Mundo 5: Resistência Asante         │
└─────────────────────────────────────────┘
```

Renderização Canvas 2D → PNG 1080×1920 (vertical, share fácil em WhatsApp dos pais).

Botão "Baixar PDF" usa biblioteca leve (jsPDF, ~70 KB) só carregada nesta tela.

### 6.7 Mosaico Coletivo da Turma

Quando turma chega 70% de acerto geral:

- Desbloqueia fragmento exclusivo `fp-coletivo-turma-{tag}`
- Cor única gerada do hash da tag (estável)
- Aparece na coleção privada do jogador como "Conquistado com #Turma7A — 7 Mai 2026"
- **Por que importa**: hoje só compete. Adiciona cooperação. Diferencia de Kahoot

### 6.8 Cleanup automático

Edge Function `cleanup_rooms` (cron diário 04:00 UTC):

```sql
DELETE FROM sankofa_rooms WHERE expires_at < now();
DELETE FROM sankofa_rooms WHERE status = 'finished' AND created_at < now() - interval '7 days';
```

Mantém base enxuta, evita custos.

### 6.9 Limites

| Recurso | Limite Fase 2 | Razão |
|---------|---------------|-------|
| Jogadores por sala | 30 | Sala média BR |
| Salas simultâneas global | 6 (Free Supabase Realtime: 200 conexões / ~30 = 6) | Free tier |
| Duração máx sala | 24 h | Cleanup automático |
| Tentativas por enigma na sala | 1 | Estilo Kahoot |
| Tempo por enigma | 15 / 30 / 60 s (professor escolhe) | Padrão |

### 6.10 Acessibilidade obrigatória

- **Modo sem cronômetro** — alunos com TDAH, PCD, ansiedade. Professor ativa no lobby
- **Aria-live** ao chegar nova pergunta
- **TTS automático** opcional ao abrir cada pergunta
- **Daltonismo**: barra de progresso usa padrão (listras) além de cor
- **Modo alto contraste** já existe (papiro/dark) — funciona aqui

### 6.11 Entregáveis Fase 2

- [ ] Migrations Supabase: `sankofa_rooms`, `sankofa_room_players`, `sankofa_room_answers`
- [ ] RLS policies completas
- [ ] Edge Functions: `score_answer`, `cleanup_rooms`
- [ ] RPC: `increment_player_score`, `room_create`, `room_join_by_code`
- [ ] `src/classroom.js` — host (professor)
- [ ] `src/classroom-player.js` — aluno
- [ ] `src/classroom-report.js` — Canvas → PNG/PDF
- [ ] `src/realtime.js` — wrapper Supabase Realtime
- [ ] Telas: Lobby, Pergunta, Placar, Final, Relatório
- [ ] `data/version.js` → `1.4.0`

---

## 7. Fase 3 — Diferida

Itens que não entram nas três fases acima. Ordem por valor/esforço:

| # | Item | Por que adia |
|---|------|--------------|
| 1 | **Painel Professor web** (`/professor` com login Google) | 3 sem trabalho. Espera 100+ professores ativos pedirem |
| 2 | **Compartilhar relatório-PNG da turma** com top 3 + casa vencedora (marketing orgânico) | Quick win após Fase 2 estabilizar |
| 3 | **PDF kit impresso** (5 enigmas, formato cartão) | Diferencial absurdo para escolas sem dispositivos. Só após piloto em 5 escolas |
| 4 | **Google Classroom integration** | Burocracia OAuth verification. Quando 50+ escolas pedirem |
| 5 | **i18n EN/FR** (Africa francófona, comunidade afro EUA/UK) | Quando 1ª escola francófona pedir |
| 6 | **Modo família passa-dispositivo** | Nicho. Cooperação coletiva já cobre |
| 7 | **Webhook export resultados** (CSV/JSON) para SISCOP/Diário de Classe | Quando 1ª escola pedir formalmente |
| 8 | **Dataset aberto agregado** (que enigmas mais erram em SP vs BA) | Vira paper acadêmico + diferencial UNICEF/UNESCO. Espera 10 mil sessões |

---

## 8. Cronograma realista

Considerando esforço de **um desenvolvedor** com tempo parcial (~25 h/semana):

| Semana | Marco |
|--------|-------|
| 1 (12-18 mai) | Fase 1 PR 1: modal perfil + gerador HGA + age-band |
| 2 (19-25 mai) | Fase 1 PR 2: WhatsApp share + tag + TTS + onboarding. Release **v1.2.0** |
| 3 (26 mai-1 jun) | Fase 1.5: schema + edge functions + UI torneio. Release **v1.3.0** |
| 4-5 (2-15 jun) | **Observação real** — métricas. Submissão Edital 04 SP PNAB no dia 27 mai. Imprensa, escolas |
| 6-9 (16 jun-13 jul) | Fase 2: schema + realtime + score server-side + lobby + pergunta + placar |
| 10-11 (14-27 jul) | Fase 2: relatório, mosaico coletivo, reconexão, polish. Release **v1.4.0** |
| 12+ | Piloto em 3-5 escolas SP. Iteração com feedback real |

Datas ajustadas a partir de hoje (2026-05-07).

---

## 9. Métricas de sucesso

### Fase 1 (após 30 dias)

| Métrica | Alvo |
|---------|------|
| % de novos perfis com nome HGA | ≥ 60% |
| Shares WhatsApp / sessão | ≥ 0,3 |
| Retorno dia-2 | ≥ 35% |
| Tags ativas com ≥ 3 jogadores | ≥ 20 |

### Fase 1.5 (após 4 semanas de torneio)

| Métrica | Alvo |
|---------|------|
| Participantes / semana | ≥ 100 (semana 1), ≥ 500 (semana 4) |
| % que jogam os 5 enigmas da semana | ≥ 50% |
| Crescimento WoW | ≥ 30% nas primeiras 4 semanas |

### Fase 2 (após 90 dias de uso por escolas)

| Métrica | Alvo |
|---------|------|
| Salas criadas / semana | ≥ 30 |
| Professores únicos hosts | ≥ 15 |
| % de salas que terminam (não abandonadas) | ≥ 75% |
| Relatórios baixados / sala finalizada | ≥ 60% |
| Net Promoter Score professor | ≥ 30 |

---

## 10. Riscos e mitigações

| Risco | Probabilidade | Mitigação |
|-------|---------------|-----------|
| Supabase free tier estoura (>200 conexões) | Média | Limitar a 6 salas simultâneas. Upgrade pago US$25/mês quando passar disso |
| Escola sem wifi estável | **Alta** | Modo offline-first do solo continua. Fase 1.5 (assíncrono) cobre maioria |
| Cheating em Sala de Aula | Alta sem mitigação | Score 100% server-side. Cliente só exibe |
| LGPD: pais reclamam de menores em ranking | Média | Faixa etária 8-12 nunca em ranking público sem opt-in. Botão "apagar dados" visível |
| Professor abandona após 1ª sessão | **Alta** | Relatório PDF/PNG após sessão. Sem isto, 80% não voltam |
| Realtime instável (latência variada) | Média | Tolerância de 2 s na janela de resposta. Reconexão 30 min |
| Custo de moderação de tags | Baixa | Blocklist + reportar tag + auto-mute se 3 reports/24 h |

---

## 11. Stack técnica

```
Cliente:
  - Vanilla JS (zero framework)
  - Web Audio API (já existe)
  - SpeechSynthesis API (TTS)
  - Canvas 2D (relatório PNG)
  - jsPDF (lazy-load, só Fase 2)

Backend (Supabase):
  - Postgres (tabelas + RLS)
  - Realtime (WebSockets, Fase 2)
  - Edge Functions (Deno + TypeScript)
  - Cron Jobs (rotação semanal, cleanup)

Hospedagem:
  - Vercel (PWA estática)
  - Supabase (backend)
  - Domínio: sankofa-eosin.vercel.app (custom domain quando adquirir)

Distribuição:
  - PWA instalável (já existe, fix v1.1.1)
  - Future: Play Store via TWA (Trusted Web Activity), App Store via PWA wrapper
```

---

## 12. Decisões em aberto

Itens que precisam de decisão antes de codar:

1. **Custom domain** (`sankofa.app` ou `sankofa.org.br`) — antes ou depois da Fase 2?
2. **Pagamento** — Fase 2 será grátis para escolas públicas? Pago para particulares? Modelo?
3. **Limite max_players=30** — flexibilizar para 50 quando upgrade Supabase?
4. **TTS voz** — usar voz padrão browser (pt-BR Microsoft/Google) ou contratar voz autoral afro-brasileira?
5. **Idioma 1.5 vs 2** — manter PT-BR único até quando? Quando 1ª escola PT-PT pedir, basta? E PALOPs?
6. **Moderação de nicks** — passar todos os nicks por blocklist mesmo se gerados por HGA? (Defesa contra `Sundiata%201337`)

---

## 13. Aprovação

Esta proposta foi formulada em 2026-05-07 com base em:

- Análise da arquitetura atual (PWA vanilla + Supabase REST opt-in)
- Inspirações: Kahoot, Quizizz, Duolingo, Wordle social
- Demandas pedagógicas Lei 10.639/03 + PCNs HGA
- Restrições orçamentárias (zero CAPEX, OPEX < US$ 30/mês até 1k usuários ativos)

**Aprovado para iniciar Fase 1 PR 1 quando o autor confirmar.**

---

## 14. Anexos

- Schema SQL completo: `docs/db/multiplayer-schema.sql` (a criar)
- RLS policies: `docs/db/multiplayer-rls.sql` (a criar)
- Edge Functions skeletons: `supabase/functions/` (a criar)
- Mockups: `docs/mockups/sala-de-aula/` (a criar — PNG)

---

**Fim do documento.**
