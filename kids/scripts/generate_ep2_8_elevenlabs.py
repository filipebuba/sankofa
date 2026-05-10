"""Regenerate EP2-8 narrações via ElevenLabs (flash_v2_5 model, 0.5x credits)."""
import json
import subprocess
import urllib.request
from pathlib import Path
from mutagen.mp3 import MP3

ROOT = Path(__file__).resolve().parent.parent
ENV = {}
for line in (ROOT / ".env").read_text().splitlines():
    if "=" in line:
        k, v = line.split("=", 1)
        ENV[k.strip()] = v.strip()
API_KEY = ENV["ELEVENLABS_API_KEY"]
VOICE = "nuE5FWBCfLcIqaRgrTaz"
MODEL = "eleven_flash_v2_5"

CENA1_STD = "Olá, criança! Eu sou a Vovó Sankofa. Vem comigo voltar muuuito atrás no tempo."
CENA10_STD = "Até a próxima."

EPS = {
    2: {
        "name": "hatshe",
        "cenas": {
            1: CENA1_STD,
            2: "Mais. Mais. Antes do celular. Antes do livro. Três mil e quinhentos anos atrás. No Egito antigo. Imagina!",
            3: "Aqui está ela. Hatshé. Tem sete anos. Vive em Tebas, perto do Rio Nilo. E ela tem uma coisa que mudou a história das mulheres.",
            4: "Olha! Hatshé brincava com bonecas de palha como qualquer menina. Mas ela era diferente. O pai dela era Faraó. A mãe também tinha sangue real. Quando o pai morreu, Hatshé subiu ao trono. Coroou-se Faraó. Não rainha. Faraó. Uma das primeiras mulheres na história a usar a coroa dupla, vermelha e branca — do Norte e do Sul do Egito.",
            5: "Vamos cantar comigo pra Hatshé?",
            6: "Vinte e dois anos governou. Sem fazer guerra. Comerciando com Punt — que ficava na atual Etiópia. Construindo templos. Sabe o que fizeram com ela depois? O sobrinho, Tutmés Terceiro, mandou apagar o nome dela das paredes. Achava que mulher não devia governar. Mas a história não esqueceu. Os arqueólogos cavaram. Encontraram. Reuniram pedaços. Hatshepsut voltou.",
            7: "Cada vez que uma menina decide liderar... cada vez que alguém te diz isso não é pra menina e tu respondes é sim... tu estás fazendo o que a Hatshé começou.",
            8: "Sankofa. Volta. E. Busca. Apaga uma vez? A gente pinta de novo.",
            9: "Tchau! Os ossos da Hatshé existem! Tá num museu! Sankofa!",
            10: CENA10_STD,
        }
    },
    3: {
        "name": "musinho",
        "cenas": {
            1: CENA1_STD,
            2: "Mais. Mais. Setecentos anos atrás. No Império do Mali, África ocidental. Imagina!",
            3: "Aqui está ele. Musinho. Tem oito anos. Vive em Niani, capital do Império do Mali. Ano mil trezentos e vinte e quatro. Setecentos anos atrás. O avô dele era o homem mais rico de toda a história. Da humanidade.",
            4: "Saíram juntos numa viagem. Caravana de sessenta mil pessoas. Doze mil camelos. Cada camelo carregava cento e trinta e seis quilos de ouro. Para onde iam? A Meca. Para rezar. No caminho passaram pelo Cairo. Mansa Musa distribuiu tanto ouro que o preço caiu. Ficou caindo por doze anos! O Cairo teve que se reacostumar com ouro normal.",
            5: "Vamos cantar comigo pro Mansa Musa?",
            6: "Quando voltaram, Mansa Musa mandou construir Tombuctu. Universidade. Setecentos mil livros. Estudantes vinham de todo o mundo islâmico estudar lá. Antes de Yale e Hárvard, já se ensinava em Tombuctu.",
            7: "Cada vez que tu pegas um livro... cada vez que tu perguntas uma coisa nova... estás numa escola que começou em Tombuctu, na África, há setecentos anos. Antes de qualquer escola da Europa.",
            8: "Sankofa. Volta. E. Busca. A história da escola não começa onde te disseram.",
            9: "Tchau! Setecentos mil livros! Eu sei ler! Sankofa!",
            10: CENA10_STD,
        }
    },
    4: {
        "name": "zimbi",
        "cenas": {
            1: CENA1_STD,
            2: "Mais. Mais. Setecentos anos atrás. No sul de África. Numa cidade construída só de pedra. Imagina!",
            3: "Aqui está ela. Zimbi. Tem nove anos. Vive numa cidade incrível no que hoje é Zimbábue. Ano mil e trezentos. O pai dela era pedreiro. Construía a Grande Cidade.",
            4: "Como era construída? Sem cola. Sem cimento. Sem argamassa. Pedra em cima de pedra. Encaixadas com tanta precisão que não cabia uma folha de papel entre elas. A torre cônica tinha onze metros. As muralhas ocupavam onze hectares. Dezoito mil pessoas viviam dentro.",
            5: "Vamos cantar comigo pra Zimbi?",
            6: "Quando os europeus chegaram em mil oitocentos e setenta e um, viram as ruínas. Falaram: africanos não construíram isso. Foram fenícios. Ou os judeus. Ou alienígenas. Demorou cem anos pra arqueologia provar que sim — africanos construíram. As pedras são teimosas. As pedras lembram.",
            7: "Cada vez que tu empilhas legos... cada vez que constróis uma casinha... pensa: alguém antes de ti, com nada além das mãos e da cabeça, construiu uma cidade que durou séculos.",
            8: "Sankofa. Volta. E. Busca. Quem construiu ainda mora aqui. Os ancestrais não foram embora.",
            9: "Tchau! Sem cola, sem cimento — só cabeça! Sankofa!",
            10: CENA10_STD,
        }
    },
    5: {
        "name": "adesua",
        "cenas": {
            1: CENA1_STD,
            2: "Mais. Mais. Quinhentos anos atrás. No Reino do Benin, em África Ocidental. Imagina!",
            3: "Aqui está ele. Adesua. Tem seis anos. Vive em Benin — atual Nigéria. Ano mil e quinhentos. O pai dele era fundidor de bronze. E o bronze era sagrado.",
            4: "Cada vez que um Oba — um rei — morria, os fundidores faziam uma cabeça de bronze dele. Não era enfeite. Era arquivo. Cada cabeça guardava o rosto do rei, sua época, suas conquistas. Adesua via o pai derretendo o bronze. Despejando em forma. Esfriando. Polindo. Cada peça levava meses.",
            5: "Vamos cantar comigo pro Adesua?",
            6: "Em mil oitocentos e noventa e sete, soldados ingleses invadiram Benin. Levaram quatro mil peças. Cabeças, marfins, máscaras. Levaram pra Londres. Hoje, em dois mil e vinte e seis, alguns museus começam a devolver. Mas a maioria ainda está fora.",
            7: "Cada vez que tu desenhas... cada vez que fazes uma escultura na areia... lembra: és parte de uma família que tem milénios de mestres artistas.",
            8: "Sankofa. Volta. E. Busca. Cada bronze tem alma. Quem segura, segura ancestral. Devolvam.",
            9: "Tchau! Eu sou de osso, mas tenho irmão de bronze! Sankofa!",
            10: CENA10_STD,
        }
    },
    6: {
        "name": "nzinguinha",
        "cenas": {
            1: CENA1_STD,
            2: "Mais. Mais. Quatrocentos anos atrás. Em Angola, África austral. Imagina!",
            3: "Aqui está ela. Nzinguinha. Tem dez anos. Vive em Ndongo — atual Angola. Ano mil seiscentos e vinte. Ela admirava a tia. A tia se chamava Nzinga.",
            4: "Quando os portugueses chegaram pra negociar, mandaram que Nzinga sentasse no chão. Cadeiras só pra europeus, diziam. Nzinga não brigou. Olhou pra um soldado dela. Mandou ele se ajoelhar. Sentou nas costas dele. Ficou na mesma altura do português. Negociou de igual.",
            5: "Vamos cantar comigo pra Nzinga?",
            6: "Quando os portugueses traíram o tratado — Nzinga liderou a resistência por trinta anos. Lutou até morrer aos oitenta. Nunca se rendeu.",
            7: "Cada vez que alguém te coloca num lugar pequeno e tu dizes não, eu fico em pé... estás fazendo igual a Nzinga.",
            8: "Sankofa. Volta. E. Busca. Toda menina preta hoje é descendente da Nzinga, em algum jeito.",
            9: "Tchau! Eu também não sento no chão! Sou só osso! Sankofa!",
            10: CENA10_STD,
        }
    },
    7: {
        "name": "dandarinha",
        "cenas": {
            1: CENA1_STD,
            2: "Mais. Mais. Trezentos e cinquenta anos atrás. Numa montanha em Alagoas, Brasil. Imagina!",
            3: "Aqui está ela. Dandarinha. Tem onze anos. Vive na Serra da Barriga — Alagoas, Brasil. Ano mil seiscentos e setenta. Brincava com seu primo Zumbi. Os dois viviam num lugar diferente: um Quilombo.",
            4: "Quilombo é palavra africana, do quicongo. Significa: lugar onde as pessoas se reúnem. No Brasil colonial virou outra coisa: lugar onde quem fugia da escravidão construía vida própria. Palmares era o maior. Mais de vinte mil pessoas. Tinha lavoura, escola própria, justiça, religião. A avó da Dandarinha era Aqualtune — princesa do Kongo, escravizada, escapou. Construiu Palmares.",
            5: "Vamos cantar comigo pra Dandara?",
            6: "Ganga Zumba foi o primeiro chefe. Depois Zumbi assumiu. Lutou até cair em mil seiscentos e noventa e cinco. Mas a Vovó Sankofa diz: Zumbi não morreu. Toda criança preta que aprende esse nome carrega Zumbi vivo. Vinte de novembro: Dia da Consciência Negra. Dia de Palmares.",
            7: "Cada vez que tu dás as mãos com alguém... cada vez que defendes um amigo... estás fazendo quilombo. Quilombo é cuidar junto.",
            8: "Sankofa. Volta. E. Busca. Palmares ainda é hoje. Onde tem gente preta junta, é Palmares.",
            9: "Tchau! Cem anos resistindo! Sankofa! Axé!",
            10: CENA10_STD,
        }
    },
    8: {
        "name": "cabralzinho",
        "cenas": {
            1: CENA1_STD,
            2: "Mais. Mais. Sessenta anos atrás. Em Bissau, Guiné, África ocidental. Imagina!",
            3: "Aqui está ele. Cabralzinho. Tem sete anos. Vive em Bissau, Guiné. Ano mil novecentos e sessenta e cinco. Sessenta anos atrás. Admirava o tio. O tio se chamava Amílcar. Engenheiro agrónomo. Estudou em Lisboa. Voltou pra casa pra libertar.",
            4: "A Guiné, naquela época, era colónia de Portugal. As crianças não podiam escolher escola. Os adultos não podiam escolher emprego. Ninguém podia escolher governo. Tio Amílcar disse uma coisa que ficou: A libertação da mente é a primeira libertação. Quer dizer: antes de libertar país, libertar a forma de pensar. Antes de tirar bandeira estrangeira — tirar ideia estrangeira.",
            5: "Vamos cantar comigo pro Cabral?",
            6: "Em mil novecentos e setenta e três, tio Amílcar foi morto. Traído. Aos quarenta e nove anos. Faltavam dois para a independência. Não viu. Mas a luta continuou. Guiné independente em mil novecentos e setenta e quatro. Cabo Verde, Moçambique, Angola, São Tomé — todos em mil novecentos e setenta e cinco.",
            7: "Cada vez que perguntas por que é assim em vez de aceitar... estás libertando a tua mente. Igual o tio Amílcar ensinou.",
            8: "Sankofa. Volta. E. Busca. Cabral, Lumumba, Mandela, Neto — cada criança que aprende esses nomes carrega o sonho deles. A história não terminou. Está em vocês.",
            9: "Tchau! Libertação da mente, primeiro! Sankofa!",
            10: CENA10_STD,
        }
    },
}


def gen(text, settings, voice=VOICE, model=MODEL):
    body = json.dumps({
        "text": text, "model_id": model, "voice_settings": settings,
    }).encode("utf-8")
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_128",
        data=body,
        headers={"xi-api-key": API_KEY, "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        if resp.status != 200:
            raise RuntimeError(f"HTTP {resp.status}: {resp.read()[:300]}")
        return resp.read()


def main():
    PAUSES = {1:1, 2:1, 3:1, 4:2, 5:45, 6:1, 7:1, 8:1, 9:1, 10:5}

    for ep_num, ep_data in EPS.items():
        stems = ROOT / f"audio/voice/ep{ep_num}-stems-v3"
        stems.mkdir(parents=True, exist_ok=True)
        print(f"\n=== EP{ep_num} {ep_data['name']} ===")
        chars_total = 0
        for idx, text in ep_data["cenas"].items():
            out = stems / f"{idx:02d}-cena{idx}.mp3"
            chars_total += len(text)
            if idx == 9:  # Fred — pitch shift after
                # Use flash with energetic settings
                settings = {"stability": 0.55, "similarity_boost": 0.70, "style": 0.65, "use_speaker_boost": True}
                raw = gen(text, settings)
                bak = stems / "09-cena9-original.mp3"
                bak.write_bytes(raw)
                # Pitch shift +18%
                cmd = ["ffmpeg","-y","-i",str(bak),"-af","asetrate=44100*1.18,aresample=44100,atempo=1/1.18",str(out)]
                subprocess.run(cmd, check=True, capture_output=True)
            else:
                settings = {"stability": 0.65, "similarity_boost": 0.75, "style": 0.35, "use_speaker_boost": True}
                out.write_bytes(gen(text, settings))
            d = MP3(out).info.length
            print(f"  cena{idx:02d}: {d:5.1f}s ({len(text):3d} chars)")
        print(f"  total chars: {chars_total}")

        # Generate silence files
        for sec in {1, 2, 5, 45}:
            sf = stems / f"_sil_{sec}s.mp3"
            subprocess.run(["ffmpeg","-y","-f","lavfi","-i","anullsrc=r=44100:cl=mono","-t",str(sec),str(sf)], check=True, capture_output=True)

        # Concat list
        STEMS_LIST = sorted([f for f in stems.glob("[0-9]*.mp3") if "original" not in f.name])
        lst = stems / "_concat.txt"
        with lst.open("w") as fp:
            for i, f in enumerate(STEMS_LIST):
                idx = i + 1
                fp.write(f"file '{f.resolve()}'\n")
                if i < len(STEMS_LIST) - 1:
                    fp.write(f"file '{(stems / f'_sil_{PAUSES[idx]}s.mp3').resolve()}'\n")
            fp.write(f"file '{(stems / '_sil_5s.mp3').resolve()}'\n")

        voz = ROOT / f"audio/voice/ep{ep_num}-narracao-completa.mp3"
        subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i",str(lst),"-c","copy",str(voz)], check=True, capture_output=True)
        print(f"  -> {voz.name}: {MP3(voz).info.length:.1f}s")


if __name__ == "__main__":
    main()
