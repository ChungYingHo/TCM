<script lang="ts">
  // 今日胺基酸測驗：每天抽幾個胺基酸，看結構猜名／看名選結構／中文↔代號／分類。
  // 連對 streak＋即時回饋帶遊戲感；計分寫入 aminoAcidSrs（與單字／元素共用 Leitner）。
  import { onMount } from 'svelte'
  import { dueIds, grade, learn, getCard } from '@/utils/aminoAcidSrs'
  import { makeQuestion, checkAnswer, QUIZ_ITEM_IDS, type AAQuestion } from '@/utils/aminoAcidQuiz'
  import AminoAcidStructure from '@/components/amino/AminoAcidStructure.svelte'
  import Icon from '@/components/common/Icon.svelte'

  let { count = 8, onfinish }: { count?: number; onfinish?: () => void } = $props()

  let deck = $state<AAQuestion[]>([])
  let i = $state(0)
  let revealed = $state(false)
  let chosen = $state<number | null>(null)
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
    deck = ids.map((id, idx) => makeQuestion(id, base + idx)).filter((q): q is AAQuestion => !!q)
    i = 0
    revealed = false
    chosen = null
    streak = 0
    best = 0
    correctCount = 0
    answered = 0
    finished = false
  }
  // Build once on mount (grading writes the SRS store; a reactive rebuild would reset the deck mid-round).
  onMount(build)

  const current = $derived(deck[i] ?? null)
  const structChoices = $derived(current?.choices.some((c) => c.code) ?? false)

  function submit(idx: number) {
    const q = current
    if (!q || revealed) return
    const ok = checkAnswer(q, idx)
    chosen = idx
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

  function textClass(idx: number): string {
    if (!revealed) return 'btn-outline'
    if (idx === current?.answer) return 'btn-success'
    if (idx === chosen) return 'btn-error'
    return 'btn-ghost opacity-50'
  }
  function structClass(idx: number): string {
    if (!revealed) return 'border-base-300 hover:border-primary'
    if (idx === current?.answer) return 'border-success bg-success/10'
    if (idx === chosen) return 'border-error bg-error/10'
    return 'border-base-300 opacity-40'
  }
</script>

{#if finished}
  <div class="rounded-box border border-base-300 bg-base-100 p-8 text-center shadow-soft">
    <Icon name="sparkles" class="mx-auto h-8 w-8 text-primary" />
    <p class="mt-2 text-lg font-bold">今日胺基酸完成！</p>
    <p class="mt-1 text-sm text-base-content/60 tabular-nums">答對 {correctCount} / {answered}　·　最長連對 {best}</p>
    <button class="btn btn-primary btn-sm mt-4" onclick={build}>再來一輪</button>
  </div>
{:else if !current}
  <div class="rounded-box border border-dashed border-base-300 p-8 text-center">
    <p class="text-base-content/60">今天沒有可練習的胺基酸項目。</p>
  </div>
{:else}
  <div class="mx-auto flex max-w-md flex-col gap-3">
    <!-- 進度 + 連對 -->
    <div class="flex items-center justify-between text-sm">
      <span class="tabular-nums text-base-content/55">{i + 1} / {deck.length}</span>
      {#if streak >= 2}
        <span class="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 font-semibold text-warning">
          <Icon name="flame" class="h-4 w-4" filled /> 連對 {streak}
        </span>
      {/if}
    </div>

    <!-- 題卡 -->
    <div class="rounded-box border border-base-300 bg-base-100 p-5 shadow-soft" class:shake={revealed && !correct}>
      <p class="text-center text-sm text-base-content/55">{current.prompt}</p>
      {#if current.subjectCode}
        <div class="mt-2 flex justify-center"><AminoAcidStructure code1={current.subjectCode} size={150} /></div>
      {:else}
        <p class="mt-1 text-center font-display text-2xl font-bold tracking-tight break-words">{current.subjectText}</p>
      {/if}

      {#if structChoices}
        <!-- 結構選項（n2s）：2×2 結構圖 -->
        <div class="mt-4 grid grid-cols-2 gap-2">
          {#each current.choices as c, idx (idx)}
            <button type="button" disabled={revealed} onclick={() => submit(idx)} class={`flex items-center justify-center rounded-box border-2 p-1 transition ${structClass(idx)}`} aria-label={`選項 ${idx + 1}`}>
              <AminoAcidStructure code1={c.code ?? ''} size={120} />
            </button>
          {/each}
        </div>
      {:else}
        <!-- 文字選項 -->
        <div class="mt-4 grid gap-2 sm:grid-cols-2">
          {#each current.choices as c, idx (idx)}
            <button class={`btn ${textClass(idx)} h-auto min-h-11 whitespace-normal break-words py-2 text-base font-normal`} disabled={revealed} onclick={() => submit(idx)}>
              {c.text}
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <!-- 回饋 -->
    {#if revealed}
      <div class={`rounded-box border p-4 ${correct ? 'border-success/30 bg-success/10' : 'border-error/30 bg-error/10'}`}>
        <p class={`flex items-center gap-2 font-bold ${correct ? 'text-success' : 'text-error'}`}>
          <Icon name={correct ? 'check' : 'x'} class="h-5 w-5" />
          {correct ? '答對了！' : '答錯了'}
        </p>
        <p class="mt-1 break-words text-sm text-base-content/70">{current.explain}</p>
        <button class="btn btn-primary btn-sm mt-3 w-full" onclick={next}>{i + 1 >= deck.length ? '完成' : '下一題'}</button>
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
