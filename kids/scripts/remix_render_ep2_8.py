"""Re-mix EP2-8 audio masters + re-render videos with new ElevenLabs narração."""
import subprocess
import glob
import os
from pathlib import Path
from mutagen.mp3 import MP3

ROOT = Path(__file__).resolve().parent.parent
os.chdir(ROOT)

EPS = {
    2: {"name": "hatshe", "title": "Hatshepsut", "tag": "A faraó-mulher do Egito",
        "trilha": "audio/music/ep2-trilha-hatshe-CORRECTED.mp3",
        "cantiga": "audio/music/ep2-cantiga-hatshe-CORRECTED.mp3",
        "bg": "art/backgrounds/ep2-karnak-MASTER.png",
        "cant_lyric": "♪ Hat-she! Hat-she! ♪",
        "curi": "Hatshepsut governou 22 anos como faraó"},
    3: {"name": "musinho", "title": "Mansa Musa", "tag": "O imperador mais rico da história",
        "trilha": "audio/music/ep3-trilha-musa-v1.mp3",
        "cantiga": "audio/music/ep3-cantiga-musa-v1.mp3",
        "bg": "art/backgrounds/ep3-tombuctu-MASTER.png",
        "cant_lyric": "♪ Man-sa Mu-sa! ♪",
        "curi": "Mansa Musa peregrinou a Meca em 1324"},
    4: {"name": "zimbi", "title": "Zimbi", "tag": "O Grande Zimbabwe de pedra",
        "trilha": "audio/music/ep4-trilha-zimbi-v1.mp3",
        "cantiga": "audio/music/ep4-cantiga-zimbi-v1.mp3",
        "bg": "art/backgrounds/ep4-grande-zimbabwe-MASTER.png",
        "cant_lyric": "♪ Zim-bi, Zim-bi ♪",
        "curi": "Grande Zimbabwe foi capital de 11.000 pessoas"},
    5: {"name": "adesua", "title": "Adesua", "tag": "Os Bronzes do Benin",
        "trilha": "audio/music/ep5-trilha-cabecas-v1.mp3",
        "cantiga": "audio/music/ep5-cantinga-cabecas-v1.mp3",
        "bg": "art/backgrounds/ep5-benin-foundry-MASTER.png",
        "cant_lyric": "♪ Ade-sua, A-de-sua ♪",
        "curi": "bronzes do Benin foram pilhados em 1897"},
    6: {"name": "nzinguinha", "title": "Nzinguinha", "tag": "A rainha guerreira de Angola",
        "trilha": "audio/music/ep6-trilha-rainha-v1.mp3",
        "cantiga": "audio/music/ep6-cantiga-rainha-v1.mp3",
        "bg": "art/backgrounds/ep6-corte-ndongo-MASTER.png",
        "cant_lyric": "♪ Nzin-ga, Nzin-ga ♪",
        "curi": "Rainha Nzinga lutou 30 anos contra Portugal"},
    7: {"name": "dandarinha", "title": "Dandarinha", "tag": "A guerreira de Palmares",
        "trilha": "audio/music/ep7-trilha-quilombo-v1.mp3",
        "cantiga": "audio/music/ep7-cantiga-quilombo-v1.mp3",
        "bg": "art/backgrounds/ep7-palmares-MASTER.png",
        "cant_lyric": "♪ Dan-da-ra! ♪",
        "curi": "Dandara liderou Palmares ao lado de Zumbi"},
    8: {"name": "cabralzinho", "title": "Cabralzinho", "tag": "Amílcar Cabral, o sonhador",
        "trilha": "audio/music/ep8-trilha-cabral-v1.mp3",
        "cantiga": "audio/music/ep8-cantiga-cabral-v1.mp3",
        "bg": "art/backgrounds/ep8-bissau-MASTER.png",
        "cant_lyric": "♪ Ca-bral, Ca-bral ♪",
        "curi": "Amílcar Cabral libertou Guiné-Bissau em 1973"},
}

PAUSES = {1:1, 2:1, 3:1, 4:2, 5:45, 6:1, 7:1, 8:1, 9:1, 10:5}
STING = "audio/music/ep1-sting-final-v1.mp3"
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
VV = "art/characters/vovo-sankofa/vovo-fly-cutout.png"
FR = "art/characters/fred-fossil/fred-front-cutout.png"


def remix(ep, info):
    voz = f"audio/voice/ep{ep}-narracao-completa.mp3"
    stems = sorted([f for f in glob.glob(f"audio/voice/ep{ep}-stems-v3/[0-9]*.mp3") if "original" not in f])
    cum = 0.0
    cantiga_delay_ms = 0
    for i, f in enumerate(stems, 1):
        cum += MP3(f).info.length
        if i == 5:
            cantiga_delay_ms = int(cum * 1000)
        cum += PAUSES.get(i, 1)
    total = MP3(voz).info.length
    trilha_dur = MP3(info["trilha"]).info.length
    loop_trilha = trilha_dur < total
    duck_start = cantiga_delay_ms/1000.0 - 0.5
    duck_end = duck_start + 46.5
    vol_expr = (
        f"if(lt(t,{duck_start}),0.15,"
        f"if(lt(t,{duck_start+0.5}),0.15+(0.03-0.15)*(t-{duck_start})/0.5,"
        f"if(lt(t,{duck_end-0.5}),0.03,"
        f"if(lt(t,{duck_end}),0.03+(0.15-0.03)*(t-({duck_end-0.5}))/0.5,"
        f"0.15))))"
    )
    trilha_filter = "[1:a]"
    if loop_trilha: trilha_filter += "aloop=loop=-1:size=2e+09,"
    trilha_filter += f"volume='{vol_expr}':eval=frame,afade=t=out:st={total-5}:d=5,atrim=0:{total}[trilha]"
    sting_delay = int((total - 16) * 1000)
    fc = (
        "[0:a]volume=1.0[voz];"
        f"{trilha_filter};"
        f"[2:a]atrim=0:43,afade=t=in:st=0:d=0.8,afade=t=out:st=41:d=2,adelay={cantiga_delay_ms}|{cantiga_delay_ms},volume=0.95[cantiga];"
        f"[3:a]atrim=0:16,adelay={sting_delay}|{sting_delay},volume=0.5[sting];"
        "[voz][trilha][cantiga][sting]amix=inputs=4:duration=first:dropout_transition=2,loudnorm=I=-16:TP=-1.5:LRA=11[mix]"
    )
    out = f"audio/masters/ep{ep}-mix-rough.mp3"
    cmd = ["ffmpeg","-y","-i",voz,"-i",info["trilha"],"-i",info["cantiga"],"-i",STING,
           "-filter_complex",fc,"-map","[mix]","-ac","2","-ar","48000",
           "-b:a","320k","-t",str(total),out]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(f"  MIX FAIL: {r.stderr[-500:]}")
        return None
    return total, cantiga_delay_ms/1000.0


def render(ep, info, total, cantiga_t):
    cut = f"art/characters/{info['name']}/{info['name']}-front-cutout.png"
    out = f"exports/youtube-16x9/ep{ep}-mvp.mp4"
    audio = f"audio/masters/ep{ep}-mix-rough.mp3"
    DUR = int(total)
    fred_start = max(180, DUR - 19)
    fred_end = max(195, DUR - 4)

    fc = f"""
[0:v]scale=2400:2400:force_original_aspect_ratio=increase,zoompan=z='min(zoom+0.0005,1.20)':d={DUR}*24:fps=24:s=1920x1080:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)',setsar=1,format=yuv420p[bg];
[1:v]scale=-1:600,format=rgba[ch];
[2:v]scale=320:-1,format=rgba[vv];
[3:v]scale=-1:700,format=rgba[fr];
[bg][ch]overlay=x='if(between(t,25,55),100+(W-overlay_w-200)*((t-25)/30),W-overlay_w-150)+sin(t*3)*15':y='H-overlay_h-60+sin(t*6)*8':enable='between(t,25,55)+between(t,{int(cantiga_t)+45},{DUR-25})'[bg2];
[bg2][vv]overlay=x='80+sin(t*1.5)*20':y='80+sin(t*4)*12':enable='between(t,4,25)+between(t,{int(cantiga_t)+45},{DUR-25})'[bg3];
[bg3][fr]overlay=x='(W-overlay_w)/2+sin(t*8)*30':y='H-overlay_h-40+abs(sin(t*5))*-25':enable='between(t,{fred_start},{fred_end})'[mix];
[mix]format=yuv420p,
drawbox=x=0:y=930:w=1920:h=150:color=#1F1408@0.65:t=fill:enable='between(t,30,42)+between(t,{int(cantiga_t)+50},{int(cantiga_t)+62})+between(t,{fred_start},{fred_end-3})+between(t,{DUR-9},{DUR-1})',
drawtext=fontfile={FONT}:text='SANKOFA KIDS':fontsize=84:fontcolor=#EDE5D5:bordercolor=#1F1408:borderw=4:x=(w-text_w)/2:y=h*0.30:enable='between(t,0.5,3.5)',
drawtext=fontfile={FONT}:text='Episódio {ep}':fontsize=56:fontcolor=#D9B95A:bordercolor=#1F1408:borderw=3:x=(w-text_w)/2:y=h*0.45:enable='between(t,0.8,3.5)',
drawtext=fontfile={FONT}:text='{info['title']} — {info['tag']}':fontsize=44:fontcolor=#EDE5D5:bordercolor=#1F1408:borderw=3:x=(w-text_w)/2:y=h*0.55:enable='between(t,1.0,3.5)',
drawtext=fontfile={FONT}:text='{info['title']}':fontsize=46:fontcolor=#D9B95A:x=(w-text_w)/2:y=h-100:enable='between(t,30,42)',
drawtext=fontfile={FONT}:text='{info['cant_lyric']}':fontsize=44:fontcolor=#D9B95A:bordercolor=#1F1408:borderw=3:x=(w-text_w)/2:y=h*0.10:enable='between(t,{int(cantiga_t)+2},{int(cantiga_t)+42})',
drawtext=fontfile={FONT}:text='Sankofa\\: volta e busca':fontsize=46:fontcolor=#D9B95A:x=(w-text_w)/2:y=h-100:enable='between(t,{int(cantiga_t)+50},{int(cantiga_t)+62})',
drawtext=fontfile={FONT}:text='Fred Fóssil entra em cena!':fontsize=46:fontcolor=#D9B95A:x=(w-text_w)/2:y=h-100:enable='between(t,{fred_start},{fred_end-3})',
drawtext=fontfile={FONT}:text='Curiosidade\\: {info['curi']}':fontsize=38:fontcolor=#EDE5D5:x=(w-text_w)/2:y=h-100:enable='between(t,{DUR-9},{DUR-1})',
drawtext=fontfile={FONT}:text='sankofa.education':fontsize=24:fontcolor=#D9B95A@0.7:x=w-text_w-30:y=h-text_h-20:enable='gte(t,4)'
[v]"""
    cmd = ["ffmpeg","-y",
           "-loop","1","-t",str(DUR),"-i",info["bg"],
           "-loop","1","-i",cut,
           "-loop","1","-i",VV,
           "-loop","1","-i",FR,
           "-i",audio,
           "-filter_complex",fc.strip(),
           "-map","[v]","-map","4:a",
           "-c:v","libx264","-preset","medium","-crf","20","-pix_fmt","yuv420p",
           "-c:a","aac","-b:a","192k","-shortest","-t",str(DUR),out]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(f"  RENDER FAIL: {r.stderr[-700:]}")
        return False
    return True


for ep_num, info in EPS.items():
    print(f"\n=== EP{ep_num} {info['title']} ===")
    res = remix(ep_num, info)
    if not res:
        continue
    total, cantiga_t = res
    print(f"  mix OK: {total:.1f}s | cantiga@{cantiga_t:.1f}s")
    if render(ep_num, info, total, cantiga_t):
        print(f"  render OK -> exports/youtube-16x9/ep{ep_num}-mvp.mp4")

print("\n=== ALL DONE ===")
