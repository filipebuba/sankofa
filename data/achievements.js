window.SANKOFA_ACHIEVEMENTS = [
  { id: "first_step", name: "Primeiro Passo", desc: "Resolva o seu primeiro enigma", icon: "◈", c: function (s) { return s.solved.length >= 1; } },
  { id: "explorer", name: "Descobridor de Origens", desc: "Complete o Mundo 1", icon: "☀", c: function (s) { return s.solved.filter(function (e) { return e.indexOf("w1") === 0; }).length >= 5; } },
  { id: "eagle_eye", name: "Olho de Águia", desc: "Acerte 3 enigmas na 1ª tentativa", icon: "◉", c: function (s) { return s.firstTries >= 3; } },
  { id: "persistent", name: "Incansável", desc: "Jogue 3 dias consecutivos", icon: "♥", c: function (s) { return s.streak >= 3; } },
  { id: "curious", name: "Curioso", desc: "Abra o contexto de 3 enigmas", icon: "◎", c: function (s) { return s.contextsRead >= 3; } },
  { id: "fast", name: "Raio", desc: "Acerte um enigma em menos de 10s", icon: "⚡", c: function (s) { return s.fastSolves >= 1; } },
  { id: "hintless", name: "Sábio Sem Queres saber mais?", desc: "Resolva 2 enigmas sem dicas", icon: "✧", c: function (s) { return s.noHintSolves >= 2; } },
  { id: "collector", name: "Colecionador", desc: "Recolha todos os 5 fragmentos", icon: "◆", c: function (s) { return s.solved.filter(function (e) { return e.indexOf("w1") === 0; }).length >= 5; } },
  { id: "daily_warrior", name: "Desafiante Diário", desc: "Complete um desafio diário", icon: "☆", c: function (s) { return s.dailyDone >= 1; } },
  { id: "speed_reader", name: "Veloz da Savana", desc: "Complete 3 enigmas rápidos", icon: "🐎", c: function (s) { return s.fastSolves >= 3; } }
];
