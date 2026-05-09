# Bateria de Testes — Sankofa Kids Studio (Gemini AI Studio)

> Cola um teste de cada vez na sessão Gemini.
> Verifica se output passa nos **critérios de aceitação**.
> Se falhar: ver "fix" sugerido.

---

## TESTE 0 — Sanity check (texto, fácil)

**Prompt**:
```
quem és tu e o que sabes fazer?
```

**Critérios de aceitação**:
- [ ] Responde em pt-BR
- [ ] Identifica-se como "Sankofa Kids Studio"
- [ ] Lista 9 tarefas que executa
- [ ] Menciona paleta oficial 13 cores
- [ ] Menciona 8 episódios
- [ ] **NÃO** se apresenta como "Gemini" ou "AI assistant genérico"

**Fix se falhar**: system instruction não foi aplicada. Recola no campo correto e abre nova sessão.

---

## TESTE 1 — Recusa fora do escopo

**Prompt**:
```
gera pokemon estilo cartoon
```

**Critérios**:
- [ ] **RECUSA** o pedido
- [ ] Justifica: Pokémon é IP Nintendo, não Sankofa
- [ ] Oferece alternativa (criatura mitologia africana)
- [ ] Mantém tom amigável, não rude

**Fix**: aumenta intensidade da regra "recusa pedidos fora do escopo" no system instruction.

---

## TESTE 2 — Pedido vago (clarificação)

**Prompt**:
```
gera lucinha
```

**Critérios**:
- [ ] **NÃO gera imagem direto**
- [ ] Pergunta: vista? expressão? pose?
- [ ] Sugere combo padrão recomendado
- [ ] Lista 2-3 opções

**Fix**: regra "pergunta antes de inventar" não está sendo seguida — reforçar no system.

---

## TESTE 3 — Geração de personagem (imagem, core)

**Prompt**:
```
gera lucinha vista de frente, t-pose neutra, expressão neutra com leve
sorriso, fundo branco puro, formato quadrado 1:1, padding 10% nas bordas
```

**Critérios**:
- [ ] Gera **imagem** (não só texto)
- [ ] Pele tom marrom escuro (skin-3 #7D5535) — NÃO branca, NÃO rosa pastel
- [ ] Cabelo crespo curto preto
- [ ] Caminha ereta sobre dois pés (não de quatro)
- [ ] Roupa: envoltório folha verde simples
- [ ] Estilo 2D flat, traço grosso preto
- [ ] **NÃO** Disney 3D, NÃO anime, NÃO realista
- [ ] Cores quentes (terra/ocre/savana) — NÃO azul/cinza
- [ ] Proporção 4 cabeças (cartoon infantil)

**Fix**: se sair realista → adiciona "FLAT 2D, CARTOON, KIRIKOU STYLE, NO 3D" no início. Se cor errada → re-anexa `art/palette/sankofa-kids.png` como input.

---

## TESTE 4 — Geração de Vovó Sankofa (pose icônica)

**Prompt**:
```
gera vovó sankofa em pose icônica: voa para frente em perfil lateral
mas pescoço dobrado 180 graus olhando para trás (símbolo Adinkra
Sankofa), asas abertas, fundo branco, formato quadrado
```

**Critérios**:
- [ ] Pássaro com penas douradas + asas terracota + peito ocre
- [ ] **PESCOÇO VIRADO PARA TRÁS** (chave do símbolo)
- [ ] Bico longo curvo branco
- [ ] Coroa pequena de penas na testa
- [ ] Olhar amigável, NÃO ameaçador
- [ ] Estilo cartoon kid-friendly

**Fix**: se pescoço normal → reforça "neck rotated 180 degrees backward, looking over shoulder, Sankofa Akan symbol pose, head facing opposite direction of body".

---

## TESTE 5 — Background sem personagens

**Prompt**:
```
gera cenário ep1 vale do rift: savana etiópica com baobá gigante
centralizado, sem personagens, formato 16:9 horizontal, paleta oficial
```

**Critérios**:
- [ ] Aspect 16:9 horizontal
- [ ] **SEM personagens** (limpo para compose)
- [ ] Baobá gigante visível
- [ ] Savana cor #6A8530
- [ ] Céu gradiente #A8693D → #D9B95A
- [ ] Montanhas distantes
- [ ] Estilo flat 2D ilustração
- [ ] **NÃO** foto realista, NÃO 3D render

**Fix**: se aparecer pessoa → "EMPTY landscape, NO characters, NO people, NO animals — clean background plate for animation overlay".

---

## TESTE 6 — Fragmento do jogo

**Prompt**:
```
gera fragmento do jogo sankofa: bronzes do benin (cabeças de bronze
do reino do benin/nigéria). formato quadrado, símbolo educativo
centralizado, fundo cor temática, estilo cartoon
```

**Critérios**:
- [ ] Aspect 1:1 quadrado
- [ ] Cabeça de bronze estilizada (não realista)
- [ ] Centralizada
- [ ] Fundo cor temática (terracota/bronze)
- [ ] Estilo cartoon Sankofa
- [ ] Educativo, não enfeite genérico

---

## TESTE 7 — Storyboard frame

**Prompt**:
```
gera frame storyboard ep1 cena 4: lucinha caminhando lateralmente,
perfil, dando primeiro passo firme, baobá ao fundo, indicar com setas
direção do movimento. anota direção de câmera e duração estimada.
```

**Critérios**:
- [ ] Imagem mostra Lucinha em perfil andando
- [ ] Setas/anotações direção movimento
- [ ] **Texto adicional**: tipo de plano (LS/MS/CU), duração em segundos
- [ ] Estilo de **rascunho** storyboard (linhas mais soltas que arte final)

---

## TESTE 8 — Narração TTS-ready (texto)

**Prompt**:
```
formata o seguinte trecho de narração da vovó sankofa para edge tts
(microsoft) com marcações de pausa, ênfase e velocidade:

"olá criança! eu sou a vovó sankofa. vem comigo voltar muito atrás
no tempo. três milhões e duzentos mil anos atrás. imagina!"
```

**Critérios**:
- [ ] Output em texto formatado
- [ ] Marcações [pausa-curta], [pausa-longa], *ênfase*
- [ ] Marcação tom (ex: [tom-carinhoso])
- [ ] Compatível com SSML ou markup Edge TTS
- [ ] Português corrigido (pontuação adequada)

---

## TESTE 9 — Lista SFX

**Prompt**:
```
lista os sfx necessários para o ep4 (zimbi/grande zimbabwe) com
busca otimizada no freesound.org. inclui CC0/CC-BY filter sugerido.
```

**Critérios**:
- [ ] Lista numerada
- [ ] Cada SFX tem: descrição + tempo + termo de busca freesound
- [ ] Inclui filtro CC0/CC-BY
- [ ] Cobre cena por cena (não genérico)
- [ ] Identifica reuso de EP1 quando aplicável

---

## TESTE 10 — Adaptar prompt Suno

**Prompt**:
```
refina o prompt suno da cantiga ep5 (adesua/benin) para mais
especificidade regional edo nigeriana. mantém os lyrics existentes.
sugere variação para versão karaoke (sem voz lead, só coro).
```

**Critérios**:
- [ ] Style block mais detalhado (instrumentos edo específicos)
- [ ] Mantém lyrics intactas
- [ ] Versão karaoke incluída
- [ ] **NÃO** sugere alternativas a Suno (regra do system instruction)
- [ ] Exclude Styles também enriquecido

**Fix se sugerir alternativa**: regra "música é Suno sempre" não foi seguida. Reforça no system.

---

## TESTE 11 — Legenda SRT (com aviso de limitação)

**Prompt**:
```
gera legenda srt do ep1 em inglês, baseado no script da narração que
me passaste antes. timecodes estimados.
```

**Critérios**:
- [ ] Output em formato SRT válido (numeração, timecodes 00:00:00,000 → 00:00:00,000, texto)
- [ ] Tradução en correta
- [ ] **AVISO explícito**: timecodes são estimativa sem áudio real
- [ ] Sugere usar Whisper depois para timing real

---

## TESTE 12 — Tradução kriol-gb

**Prompt**:
```
traduz a moral do ep8 (cabralzinho) para kriol-gb (crioulo guineense):

"sankofa. volta. e. busca. cabral, lumumba, mandela, neto — cada
criança que aprende esses nomes carrega o sonho deles."
```

**Critérios**:
- [ ] Tradução em kriol-gb (não pt-PT genérico)
- [ ] Mantém ritmo cantável
- [ ] Mantém nomes próprios intactos
- [ ] Avisa se incerto sobre alguma palavra

---

## TESTE 13 — Consistência cross-personagem (difícil)

**Prompt**:
```
gera os 8 protagonistas em uma única ilustração, lado a lado, todos
em pose neutra frontal, mesmo estilo unificado. ordem: lucinha, hatshé,
musinho, zimbi, adesua, nzinguinha, dandarinha, cabralzinho.
```

**Critérios**:
- [ ] **8 personagens visíveis** (pode ser difícil para Gemini)
- [ ] Cada um identificável pelos atributos canônicos
- [ ] Estilo consistente entre todos
- [ ] Mesma proporção e estética

**Nota**: este é o **teste mais difícil**. Gemini pode falhar (gerar 5-6 só, ou misturar atributos). Se falhar, gerar individualmente em sessão única e compor depois no Krita.

---

## TESTE 14 — Drift detection

**Prompt** (depois de gerar várias imagens):
```
gera de novo a lucinha frente neutra, exatamente igual à primeira que
geraste nesta sessão. compara as duas se possível.
```

**Critérios**:
- [ ] Tenta manter consistência
- [ ] Se driftar, **reconhece** drift e oferece refazer com âncora visual
- [ ] Sugere usar imagem anterior como input ("match this style")

**Limitação conhecida**: Gemini não tem character lock. Drift é normal. Solução: gerar tudo numa sessão + reutilizar primeira imagem como referência visual em todos os pedidos seguintes.

---

## TESTE 15 — Stress test paleta

**Prompt**:
```
gera lucinha mas usando azul royal e roxo neon nas roupas
```

**Critérios**:
- [ ] **RECUSA** ou **AVISA** que viola paleta oficial
- [ ] Sugere cores compatíveis (terracota, ouro, savana)
- [ ] Se gerar mesmo assim, marca como "fora da bíblia visual"

**Fix**: regra "paleta oficial inviolável" não foi seguida — reforçar.

---

## Score final

Conta os ✓:
- **15-13 acertos**: agente pronto para produção
- **12-10 acertos**: refinar 2-3 regras do system instruction
- **9 ou menos**: revisar system instruction inteiro, talvez quebrar em prompts especializados

---

## Iteração rápida

Se um teste falhar:
1. Identifica regra violada
2. Re-edita system instruction reforçando aquela regra com **MAIÚSCULAS** e **negative prompt**
3. Abre nova sessão (system instruction só carrega no início)
4. Reroda só o teste que falhou

---

CC BY-SA 4.0 — Sankofa Educa.
