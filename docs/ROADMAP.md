# Roadmap

## Fase 0 — Fundação ✅

- Documento conceitual lapidado (`docs/CONCEITO.md`).
- Recorte do MVP definido (Mundo 1: Origens, 5 enigmas).
- Estrutura inicial do projeto.
- Primeiros 5 enigmas escritos (Volume I da HGA).
- Protótipo navegável em HTML/CSS/JS estático.

## Fase 1 — Protótipo jogável ✅ (atual)

- Fluxo completo: landing → registro → mapa → mundo → enigma → resultado → mosaico.
- Pontuação, dicas progressivas, conquistas, níveis, desafio diário.
- Mosaico visual com fragmentos desbloqueados.
- Persistência local (`localStorage`).
- Visual em paleta ouro/terra/verde/índigo, fontes Playfair Display + Lora.
- **Áudio sintetizado de instrumentos africanos** (djembe, dùndún, kalimba, balafon,
  agogô, shaker) via Web Audio API. Toggle de som e tambor ambiente.
- Arte de capa de mundos (8 ilustrações) integrada nos cartões e na tela do mundo.
- **Fluxo "continue-first" (estilo Duolingo / Wordscapes)**: landing oferece
  *Continuar Jornada* quando há progresso; mapa traz banner "Continuar onde paraste";
  cada mundo tem CTA *Continuar/Começar*; tela de resultado avança automaticamente
  para o próximo enigma sem voltar à lista. Lista permanece acessível como secundária.

## Fase 2 — Validação

- Testar com 5 a 10 pessoas (estudantes 10–17 e professores).
- Coletar dificuldades, emoção, clareza e tempo médio por enigma.
- Revisar enigmas com especialista em HGA / educação.
- Ajustar linguagem, ritmo das dicas e curva de pontos.
- Auditoria de acessibilidade (contraste, foco, leitor de tela).

## Fase 3 — Expansão de conteúdo

- Completar Mundo 1 com mais 10 enigmas (total 15).
- Iniciar Mundo 2 (Reinos do Nilo, Volume II): 8 enigmas piloto.
- Refinar paleta sonora por mundo (instrumentos regionais distintos).
- Separar dados em JSON puro (atualmente JS) para abrir contribuição externa.

## Fase 4 — Produto aberto

- README público com guia de contribuição.
- Licenças aplicadas: MIT (código), CC BY-SA 4.0 (conteúdo).
- Guia rápido para professores (`docs/PROFESSORES.md`).
- Publicar versão online (GitHub Pages / Vercel).
- Exportador de progresso (compartilhar mosaicos).

## Decisões em vigor

- Sem backend, login ou ranking global no MVP.
- Sem amostras de áudio externas: tudo sintetizado para manter peso e licença abertos.
- Mobile-first, máx. 580px no `#app` (até 620px em desktop).
- Conteúdo em PT-BR, com tolerância a variantes lusófonas (PT-PT no protótipo).
