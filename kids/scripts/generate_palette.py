#!/usr/bin/env python3
"""Generate Sankofa Kids palette swatches.

Outputs:
  art/palette/sankofa-kids.png       — visual swatch grid (1200x800)
  art/palette/sankofa-kids.ase       — Adobe Swatch Exchange (binary)
  art/palette/sankofa-kids.gpl       — GIMP/Krita palette
  art/palette/sankofa-kids-skin.png  — 6-tone skin ramp strip
"""

from __future__ import annotations
import struct
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "art" / "palette"
OUT.mkdir(parents=True, exist_ok=True)

PALETTE = [
    ("sky-earth",   "#a8693d", "Céu terra (gradiente topo)"),
    ("ochre",       "#d9b95a", "Ocre (gradiente base + acentos)"),
    ("savana",      "#6a8530", "Savana / capim"),
    ("gold",        "#c9a84c", "Ouro — Vovó Sankofa"),
    ("terracotta",  "#b85a3a", "Terracota — acentos quentes"),
    ("bone-white",  "#ede5d5", "Branco osso — texto, dentes"),
    ("line-black",  "#1f1408", "Linha preta — outline"),
]

SKIN_RAMP = [
    ("skin-1", "#3a2010", "Sombra mais escura"),
    ("skin-2", "#5a3520", "Sombra média"),
    ("skin-3", "#7d5535", "Tom base escuro"),
    ("skin-4", "#a07550", "Tom base médio"),
    ("skin-5", "#bf9268", "Highlight médio"),
    ("skin-6", "#d9b07a", "Highlight claro"),
]


def hex_to_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


def text_color_for_bg(rgb: tuple[int, int, int]) -> tuple[int, int, int]:
    luminance = 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]
    return (20, 14, 8) if luminance > 140 else (237, 229, 213)


def load_font(size: int) -> ImageFont.FreeTypeFont:
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/mnt/c/Windows/Fonts/arialbd.ttf",
        "/mnt/c/Windows/Fonts/arial.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def build_main_swatch():
    width, height = 1400, 900
    rows = [PALETTE, SKIN_RAMP]
    img = Image.new("RGB", (width, height), (245, 240, 230))
    draw = ImageDraw.Draw(img)

    title_font = load_font(38)
    label_font = load_font(20)
    hex_font = load_font(22)
    desc_font = load_font(16)

    draw.text((40, 30), "Sankofa Kids — Paleta Oficial", font=title_font, fill=(31, 20, 8))
    draw.text((40, 80), "CC BY-SA 4.0 · Sankofa Educa", font=desc_font, fill=(80, 60, 40))

    margin = 40
    top = 130

    def render_row(items, y_top, row_label):
        draw.text((margin, y_top), row_label, font=label_font, fill=(31, 20, 8))
        cell_w = (width - 2 * margin) // len(items)
        cell_h = 280
        y = y_top + 30
        for idx, (name, hexv, desc) in enumerate(items):
            x = margin + idx * cell_w
            rgb = hex_to_rgb(hexv)
            draw.rectangle([x, y, x + cell_w - 8, y + cell_h], fill=rgb, outline=(31, 20, 8), width=2)
            text_col = text_color_for_bg(rgb)
            draw.text((x + 14, y + 14), name, font=label_font, fill=text_col)
            draw.text((x + 14, y + cell_h - 70), hexv.upper(), font=hex_font, fill=text_col)
            draw.text((x + 14, y + cell_h - 38), desc, font=desc_font, fill=text_col)

    render_row(PALETTE, top, "Paleta principal")
    render_row(SKIN_RAMP, top + 350, "Pele — 6 tons (escuro → claro)")

    out = OUT / "sankofa-kids.png"
    img.save(out, "PNG", optimize=True)
    print(f"wrote {out}")


def build_skin_strip():
    width, height = 1200, 200
    img = Image.new("RGB", (width, height), (245, 240, 230))
    draw = ImageDraw.Draw(img)
    label_font = load_font(18)
    hex_font = load_font(16)
    cell_w = width // len(SKIN_RAMP)
    for idx, (name, hexv, _) in enumerate(SKIN_RAMP):
        x = idx * cell_w
        rgb = hex_to_rgb(hexv)
        draw.rectangle([x, 0, x + cell_w, height - 40], fill=rgb)
        draw.text((x + 10, height - 36), name, font=label_font, fill=(31, 20, 8))
        draw.text((x + 10, height - 18), hexv.upper(), font=hex_font, fill=(31, 20, 8))
    out = OUT / "sankofa-kids-skin.png"
    img.save(out, "PNG", optimize=True)
    print(f"wrote {out}")


def build_gpl():
    """GIMP/Krita palette format."""
    lines = ["GIMP Palette", "Name: Sankofa Kids", "Columns: 7", "#"]
    for name, hexv, desc in PALETTE + SKIN_RAMP:
        r, g, b = hex_to_rgb(hexv)
        lines.append(f"{r:3d} {g:3d} {b:3d}\t{name} — {desc}")
    out = OUT / "sankofa-kids.gpl"
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"wrote {out}")


def build_ase():
    """Adobe Swatch Exchange binary format (ASE v1.0)."""
    items = PALETTE + SKIN_RAMP
    body = b""
    body += b"\xC0\x01"
    body += struct.pack(">H", 1)
    group_name = "Sankofa Kids\x00"
    name_utf16 = group_name.encode("utf-16-be")
    block_data = struct.pack(">H", len(group_name)) + name_utf16
    body += struct.pack(">I", len(block_data)) + block_data

    for name, hexv, _ in items:
        r, g, b = hex_to_rgb(hexv)
        color_name = name + "\x00"
        name_utf16 = color_name.encode("utf-16-be")
        block_data = (
            struct.pack(">H", len(color_name))
            + name_utf16
            + b"RGB "
            + struct.pack(">f", r / 255.0)
            + struct.pack(">f", g / 255.0)
            + struct.pack(">f", b / 255.0)
            + struct.pack(">H", 0)
        )
        body += b"\x00\x01"
        body += struct.pack(">I", len(block_data)) + block_data

    body += b"\xC0\x02"
    body += struct.pack(">I", 0)

    header = b"ASEF" + struct.pack(">HH", 1, 0) + struct.pack(">I", len(items) + 2)
    out = OUT / "sankofa-kids.ase"
    out.write_bytes(header + body)
    print(f"wrote {out}")


if __name__ == "__main__":
    build_main_swatch()
    build_skin_strip()
    build_gpl()
    build_ase()
    print("\npaleta gerada em", OUT)
