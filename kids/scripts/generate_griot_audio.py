"""Generate 3 griot audio clips via ElevenLabs for game/assets/griot/."""
import json
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ENV = {}
for line in (ROOT / ".env").read_text().splitlines():
    if "=" in line:
        k, v = line.split("=", 1)
        ENV[k.strip()] = v.strip()
API_KEY = ENV["ELEVENLABS_API_KEY"]
VOICE = "nuE5FWBCfLcIqaRgrTaz"
MODEL = "eleven_flash_v2_5"

OUT = ROOT / "game/assets/griot"
OUT.mkdir(parents=True, exist_ok=True)

GRIOTS = {
    "fossil": "A Lúcia caminhou aqui há 3 milhões de anos. Seus ossos contam a história dos primeiros que andaram em pé.",
    "chopper": "Pedra contra pedra. Esta foi a primeira tecnologia da humanidade. Lascar pedra para cortar, raspar, criar.",
    "rupestre": "Os ancestrais desenhavam nas paredes. Mãos sopradas com ocre. Histórias antes da escrita.",
}

settings = {"stability": 0.65, "similarity_boost": 0.75, "style": 0.40, "use_speaker_boost": True}

for name, text in GRIOTS.items():
    body = json.dumps({"text": text, "model_id": MODEL, "voice_settings": settings}).encode()
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_128",
        data=body,
        headers={"xi-api-key": API_KEY, "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        if resp.status != 200:
            raise RuntimeError(f"HTTP {resp.status}: {resp.read()[:300]}")
        out = OUT / f"{name}.mp3"
        out.write_bytes(resp.read())
        print(f"{name}: {out.stat().st_size} bytes -> {out}")

print("done")
