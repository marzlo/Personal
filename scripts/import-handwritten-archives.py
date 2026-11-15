"""Import photographed notes, sequentially, without inventing transcriptions.

Dry run by default. Original archives are never modified. The manifest records
source checksums and conservative visual matches against existing WebP photos.
"""
import argparse
import hashlib
import io
import json
from pathlib import Path
import zipfile

import numpy as np
from PIL import Image, ImageOps


def fingerprint(image):
    small = ImageOps.grayscale(image).resize((32, 32))
    a = np.asarray(small, dtype=float)
    return a, a[:, 1:] > a[:, :-1]


def main():
    p = argparse.ArgumentParser()
    p.add_argument('archives', type=Path)
    p.add_argument('--apply', action='store_true')
    p.add_argument('--report', type=Path, required=True)
    args = p.parse_args()
    root = Path(__file__).resolve().parents[1]
    existing = []
    valid_paths = set()
    for f in sorted((root / 'assets/handwritten').glob('*.webp')):
        try:
            existing.append((f.as_posix(), fingerprint(ImageOps.exif_transpose(Image.open(f)))))
            valid_paths.add(f)
        except OSError:
            pass  # A stopped conversion is rewritten from the untouched source archive.
    seen = {}
    report = {'batches': [], 'new': 0, 'duplicates': 0, 'candidates': []}
    imports_path = root / 'handwritten-imports.js'
    entries = json.loads(imports_path.read_text(encoding='utf-8').split('=', 1)[1].strip().removesuffix(';')) if imports_path.exists() else []
    imported_hashes = {e['sourceSha256'] for e in entries}
    for archive in sorted(args.archives.glob('*.zip')):
        batch = {'archive': archive.name, 'images': []}
        with zipfile.ZipFile(archive) as z:
            for info in z.infolist():
                if info.is_dir() or Path(info.filename).suffix.lower() not in {'.jpg', '.jpeg', '.png', '.webp'}:
                    continue
                data = z.read(info)
                sha = hashlib.sha256(data).hexdigest()
                note_id = 'photo-' + sha[:16]
                image_path = 'assets/handwritten/' + note_id + '.webp'
                image = ImageOps.exif_transpose(Image.open(io.BytesIO(data))).convert('RGB')
                a, bits = fingerprint(image)
                matches = sorted((float(np.mean(bits != b)), float(np.sqrt(np.mean((a - ref) ** 2))), path)
                                 for path, (ref, b) in existing)
                best = matches[0] if matches else (1, 255, '')
                # JPEG/WebP re-encoding changes bytes but scarcely changes these pixels.
                duplicate = seen.get(sha) or (best[2] if best[0] < .045 and best[1] < 9 else None)
                if duplicate and Path(duplicate).name == note_id + '.webp':
                    duplicate = None  # Resume without treating our own earlier output as a duplicate.
                if duplicate and Path(duplicate).is_absolute():
                    duplicate = Path(duplicate).relative_to(root).as_posix()
                item = {'file': info.filename, 'sha256': sha, 'duplicateOf': duplicate,
                        'closest': {'image': best[2].split('/assets/')[-1], 'difference': best[0], 'rmse': best[1]}}
                batch['images'].append(item)
                if duplicate:
                    report['duplicates'] += 1
                    continue
                if best[0] < .14 and Path(best[2]).name != note_id + '.webp':
                    report['candidates'].append({'archive': archive.name, **item})
                seen[sha] = image_path
                report['new'] += 1
                if sha not in imported_hashes:
                    entries.append(dict(id=note_id, number=Path(info.filename).stem,
                                    title='手寫筆記 · ' + Path(info.filename).stem,
                                    topic='待轉錄', source=archive.name + '／' + info.filename,
                                    image=image_path, body='', question='', annotation='',
                                    status='untranscribed', sourceSha256=sha, sourceArchive=archive.name))
                if args.apply and root / image_path not in valid_paths:
                    image.thumbnail((2600, 2600), Image.Resampling.LANCZOS)
                    target = root / image_path
                    temporary = target.with_suffix('.tmp')
                    image.save(temporary, 'WEBP', quality=87, exif=b'', method=0)
                    temporary.replace(target)
        report['batches'].append(batch)
        if args.apply:
            imports_path.write_text('window.HANDWRITTEN_IMPORTS = ' + json.dumps(entries, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
        print(f'{archive.name}: {len(batch["images"])} checked', flush=True)
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    if args.apply:
        imports_path.write_text('window.HANDWRITTEN_IMPORTS = ' + json.dumps(entries, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
    print(json.dumps({'new': report['new'], 'duplicates': report['duplicates'], 'candidates': len(report['candidates'])}))


if __name__ == '__main__':
    main()
