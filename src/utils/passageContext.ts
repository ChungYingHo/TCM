// 題組（長閱讀／克漏字）support: each question's screenshot is cropped from its own
// number to the next, so the SHARED passage of a question group sits at the bottom of
// an EARLIER question's image. When such a question is served standalone (daily drill,
// wrong book, tag quiz, mini quiz), the reader needs a way to pull up that context.

const GROUP_STEM = /(依|根)據(上|下|本|甲|乙|丙|此)文|承上題|閱讀後回答/

/** Tags whose questions hang off a shared passage that lives outside their own crop. */
const GROUP_TAGS = new Set(['克漏字', '閱讀測驗'])

/** Does this question likely belong to a passage group (= needs earlier-image context)? */
export function needsPassageContext(q: {
  question_text?: string | null
  concept_tags?: string[] | null
  question_number: number | string
}): boolean {
  if (Number(q.question_number) <= 1) return false // nothing earlier to look at
  if ((q.concept_tags || []).some((t) => GROUP_TAGS.has(t))) return true
  return GROUP_STEM.test(q.question_text || '')
}

/** Image URL of the question `back` numbers earlier in the same paper (null if none).
 *  Derived from the predictable /q/<school>/<year>/<subject>/<n>.webp layout. */
export function earlierImageUrl(
  q: { question_image_url?: string | null; question_number: number | string },
  back: number,
): string | null {
  const url = q.question_image_url
  const n = Number(q.question_number) - back
  if (!url || n < 1) return null
  return url.replace(/\d+(\.\w+)$/, `${n}$1`)
}
