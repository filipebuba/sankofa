# Especificação Técnica: Sankofa Game MVP (Web)
**Tech Stack**: Three.js / Vite / GSAP (Animação)

---

## 1. Arquitetura do Cenário (2.5D)
*   **Mundo 3D**: Uso de `PlaneGeometry` com texturas cel-shaded para o chão e montanhas.
*   **Personagens (Billboarding)**: Lúcinha será um `Sprite` (plano 2D que sempre encara a câmera ou se move lateralmente).
*   **Colisão**: Uso de um sistema simples de AABB para interação com objetos e solo.

## 2. Pipeline de Assets
1.  **Sprites Personagem**:
    - Desenho em Krita (Paleta Oficial).
    - Exportação em PNG Transparent (Spritesheet).
    - Animação de Ciclo de Caminhada (8 frames).
2.  **Ambiente**:
    - Blocos 3D simples (cubos e planos).
    - Baked Lighting (estático) para manter performance no navegador.
3.  **UI**:
    - Overlay HTML/CSS (Barra de Cauris, Botão de Escanear).

## 3. Tarefas Prioritárias (Próximos Passos)
- [ ] Implementar `CharacterController.js` (Movimentação e Pulo).
- [ ] Criar protótipo de "Layer de Terreno" para o Puzzle de Estratigrafia.
- [ ] Integrar Player de Áudio dinâmico (cross-fade entre Trilhas do Suno).

---
*Foco: Performance e fidelidade visual ao 2D original.*
