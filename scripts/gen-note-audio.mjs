// Populate each concept note's `audio:` frontmatter with a spoken-review script,
// derived DETERMINISTICALLY from the note's own (already human-reviewed) Memorize
// + KeyPoints blocks — no LLM, no new facts. The AudioReader (browser TTS) reads
// it for drive-time / eyes-free revision.
//
// Notes that already carry a hand-written `audio:` (e.g. acid-base) are left
// untouched. Run: `node scripts/gen-note-audio.mjs`
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const NOTES_DIR = join(HERE, '..', 'src', 'content', 'notes')

/** Turn note-prose (HTML + markdown + math) into something a TTS engine reads cleanly. */
function speakify(s) {
  return s
    .replace(/<br\s*\/?>/gi, '。')
    .replace(/<[^>]+>/g, '') // strip HTML tags (<b>, <i>, …)
    .replace(/\*\*(.+?)\*\*/g, '$1') // markdown bold
    .replace(/`([^`]+)`/g, '$1') // inline code
    .replace(/\${1,2}/g, '') // math delimiters
    .replace(/&lt;/g, '小於').replace(/&gt;/g, '大於').replace(/&amp;/g, '與')
    .replace(/[＝=]/g, '等於')
    .replace(/≈/g, '約等於')
    .replace(/≠/g, '不等於')
    .replace(/[≥⩾]/g, '大於等於').replace(/[≤⩽]/g, '小於等於')
    .replace(/×/g, '乘以').replace(/÷/g, '除以')
    .replace(/→/g, '，得到 ')
    .replace(/[\[\]]/g, '') // brackets around ions/concentrations
    .replace(/\s*[│|]\s*/g, '，')
    .replace(/[。、，]\s*[。、，]+/g, '。') // collapse doubled punctuation
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function extractMemorize(body) {
  const m = body.match(/<Memorize>([\s\S]*?)<\/Memorize>/)
  return m ? speakify(m[1]) : ''
}

function extractKeyPoints(body) {
  const block = body.match(/items=\{\[([\s\S]*?)\]\}/)
  if (!block) return []
  const strings = []
  const re = /(["'])((?:\\.|(?!\1).)*)\1/g
  let hit
  while ((hit = re.exec(block[1]))) {
    const raw = hit[2].replace(/\\(["'])/g, '$1')
    const t = speakify(raw)
    if (t) strings.push(t)
  }
  return strings
}

function frontmatterField(fm, name) {
  const m = fm.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'))
  return m ? m[1].trim().replace(/^['"]|['"]$/g, '') : ''
}

/** YAML folded block — safe for arbitrary prose (no quoting needed), 2-space indent. */
function foldedBlock(text) {
  const lines = text
    .split(/(?<=。)/) // keep sentence-final 。 with its sentence
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => `  ${l}`)
  return `audio: >\n${lines.join('\n')}\n`
}

const files = readdirSync(NOTES_DIR).filter((f) => f.endsWith('.mdx'))
let written = 0
let skipped = 0

for (const file of files) {
  const path = join(NOTES_DIR, file)
  const raw = readFileSync(path, 'utf8')
  const eol = raw.includes('\r\n') ? '\r\n' : '\n'
  const src = raw.replace(/\r\n/g, '\n') // parse in LF, restore eol on write
  const fmMatch = src.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!fmMatch) {
    console.warn(`! ${file}: no frontmatter, skipped`)
    continue
  }
  const [, fm, body] = fmMatch

  // already has a real audio script → leave the curated version alone
  if (/^audio:\s*(?:[>|]|['"]?\S)/m.test(fm)) {
    skipped += 1
    continue
  }

  const tag = frontmatterField(fm, 'tag')
  const memorize = extractMemorize(body)
  const keypoints = extractKeyPoints(body)

  const parts = [`${tag}，重點複習。`]
  if (memorize) parts.push(memorize)
  if (keypoints.length) parts.push('解題重點：' + keypoints.join('。'))
  if (!memorize && !keypoints.length) {
    const summary = frontmatterField(fm, 'summary')
    if (summary) parts.push(speakify(summary))
  }
  let script = parts.join('。').replace(/。+/g, '。').trim()
  if (!script.endsWith('。')) script += '。'

  // insert the audio block right before `draft:` (always present), else append
  const audioYaml = foldedBlock(script).trimEnd()
  const newFm = /^draft:/m.test(fm)
    ? fm.replace(/^(draft:.*)$/m, `${audioYaml}\n$1`)
    : `${fm}\n${audioYaml}`

  const out = `---\n${newFm}\n---\n${body}`.replace(/\n/g, eol)
  writeFileSync(path, out, 'utf8')
  written += 1
}

console.log(`audio frontmatter: wrote ${written}, skipped ${skipped} (already had audio), of ${files.length} notes`)
