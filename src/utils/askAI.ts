// "問 AI" — no API integration. Builds a context-rich prompt, copies it to the
// clipboard, and opens Gemini in a new tab; the user pastes (Ctrl/Cmd+V) and sends.
import type { QuestionRecord } from '@/models/question'
import { primaryTag } from '@/models/taxonomy'
import { solveSteps } from '@/models/solveTemplates'

const GEMINI_URL = 'https://gemini.google.com/app'

export function buildQuestionPrompt(q: QuestionRecord): string {
  const opts = (q.options ?? [])
    .filter((o) => o.text)
    .map((o) => `(${o.letter}) ${o.text}`)
    .join('\n')
  const ans = (q.correct_answer ?? []).join('、')
  const tag = primaryTag(q.concept_tags) ?? ''
  const steps = solveSteps(tag).map((s) => `- ${s.replace(/<[^>]+>/g, '')}`).join('\n')
  const lines = [
    '我在準備學士後中醫考試，請用初學者也懂的方式幫我解這題：解釋為什麼正解正確、其他選項為什麼錯，以及下次遇到同類題該怎麼判斷。',
    '',
    `【考點】${tag}`,
    `【題目】${q.question_text || '（此題以圖片呈現，文字可能不完整）'}`,
  ]
  if (opts) lines.push('【選項】', opts)
  if (ans) lines.push(`【正確答案】${ans}`)
  if (steps) lines.push('【參考解題方向】', steps)
  return lines.join('\n')
}

export function buildSelectionPrompt(text: string): string {
  return `請用初學者也懂的方式，清楚解釋以下內容（必要時舉例），這是我準備學士後中醫考試時看到的：\n\n${text.trim()}`
}

async function copy(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none'
    document.body.appendChild(ta)
    ta.select()
    try { document.execCommand('copy') } catch { /* ignore */ }
    ta.remove()
  }
}

function toast(msg: string): void {
  const el = document.createElement('div')
  el.textContent = msg
  el.setAttribute('role', 'status')
  el.style.cssText =
    'position:fixed;left:50%;bottom:1.5rem;transform:translateX(-50%) translateY(8px);' +
    'background:var(--color-neutral,#222);color:#fff;padding:.6rem 1rem;border-radius:.75rem;' +
    'font-size:.85rem;z-index:9999;opacity:0;transition:opacity .25s,transform .25s;' +
    'box-shadow:0 8px 28px -8px rgba(0,0,0,.5);max-width:90vw;text-align:center'
  document.body.appendChild(el)
  requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'translateX(-50%) translateY(0)' })
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300) }, 2800)
}

/** Copy the prompt and open Gemini. */
export async function askGemini(prompt: string): Promise<void> {
  await copy(prompt)
  window.open(GEMINI_URL, '_blank', 'noopener')
  toast('已複製問題 → 切到 Gemini 貼上（Ctrl/⌘+V）按 Enter 即可')
}
