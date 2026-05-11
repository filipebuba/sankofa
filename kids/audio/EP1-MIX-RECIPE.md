# EP1 — Receita de Mix (timecodes reais)

> Importa em DaVinci Resolve Fairlight ou Audacity.
> Todos os timecodes calculados das durações reais dos stems.
> Total: 03:00 (faltam 30s para meta 3:30 — espalhar em pausas extras + cantiga estendida).

---

## Tracks (5)

| Track | Conteúdo | Pan | Loudness alvo |
|---|---|---|---|
| T1 — Voz | 10 stems narração | center | -16 LUFS |
| T2 — Música base | trilha loop background | wide stereo | -23 LUFS |
| T3 — Cantiga | refrão Lucy cena 5 | center | -16 LUFS |
| T4 — SFX | vento, cigarras, kalimba sting | wide | -28 LUFS ambiente, -20 pontual |
| T5 — Sting | kalimba final | wide | -18 LUFS |

---

## Timeline cena por cena

| TC | Track | Arquivo | Duração | Volume |
|---|---|---|---|---|
| 00:00 | T2 | `audio/music/ep1-trilha-loop-v3.mp3` (loop até 3:00) | 180s loop | -23 LUFS background |
| 00:00 | T1 | `voice/ep1-stems/01-cena1-abertura.mp3` | 7.3s | -16 LUFS |
| 00:08 | T1 | `voice/ep1-stems/02-cena2-volta-tempo.mp3` | 16.2s | -16 |
| 00:08 | T4 | SFX whoosh + cigarras (Freesound) | 17s ambiente | -22 |
| 00:25 | T1 | `voice/ep1-stems/03-cena3-apresentacao.mp3` | 11.6s | -16 |
| 00:38 | T1 | `voice/ep1-stems/04-cena4-caminhar.mp3` | 21.5s | -16 |
| 00:38 | T4 | SFX passos deliberados | 5s pontual | -20 |
| 01:00 | T1 | `voice/ep1-stems/05-cena5-intro-cantiga.mp3` | 2s | -16 |
| 01:03 | T2 | duck trilha (-30dB durante cantiga) | 30s | duck |
| 01:03 | T3 | `audio/music/ep1-cantiga-lucy-v1.mp3` (CORTAR a 30s, fade in/out) | 30s | -16 LUFS frente |
| 01:33 | T2 | unduck trilha | — | volta -23 |
| 01:33 | T1 | `voice/ep1-stems/06-cena6-descoberta.mp3` | 20.8s | -16 |
| 01:54 | T1 | `voice/ep1-stems/07-cena7-conexao.mp3` | 18.5s | -16 |
| 02:13 | T1 | `voice/ep1-stems/08-cena8-moral.mp3` | 19.1s | -16 |
| 02:32 | T1 | `voice/ep1-stems/09-cena9-fred.mp3` | 9.1s | -16 |
| 02:32 | T4 | SFX boing-cartoon entrada Fred | 0.5s | -18 |
| 02:42 | T1 | `voice/ep1-stems/10-cena10-fim.mp3` | 1.7s | -16 |
| 02:44 | T2 | fade out trilha (linear 4s) | — | -∞ |
| 02:44 | T5 | `audio/music/ep1-sting-final-v1.mp3` (cortar a 16s) | 16s | -18 LUFS wide |
| 03:00 | — | FIM (silêncio respiração) | — | — |

---

## Comandos ffmpeg (quando instalado)

### Concat narração com pausas precisas:

```bash
# Criar lista temp com silêncios entre cenas
cat > /tmp/concat.txt <<EOF
file 'audio/voice/ep1-stems/01-cena1-abertura.mp3'
file '/tmp/silence-1s.mp3'
file 'audio/voice/ep1-stems/02-cena2-volta-tempo.mp3'
file '/tmp/silence-1s.mp3'
file 'audio/voice/ep1-stems/03-cena3-apresentacao.mp3'
file '/tmp/silence-1s.mp3'
file 'audio/voice/ep1-stems/04-cena4-caminhar.mp3'
file '/tmp/silence-2s.mp3'
file 'audio/voice/ep1-stems/05-cena5-intro-cantiga.mp3'
file '/tmp/silence-30s.mp3'
file 'audio/voice/ep1-stems/06-cena6-descoberta.mp3'
file '/tmp/silence-1s.mp3'
file 'audio/voice/ep1-stems/07-cena7-conexao.mp3'
file '/tmp/silence-1s.mp3'
file 'audio/voice/ep1-stems/08-cena8-moral.mp3'
file '/tmp/silence-1s.mp3'
file 'audio/voice/ep1-stems/09-cena9-fred.mp3'
file '/tmp/silence-2s.mp3'
file 'audio/voice/ep1-stems/10-cena10-fim.mp3'
EOF

# Gerar silêncios
ffmpeg -f lavfi -i anullsrc=r=24000:cl=mono -t 1 /tmp/silence-1s.mp3
ffmpeg -f lavfi -i anullsrc=r=24000:cl=mono -t 2 /tmp/silence-2s.mp3
ffmpeg -f lavfi -i anullsrc=r=24000:cl=mono -t 30 /tmp/silence-30s.mp3

# Concat narração com pausas
ffmpeg -f concat -safe 0 -i /tmp/concat.txt -c copy audio/voice/ep1-narracao-completa.mp3
```

### Mix narração + trilha + cantiga + sting:

```bash
ffmpeg \
  -i audio/voice/ep1-narracao-completa.mp3 \
  -i audio/music/ep1-trilha-loop-v3.mp3 \
  -i audio/music/ep1-cantiga-lucy-v1.mp3 \
  -i audio/music/ep1-sting-final-v1.mp3 \
  -filter_complex "
    [0:a]volume=1.0[voz];
    [1:a]aloop=loop=-1:size=2e+09,volume=0.25,atrim=0:180[trilha];
    [2:a]atrim=0:30,afade=t=in:st=0:d=0.5,afade=t=out:st=29:d=1,adelay=63000|63000,volume=1.0[cantiga];
    [3:a]atrim=0:16,adelay=164000|164000,volume=0.6[sting];
    [voz][trilha][cantiga][sting]amix=inputs=4:duration=longest:dropout_transition=2[mix]
  " \
  -map "[mix]" \
  -ac 2 -ar 48000 -b:a 320k \
  audio/masters/ep1-mix-rough.mp3
```

---

## Para instalar ffmpeg (escolhe um):

**WSL Ubuntu/Debian** (precisa sudo):
```bash
sudo apt update && sudo apt install -y ffmpeg
```

**Windows** (sem WSL):
- Download: https://www.gyan.dev/ffmpeg/builds/
- Extrair → adicionar `bin/` ao PATH do sistema

**Static binary direto** (sem sudo):
```bash
mkdir -p ~/bin && cd ~/bin
curl -L -o ffmpeg.tar.xz https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz
tar xf ffmpeg.tar.xz --strip-components=1 --wildcards '*/ffmpeg' '*/ffprobe'
echo 'export PATH=$HOME/bin:$PATH' >> ~/.bashrc && source ~/.bashrc
```

---

## Alternativa GUI (sem command-line)

### DaVinci Resolve (grátis)
1. Importar todos arquivos `.mp3` em Media Pool
2. Criar timeline 24fps
3. Arrastar para tracks conforme tabela acima
4. Aplicar ducking automático em T2 quando T3 toca
5. Master: Fairlight tab → Loudness → -16 LUFS integrated
6. Export → MP3 320 kbps OU WAV 48k 24-bit → `audio/masters/ep1-mix.wav`

### Audacity (grátis, leve)
1. File → Import → Audio (todos os MP3)
2. Cada track aparece como faixa
3. Arrastar com Time Shift Tool conforme timecodes
4. Effect → Amplify (ajustar volumes)
5. Mix → Mix and Render
6. File → Export Audio → MP3

---

CC BY-SA 4.0 — Sankofa Educa.
