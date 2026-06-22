# -*- coding: utf-8 -*-
# Reusable batch picker for the explanation rollout. Read-only; dumps next-N todo.
#   python pipeline/data/_pick.py [subject=chemistry] [N=45] [kind=all|text|figure]
# Sort: daily-quiz pool first, then newest year, then id. Writes _batch.json. Temp.
import json, os, re, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
HERE = os.path.dirname(__file__)
ROOT = os.path.join(HERE, '..', '..')
subject = sys.argv[1] if len(sys.argv) > 1 else 'chemistry'
N = int(sys.argv[2]) if len(sys.argv) > 2 else 45
kind = sys.argv[3] if len(sys.argv) > 3 else 'all'

FIG = re.compile(r'下圖|如[下右左]?圖|[右左附前後]圖|圖[中所示例]|據圖|依圖|看圖|'
                 r'下列(化合物|結構|分子|化學式|反應式?|數據|圖|表)|下表|如下(化合物|結構|圖|表)|'
                 r'此(化合物|結構|分子)|該(化合物|結構)')

def needs_image(q):
    stem = (q.get('question_text') or '').strip()
    if not stem or FIG.search(stem):
        return True
    opts = q.get('options') or []
    return len(opts) < 2 or not all((o.get('text') or '').strip() for o in opts)

cache = json.load(open(os.path.join(HERE, 'question_explanations.json'), encoding='utf-8'))
skip_path = os.path.join(HERE, '_skip.json')
skip = set(json.load(open(skip_path, encoding='utf-8'))) if os.path.exists(skip_path) else set()
done = lambda qid: (qid in skip) or (qid in cache and isinstance(cache[qid], str) and cache[qid].strip())
sched = json.load(open(os.path.join(ROOT, 'src/data/schedule.json'), encoding='utf-8'))
pool = set()
for ids in (sched.get('quizPoolByTag') or {}).values():
    pool.update(ids)

qs = []
for sch in ('CMU', 'ISU', 'TCU'):
    qs.extend(json.load(open(os.path.join(ROOT, f'src/data/{sch}.json'), encoding='utf-8'))['questions'])
todo = [q for q in qs if q['subject'] == subject and not done(q['id'])]
if kind == 'text':
    todo = [q for q in todo if not needs_image(q)]
elif kind == 'figure':
    todo = [q for q in todo if needs_image(q)]
todo.sort(key=lambda q: (0 if q['id'] in pool else 1, -int(q['year']), q['id']))
nfig = sum(1 for q in todo if needs_image(q))
print(f'{subject}: todo={len(todo)} (figure={nfig} text={len(todo)-nfig}) in-pool-todo={sum(1 for q in todo if q["id"] in pool)}')

batch = todo[:N]
out = [{
    'id': q['id'], 'yr': q['year'], 'num': q['question_number'], 'fig': needs_image(q),
    'stem': q.get('question_text') or '',
    'opts': [[o['letter'], o.get('text') or ''] for o in q.get('options') or []],
    'ans': q.get('correct_answer') or [], 'award_all': q.get('award_all', False),
    'tags': q.get('concept_tags') or [], 'img': q['question_image_url'], 'pimg': q.get('passage_image_url'),
} for q in batch]
json.dump(out, open(os.path.join(HERE, '_batch.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'=== batch: {len(out)} q (figure={sum(1 for q in out if q["fig"])}) ===')
for q in out:
    flag = ' [FIG]' if q['fig'] else ''
    aw = ' [送分]' if q['award_all'] else ''
    print(f'\n### {q["id"]}  ans={",".join(q["ans"])}{flag}{aw}')
    print(f'Q: {q["stem"]}')
    print('  ' + ' | '.join(f'({l}){t}' for l, t in q['opts']))
