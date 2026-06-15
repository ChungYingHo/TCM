// Lazy loader for per-question AI-draft worked solutions (src/data/explanations.json).
// One fetch per session, cached in-module; AnswerReveal looks up by question id.
export interface ExplanationData {
  count: number
  eligible: number
  draft: boolean
  solutions: Record<string, string>
}

let cache: Promise<ExplanationData> | null = null

export function loadExplanations(): Promise<ExplanationData> {
  if (!cache) {
    cache = fetch('/api/data/explanations').then((res) => {
      if (!res.ok) throw new Error(`failed to load explanations: ${res.status}`)
      return res.json() as Promise<ExplanationData>
    })
    cache.catch(() => (cache = null)) // let a later mount retry after a failed load
  }
  return cache
}
