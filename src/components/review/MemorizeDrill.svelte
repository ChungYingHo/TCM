<script lang="ts">
  // 今日必背：把每篇筆記的必背項目當回想卡排班複習（Leitner，同 vocabSrs 的模型）。
  // 正面只給主題與出處，先自己回想，翻開才對答案——這是 Aira 要的「快速複習需要記憶的基礎知識」。
  // 內容直接取自筆記的 `<Memorize items>`，所以筆記改了複習內容就跟著改，不會分歧。
  import { onMount } from 'svelte'
  import type { NoteCard } from '@/utils/noteReview'
  import { dueIds, getCard, grade, learn, leechIds } from '@/utils/noteCardSrs'
  import { seededSample } from '@/utils/reviewSample'
  import Icon from '@/components/common/Icon.svelte'

  const FRESH = 8 // 每輪最多帶進幾張沒學過的新卡，避免第一天就被幾百張淹掉

  let { cards, today }: { cards: NoteCard[]; today: string } = $props()

  const byId = $derived(new Map(cards.map((c) => [c.id, c])))

  let deck = $state<string[]>([])
  let i = $state(0)
  let flipped = $state(false)
  let done = $state(0)
  /** 已放出的提示條數（0＝還沒給）。條列卡逐條放，單句卡放前面一段。 */
  let hints = $state(0)

  function build() {
    const due = dueIds().filter((id) => byId.has(id))
    // 一直答不熟的先考——它們才是真正的破口，混在牌堆中間常常整輪都輪不到（DailyPlan 的
    // 「一直記不起來的」區塊就是宣告這件事，這裡要真的做到）。
    const stuck = new Set(leechIds().filter((id) => byId.has(id)))
    const ordered = [...due.filter((id) => stuck.has(id)), ...due.filter((id) => !stuck.has(id))]
    const seen = new Set(ordered)
    const fresh = seededSample(
      cards.filter((c) => !seen.has(c.id) && !getCard(c.id)),
      FRESH,
      `cards:${today}`,
    ).map((c) => c.id)
    deck = [...ordered, ...fresh]
    i = 0
    done = 0
    flipped = false
    hints = 0
    requeued = new Set()
  }
  // 只在掛載時建一次牌組。作答會寫 SRS → 讓父層重算 props，若用 $effect 重建就會把 i 歸零、
  // 卡在同一張翻不過去（見 VocabStudy 的同一個坑）。
  onMount(build)

  const current = $derived(deck[i] ? byId.get(deck[i]) : null)
  const remaining = $derived(Math.max(0, deck.length - i))

  const revealed = $derived(hints > 0)
  /** 單句卡的提示＝前面約四成，留下後半自己想。 */
  const partial = $derived(current ? current.plain.slice(0, Math.ceil(current.plain.length * 0.4)) : '')
  /** 條列卡放到剩最後一條就停（全放完等於直接看答案）；單句卡要前半有東西可露才給。 */
  const canHint = $derived(
    !!current &&
      (current.points.length
        ? hints < current.points.length - 1
        : hints === 0 && current.plain.length >= 12),
  )

  function hint() {
    hints += 1
  }

  // 這一輪已經重排過的卡，避免答錯兩次就無限循環。
  let requeued = $state<Set<string>>(new Set())

  function answer(known: boolean) {
    const id = deck[i]
    if (id) {
      if (!getCard(id)) learn([id])
      grade(id, known)
      // 答「不熟」的卡排到本輪尾端再回想一次。SRS 只在第一次作答時寫入，這次重考純粹是當場
      // 再試一遍——間隔複習把它排到明天，但當下立刻重試才是最划算的一步（Aira 2026-08-05）。
      if (!known && !requeued.has(id)) {
        requeued.add(id)
        deck = [...deck, id]
      }
    }
    i += 1
    done += 1
    flipped = false
    hints = 0
  }
</script>

{#if !deck.length}
  <p class="py-4 text-center text-sm text-base-content/50">目前沒有到期的必背卡，明天再來。</p>
{:else if !current}
  <div class="rounded-box border border-dashed border-base-300 p-8 text-center">
    <p class="text-lg font-bold">今天的必背複習完了 🎉</p>
    <p class="mt-1 text-sm text-base-content/55">這輪 {done} 張，到期的之後會自動再排進來。</p>
    <button class="btn btn-primary btn-sm mt-3" onclick={build}>再來一輪</button>
  </div>
{:else}
  <div class="mx-auto flex max-w-xl flex-col gap-3">
    <p class="text-center text-sm tabular-nums text-base-content/55">剩 {remaining} 張</p>

    <div class="overflow-hidden rounded-box border border-base-300 bg-base-100 shadow-soft">
      <!-- 出處放大、放在最上面：光看主題想不起來時，「這是哪一篇的」才是真正的檢索線索 -->
      <div class="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-base-200 bg-base-200/40 px-4 py-2.5">
        <span class="badge badge-ghost badge-sm">{current.subject}</span>
        <a class="link-hover truncate text-sm font-semibold text-base-content/75" href={current.noteHref}>
          {current.noteTitle}
        </a>
      </div>

      {#if !flipped}
        <div class="flex min-h-44 flex-col items-center justify-center gap-2.5 p-6 text-center">
          <p class="text-xs tracking-wide text-base-content/45">關於這一項，你記得什麼？</p>
          <p class="font-display text-2xl font-bold leading-snug tracking-tight">
            {@html current.topic || '這篇的重點'}
          </p>
          {#if current.points.length}
            <p class="text-sm text-base-content/50">共 {current.points.length} 個要點</p>
          {/if}

          {#if revealed}
            <div class="memorize-body mt-1 w-full rounded-lg bg-base-200/50 px-4 py-3 text-left text-[0.9rem] leading-relaxed">
              {#if current.points.length}
                <ul class="mz-list">
                  {#each current.points.slice(0, hints) as p, i (i)}<li class="mz-item">{@html p}</li>{/each}
                </ul>
              {:else}
                <span>{partial}…</span>
              {/if}
            </div>
          {/if}

          <div class="mt-2 flex flex-wrap justify-center gap-2">
            {#if canHint}
              <button class="btn btn-ghost btn-sm" onclick={hint}>
                <Icon name="sparkles" class="h-4 w-4" />
                {revealed ? '再給一點' : '給我提示'}
              </button>
            {/if}
            <button class="btn btn-primary btn-sm" onclick={() => (flipped = true)}>翻開看答案</button>
          </div>
        </div>
      {:else}
        <div class="memorize-body px-5 py-4">
          {#if current.topic}
            <p class="mb-1.5 font-semibold text-accent">{@html current.topic}</p>
          {/if}
          <div class="text-[0.9375rem] leading-relaxed">{@html current.body}</div>
        </div>
      {/if}
    </div>

    {#if flipped}
      <div class="grid grid-cols-2 gap-2">
        <button class="btn btn-outline btn-error" onclick={() => answer(false)}>不熟</button>
        <button class="btn btn-success" onclick={() => answer(true)}>記得 <Icon name="check" class="h-4 w-4" /></button>
      </div>
    {/if}
  </div>
{/if}

