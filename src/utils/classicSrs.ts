// 古文 spaced repetition (Leitner) — thin wrapper over the shared Leitner core, keyed by classic id.
//
// 2026-08-05 起**休眠**：每日複習不再排古文（Aira 指名這是沒在用的功能之一），/classics 仍可自由閱讀。
// 這個 store 保留只為**不要在下次雲端同步時把既有的複習歷史抹掉**——cloud.ts 仍會 dump/replace 它。
import type { ClassicSrsStore } from '@/models/progress'
import { createLeitner } from '@/utils/leitner'

const srs = createLeitner('tcm.classicSrs.v1')

/** Raw snapshot / restore — used by the cloud layer. */
export function dumpClassicSrs(): ClassicSrsStore {
  return srs.dump()
}
export function replaceClassicSrs(store: ClassicSrsStore): void {
  srs.replace(store)
}
