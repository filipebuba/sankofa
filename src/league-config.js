/*
  Sankofa — configuração da Liga + Torneio.
  A anon key é pública por design — RLS protege. Comitar é seguro.
  Service role NUNCA entra aqui (só Edge Functions usam).
*/
window.SANKOFA_LEAGUE_CONFIG = {
  url: "https://jcfqlvzdmmkeehqvfdtb.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjZnFsdnpkbW1rZWVocXZmZHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNTkxOTMsImV4cCI6MjA5MzczNTE5M30.9765hAvOeq7ss6V6xpY8gfJUO7wCqXHg3FXpLiBbXtk",
  hasTagColumn: true
};
