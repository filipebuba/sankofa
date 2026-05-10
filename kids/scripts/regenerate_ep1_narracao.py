"""Regenerate EP1 narration with HGA-corrected text + grandmother prosody.

Voice: pt-BR-FranciscaNeural with rate=-15%, pitch=-4Hz (slower, slightly lower).
Cena 9 = Fred Fóssil = pt-BR-AntonioNeural with pitch=+30Hz (cartoon kid).

Output: audio/voice/ep1-stems-v2/*.mp3 + audio/voice/ep1-narracao-completa.mp3
"""
import asyncio
import os
import subprocess
import edge_tts
from pathlib import Path
from mutagen.mp3 import MP3

ROOT = Path(__file__).resolve().parent.parent
STEMS = ROOT / "audio/voice/ep1-stems-v2"
STEMS.mkdir(parents=True, exist_ok=True)

VOVO = "pt-BR-FranciscaNeural"
FRED = "pt-BR-AntonioNeural"

CENAS = [
    # (idx, voice, rate, pitch, text, pause_after)
    (1, VOVO, "-15%", "-4Hz",
     "Olá, criança! Eu sou a Vovó Sankofa. "
     "Vem comigo voltar muuuito atrás no tempo.",
     1),
    (2, VOVO, "-18%", "-4Hz",
     "Mais. Mais. Mais ainda. "
     "Antes do celular. Antes da televisão. Antes do livro. "
     "Antes da escrita. Antes da escola. "
     "Três milhões e duzentos mil anos atrás. Imagina!",
     1),
    (3, VOVO, "-15%", "-4Hz",
     "Aqui está ela. Lúcinha. "
     "Ela tem quatro anos. "
     "Vive na Etiópia, no leste do continente africano. "
     "E ela tem uma coisa especial.",
     1),
    (4, VOVO, "-15%", "-4Hz",
     "Olha! Olha bem! "
     "Lúcinha está em pé. Sobre os dois pés! Caminhando! "
     "Lúcinha é uma das primeiras meninas que conhecemos "
     "que andou em pé na nossa família grande e antiga. "
     "Antes dela, há muitos milhões de anos, "
     "outras crianças também andavam em pé — "
     "em Chade, em Quénia, na Etiópia. "
     "Mas a Lúcinha é a mais famosa de todas. "
     "Uma menina pequenininha, "
     "há três milhões de anos, "
     "caminhando na savana africana!",
     2),
    (5, VOVO, "-12%", "-3Hz",
     "Vamos cantar comigo pra Lúcinha?",
     30),  # 30s gap for cantiga Suno
    (6, VOVO, "-15%", "-4Hz",
     "Sabe como a gente sabe da Lúcinha? "
     "Cientistas — pessoas que estudam o passado — "
     "encontraram os ossos dela. "
     "Em mil novecentos e setenta e quatro! Na Etiópia! "
     "E sabe o nome que deram pra ela? Lúci. "
     "Por causa de uma música dos Bítols que tocava no acampamento.",
     1),
    (7, VOVO, "-15%", "-4Hz",
     "Sabe de uma coisa? "
     "Cada vez que tu caminhas em pé... "
     "cada vez que tu corres, pulas, danças... "
     "Tu estás fazendo o que a Lúcinha começou. "
     "Há três milhões de anos. "
     "Ela faz parte da nossa família muito antiga. "
     "De toda gente do mundo inteiro.",
     1),
    (8, VOVO, "-15%", "-5Hz",
     "Lembra do meu nome? Sankofa. "
     "É uma palavra antiga, do povo Akan, em Gana. "
     "Quer dizer: Volta. E. Busca. "
     "Volta no tempo. Busca a história. "
     "Aprende com quem veio antes. "
     "Tu fazes parte dessa história, criança.",
     1),
    (9, FRED, "+5%", "+30Hz",
     "Tchau! Lembra: caminhar em pé é coisa muito antiga! "
     "Eu sou os ossos! Hahahaha! Sankofa!",
     1),
    (10, VOVO, "-18%", "-5Hz",
     "Até a próxima.",
     1),
    (11, VOVO, "-15%", "-4Hz",
     "...",
     5),
]


async def gen(idx, voice, rate, pitch, text):
    out = STEMS / f"{idx:02d}-cena{idx}.mp3"
    if not text.strip() or text == "...":
        # Generate 1s silence
        subprocess.run([
            "ffmpeg", "-y", "-f", "lavfi", "-i",
            "anullsrc=r=24000:cl=mono", "-t", "1", str(out)
        ], check=True, capture_output=True)
        return out
    comm = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
    await comm.save(str(out))
    return out


async def main():
    print("=== Generating EP1 stems (HGA corrected, grandmother prosody) ===")
    files = []
    for spec in CENAS:
        idx, voice, rate, pitch, text, pause = spec
        f = await gen(idx, voice, rate, pitch, text)
        d = MP3(f).info.length
        print(f"cena{idx:02d}: {d:.1f}s ({voice} rate={rate} pitch={pitch}) -> {f.name}")
        files.append((f, pause))

    # Generate silence files
    for sec in {1, 2, 5, 30}:
        sf = STEMS / f"_sil_{sec}s.mp3"
        subprocess.run([
            "ffmpeg", "-y", "-f", "lavfi", "-i",
            "anullsrc=r=24000:cl=mono", "-t", str(sec), str(sf)
        ], check=True, capture_output=True)

    # Concat list
    lst = STEMS / "_concat.txt"
    with lst.open("w") as fp:
        for i, (f, pause) in enumerate(files):
            fp.write(f"file '{f.resolve()}'\n")
            if i < len(files) - 1:
                sf = STEMS / f"_sil_{pause}s.mp3"
                fp.write(f"file '{sf.resolve()}'\n")

    out = ROOT / "audio/voice/ep1-narracao-completa.mp3"
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", str(lst), "-c", "copy", str(out)
    ], check=True, capture_output=True)
    total = MP3(out).info.length
    print(f"\nNarração completa: {total:.1f}s -> {out}")


if __name__ == "__main__":
    asyncio.run(main())
