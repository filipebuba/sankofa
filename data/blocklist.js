/*
  Sankofa — Blocklist de termos vetados em nicks e tags.
  Lista mínima conservadora, focada em proteção de menores.
  Usa normalização (NFD + lowercase) antes de comparar.
*/
window.SANKOFA_BLOCKLIST = [
  // Sexual / explícito
  "sex", "porn", "xxx", "boob", "tits", "dick", "cock", "pussy", "anal",
  "puta", "buceta", "rola", "pau", "caralho", "pinto", "vagabunda",

  // Insultos racistas / discriminatórios
  "macaco", "neguinho", "mongol", "retardado", "retardada", "viado", "bicha",
  "sapatao", "travesti", "tranny", "nigger", "nigga", "kkkk-nazi", "nazi",
  "hitler", "nazismo", "racista", "supremacista",

  // Violência
  "kill", "matar", "morte", "estupro", "estuprador", "pedofilo", "pedofilia",

  // Drogas e álcool (proteção menores)
  "cocaina", "maconha", "crack", "drogado", "bebado",

  // Spam comercial
  "compre", "promocao", "desconto", "frete-gratis", "viagra", "casino", "casino"
];

window.sankofaCensor = function (text) {
  if (!text) return true;
  var norm = String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  for (var i = 0; i < window.SANKOFA_BLOCKLIST.length; i++) {
    var term = window.SANKOFA_BLOCKLIST[i].toLowerCase();
    if (norm.indexOf(term) !== -1) return false;
  }
  return true;
};
