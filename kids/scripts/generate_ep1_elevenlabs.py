"""Generate EP1 stems via ElevenLabs API + concat + create narração-completa.mp3."""
import os
import json
import subprocess
import urllib.request
from pathlib import Path
from mutagen.mp3 import MP3

ROOT = Path(__file__).resolve().parent.parent
STEMS = ROOT / "audio/voice/ep1-stems-v3"
STEMS.mkdir(parents=True, exist_ok=True)

ENV = {}
for line in (ROOT / ".env").read_text().splitlines():
    if "=" in line:
        k, v = line.split("=", 1)
        ENV[k.strip()] = v.strip()
API_KEY = ENV["ELEVENLABS_API_KEY"]
VOICE = "nuE5FWBCfLcIqaRgrTaz"
MODEL = "eleven_multilingual_v2"

CENAS = [
    (1, "Olá, criança! Eu sou a Vovó Sankofa. Vem comigo voltar muuuito atrás no tempo.",
     {"stability": 0.65, "similarity_boost": 0.75, "style": 0.30, "use_speaker_boost": True}, 1),
    (2, "Mais. Mais. Mais ainda. Antes do celular. Antes da televisão. Antes do livro. Antes da escrita. Antes da escola. Três milhões e duzentos mil anos atrás. Imagina!",
     {"stability": 0.60, "similarity_boost": 0.75, "style": 0.40, "use_speaker_boost": True}, 1),
    (3, "Aqui está ela. Lúcinha. Ela tem quatro anos. Vive na Etiópia, no leste do continente africano. E ela tem uma coisa especial.",
     {"stability": 0.65, "similarity_boost": 0.75, "style": 0.35, "use_speaker_boost": True}, 1),
    (4, "Olha! Olha bem! Lúcinha está em pé. Sobre os dois pés! Caminhando! Lúcinha é uma das primeiras meninas que conhecemos que andou em pé na nossa família grande e antiga. Antes dela, há muitos milhões de anos, outras crianças também andavam em pé — em Chade, em Quénia, na Etiópia. Mas a Lúcinha é a mais famosa de todas. Uma menina pequenininha, há três milhões de anos, caminhando na savana africana!",
     {"stability": 0.60, "similarity_boost": 0.75, "style": 0.45, "use_speaker_boost": True}, 2),
    (5, "Vamos cantar comigo pra Lúcinha?",
     {"stability": 0.55, "similarity_boost": 0.75, "style": 0.50, "use_speaker_boost": True}, 30),
    (6, "Sabe como a gente sabe da Lúcinha? Cientistas — pessoas que estudam o passado — encontraram os ossos dela. Em mil novecentos e setenta e quatro! Na Etiópia! E sabe o nome que deram pra ela? Lúci. Por causa de uma música dos Bítols que tocava no acampamento.",
     {"stability": 0.60, "similarity_boost": 0.75, "style": 0.40, "use_speaker_boost": True}, 1),
    (7, "Sabe de uma coisa? Cada vez que tu caminhas em pé... cada vez que tu corres, pulas, danças... Tu estás fazendo o que a Lúcinha começou. Há três milhões de anos. Ela faz parte da nossa família muito antiga. De toda gente do mundo inteiro.",
     {"stability": 0.65, "similarity_boost": 0.75, "style": 0.45, "use_speaker_boost": True}, 1),
    (8, "Lembra do meu nome? Sankofa. É uma palavra antiga, do povo Akan, em Gana. Quer dizer: Volta. E. Busca. Volta no tempo. Busca a história. Aprende com quem veio antes. Tu fazes parte dessa história, criança.",
     {"stability": 0.70, "similarity_boost": 0.75, "style": 0.30, "use_speaker_boost": True}, 1),
    (9, "Tchau! Lembra: caminhar em pé é coisa muito antiga! Eu sou os ossos! Hahahaha! Sankofa!",
     {"stability": 0.40, "similarity_boost": 0.70, "style": 0.75, "use_speaker_boost": True}, 1),
    (10, "Até a próxima.",
     {"stability": 0.70, "similarity_boost": 0.75, "style": 0.30, "use_speaker_boost": True}, 5),
]


def gen(idx, text, settings):
    out = STEMS / f"{idx:02d}-cena{idx}.mp3"
    body = json.dumps({
        "text": text,
        "model_id": MODEL,
        "voice_settings": settings,
    }).encode("utf-8")
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_128",
        data=body,
        headers={
            "xi-api-key": API_KEY,
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        if resp.status != 200:
            raise RuntimeError(f"HTTP {resp.status}: {resp.read()[:300]}")
        out.write_bytes(resp.read())
    return out


def main():
    print("=== Generating EP1 stems via ElevenLabs ===")
    for spec in CENAS:
        idx, text, settings, _ = spec
        f = gen(idx, text, settings)
        d = MP3(f).info.length
        chars = len(text)
        print(f"cena{idx:02d}: {d:5.1f}s ({chars:3d} chars) -> {f.name}")

    # Pitch-shift cena 9 (Fred) up
    src9 = STEMS / "09-cena9.mp3"
    bak9 = STEMS / "09-cena9-original.mp3"
    if not bak9.exists():
        src9.replace(bak9)
    cmd = [
        "ffmpeg", "-y", "-i", str(bak9),
        "-af", "asetrate=44100*1.18,aresample=44100,atempo=1/1.18",
        str(src9),
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    print(f"cena09: pitched +18% for Fred Fóssil")

    # Generate silence files
    for sec in {1, 2, 5, 30}:
        sf = STEMS / f"_sil_{sec}s.mp3"
        subprocess.run([
            "ffmpeg", "-y", "-f", "lavfi", "-i",
            "anullsrc=r=44100:cl=mono", "-t", str(sec), str(sf),
        ], check=True, capture_output=True)

    # Concat list with pauses
    lst = STEMS / "_concat.txt"
    with lst.open("w") as fp:
        for i, spec in enumerate(CENAS):
            idx, _, _, pause = spec
            sf = STEMS / f"{idx:02d}-cena{idx}.mp3"
            fp.write(f"file '{sf.resolve()}'\n")
            if i < len(CENAS) - 1:
                fp.write(f"file '{(STEMS / f'_sil_{pause}s.mp3').resolve()}'\n")
        # Trailing silence (cena 11 = 5s)
        fp.write(f"file '{(STEMS / '_sil_5s.mp3').resolve()}'\n")

    out = ROOT / "audio/voice/ep1-narracao-completa.mp3"
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", str(lst), "-c", "copy", str(out),
    ], check=True, capture_output=True)
    print(f"\nNarração completa: {MP3(out).info.length:.1f}s -> {out}")


if __name__ == "__main__":
    main()
