# Liga dos Griôs — Setup

Liga global é **opt-in** e usa Supabase. Sem ela, liga local entre perfis no mesmo dispositivo continua funcional.

## Tabela Supabase

```sql
create table league_scores (
  handle text primary key,
  cauris int not null default 0,
  title  text,
  house  text,
  week_start date not null,
  updated_at timestamptz not null default now()
);
create index league_scores_week_idx on league_scores(week_start, cauris desc);

alter table league_scores enable row level security;
create policy "read all" on league_scores for select using (true);
create policy "upsert" on league_scores for insert with check (true);
create policy "update self" on league_scores for update using (true);
```

## Configurar no jogo

Antes do `<script src="src/league.js">`, em `index.html`:

```html
<script>
  window.SANKOFA_LEAGUE_CONFIG = {
    url: "https://<project-ref>.supabase.co",
    anonKey: "<anon-public-key>"
  };
</script>
```

Sem config = liga global escondida automaticamente.

## Tiers (semanais)

| Tier                    | Posição (percentil) | Cor      |
|-------------------------|---------------------|----------|
| Caçador                 | bottom 50%          | cinza    |
| Griô do Sahel           | top 50%             | bronze   |
| Mercador de Tombuctu    | top 25%             | ouro     |
| Conselheiro Real        | top 10%             | terra    |
| Mansa da Semana         | top 3%              | ouro alto|
| Soberano Pan-Africano   | #1                  | branco   |

## Reset

Domingo 00:00 UTC. `week_start` recalculado a cada submit.

## Privacy

- Apenas `handle` (nome do jogador truncado a 20 chars), `cauris`, `title`, `house`.
- Sem email, sem foto, sem IP no schema.
- Player pode desativar via "Recomeçar do Zero" (limpa state, opt-out implícito).

## Liga local (sempre disponível)

`SankofaProfiles` permite múltiplos perfis no mesmo `localStorage`. Cada um tem cauris/state isolados. Útil para sala de aula. Nada vai para servidor.
