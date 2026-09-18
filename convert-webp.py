from PIL import Image
from pathlib import Path
import os

images_dir = Path('images')

for img_path in images_dir.glob('*.jpg'):
    output_path = img_path.with_suffix('.webp')
    print(f'Converting {img_path.name} ...')
    with Image.open(img_path) as img:
        img.save(output_path, 'WEBP', quality=85, method=6)

    original_size = img_path.stat().st_size
    new_size = output_path.stat().st_size
    print(f'  Original: {original_size / (1024*1024):.2f} MB | WebP: {new_size / (1024*1024):.2f} MB')

print('Done.')
