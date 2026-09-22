from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageFont
import hashlib, json, subprocess, shutil

root = Path('/home/ubuntu/work_bio_digital')
imgdir = root / 'images'
ocrdir = root / 'ocr'
ocrdir.mkdir(exist_ok=True)
items = []
for p in sorted(imgdir.glob('*.jpg')):
    with Image.open(p) as im:
        dims = im.size
        items.append({
            'file': p.name,
            'width': dims[0], 'height': dims[1], 'mode': im.mode,
            'sha256': hashlib.sha256(p.read_bytes()).hexdigest(),
            'aspect_ratio': round(dims[0]/dims[1], 4),
            'pixels': dims[0]*dims[1],
        })
        if shutil.which('tesseract'):
            outbase = ocrdir / p.stem
            subprocess.run(['tesseract', str(p), str(outbase), '--psm', '6'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=False)
# contact sheet with readable labels
thumb_w, thumb_h = 220, 310
cols = 4
rows = (len(items)+cols-1)//cols
sheet = Image.new('RGB', (cols*thumb_w, rows*thumb_h), 'white')
draw = ImageDraw.Draw(sheet)
for i, item in enumerate(items):
    p = imgdir / item['file']
    with Image.open(p) as im:
        im = ImageOps.contain(im.convert('RGB'), (thumb_w-12, thumb_h-42))
        x = (i%cols)*thumb_w + (thumb_w-im.width)//2
        y = (i//cols)*thumb_h + 4
        sheet.paste(im, (x,y))
    label = f"{i+1:02d} {item['file'][:24]}"
    draw.text(((i%cols)*thumb_w+6, (i//cols)*thumb_h+thumb_h-34), label, fill='black')
    draw.text(((i%cols)*thumb_w+6, (i//cols)*thumb_h+thumb_h-18), f"{item['width']}x{item['height']}", fill='black')
sheet.save(root/'contact_sheet.jpg', quality=92)
(root/'inventory.json').write_text(json.dumps(items, indent=2), encoding='utf-8')
print(json.dumps({'count': len(items), 'contact_sheet': str(root/'contact_sheet.jpg'), 'ocr_dir': str(ocrdir)}, indent=2))
for txt in sorted(ocrdir.glob('*.txt')):
    text = txt.read_text(errors='replace')
    print(f'\n--- {txt.name} ---\n{text[:4000]}')

def main(): pass
if __name__ == '__main__': main()
