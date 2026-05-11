#!/usr/bin/env bash
# Render PNG sequence + audio mix → master MP4 16:9 + 9:16 vertical.
# Usage: ./scripts/render_ep.sh ep1
# Requires: ffmpeg installed.

set -euo pipefail

EP="${1:-ep1}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FRAMES_DIR="$ROOT/renders/$EP"
AUDIO_MIX="$ROOT/audio/masters/${EP}-mix.wav"
OUT_16x9="$ROOT/exports/youtube-16x9/${EP}-master.mp4"
OUT_9x16="$ROOT/exports/reels-9x16/${EP}-reel.mp4"
OUT_9x16_TIKTOK="$ROOT/exports/tiktok-9x16/${EP}-tiktok.mp4"

if [ ! -d "$FRAMES_DIR" ]; then
  echo "ERRO: pasta $FRAMES_DIR não existe"
  exit 1
fi

if [ ! -f "$AUDIO_MIX" ]; then
  echo "ERRO: mix de áudio $AUDIO_MIX não existe"
  exit 1
fi

mkdir -p "$(dirname "$OUT_16x9")" "$(dirname "$OUT_9x16")" "$(dirname "$OUT_9x16_TIKTOK")"

echo "[1/3] Render YouTube 16:9 (1920x1080 @ 24fps H.264)..."
ffmpeg -y \
  -framerate 24 \
  -i "$FRAMES_DIR/frame_%05d.png" \
  -i "$AUDIO_MIX" \
  -c:v libx264 -pix_fmt yuv420p -crf 18 -preset medium \
  -c:a aac -b:a 320k -ar 48000 \
  -shortest \
  -movflags +faststart \
  "$OUT_16x9"

echo "[2/3] Render Reels 9:16 (1080x1920 — crop centro)..."
ffmpeg -y \
  -i "$OUT_16x9" \
  -vf "crop=ih*9/16:ih,scale=1080:1920" \
  -c:v libx264 -pix_fmt yuv420p -crf 20 -preset medium \
  -c:a aac -b:a 256k \
  -movflags +faststart \
  "$OUT_9x16"

echo "[3/3] Render TikTok 9:16 (idêntico Reels, container otimizado)..."
cp "$OUT_9x16" "$OUT_9x16_TIKTOK"

echo
echo "Done."
echo "  YouTube : $OUT_16x9"
echo "  Reels   : $OUT_9x16"
echo "  TikTok  : $OUT_9x16_TIKTOK"
