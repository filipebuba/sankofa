# Sankofa — Fragmentos da África

## Tese do projeto

Sankofa é um jogo digital educativo sobre a História Geral da África (HGA, UNESCO),
que transforma conhecimento histórico rigoroso em experiência de descoberta. O jogador
não recebe uma aula tradicional: resolve enigmas, recolhe fragmentos de memória e monta
mosaicos visuais que revelam civilizações, rotas, personagens, tecnologias e narrativas
africanas.

O nome vem do povo Acano-Axanti (Gana) e significa "volte e busque". O símbolo — um
pássaro que olha para trás enquanto voa em frente — guia o tom do projeto: recuperar o
que foi apagado, distorcido ou esquecido, para construir presente e futuro mais
conscientes.

## Problema

Há uma distância grande entre a riqueza da HGA da UNESCO (8 volumes) e o acesso real de
crianças, jovens, professores e famílias afrodescendentes lusófonas. O conteúdo existe,
mas chega de forma acadêmica, extensa e pouco jogável.

## Proposta

Um jogo web aberto, leve, mobile-first e acessível em que cada enigma combina:

- introdução narrativa curta (frase poética);
- contexto histórico opcional (botão "Queres saber mais?");
- pergunta de múltipla escolha;
- até 3 dicas progressivas (com custo de pontos);
- explicação após a resposta;
- fragmento desbloqueado para o mosaico do mundo;
- curiosidade extra;
- pontos, conquistas e progresso local.

## Diferencial

- **Perspectiva afrocentrada**: agência histórica africana, sem reduzir o continente a
  escravização, sofrimento ou exotismo.
- **Sonoridade africana**: feedback auditivo sintetizado a partir de instrumentos
  africanos (djembe, dùndún/talking drum, kalimba/mbira, balafon, agogô, shaker). Sem
  amostras externas: o motor sintetiza tudo via Web Audio.
- **Visual em estilo manuscrito ouro/terra/índigo**, fontes Playfair Display + Lora,
  enigmas como peças narrativas curtas.

## Público inicial

Estudantes de 10 a 17 anos, professores da educação básica e educadores afrodescendentes.
Deve funcionar de forma autônoma e também caber em sala de aula.

## Estado atual (v1.3.6-dev)

A versão jogável cobre **os 8 mundos** com **71 enigmas** validados a partir dos Volumes I–VIII da HGA:

- **Mundo 1 — Origens** (15 enigmas): Vale do Rift, Saara verde, metalurgia, expansão Bantu, arte rupestre.
- **Mundo 2 — Reinos do Nilo** (8): Kemet, Hatshepsut, hieróglifos, Núbia, Aksum.
- **Mundo 3 — Impérios do Sahel** (8): Mansa Musa, Sundiata, Tombuctu, Songhai.
- **Mundo 4 — Costas e Rotas** (8): Kilwa, Grande Zimbabwe, suaíli, monção.
- **Mundo 5 — Florestas e Reinos** (8): Bronzes do Benin, Kongo, Ifé, Asante.
- **Mundo 6 — Resistência** (8): Palmares, Zumbi, Dandara, Haiti, Carlota Lucumí.
- **Mundo 7 — O Encontro Forçado** (8): candomblé, capoeira, samba, terreiros.
- **Mundo 8 — Luta e Liberdade** (8): Berlim, Lumumba, Cabral, Mandela.

## Sistemas pedagógicos vivos

Além do loop básico, o jogo tem mecânicas educativas próprias:

- **Avanço liberal**: próximo mundo abre com 70% de acerto, não 100%. Errar não bloqueia.
- **Mestria 100%** (+100 cauris) e **Mestria Perfeita** — 100% com ≥80% acertos em 1ª tentativa (+250 cauris).
- **Caderno de Revisão**: enigmas errados ficam pendentes com tracking persistente; ao voltar e acertar, sem cauris extras (reforço puro).
- **Karma + Skip**: se >50% pendente, "anciãos" sugerem revisar antes; insistir custa 50 cauris. Pular após 2 erros: +5 pts piedade, sem cauris.
- **Audiência Real / Daily**: súdito do dia entrega frase histórica + cauris bônus.
- **Festivais HGA** (Dia da África 25/05, Consciência Negra 20/11, Lua Nova, Festa Sankofa): multiplicador ×1.5–2.0 em cauris.
- **Selo Real PNG** (1080×1080): exporta casa+título+mosaico para partilha.
- **9 Casas Reais** com perks (Kemet bônus Vol. II, Asante 1ª tentativa, Quilombo dobra streak, etc.) e **9 Súditos NPC** desbloqueados por marcos.
- **Genealogia**: árvore de ancestrais por casa (35+ entradas) acessível no Trono.
- **Liga local multi-perfil** + **Liga Global Supabase opt-in** (com aba `#MinhaTag`) + **Torneio Semanal Assíncrono** (5 enigmas, anti-cheat server-side).
- **TTS** (Web Speech API): leitura de pergunta e contexto, opt-in.

## Princípios de design

- **Jogo primeiro**: experiência prazerosa antes de explicativa.
- **Descoberta antes de instrução**: conhecimento como recompensa.
- **Rigor com leveza**: cada enigma tem fonte da HGA e nota histórica.
- **Acesso amplo**: navegador, sem cadastro, funciona em celulares modestos.
- **Erro sem punição**: errar abre caminho para pistas, alimenta o Caderno de Revisão, não bloqueia o jogo.
- **Avanço liberal, mestria opcional**: 70% destrava o próximo mundo; 100% e 100%+1ªtent ganham marcos honoríficos.
- **Som como cultura**: o feedback sonoro também ensina — instrumentos africanos
  no lugar de bipes genéricos.
- **Identidade afro-histórica**: nicks da HGA, casas reais, súditos, genealogia — pertencimento como mecânica.

## Frase curta

Sankofa é um jogo de enigmas históricos em que cada resposta recupera um fragmento da
memória africana — ao som de tambores, kalimbas e balafons.
