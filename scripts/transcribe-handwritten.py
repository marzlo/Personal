"""Local, resumable OCR drafts. Never treat model confidence as proofreading.

Requires rapidocr==3.8.0, onnxruntime, Pillow and opencc-python-reimplemented.
Download models once; image recognition itself runs locally.
"""
import argparse
import io
import json
from pathlib import Path
import sys
import time
import zipfile

import cv2
import numpy as np
from PIL import Image, ImageOps
from rapidocr import RapidOCR, ModelType, OCRVersion


def ink_color(image, box):
    mask = np.zeros(image.shape[:2], dtype=np.uint8)
    cv2.fillPoly(mask, [np.asarray(box, dtype=np.int32)], 255)
    pixels = image[mask > 0].astype(float)
    if not len(pixels):
        return 'unknown'
    r, g, b = pixels[:, 0], pixels[:, 1], pixels[:, 2]
    red = (r > g * 1.18) & (r > b * 1.12) & (g < 160)
    blue = (b > r * 1.16) & (b > g * 1.03) & (r < 160)
    green = (g > r * 1.12) & (g > b * 1.02) & (r < 160)
    counts = {'red': int(red.sum()), 'blue': int(blue.sum()), 'green': int(green.sum())}
    best = max(counts, key=counts.get)
    return best if counts[best] > len(pixels) * .015 else 'unknown'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('archives', type=Path)
    parser.add_argument('--start', type=int, default=0)
    parser.add_argument('--stop', type=int, default=302)
    parser.add_argument('--threads', type=int, default=4)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    imports = json.loads((root / 'handwritten-imports.js').read_text(encoding='utf-8').split('=', 1)[1].strip().removesuffix(';'))
    out = root / '.cache/handwritten-ocr'
    out.mkdir(exist_ok=True)
    model_dir = root / '.cache/rapid-models'
    model_dir.mkdir(exist_ok=True)
    engine = RapidOCR(params={
        'Det.ocr_version': OCRVersion.PPOCRV5, 'Det.model_type': ModelType.MOBILE,
        'Rec.ocr_version': OCRVersion.PPOCRV5, 'Rec.model_type': ModelType.SERVER,
        'Global.model_root_dir': str(model_dir), 'Global.use_cls': False,
        'Global.text_score': .35, 'Global.max_side_len': 4096,
        'Det.limit_side_len': 1280, 'Det.limit_type': 'max',
        'EngineConfig.onnxruntime.intra_op_num_threads': args.threads,
        'EngineConfig.onnxruntime.inter_op_num_threads': 1,
    })
    archive = None
    archive_name = None
    for index in range(args.start, min(args.stop, len(imports))):
        note = imports[index]
        dest = out / (note['id'] + '.json')
        if dest.exists() and json.loads(dest.read_text(encoding='utf-8')).get('lines'):
            print(f'{index + 1}/302 cached', flush=True)
            continue
        started = time.time()
        if note['sourceArchive'] != archive_name:
            if archive:
                archive.close()
            archive_name = note['sourceArchive']
            archive = zipfile.ZipFile(args.archives / archive_name)
        filename = note['source'].split('／', 1)[1].split('；', 1)[0]
        image = np.asarray(ImageOps.exif_transpose(Image.open(io.BytesIO(archive.read(filename)))).convert('RGB'))
        result = engine(cv2.cvtColor(image, cv2.COLOR_RGB2BGR))
        lines = []
        if result.boxes is not None:
            for text, score, box in zip(result.txts, result.scores, result.boxes):
                lines.append({'text': text, 'score': round(float(score), 4),
                              'box': box.tolist(), 'color': ink_color(image, box)})
        data = {'id': note['id'], 'file': filename, 'archive': archive_name,
                'engine': 'RapidOCR 3.8.0 / PP-OCRv5 mobile detection + server recognition',
                'width': image.shape[1], 'height': image.shape[0], 'lines': lines,
                'seconds': round(time.time() - started, 2)}
        tmp = dest.with_suffix('.tmp')
        tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
        tmp.replace(dest)
        print(f'{index + 1}/302 lines={len(lines)} chars={sum(len(x["text"]) for x in lines)} seconds={data["seconds"]}', flush=True)
    if archive:
        archive.close()


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
