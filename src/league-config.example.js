/*
  Sankofa Liga — exemplo de configuração.
  Copia este ficheiro para `src/league-config.js` e preenche.
  O ficheiro real está no .gitignore.

  Sem este ficheiro, a Liga global fica oculta e a liga local
  entre perfis no mesmo dispositivo continua funcional.

  Em deploy Vercel: usa env vars SUPABASE_URL e SUPABASE_ANON_KEY
  e injeta no build (ver README.md).
*/
window.SANKOFA_LEAGUE_CONFIG = {
  url: "https://YOUR-PROJECT.supabase.co",
  anonKey: "YOUR-ANON-PUBLIC-KEY",
  hasTagColumn: true   // após rodar SETUP_TOURNAMENT.sql + RUN_THIS_FIRST.sql
};

// Painel admin: autenticação via Supabase Auth (email + senha).
// Criar usuário em Studio → Authentication → Users.
// Desativar self-signup em Studio → Authentication → Providers → Email.
// Acesso: /?admin=1 ou /#admin
