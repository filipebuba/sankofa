# Sankofa Kids — Spec de Enigmas Game-First

Versão: 2026-05-11

## Princípio

Sankofa Kids deve ensinar como consequência da aventura, não como interrupção dela.

Um bom enigma parece uma porta de filme: Lucinha observa o mundo, recolhe pistas, escuta uma memória e só então entende como passar. A resposta certa não deve parecer "decorei uma ficha"; deve parecer "entendi o que o cenário estava tentando me contar".

## Loop Principal

1. Explorar o cenário.
2. Revelar memórias com o cajado.
3. Ouvir o griot ou falar com NPCs.
4. Encontrar um bloqueio narrativo: porta, passagem, vida esgotada, ritual, personagem.
5. Resolver um enigma usando pistas já vistas.
6. Receber recompensa de jogo e uma explicação curta de aprendizado.

## Tipos de Enigma

### Observação

Usado no começo da fase.

O jogador responde a algo que viu diretamente: um fóssil, uma pintura, uma ferramenta, uma paisagem.

Exemplo:
"A memória mostra ossos de pés e quadril. Que segredo eles guardam?"

### Comparação

Usado no meio da fase.

O jogador compara duas pistas: cenário atual versus memória ancestral, objeto versus uso, personagem versus ambiente.

Exemplo:
"Vês areia, mas a parede mostra hipopótamos. O que mudou?"

### Inferência

Usado no final da fase.

O jogador precisa concluir uma causa ou consequência histórica.

Exemplo:
"Se o ferro corta árvore, abre campo e faz canoa, que mudança ele permitiu?"

## Progressão de Dificuldade

### Fase 1.1 — Rift Memories

Foco: origem, bipedalismo, primeiras tecnologias, memória antes da escrita.

Dificuldade:
- 70% observação.
- 30% comparação.
- Sem inferência complexa.

### Fase 1.2 — Saara Verde

Foco: mudança climática, Saara úmido, Tassili, pastoreio.

Dificuldade:
- 30% observação.
- 50% comparação.
- 20% inferência.

### Fase 1.3 — Forja Bantu

Foco: ferro, agricultura, línguas Bantu, migração, canoa.

Dificuldade:
- 20% observação.
- 40% comparação.
- 40% inferência.

## Regras de Escrita

- A pergunta deve ser uma cena, não uma prova.
- Cada alternativa errada deve ser plausível para uma criança, mas historicamente falsa ou incompleta.
- A explicação deve ensinar depois da escolha, em 1 ou 2 frases.
- Não usar sempre a alternativa A.
- Em runtime, embaralhar as alternativas sempre.
- Evitar datas secas sem contexto. Preferir causa, pista visual e consequência.
- Manter "jogo-first": o enigma compra vida, abre passagem, dá ferramenta, desbloqueia NPC ou protege progresso.

## Estrutura de Dados

Cada enigma pode usar:

```js
{
  diff: 'fácil' | 'médio' | 'difícil',
  type: 'observação' | 'comparação' | 'inferência',
  scene: 'Texto curto que coloca Lucinha dentro da situação.',
  q: 'Pergunta central.',
  o: ['opção A', 'opção B', 'opção C', 'opção D'],
  c: 2,
  e: 'Explicação histórica curta.',
  reward: 'vida' | 'passagem' | 'cauris' | 'ferramenta'
}
```

## Critério de Qualidade

Um enigma está pronto quando:

- A resposta correta continua correta mesmo se mudar de posição.
- A criança consegue inferir a resposta por pistas do jogo.
- A explicação ensina algo novo sem virar aula longa.
- A recompensa altera o estado do jogo.
- A pergunta caberia numa cena de aventura.

## Exemplos de Tom

Fraco:
"Qual foi a primeira tecnologia da humanidade?"

Melhor:
"Lucinha encontra uma pedra com marcas de pancada. Ela não parece bonita, parece útil. O que essa pedra permitia fazer?"

Fraco:
"O Saara Verde existiu há quantos anos?"

Melhor:
"Na parede aparecem hipopótamos e nadadores. Do lado de fora, só areia. Que verdade essa pintura guarda?"

Fraco:
"Quantas línguas Bantu existem?"

Melhor:
"O linguista mostra palavras parecidas em aldeias distantes. O que isso revela sobre os povos Bantu?"
