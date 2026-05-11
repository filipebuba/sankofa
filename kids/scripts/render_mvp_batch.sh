#!/bin/bash
# Batch render EP2-8 MVP videos using v5 recipe.
# Reusable: each episode gets bg + protagonist + Vovó + Fred overlays.

set -e
cd "$(dirname "$0")/.."

FONT="/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
VV="art/characters/vovo-sankofa/vovo-fly-cutout.png"
FR="art/characters/fred-fossil/fred-front-cutout.png"

# Episode metadata: ep#|protagonist|cutout|bg-day|bg-alt|title|tagline|cantiga-line|curiosity
EPS=(
  "2|hatshe|art/characters/hatshe/hatshe-front-cutout.png|art/backgrounds/ep2-karnak-MASTER.png|art/backgrounds/ep2-karnak-MASTER.png|Hatshepsut|A faraó-mulher do Egito|♪ Hat-she! Hat-she! ♪|Curiosidade: Hatshepsut governou 22 anos como faraó"
  "3|musinho|art/characters/musinho/musinho-front-cutout.png|art/backgrounds/ep3-tombuctu-MASTER.png|art/backgrounds/ep3-tombuctu-MASTER.png|Mansa Musa|O imperador mais rico da história|♪ Man-sa Mu-sa! ♪|Curiosidade: Mansa Musa peregrinou a Meca em 1324"
  "4|zimbi|art/characters/zimbi/zimbi-front-cutout.png|art/backgrounds/ep4-grande-zimbabwe-MASTER.png|art/backgrounds/ep4-grande-zimbabwe-MASTER.png|Zimbi|O Grande Zimbabwe de pedra|♪ Zim-bi, Zim-bi ♪|Curiosidade: Grande Zimbabwe foi capital de 11.000 pessoas"
  "5|adesua|art/characters/adesua/adesua-front-cutout.png|art/backgrounds/ep5-benin-foundry-MASTER.png|art/backgrounds/ep5-benin-foundry-MASTER.png|Adesua|Os Bronzes do Benin|♪ Ade-sua, A-de-sua ♪|Curiosidade: bronzes do Benin foram pilhados em 1897"
  "6|nzinguinha|art/characters/nzinguinha/nzinguinha-front-cutout.png|art/backgrounds/ep6-corte-ndongo-MASTER.png|art/backgrounds/ep6-corte-ndongo-MASTER.png|Nzinguinha|A rainha guerreira de Angola|♪ Nzin-ga, Nzin-ga ♪|Curiosidade: Rainha Nzinga lutou 30 anos contra Portugal"
  "7|dandarinha|art/characters/dandarinha/dandarinha-front-cutout.png|art/backgrounds/ep7-palmares-MASTER.png|art/backgrounds/ep7-palmares-MASTER.png|Dandarinha|A guerreira de Palmares|♪ Dan-da-ra! ♪|Curiosidade: Dandara liderou Palmares ao lado de Zumbi"
  "8|cabralzinho|art/characters/cabralzinho/cabralzinho-front-cutout.png|art/backgrounds/ep8-bissau-MASTER.png|art/backgrounds/ep8-bissau-MASTER.png|Cabralzinho|Amílcar Cabral, o sonhador|♪ Ca-bral, Ca-bral ♪|Curiosidade: Amílcar Cabral libertou Guiné-Bissau em 1973"
)

for line in "${EPS[@]}"; do
  IFS='|' read -r EP CHAR CUT BGD BGA TITLE TAG CANT CURI <<< "$line"
  AUDIO="audio/masters/ep${EP}-mix-rough.mp3"
  OUT="exports/youtube-16x9/ep${EP}-mvp.mp4"

  if [ ! -f "$AUDIO" ]; then echo "SKIP ep$EP: no audio"; continue; fi
  if [ ! -f "$CUT" ]; then echo "SKIP ep$EP: no cutout"; continue; fi
  if [ ! -f "$BGD" ]; then echo "SKIP ep$EP: no bg"; continue; fi

  DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$AUDIO" | awk '{printf "%d", $1+0.5}')
  echo ""
  echo "=== EP$EP $TITLE — dur=${DUR}s ==="

  ffmpeg -y \
    -loop 1 -t $DUR -i "$BGD" \
    -loop 1 -i "$CUT" \
    -loop 1 -i "$VV" \
    -loop 1 -i "$FR" \
    -i "$AUDIO" \
    -filter_complex "
[0:v]scale=2400:2400:force_original_aspect_ratio=increase,zoompan=z='min(zoom+0.0005,1.20)':d=${DUR}*24:fps=24:s=1920x1080:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)',setsar=1,format=yuv420p[bg];
[1:v]scale=-1:600,format=rgba[ch];
[2:v]scale=320:-1,format=rgba[vv];
[3:v]scale=-1:700,format=rgba[fr];
[bg][ch]overlay=x='if(between(t,25,55),100+(W-overlay_w-200)*((t-25)/30),W-overlay_w-150)+sin(t*3)*15':y='H-overlay_h-60+sin(t*6)*8':enable='between(t,25,55)+between(t,100,150)'[bg2];
[bg2][vv]overlay=x='80+sin(t*1.5)*20':y='80+sin(t*4)*12':enable='between(t,4,25)+between(t,100,148)'[bg3];
[bg3][fr]overlay=x='(W-overlay_w)/2+sin(t*8)*30':y='H-overlay_h-40+abs(sin(t*5))*-25':enable='between(t,${DUR}-19,${DUR}-4)'[mix];
[mix]format=yuv420p,
drawbox=x=0:y=930:w=1920:h=150:color=#1F1408@0.65:t=fill:enable='between(t,30,42)+between(t,100,112)+between(t,${DUR}-19,${DUR}-12)+between(t,${DUR}-9,${DUR}-1)',
drawtext=fontfile=${FONT}:text='SANKOFA KIDS':fontsize=84:fontcolor=#EDE5D5:bordercolor=#1F1408:borderw=4:x=(w-text_w)/2:y=h*0.30:enable='between(t,0.5,3.5)',
drawtext=fontfile=${FONT}:text='Episódio ${EP}':fontsize=56:fontcolor=#D9B95A:bordercolor=#1F1408:borderw=3:x=(w-text_w)/2:y=h*0.45:enable='between(t,0.8,3.5)',
drawtext=fontfile=${FONT}:text='${TITLE} — ${TAG}':fontsize=44:fontcolor=#EDE5D5:bordercolor=#1F1408:borderw=3:x=(w-text_w)/2:y=h*0.55:enable='between(t,1.0,3.5)',
drawtext=fontfile=${FONT}:text='${TITLE}':fontsize=46:fontcolor=#D9B95A:x=(w-text_w)/2:y=h-100:enable='between(t,30,42)',
drawtext=fontfile=${FONT}:text='${CANT}':fontsize=44:fontcolor=#D9B95A:bordercolor=#1F1408:borderw=3:x=(w-text_w)/2:y=h*0.10:enable='between(t,62,92)',
drawtext=fontfile=${FONT}:text='Sankofa\: volta e busca':fontsize=46:fontcolor=#D9B95A:x=(w-text_w)/2:y=h-100:enable='between(t,100,112)',
drawtext=fontfile=${FONT}:text='Fred Fóssil entra em cena!':fontsize=46:fontcolor=#D9B95A:x=(w-text_w)/2:y=h-100:enable='between(t,${DUR}-19,${DUR}-12)',
drawtext=fontfile=${FONT}:text='${CURI}':fontsize=38:fontcolor=#EDE5D5:x=(w-text_w)/2:y=h-100:enable='between(t,${DUR}-9,${DUR}-1)',
drawtext=fontfile=${FONT}:text='sankofa.education':fontsize=24:fontcolor=#D9B95A@0.7:x=w-text_w-30:y=h-text_h-20:enable='gte(t,4)'
[v]" -map "[v]" -map 4:a -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -t $DUR "$OUT" 2>&1 | tail -3
  echo "OK ep$EP -> $OUT"
done

echo ""
echo "=== BATCH DONE ==="
ls -lh exports/youtube-16x9/
