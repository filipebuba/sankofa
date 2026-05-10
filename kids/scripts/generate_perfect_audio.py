"""Generate special Vovó audio for perfect completion."""
import json, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ENV = {}
for line in (ROOT / ".env").read_text().splitlines():
    if "=" in line: k,v=line.split("=",1); ENV[k.strip()]=v.strip()

text = ("Tu encontraste todas as memórias do Rift sem perder uma vida. "
        "És uma verdadeira arqueóloga do Sankofa! "
        "Eu, Vovó Sankofa, presenteio-te com o código secreto: "
        "RIFT dois mil e vinte e seis. "
        "Guarda-o bem. Volta. E. Busca. Até à próxima aventura, jovem.")

body = json.dumps({
    "text": text, "model_id": "eleven_flash_v2_5",
    "voice_settings": {"stability":0.70,"similarity_boost":0.75,"style":0.45,"use_speaker_boost":True}
}).encode()
req = urllib.request.Request(
    "https://api.elevenlabs.io/v1/text-to-speech/nuE5FWBCfLcIqaRgrTaz?output_format=mp3_44100_128",
    data=body, headers={"xi-api-key":ENV["ELEVENLABS_API_KEY"],"Content-Type":"application/json"},
    method="POST")
out = ROOT / "game/assets/vovo-perfect.mp3"
with urllib.request.urlopen(req, timeout=60) as r:
    out.write_bytes(r.read())
print(f"{out}: {out.stat().st_size} bytes ({len(text)} chars)")
