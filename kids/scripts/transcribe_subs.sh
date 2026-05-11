#!/usr/bin/env bash
# Auto-transcribe narration → SRT subtitle file via OpenAI Whisper (local).
# Usage: ./scripts/transcribe_subs.sh ep1
# Install: pip install openai-whisper

set -euo pipefail

EP="${1:-ep1}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VOICE="$ROOT/audio/voice/${EP}-narracao.wav"
OUT_DIR="$ROOT/subs/pt-BR"
OUT_FILE="$OUT_DIR/${EP}.srt"

mkdir -p "$OUT_DIR"

if [ ! -f "$VOICE" ]; then
  echo "ERRO: $VOICE não existe"
  exit 1
fi

echo "Transcrevendo $VOICE com Whisper (modelo medium, pt-BR)..."
whisper "$VOICE" \
  --model medium \
  --language pt \
  --output_format srt \
  --output_dir "$OUT_DIR"

# whisper salva como ${VOICE_BASENAME}.srt — renomear
BASENAME=$(basename "$VOICE" .wav)
if [ -f "$OUT_DIR/${BASENAME}.srt" ]; then
  mv "$OUT_DIR/${BASENAME}.srt" "$OUT_FILE"
fi

echo "Done: $OUT_FILE"
echo "REVISÃO MANUAL OBRIGATÓRIA — Whisper erra nomes próprios (Lucinha, Sankofa, Adinkra)."
