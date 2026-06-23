<script lang="ts">
  import { onMount } from 'svelte'
  import { makeQuestions, checkAnswer, type UnitFactorQuestion } from '@/utils/unitFactorQuiz'
  import Icon from '@/components/common/Icon.svelte'

  let { count = 8, onfinish }: { count?: number; onfinish?: () => void } = $props()

  let deck = $state<UnitFactorQuestion[]>([])
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
    deck = makeQuestions(count)
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
    <p class="mt-2 text-lg font-bold">今日化學基礎完成！</p>
    <p class="mt-1 text-sm text-base-content/60 tabular-nums">
      答對 {correctCount} / {answered}　·　最長連對 {best}
    </p>
    <button class="btn btn-primary btn-sm mt-4" onclick={build}>再來一輪</button>
  </div>
{:else if !current}
  <div class="rounded-box border border-dashed border-base-300 p-8 text-center">
    <p class="text-base-content/60">沒有可練習的題目。</p>
  </div>
{:else}
  <div class="mx-auto flex max-w-md flex-col gap-3">
    <div class="flex items-center justify-between text-sm">
      <span class="text-base-content/55 tabular-nums">{i + 1} / {deck.length}</span>
      {#if streak >= 2}
        <span class="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 font-semibold text-warning">
          <Icon name="flame" class="h-4 w-4" filled /> 連對 {streak}
        </span>
      {/if}
    </div>

    <div class="rounded-box border border-base-300 bg-base-100 p-6 shadow-soft" class:shake={revealed && !correct}>
      <p class="text-center text-sm text-base-content/55">{current.prompt}</p>
      <p class="mt-1 text-center font-display text-2xl font-bold tracking-tight break-words">{current.subject}</p>

      <div class="mt-5 grid gap-2 sm:grid-cols-2">
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

    {#if revealed}
      <div class="rounded-box border p-4 {correct ? 'border-success/30 bg-success/10' : 'border-error/30 bg-error/10'}">
        <p class="flex items-center gap-2 font-bold {correct ? 'text-success' : 'text-error'}">
          <Icon name={correct ? 'check' : 'x'} class="h-5 w-5" />
          {correct ? '答對了！' : '答錯了'}
        </p>
        {#if !correct}<p class="mt-1 text-sm">正解：<span class="font-semibold break-words">{current.answer}</span></p>{/if}
        <p class="mt-1 text-sm text-base-content/70 break-words">
          <span class="font-semibold">Unit Factor：</span>{current.explain}
        </p>
        <button class="btn btn-primary btn-sm mt-3 w-full" onclick={next}>
          {i + 1 >= deck.length ? '完成' : '下一題'}
        </button>
      </div>
    {/if}
  </div>
{/if}
