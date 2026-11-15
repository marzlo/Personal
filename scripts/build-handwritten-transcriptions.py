"""Publish complete local OCR output as explicitly unverified drafts.

Visual corrections take precedence. Existing note IDs/photos and owner edits
are not modified. Low-confidence lines stay visible, labelled for checking.
"""
import json
from pathlib import Path
import re
from opencc import OpenCC

ROOT = Path(__file__).resolve().parents[1]
FIELDS = ('body', 'question', 'annotation')


def classify(line, width, height):
    points = line['box']
    xs, ys = [p[0] for p in points], [p[1] for p in points]
    w, h = max(xs) - min(xs), max(ys) - min(ys)
    text = line['text'].strip()
    if h > w * 1.35 or (len(text) <= 3 and (sum(xs)/4 < width * .2 or sum(ys)/4 < height * .18)):
        return 'annotation'
    if re.search(r'[Pp][.．。:：\s]*\d{1,4}', text) and sum(ys)/4 > height * .65:
        return 'annotation'
    if line['color'] == 'red' and re.search(r'[?？]', text):
        return 'question'
    return 'body'


def main():
    path = ROOT / 'handwritten-imports.js'
    notes = json.loads(path.read_text(encoding='utf-8').split('=', 1)[1].strip().removesuffix(';'))
    corrections = json.loads((ROOT / 'handwritten-transcription-corrections.json').read_text(encoding='utf-8'))
    exceptions = json.loads((ROOT / 'handwritten-transcription-exceptions.json').read_text(encoding='utf-8'))
    cc = OpenCC('s2t')
    report = {'total': len(notes), 'visualDrafts': 0, 'machineDrafts': 0, 'needsPhoto': [], 'missing': [], 'photos': []}
    for note in notes:
        filename = note['source'].split('／', 1)[1].split('；', 1)[0]
        issue = exceptions.get(Path(filename).stem)
        if issue:
            note.update(body='', question='', annotation='', status='needs-photo',
                        topic='手寫筆記／需清晰照片', transcriptionMethod='unreadable', transcriptionIssue=issue)
            for key in ('ocrLines', 'ocrOriginalFields'):
                note.pop(key, None)
            report['needsPhoto'].append({'id': note['id'], 'file': filename, 'reason': issue})
            report['photos'].append({'id': note['id'], 'file': filename, 'method': 'unreadable'})
            continue
        correction = corrections.get(Path(filename).stem)
        if correction:
            entry = dict(correction)
            source = entry.pop('sourceText')
            note.update(entry, status='pending', transcriptionMethod='visual')
            note['source'] = note['sourceArchive'] + '／' + filename + '；' + source
            for key in ('ocrLines', 'ocrOriginalFields'):
                note.pop(key, None)
            report['visualDrafts'] += 1
            report['photos'].append({'id': note['id'], 'file': filename, 'method': 'visual'})
            continue
        output = ROOT / '.cache/handwritten-ocr' / (note['id'] + '.json')
        if not output.exists():
            report['missing'].append(note['id'])
            continue
        result = json.loads(output.read_text(encoding='utf-8'))
        lines = result.get('lines', [])
        if not lines or sum(len(x['text']) for x in lines) < 30:
            report['missing'].append(note['id'])
            continue
        groups = {key: [] for key in FIELDS}
        normalized = []
        for line in lines:
            role = classify(line, result['width'], result['height'])
            text = cc.convert(line['text'].strip())
            if not text:
                continue
            uncertain = line['score'] < .92
            if uncertain:
                text += '〔待確認〕'
            groups[role].append(text)
            normalized.append({'text': text, 'role': role, 'color': line['color'], 'uncertain': uncertain})
        # If layout detection assigned everything to margins, retain all text
        # in the body rather than silently publishing a blank transcription.
        if not groups['body']:
            for line in normalized:
                line['role'] = 'body'
            groups = {'body': [x['text'] for x in normalized], 'question': [], 'annotation': []}
        for key in FIELDS:
            note[key] = '\n'.join(groups[key])
        note.update(status='ocr-draft', topic='手寫筆記／辨識草稿', transcriptionMethod='local-ocr',
                    ocrLines=normalized, ocrOriginalFields={key: note[key] for key in FIELDS})
        report['machineDrafts'] += 1
        report['photos'].append({'id': note['id'], 'file': filename, 'method': 'local-ocr',
                                 'lines': len(normalized), 'linesToCheck': sum(x['uncertain'] for x in normalized)})
    if report['missing']:
        (ROOT / '.cache/transcription-progress.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
        raise SystemExit(f'Not publishing incomplete batch: {len(report["missing"])} photos still need OCR/review')
    path.write_text('window.HANDWRITTEN_IMPORTS = ' + json.dumps(notes, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
    (ROOT / 'handwritten-transcription-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({key: value for key, value in report.items() if key != 'photos'}))


if __name__ == '__main__':
    main()
