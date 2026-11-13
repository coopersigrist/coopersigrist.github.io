"""Generate Games-tab art that matches the on-site games."""
from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUT = Path(r"C:\CODE\Website\assets\img\games")
OUT.mkdir(parents=True, exist_ok=True)
W, H = 1600, 900


def lerp(a, b, t):
    return a + (b - a) * t


def mix(c1, c2, t):
    return tuple(int(lerp(a, b, t)) for a, b in zip(c1, c2))


def draw_asteroids():
    img = Image.new("RGB", (W, H), "#070b18")
    px = img.load()
    for y in range(H):
        t = y / (H - 1)
        x_bias = 0
        for x in range(W):
            u = (x / (W - 1) + t) / 2
            col = mix((7, 11, 24), (22, 16, 34), u)
            px[x, y] = col

    rng = random.Random(7)
    draw = ImageDraw.Draw(img)

    def asteroid(cx, cy, r, seed):
        local = random.Random(seed)
        n = 7
        pts = []
        for i in range(n):
            ang = (i / n) * math.tau + local.random() * 0.12
            scale = 0.75 + local.random() * 0.45
            pts.append((cx + math.cos(ang) * r * scale, cy + math.sin(ang) * r * scale))
        draw.polygon(pts, fill="#8a8174")
        # crater-ish darker patches like the canvas rocks
        for _ in range(3):
            ox = cx + local.uniform(-r * 0.35, r * 0.35)
            oy = cy + local.uniform(-r * 0.35, r * 0.35)
            rr = r * local.uniform(0.08, 0.18)
            draw.ellipse((ox - rr, oy - rr, ox + rr, oy + rr), fill="#6f675c")

    rocks = [
        (280, 220, 120, 1),
        (470, 620, 90, 2),
        (980, 210, 110, 3),
        (1220, 520, 150, 4),
        (1480, 180, 70, 5),
        (760, 740, 80, 6),
        (140, 700, 60, 8),
        (1100, 780, 55, 9),
        (860, 360, 48, 10),
    ]
    for spec in rocks:
        asteroid(*spec)

    photons = [
        (620, 240, 14),
        (720, 430, 16),
        (900, 560, 13),
        (1040, 330, 15),
        (540, 500, 12),
        (1280, 300, 14),
    ]
    for x, y, r in photons:
        draw.ellipse((x - r * 2.2, y - r * 2.2, x + r * 2.2, y + r * 2.2), fill="#5a4818")
        draw.ellipse((x - r, y - r, x + r, y + r), fill="#ffe27a")
        draw.ellipse((x - r * 0.4, y - r * 0.4, x + r * 0.25, y + r * 0.25), fill="#fff6c8")

    # triangle ship, same silhouette as games.js, pointing up-right
    cx, cy, a = 640, 470, math.radians(-18)
    pts = [(14, 0), (-10, -8), (-6, 0), (-10, 8)]
    scale = 6.2
    world = []
    for x, y in pts:
        x, y = x * scale, y * scale
        rx = cx + x * math.cos(a) - y * math.sin(a)
        ry = cy + x * math.sin(a) + y * math.cos(a)
        world.append((rx, ry))
    draw.polygon(world, fill="#d7ecff")
    # small engine notch shadow
    img = img.filter(ImageFilter.SMOOTH)
    img.save(OUT / "asteroids.jpg", "JPEG", quality=92, optimize=True)


def rounded_rect(draw, box, r, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=r, fill=fill, outline=outline, width=width)


def card(draw, x, y, w, h, rank, suit, back=False, angle=0, img=None):
    face = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(face)
    if back:
        rounded_rect(d, (0, 0, w - 1, h - 1), 12, fill="#1f3d73", outline="#d8c07a", width=3)
        rounded_rect(d, (10, 10, w - 11, h - 11), 8, fill="#274a8a", outline="#d8c07a", width=2)
        for i in range(4):
            for j in range(6):
                cx = 22 + i * ((w - 44) / 3)
                cy = 22 + j * ((h - 44) / 5)
                d.ellipse((cx - 5, cy - 5, cx + 5, cy + 5), outline="#d8c07a")
    else:
        color = "#c1121f" if suit in "♥♦" else "#111111"
        rounded_rect(d, (0, 0, w - 1, h - 1), 12, fill="#f7f4ea", outline="#2b2b2b", width=2)
        try:
            font_lg = ImageFont.truetype("arial.ttf", int(h * 0.28))
            font_sm = ImageFont.truetype("arial.ttf", int(h * 0.18))
            font_suit = ImageFont.truetype("seguisym.ttf", int(h * 0.22))
        except OSError:
            font_lg = ImageFont.load_default()
            font_sm = font_lg
            font_suit = font_lg
        d.text((10, 6), rank, fill=color, font=font_lg)
        d.text((12, 8 + h * 0.26), suit, fill=color, font=font_suit)
        d.text((w / 2 - 12, h / 2 - 16), suit, fill=color, font=font_suit)

    if angle:
        face = face.rotate(angle, expand=True, resample=Image.Resampling.BICUBIC)
    if img is None:
        return face
    img.alpha_composite(face, (int(x - face.width / 2), int(y - face.height / 2)))
    return face


def fan(img, cx, cy, n, spread, y_arc, back=True, faces=None):
    for i in range(n):
        t = i / max(n - 1, 1)
        ang = -spread / 2 + t * spread
        x = cx + math.sin(math.radians(ang)) * 70
        y = cy + abs(math.sin(math.radians(ang))) * y_arc
        if back:
            card(ImageDraw.Draw(img), x, y, 92, 132, "", "", back=True, angle=ang, img=img)
        else:
            rank, suit = faces[i]
            card(ImageDraw.Draw(img), x, y, 108, 154, rank, suit, angle=ang * 0.6, img=img)


def draw_solo():
    img = Image.new("RGBA", (W, H), "#14532d")
    draw = ImageDraw.Draw(img)
    # table felt
    for y in range(H):
        shade = int(12 * math.sin(y / 70))
        draw.line([(0, y), (W, y)], fill=(18 + shade, 84 + shade // 2, 42))
    # inner table
    draw.ellipse((90, 40, W - 90, H - 40), fill="#166534", outline="#0f3d24", width=10)
    draw.ellipse((120, 62, W - 120, H - 62), outline="#4ade80", width=3)

    # score chip like the real game's 26-point rule
    rounded_rect(draw, (W / 2 - 70, 86, W / 2 + 70, 132), 18, fill="#052e16", outline="#bbf7d0", width=2)
    try:
        font = ImageFont.truetype("arial.ttf", 28)
        font_sm = ImageFont.truetype("arial.ttf", 16)
    except OSError:
        font = ImageFont.load_default()
        font_sm = font
    draw.text((W / 2, 109), "26 to lose", fill="#dcfce7", font=font_sm, anchor="mm")

    # opponent hands (card backs)
    fan(img, W / 2, 210, 6, 46, 18, back=True)
    fan(img, 250, 430, 5, 40, 10, back=True)
    fan(img, W - 250, 430, 5, 40, 10, back=True)

    # center trick: 4 face-up cards, 32-card deck ranks
    trick = [("J", "♠"), ("A", "♥"), ("K", "♣"), ("9", "♦")]
    offsets = [(-70, -28, -18), (18, -46, 8), (-24, 22, -6), (78, 8, 16)]
    for (rank, suit), (dx, dy, ang) in zip(trick, offsets):
        card(draw, W / 2 + dx, 430 + dy, 150, 214, rank, suit, angle=ang, img=img)

    # player hand along the bottom
    hand = [("7", "♦"), ("9", "♥"), ("J", "♣"), ("Q", "♠"), ("K", "♥"), ("A", "♠")]
    n = len(hand)
    for i, (rank, suit) in enumerate(hand):
        t = i / (n - 1)
        ang = -16 + t * 32
        x = 430 + i * 125
        y = 730 - abs(i - 2.5) * 8
        card(draw, x, y, 168, 236, rank, suit, angle=ang, img=img)

    rgb = img.convert("RGB")
    rgb.save(OUT / "solo.jpg", "JPEG", quality=92, optimize=True)


if __name__ == "__main__":
    draw_asteroids()
    draw_solo()
    print("wrote", OUT / "asteroids.jpg", OUT / "solo.jpg")
