# Áudio — Motor de Instrumentos Africanos

O Sankofa não usa amostras de áudio. Todos os sons são **sintetizados em tempo real**
via Web Audio API, em `src/audio.js`. Isto mantém o jogo leve, livre de questões de
licença e funcional offline.

## Instrumentos modelados

| Instrumento  | Origem / referência                        | Síntese                                                      |
|--------------|--------------------------------------------|--------------------------------------------------------------|
| Djembe       | África Ocidental (mandinga)                | Seno com glide grave + ruído filtrado (ataque de pele)       |
| Talking drum | Dùndún (ioruba) / África Ocidental         | Seno com pitch-bend rápido + sub-harmônico                   |
| Kalimba      | Mbira (xona, zimbabué) e variantes         | Síntese FM (carrier sine + modulator decay)                  |
| Balafon      | Mande (Mali, Guiné, Burkina Faso)          | Triângulo + parcial sine 4ª, decay curto e amadeirado        |
| Agogô / sino | Iorubá (Nigéria) / candomblé brasileiro    | Três parciais inarmônicos (1, 2.76, 5.4)                     |
| Shaker       | Caxixi / ganzá / hochet                    | Ruído branco filtrado (highpass + bandpass)                  |

A escala usada é **pentatônica menor em Lá** (A4, C5, D5, E5, G5, A5, C6) — afinação
comum em mbiras e balafons.

## Mapeamento de eventos

| Evento          | Instrumento(s)                                          | Intenção                                   |
|-----------------|---------------------------------------------------------|--------------------------------------------|
| `click`         | Kalimba aguda (1 nota)                                  | Toque leve de UI                           |
| `navigate`      | Kalimba 2 notas ascendentes                             | Mudança de tela                            |
| `select`        | Balafon                                                 | Abrir um enigma                            |
| `hint`          | Shaker x2                                               | Dica revelada                              |
| `wrong`         | Djembe bass + tom                                       | Resposta incorreta, sem agressividade      |
| `correct`       | Talking drum subindo + djembe + balafon shimmer         | Acerto                                     |
| `fragment`      | Balafon arpejo + djembe                                 | Fragmento recolhido                        |
| `achievement`   | Sino + balafon + rufle de djembe                        | Conquista desbloqueada                     |
| `levelUp`       | Trio de talking drums + balafon agudo                   | Subiu de nível                             |
| `dailyOpen`     | Sino + kalimba                                          | Abrir desafio diário                       |
| Ambiente        | Djembe lento + shaker offbeat + kalimba esparsa         | Loop opcional na landing (toggle 🥁)       |

## Controles na UI

- **🔊 / 🔇** (canto superior direito): som global on/off.
- **🥁** (à esquerda do anterior): tambor ambiente on/off. Some quando o som global
  está desligado.

## Ajustar / estender

A API exposta em `window.SankofaAudio`:

```js
SankofaAudio.unlock();              // chamar no primeiro gesto do usuário
SankofaAudio.play("correct");       // dispara um evento
SankofaAudio.setMuted(true);        // mudo global
SankofaAudio.startAmbient();        // tambor de fundo
SankofaAudio.stopAmbient();
```

Para tocar diretamente um instrumento (em desenvolvimento, no console):

```js
// Padrões internos não exportados; editar src/audio.js para acrescentar variantes.
```

A skill **`sankofa-tune-audio`** (em `.claude/skills/`) guia mudanças de timbre,
duração, volume e mapeamento de eventos.

## Diretrizes de uso

- **Nunca** mascare leitura. Som é decoração, não dependência.
- Toda interação relevante tem feedback visual equivalente (toast, animação, cor).
- Volume mestre fica em ~0.85; eventos individuais em 0.18–0.6.
- O ambiente não deve cobrir a leitura — fica em ~0.16–0.32.
- Em telas de leitura longa (resultado, contexto) evite disparar mais de 1 evento.

## Próximos passos

- Paleta sonora por mundo (Mundo 1 = Origens com djembe; Mundo 2 = Nilo com flauta
  ney sintetizada; Mundo 3 = Sahel com kora sintetizada; etc.).
- Detecção de redução de movimento / preferências de som no sistema.
- Exportar gravação curta (WAV) do mosaico completo como "selo sonoro" do mundo.
