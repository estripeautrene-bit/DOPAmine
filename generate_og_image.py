#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont
import os

OUT_PATH = "/Users/reneestripeaut/DOPAmine/images/dopa-share-og.png"
W, H = 1200, 630

def font(size, weight="bold"):
    candidates_bold = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/Library/Fonts/Arial Bold.ttf",
        "/System/Library/Fonts/HelveticaNeue.ttc",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    candidates_regular = [
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial.ttf",
        "/System/Library/Fonts/HelveticaNeue.ttc",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    candidates = candidates_bold if weight == "bold" else candidates_regular
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()

def emoji_font(size):
    path = "/System/Library/Fonts/Apple Color Emoji.ttc"
    if os.path.exists(path):
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            pass
    return None

img  = Image.new("RGBA", (W, H), color=(14, 11, 26, 255))
draw = ImageDraw.Draw(img)

BLOOM_H, BLOOM_ALPHA = 225, 48
for y in range(H - 1, H - BLOOM_H, -1):
    t = (H - y) / BLOOM_H
    alpha = int(BLOOM_ALPHA * (1 - t))
    r = 14 + int((255 - 14) * alpha / 255 * 0.55)
    g = 11 + int((176 - 11) * alpha / 255 * 0.30)
    for x in range(W):
        draw.point((x, y), fill=(r, g, 26, 255))

AMBER, WHITE, PURPLE, MUTED = "#FFB020", "#FFFFFF", "#B57BF7", "#5A5470"

draw.text((68, 52), "DOPAmine · mydopa.app", font=font(23, "regular"), fill=AMBER)

h1  = font(118, "bold")
GAP = int(118 * 1.08)
draw.text((68, 142),         "7 days.",   font=h1, fill=WHITE)
draw.text((68, 142 + GAP),   "You won't", font=h1, fill=WHITE)
draw.text((68, 142 + GAP*2), "last.",     font=h1, fill=PURPLE)

draw.text((68, H - 48), "mydopa.app", font=font(24, "regular"), fill=MUTED)

ef = emoji_font(260)
if ef:
    bbox = draw.textbbox((0, 0), "🧠", font=ef)
    ew, eh = bbox[2] - bbox[0], bbox[3] - bbox[1]
    ex = W - ew - 80
    ey = (H - eh) // 2 - 20
    draw.text((ex, ey), "🧠", font=ef, embedded_color=True)

final = img.convert("RGB")
os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
final.save(OUT_PATH, "PNG", optimize=True)
print(f"✅  Saved → {OUT_PATH}")
