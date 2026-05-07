/*
  Sankofa — Banco de nomes históricos da África (HGA UNESCO).
  Cada entrada = pessoa real ou figura nomeada nos volumes I-VIII.
  Usado pelo gerador "Nome Histórico" no modal de perfil.

  Schema:
    {
      name: "Nome curto",
      sex:  "M" | "F" | "X",   // X = neutro / coletivo
      period: "época",
      casa:  "casa real ou origem (data/houses.js casa.id)",
      world: 1..8 (mundo HGA correspondente),
      desc:  "1 frase educativa, < 140 chars"
    }

  60+ entradas iniciais. Pode crescer livremente. Mantenha sempre fonte HGA.
*/
window.HGA_NAMES = [
  // Mundo 1 — Origens
  { name: "Lucy",        sex: "F", period: "c. 3,2 milhões a.C.", casa: "kemet",    world: 1, desc: "Australopithecus afarensis encontrada em Hadar, Etiópia. Lembra que toda humanidade começou em África." },
  { name: "Kintu",       sex: "M", period: "lendário",            casa: "kemet",    world: 1, desc: "Primeiro humano da mitologia bantu de Buganda. Quem cuida da terra herda o céu." },
  { name: "Ọ̀ṣun",        sex: "F", period: "lendário",            casa: "asante",   world: 1, desc: "Orixá yorubá das águas doces. Símbolo de fertilidade, beleza e poder feminino." },
  { name: "Yemanjá",     sex: "F", period: "lendário",            casa: "asante",   world: 1, desc: "Orixá das águas salgadas. Mãe de todos os orixás na cosmovisão yorubá." },
  { name: "Anansi",      sex: "M", period: "lendário",            casa: "asante",   world: 1, desc: "Aranha-trickster akan. Levou histórias para o mundo. Sabedoria através da astúcia." },
  { name: "Mawu",        sex: "F", period: "lendário",            casa: "asante",   world: 1, desc: "Divindade-mãe lua na cosmologia fon (Daomé). Forma par com Lisa, o sol." },

  // Mundo 2 — Kemet e Núbia
  { name: "Narmer",      sex: "M", period: "c. 3100 a.C.",        casa: "kemet",    world: 2, desc: "Unificou o Alto e o Baixo Egito. Primeiro faraó da história documentada." },
  { name: "Imhotep",     sex: "M", period: "c. 2667-2648 a.C.",   casa: "kemet",    world: 2, desc: "Arquiteto da pirâmide de Djoser. Médico, astrônomo, divinizado séculos depois." },
  { name: "Hatshepsut",  sex: "F", period: "1507-1458 a.C.",      casa: "kemet",    world: 2, desc: "Faraó-mulher do Egito. Reinou 21 anos, mandou expedição a Punt, ergueu obeliscos." },
  { name: "Akhenaton",   sex: "M", period: "c. 1353-1336 a.C.",   casa: "kemet",    world: 2, desc: "Faraó que tentou monoteísmo solar. Pai de Tutankhamon, marido de Nefertiti." },
  { name: "Nefertiti",   sex: "F", period: "c. 1370-1330 a.C.",   casa: "kemet",    world: 2, desc: "Rainha de Akhenaton. Possivelmente reinou sozinha após a morte dele." },
  { name: "Ramsés",      sex: "M", period: "c. 1303-1213 a.C.",   casa: "kemet",    world: 2, desc: "Faraó Ramsés II. 66 anos no trono. Construiu Abu Simbel. Casado com Nefertari." },
  { name: "Taharqa",     sex: "M", period: "c. 690-664 a.C.",     casa: "kush",     world: 2, desc: "Faraó kushita da 25ª dinastia. Conquistou todo o Egito a partir do sul." },
  { name: "Amanirenas",  sex: "F", period: "c. 40-10 a.C.",       casa: "kush",     world: 2, desc: "Kandake guerreira de Meroé. Enfrentou Roma e arrancou tratado de paz favorável." },
  { name: "Ezana",       sex: "M", period: "c. 320-360 d.C.",     casa: "aksum",    world: 2, desc: "Negus de Aksum. Cristianizou o reino. Suas estelas ainda estão de pé na Etiópia." },

  // Mundo 3 — Sahel
  { name: "Sundiata",    sex: "M", period: "c. 1217-1255",        casa: "mali",     world: 3, desc: "Fundador do Império do Mali. Filho de Sogolon Kondé, vencedor de Sumanguru." },
  { name: "Mansa Musa",  sex: "M", period: "c. 1280-1337",        casa: "mali",     world: 3, desc: "Imperador mais rico da história. Sua peregrinação a Meca abalou economias." },
  { name: "Sogolon",     sex: "F", period: "século XIII",         casa: "mali",     world: 3, desc: "Mãe de Sundiata. Conhecida como a 'mulher-búfalo'. Fundadora indireta do Mali." },
  { name: "Askia",       sex: "M", period: "c. 1443-1538",        casa: "mali",     world: 3, desc: "Askia Muhammad I. Reorganizou o Império Songhai e fez a peregrinação a Meca." },
  { name: "Ahmed Baba",  sex: "M", period: "1556-1627",           casa: "mali",     world: 3, desc: "Sábio de Tombuctu. Escreveu mais de 40 livros. Bibliotecas-monumento ainda existem." },
  { name: "Tin Hinan",   sex: "F", period: "século IV",           casa: "mali",     world: 3, desc: "Rainha-mãe dos Tuaregues. Túmulo descoberto no Hoggar (Argélia) em 1925." },

  // Mundo 4 — Costas e rotas
  { name: "Yusuf",       sex: "M", period: "século XIV",          casa: "aksum",    world: 4, desc: "Sultão de Kilwa. Cidade de pedra e coral foi entreposto-rei do oceano Índico." },
  { name: "Mwene",       sex: "M", period: "século XV",           casa: "aksum",    world: 4, desc: "Mwene Mutapa — 'senhor das terras pilhadas'. Construiu Grande Zimbábue." },
  { name: "Hassan",      sex: "M", period: "século X",            casa: "aksum",    world: 4, desc: "Hassan ibn Ali. Fundador da dinastia xirázida em Kilwa segundo crônicas suaílis." },
  { name: "Rasoherina",  sex: "F", period: "1814-1868",           casa: "aksum",    world: 4, desc: "Rainha Merina de Madagáscar. Resistiu à pressão colonial francesa." },

  // Mundo 5 — Florestas e reinos
  { name: "Idia",        sex: "F", period: "século XVI",          casa: "benin",    world: 5, desc: "Rainha-mãe do Benin. Suas máscaras de marfim estão em museus do mundo todo." },
  { name: "Oba",         sex: "M", period: "lendário",            casa: "benin",    world: 5, desc: "Título dos reis do Benin. Cada Oba acrescenta um bronze à história." },
  { name: "Afonso",      sex: "M", period: "c. 1456-1542",        casa: "kongo",    world: 5, desc: "Mvemba a Nzinga, rei do Kongo. Cristão. Tentou parar o tráfico que sangrava seu reino." },
  { name: "Kimpa Vita",  sex: "F", period: "c. 1684-1706",        casa: "kongo",    world: 5, desc: "Profetisa Beatriz do Kongo. Pregava Jesus negro. Queimada como herege aos 22." },
  { name: "Nzinga",      sex: "F", period: "1583-1663",           casa: "kongo",    world: 5, desc: "Rainha de Ndongo e Matamba. Resistiu 40 anos ao avanço português em Angola." },
  { name: "Yaa",         sex: "F", period: "c. 1840-1921",        casa: "asante",   world: 5, desc: "Yaa Asantewaa, rainha-mãe do Reino Asante. Liderou a última guerra contra os britânicos." },
  { name: "Osei",        sex: "M", period: "c. 1660-1717",        casa: "asante",   world: 5, desc: "Osei Tutu I, primeiro Asantehene. Fundou o reino com o Trono de Ouro caído do céu." },

  // Mundo 6 — Resistência
  { name: "Zumbi",       sex: "M", period: "1655-1695",           casa: "quilombo", world: 6, desc: "Último líder do Quilombo de Palmares. Resistiu 17 anos. Símbolo nacional do 20 de Novembro." },
  { name: "Dandara",     sex: "F", period: "?-1694",              casa: "quilombo", world: 6, desc: "Companheira de Zumbi. Guerreira de capoeira. Preferiu o despenhadeiro à escravidão." },
  { name: "Aqualtune",   sex: "F", period: "c. 1605-?",           casa: "kongo",    world: 6, desc: "Princesa kongolesa escravizada que se tornou avó de Zumbi. Primeira mulher de Palmares." },
  { name: "Ganga Zumba", sex: "M", period: "c. 1630-1678",        casa: "quilombo", world: 6, desc: "Tio de Zumbi. Primeiro rei-supremo de Palmares. Negociou paz que custou a vida." },
  { name: "Tereza",      sex: "F", period: "c. 1700-1770",        casa: "quilombo", world: 6, desc: "Tereza de Benguela. Rainha do Quilombo do Quariterê (MT). 20 anos de resistência." },
  { name: "Carlota",     sex: "F", period: "século XIX",          casa: "quilombo", world: 6, desc: "Carlota Lucumí. Liderou revolta de escravizados em Cuba (1843). Yorubá nascida livre." },
  { name: "Toussaint",   sex: "M", period: "1743-1803",           casa: "quilombo", world: 6, desc: "Toussaint Louverture. Liderou a Revolução Haitiana — a 1ª república negra livre." },
  { name: "Dessalines",  sex: "M", period: "1758-1806",           casa: "quilombo", world: 6, desc: "Jean-Jacques Dessalines. Proclamou a independência do Haiti em 1804." },

  // Mundo 7 — Encontro forçado / Diáspora
  { name: "Aninha",      sex: "F", period: "1869-1938",           casa: "asante",   world: 7, desc: "Mãe Aninha. Fundou o Ilê Axé Opô Afonjá. Pilar do candomblé baiano." },
  { name: "Pixinguinha", sex: "M", period: "1897-1973",           casa: "kongo",    world: 7, desc: "Alfredo da Rocha Vianna. Pai do choro. Compôs 'Carinhoso'." },
  { name: "Cartola",     sex: "M", period: "1908-1980",           casa: "kongo",    world: 7, desc: "Angenor de Oliveira. Sambista da Mangueira. Compôs 'O Mundo é um Moinho'." },
  { name: "Mestre Bimba",sex: "M", period: "1899-1974",           casa: "asante",   world: 7, desc: "Manuel dos Reis Machado. Criou a Capoeira Regional. Tirou a capoeira da clandestinidade." },

  // Mundo 8 — Luta e liberdade
  { name: "Lumumba",     sex: "M", period: "1925-1961",           casa: "kongo",    world: 8, desc: "Patrice Lumumba. 1º primeiro-ministro do Congo independente. Assassinado pela CIA e Bélgica." },
  { name: "Cabral",      sex: "M", period: "1924-1973",           casa: "kongo",    world: 8, desc: "Amílcar Cabral. Libertou Guiné e Cabo Verde do colonialismo português. Assassinado." },
  { name: "Nkrumah",     sex: "M", period: "1909-1972",           casa: "asante",   world: 8, desc: "Kwame Nkrumah. 1º presidente de Gana. Pan-africanista. Visão da África Unida." },
  { name: "Neto",        sex: "M", period: "1922-1979",           casa: "kongo",    world: 8, desc: "Agostinho Neto. Médico, poeta, 1º presidente de Angola independente." },
  { name: "Biko",        sex: "M", period: "1946-1977",           casa: "kongo",    world: 8, desc: "Steve Biko. Pai da Consciência Negra na África do Sul. Morto sob tortura aos 30." },
  { name: "Mandela",     sex: "M", period: "1918-2013",           casa: "kongo",    world: 8, desc: "Nelson Mandela. 27 anos preso. 1º presidente negro da África do Sul. Madiba." },
  { name: "Sankara",     sex: "M", period: "1949-1987",           casa: "kongo",    world: 8, desc: "Thomas Sankara. Presidente de Burkina Faso. 'Che Guevara africano'. Renomeou seu país: 'terra dos honrados'." },
  { name: "Garvey",      sex: "M", period: "1887-1940",           casa: "kongo",    world: 8, desc: "Marcus Garvey. Jamaicano. Pai do pan-africanismo moderno. 'Up, you mighty race'." },
  { name: "Du Bois",     sex: "M", period: "1868-1963",           casa: "kongo",    world: 8, desc: "W.E.B. Du Bois. Sociólogo afro-americano. Organizou Congressos Pan-Africanos." },
  { name: "Nyerere",     sex: "M", period: "1922-1999",           casa: "asante",   world: 8, desc: "Julius Nyerere. Mwalimu (professor). 1º presidente da Tanzânia. Filosofia ujamaa." },
  { name: "Cesária",     sex: "F", period: "1941-2011",           casa: "kongo",    world: 8, desc: "Cesária Évora. 'Diva dos pés descalços'. Levou a morna de Cabo Verde ao mundo." },
  { name: "Miriam",      sex: "F", period: "1932-2008",           casa: "kongo",    world: 8, desc: "Miriam Makeba. Mama África. Cantou contra o apartheid. Voz da liberdade negra." },
  { name: "Wangari",     sex: "F", period: "1940-2011",           casa: "asante",   world: 8, desc: "Wangari Maathai. Queniana. Plantou 30 milhões de árvores. Nobel da Paz 2004." },
  { name: "Ellen",       sex: "F", period: "1938-",               casa: "asante",   world: 8, desc: "Ellen Johnson Sirleaf. 1ª presidenta eleita da África (Libéria, 2006). Nobel da Paz 2011." },
  { name: "Funmilayo",   sex: "F", period: "1900-1978",           casa: "asante",   world: 8, desc: "Funmilayo Ransome-Kuti. Pioneira do feminismo nigeriano. Mãe de Fela Kuti." },
  { name: "Fela",        sex: "M", period: "1938-1997",           casa: "asante",   world: 8, desc: "Fela Kuti. Criou o afrobeat. 27 esposas, 200 prisões. Música como arma." },
  { name: "Conceição",   sex: "F", period: "1946-2023",           casa: "quilombo", world: 8, desc: "Conceição Evaristo. Escritora mineira. Cunhou 'escrevivência'. Voz da literatura negra brasileira." },
  { name: "Lélia",       sex: "F", period: "1935-1994",           casa: "quilombo", world: 8, desc: "Lélia Gonzalez. Antropóloga, ativista. Cunhou 'amefricanidade'. Pensadora pan-africana brasileira." },
  { name: "Abdias",      sex: "M", period: "1914-2011",           casa: "quilombo", world: 8, desc: "Abdias do Nascimento. Fundou Teatro Experimental do Negro. Senador, ministro, pintor." },
  { name: "Beatriz",     sex: "F", period: "1942-2011",           casa: "quilombo", world: 8, desc: "Beatriz Nascimento. Historiadora. Ressignificou os quilombos como projeto de liberdade." }
];

// Total: 60 nomes curados. Adicionar mais usando a skill sankofa-add-enigma como referência.
window.HGA_NAMES_VERSION = "2026-05-07";

// Helpers
window.HGAName = {
  random: function (filter) {
    var pool = window.HGA_NAMES;
    if (filter && filter.sex) pool = pool.filter(function (n) { return n.sex === filter.sex; });
    if (filter && filter.world) pool = pool.filter(function (n) { return n.world === filter.world; });
    if (filter && filter.casa) pool = pool.filter(function (n) { return n.casa === filter.casa; });
    if (pool.length === 0) pool = window.HGA_NAMES;
    return pool[Math.floor(Math.random() * pool.length)];
  },
  byName: function (name) {
    return window.HGA_NAMES.find(function (n) { return n.name === name; }) || null;
  },
  count: function () { return window.HGA_NAMES.length; }
};
