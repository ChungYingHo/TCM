<script lang="ts">
  // 一份實力測驗的線上作答。題目本身是裁圖（選項也在圖裡），所以按鈕只給字母。
  // 答案只認 JSON 裡那個從【解答】表抽出來的字母，畫面不做任何推論。
  import type { PracticeAnswers, PracticeLetter, PracticeTest } from '@/models/practice'
  import { PRACTICE_LETTERS, practiceStoreKey, scorePractice } from '@/models/practice'
  import { createJsonStore } from '@/utils/localStore'
  import Icon from '@/components/common/Icon.svelte'

  let { test }: { test: PracticeTest } = $props()

  // SSR 時 localStorage 不存在，read() 會回空物件；到瀏覽器再初始化一次就拿到真的紀錄。
  const store = createJsonStore<PracticeAnswers>(practiceStoreKey(test.code))
  let answers = $state<PracticeAnswers>({ ...store.read() })
  let showAll = $state(false)

  const score = $derived(scorePractice(test, answers))
  const pct = $derived(score.answered ? Math.round((score.correct / score.answered) * 100) : 0)

  function pick(n: number, letter: PracticeLetter) {
    if (answers[String(n)]) return // 一題只答一次，答完就定案
    const next = { ...answers, [String(n)]: letter }
    answers = next
    store.write(next)
  }

  function reset() {
    answers = {}
    store.write({})
    showAll = false
  }

  function stateClass(q: { n: number; answer: PracticeLetter | null }, letter: PracticeLetter): string {
    const picked = answers[String(q.n)]
    if (!picked && !showAll) return 'btn-outline'
    if (q.answer === letter) return 'btn-success'
    if (picked === letter) return 'btn-error'
    return 'btn-outline opacity-60'
  }
</script>

<div class="flex flex-col gap-4">
  <!-- 計分列：黏在上緣，捲到第 40 題也看得到目前狀況 -->
  <div class="sticky top-2 z-20 rounded-box border border-base-300 bg-base-100/95 p-3 shadow-soft backdrop-blur sm:p-4">
    <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <div class="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
        <span>已作答 <b class="tabular-nums">{score.answered}</b><span class="text-base-content/40">/{score.total}</span></span>
        <span>答對 <b class="tabular-nums text-success">{score.correct}</b></span>
        {#if score.answered}
          <span>正確率 <b class="tabular-nums">{pct}%</b></span>
        {/if}
      </div>
      <div class="flex gap-2">
        <button class="btn btn-ghost btn-xs" onclick={() => (showAll = !showAll)}>
          {showAll ? '隱藏答案' : '顯示全部答案'}
        </button>
        <button class="btn btn-ghost btn-xs text-error" onclick={reset} disabled={!score.answered}>
          重做
        </button>
      </div>
    </div>
    <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-base-300/60">
      <div class="h-full bg-primary transition-[width]" style={`width:${(score.answered / score.total) * 100}%`}></div>
    </div>
  </div>

  {#each test.questions as q (q.n)}
    {@const picked = answers[String(q.n)]}
    <section class="rounded-box border border-base-300 bg-base-100 p-3 shadow-soft sm:p-4">
      <div class="mb-2 flex items-center gap-2">
        <span class="badge badge-sm badge-neutral tabular-nums">{q.n}</span>
        {#if picked}
          {#if q.answer && picked === q.answer}
            <span class="text-sm font-semibold text-success">答對</span>
          {:else}
            <span class="text-sm font-semibold text-error">答錯，正解 {q.answer ?? '—'}</span>
          {/if}
        {/if}
      </div>

      <div class="overflow-x-auto">
        <img
          src={q.img}
          alt={q.stem ? `第 ${q.n} 題：${q.stem}` : `第 ${q.n} 題題目圖`}
          width={q.w}
          height={q.h}
          loading="lazy"
          class="h-auto w-full min-w-[34rem] rounded-lg border border-base-200 bg-white"
        />
      </div>

      <div class="mt-3 grid grid-cols-4 gap-2">
        {#each PRACTICE_LETTERS as letter (letter)}
          <button
            type="button"
            class={`btn min-h-10 font-bold ${stateClass(q, letter)}`}
            aria-pressed={picked === letter}
            disabled={!!picked}
            onclick={() => pick(q.n, letter)}
          >
            {letter}
          </button>
        {/each}
      </div>

      {#if (picked || showAll) && q.explain}
        <div class="mt-3 rounded-lg border border-info/30 bg-info/[0.06] px-3 py-2.5 text-sm leading-relaxed">
          <p class="mb-1 font-semibold text-info">詳解</p>
          <p class="whitespace-pre-line text-base-content/80">{q.explain}</p>
        </div>
      {:else if picked && !q.explain}
        <p class="mt-3 text-sm text-base-content/45">這一題原卷沒有附詳解。</p>
      {/if}
    </section>
  {/each}

  <div class="rounded-box border border-base-300 bg-base-200/40 p-4 text-sm leading-relaxed text-base-content/70">
    答案來自原卷的【解答】表，詳解來自原卷的【詳解】。作答紀錄存在這台裝置的瀏覽器裡，
    重新整理不會消失，按「重做」才會清掉。
    <a class="link link-primary" href="/notes?subject=國文">回國文筆記</a>
    <Icon name="arrowRight" class="inline h-3.5 w-3.5" />
  </div>
</div>
