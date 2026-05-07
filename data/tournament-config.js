/*
  Sankofa — Configuração do Torneio Assíncrono Semanal (Fase 1.5).
*/
window.SANKOFA_TOURNAMENT = {
  ENIGMAS_PER_WEEK: 5,
  MAX_ATTEMPTS: 3,
  MIN_MS: 1500,                 // bate com Edge Function
  ROTATE_DOW: 0,                // domingo
  ROTATE_HOUR_UTC: 0,
  REWARDS: {
    weekChampion: 100,          // cauris extra para o #1 da semana
    fragmentBonus: "fp-mansa",  // fragmento simbólico
    badgePrefix: "Campeão da Semana"
  }
};

window.SANKOFA_TOURNAMENT_WEEK_ISO = function () {
  // ISO week 'YYYY-WnnX' equivalente ao to_char(now(),'IYYY-"W"IW') do Postgres.
  var d = new Date();
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  var week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return d.getUTCFullYear() + "-W" + String(week).padStart(2, "0");
};
