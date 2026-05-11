# Lista de Assets: Mundo 1 — "Memórias do Rift"
**Estratégia**: Reciclagem Transmídia do Episódio 1 (Vídeo → Jogo)

Este documento mapeia todos os elementos visuais e sonoros criados para a animação do Episódio 1 que devem ser transformados em sprites e objetos para o jogo 2.5D.

---

## 1. Sprites de Personagens (2D Flat)
*Extraídos dos Model Sheets e frames da animação.*

| Asset | Descrição | Status (EP1) |
|---|---|---|
| **Lucinha (Walk Cycle)** | Ciclo de caminhada de 8 frames (estilo saltitante). | ✅ Pronto |
| **Lucinha (Jump)** | 3 frames: Impulso, Ápice (flip) e Aterrissagem. | ✅ Pronto |
| **Lucinha (Scan)** | Animação dela batendo o cajado no chão. | ⏳ Criar a partir de pose |
| **Vovó Sankofa (NPC)** | Pousada em um galho, piscando e olhando para trás. | ✅ Pronto |
| **Fred Fóssil (UI/Dica)** | Cabeça do Fred aparecendo no canto da tela para dar dicas. | ✅ Pronto |
| **Tropa de Irmãos** | Sprites estáticos para preencher o fundo da savana. | ✅ Pronto |

---

## 2. Sprites de Ambiente (Props)
*Usados para compor o cenário 3D no Three.js.*

| Asset | Descrição | Uso no Jogo |
|---|---|---|
| **Baobá Gigante** | Árvore ícone do EP1. | Obstáculo / Ponto de sombra. |
| **Rochas do Rift** | 3 variações de rochas sedimentares. | Plataformas de pulo. |
| **Grama de Savana** | Pequenos tufos de grama (#6a8530). | Decoração de solo. |
| **Paredão de Solo** | Textura com camadas coloridas (estratigrafia). | Puzzle 1 (Escaneamento). |
| **Nuvens Stylized** | Nuvens planas da paleta oficial. | Background Parallax. |

---

## 3. Itens e Colecionáveis (Fragmentos)
*Itens que a Lúcinha coleta ou interage.*

| Asset | Descrição | Função |
|---|---|---|
| **Cauris** | Moeda dourada com brilho. | Pontuação / Recompensa. |
| **Pedra Chopper** | Pedra lascada rústica. | Fragmento de Memória 1. |
| **Mandíbula Fóssil** | Osso fofo do Fred (referência). | Fragmento de Memória 2. |
| **Pintura de Búfalo** | Textura de pintura rupestre. | Fragmento de Memória 3. |
| **Cajado Sankofa** | Objeto que a Lúcinha carrega. | Ferramenta de interação. |

---

## 4. Áudio e Voz (Sound Assets)
*Reciclados da narração do ElevenLabs e trilhas do Suno.*

| Asset | Descrição | Trigger no Jogo |
|---|---|---|
| **Voz Vovó: "Olá!"** | Saudação inicial. | Ao iniciar o nível. |
| **Voz Vovó: "Mãos livres!"** | Comentário pedagógico. | Ao coletar item. |
| **Trilha Loop (Suno)** | Kalimba + Djembe suave. | Música de exploração. |
| **SFX: "Whoosh"** | Som de vento/reverso. | Ao realizar Dash/Salto. |
| **SFX: "Pulse"** | Vibração rítmica. | Próximo a fragmentos. |

---

## 5. Elementos de Interface (UI)
*Estilo flat para overlay.*

- [ ] **Ícone de Coração**: Vida (Sankofa Energia).
- [ ] **Barra de Progresso**: Estilo "Trilha de Pegadas".
- [ ] **Moldura de Diálogo**: Papiro ou textura de terra com bordas grossas.

---
*Próximo Passo: Exportar os arquivos PNG do Krita com as dimensões corretas para o Three.js.*
