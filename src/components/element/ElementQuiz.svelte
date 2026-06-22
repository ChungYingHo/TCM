<script lang="ts">
  // 今日元素「測驗」：每天抽幾個元素，問原子序↔元素、中/英/符號、價電子、族、週期、常用原子量、
  // 3d/4d/5d 系列。全部選擇題（手機不好打字），連對 streak 與即時回饋帶點遊戲感；
  // 計分後寫入 elementSrs（與單字共用一套「到期複習」心智模型）。
  import { onMount } from 'svelte'
  import { dueIds, grade, learn, getCard } from '@/utils/elementSrs'
  import { makeQuestion, checkAnswer, QUIZ_ITEM_IDS, type ElementQuestion } from '@/utils/elementQuiz'
  import Icon from '@/components/common/Icon.svelte'

  let { count = 8, onfinish }: { count?: number; onfinish?: () => void } = $props()

  let deck = $state<ElementQuestion[]>([])
  let i = $state(0)
  let revealed = $state(false)
  let chosen = $state<string | null>(null)
  let correct = $state(false)
  let streak = $state(0)
  let best = $state(0)
  let correctCount = $state(0)
  let answered = $state(0)
  let finished = $state(false)

  function build() {
    const due = dueIds().slice(0, count)
    const seen = new Set(due)
    const fresh = QUIZ_ITEM_IDS.filter((id) => !getCard(id) && !seen.has(id))
    for (let k = fresh.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1))
      ;[fresh[k], fresh[j]] = [fresh[j], fresh[k]]
    }
    const ids = [...due, ...fresh].slice(0, count)
    const base = Math.floor(Math.random() * 1e9)
    deck = ids.map((id, idx) => makeQuestion(id, base + idx)).filter((q): q is ElementQuestion => !!q)
    i = 0
    revealed = false
    chosen = null
    streak = 0
    best = 0
    correctCount = 0
    answered = 0
    finished = false
  }
  onMount(build)

  const current = $derived(deck[i] ?? null)
  const longChoice = $derived(current?.choices.some((c) => c.length > 8) ?? false)

  function submit(answerStr: string) {
    const q = current
    if (!q || revealed) return
    const ok = checkAnswer(q, answerStr)
    chosen = answerStr
    correct = ok
    revealed = true
    answered += 1
    if (ok) {
      correctCount += 1
      streak += 1
      best = Math.max(best, streak)
    } else {
      streak = 0
    }
    if (!getCard(q.itemId)) learn([q.itemId])
    grade(q.itemId, ok)
  }

  function next() {
    i += 1
    revealed = false
    chosen = null
    if (i >= deck.length) {
      finished = true
      onfinish?.()
    }
  }

  function choiceClass(c: string): string {
    if (!revealed) return 'btn-outline'
    if (c === current?.answer) return 'btn-success'
    if (c === chosen) return 'btn-error'
    return 'btn-ghost opacity-50'
  }
</script>

{#if finished}
  <div class="rounded-box border border-base-300 bg-base-100 p-8 text-center shadow-soft">
    <Icon name="sparkles" class="mx-auto h-8 w-8 text-primary" />
    <p class="mt-2 text-lg font-bold">今日元素完成！</p>
    <p class="mt-1 text-sm text-base-content/60 tabular-nums">
      答對 {correctCount} / {answered}　·　最長連對 {best}
    </p>
    <button class="btn btn-primary btn-sm mt-4" onclick={build}>再來一輪</button>
  </div>
{:else if !current}
  <div class="rounded-box border border-dashed border-base-300 p-8 text-center">
    <p class="text-base-content/60">今天沒有可練習的元素項目。</p>
  </div>
{:else}
  <div class="mx-auto flex max-w-md flex-col gap-3">
    <!-- 進度 + 連對 -->
    <div class="flex items-center justify-between text-sm">
      <span class="text-base-content/55 tabular-nums">{i + 1} / {deck.length}</span>
      {#if streak >= 2}
        <span class="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 font-semibold text-warning">
          <Icon name="flame" class="h-4 w-4" filled /> 連對 {streak}
        </span>
      {/if}
    </div>

    <!-- 題卡 -->
    <div class="rounded-box border border-base-300 bg-base-100 p-6 shadow-soft" class:shake={revealed && !correct}>
      <p class="text-center text-sm text-base-content/55">{current.prompt}</p>
      <p class="mt-1 text-center font-display text-3xl font-bold tracking-tight break-words">{current.subject}</p>

      <div class="mt-5 grid gap-2 {longChoice ? '' : 'sm:grid-cols-2'}">
        {#each current.choices as c (c)}
          <button
            class="btn {choiceClass(c)} h-auto min-h-11 whitespace-normal break-words py-2 text-base font-normal"
            disabled={revealed}
            onclick={() => submit(c)}
          >
            {c}
          </button>
        {/each}
      </div>
    </div>

    <!-- 回饋 -->
    {#if revealed}
      <div class="rounded-box border p-4 {correct ? 'border-success/30 bg-success/10' : 'border-error/30 bg-error/10'}">
        <p class="flex items-center gap-2 font-bold {correct ? 'text-success' : 'text-error'}">
          <Icon name={correct ? 'check' : 'x'} class="h-5 w-5" />
          {correct ? '答對了！' : '答錯了'}
        </p>
        {#if !correct}<p class="mt-1 text-sm">正解：<span class="font-semibold break-words">{current.answer}</span></p>{/if}
        {#if current.explain}<p class="mt-1 text-sm text-base-content/70 break-words">{current.explain}</p>{/if}
        <button class="btn btn-primary btn-sm mt-3 w-full" onclick={next}>
          {i + 1 >= deck.length ? '完成' : '下一題'}
        </button>
      </div>
    {/if}
  </div>
{/if}

<style>
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-5px); }
    40%, 80% { transform: translateX(5px); }
  }
  .shake { animation: shake 0.32s ease-in-out; }
</style>
