"""Draws the OnTrack icon and writes it as a macOS .icns (PNG-based entries)."""
import io, struct, sys
from PIL import Image, ImageDraw

def draw(size):
    s = size * 4  # supersample
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    m = int(s * 0.09)
    d.rounded_rectangle([m, m, s - m, s - m], radius=int(s * 0.2), fill=(47, 107, 79, 255))
    # a track: two lanes curving to a finish dot
    w = int(s * 0.06)
    d.arc([int(s*.24), int(s*.24), int(s*.76), int(s*.76)], 140, 400, fill=(226, 239, 231, 255), width=w)
    d.arc([int(s*.34), int(s*.34), int(s*.66), int(s*.66)], 140, 400, fill=(226, 239, 231, 140), width=int(w*.7))
    # check mark in the middle
    d.line([(s*.40, s*.51), (s*.47, s*.58), (s*.61, s*.43)], fill=(255, 255, 255, 255), width=int(s*.055), joint="curve")
    return img.resize((size, size), Image.LANCZOS)

def png(size):
    b = io.BytesIO(); draw(size).save(b, "PNG"); return b.getvalue()

entries = [(b"icp4", 16), (b"icp5", 32), (b"icp6", 64), (b"ic07", 128), (b"ic08", 256), (b"ic09", 512), (b"ic10", 1024)]
body = b"".join(t + struct.pack(">I", len(p) + 8) + p for t, p in ((t, png(n)) for t, n in entries))
with open(sys.argv[1], "wb") as f:
    f.write(b"icns" + struct.pack(">I", len(body) + 8) + body)
draw(512).save(sys.argv[1].replace(".icns", ".png"))
