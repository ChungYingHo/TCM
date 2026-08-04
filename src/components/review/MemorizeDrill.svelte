<script lang="ts">
  // 今日必背：把每篇筆記的必背項目當回想卡排班複習（Leitner，同 vocabSrs 的模型）。
  // 正面只給主題與出處，先自己回想，翻開才對答案——這是 Aira 要的「快速複習需要記憶的基礎知識」。
  // 內容直接取自筆記的 `<Memorize items>`，所以筆記改了複習內容就跟著改，不會分歧。
  import { onMount } from 'svelte'
  import type { NoteCard } from '@/utils/noteReview'
  import { dueIds, getCard, grade, learn } from '@/utils/noteCardSrs'
  import { seededSample } from '@/utils/reviewSample'
  import Icon from '@/components/common/Icon.svelte'

  const FRESH = 8 // 每輪最多帶進幾張沒學過的新卡，避免第一天就被幾百張淹掉

  let { cards, today }: { cards: NoteCard[]; today: string } = $props()

  const byId = $derived(new Map(cards.map((c) => [c.id, c])))

  let deck = $state<string[]>([])
  let i = $state(0)
  let flipped = $state(false)
  let done = $state(0)

  function build() {
    const due = dueIds().filter((id) => byId.has(id))
    const seen = new Set(due)
    const fresh = seededSample(
      cards.filter((c) => !seen.has(c.id) && !getCard(c.id)),
      FRESH,
      `cards:${today}`,
    ).map((c) => c.id)
    deck = [...due, ...fresh]
    i = 0
    done = 0
    flipped = false
  }
  // 只在掛載時建一次牌組。作答會寫 SRS → 讓父層重算 props，若用 $effect 重建就會把 i 歸零、
  // 卡在同一張翻不過去（見 VocabStudy 的同一個坑）。
  onMount(build)

  const current = $derived(deck[i] ? byId.get(deck[i]) : null)
  const remaining = $derived(Math.max(0, deck.length - i))

  function answer(known: boolean) {
    const id = deck[i]
    if (id) {
      if (!getCard(id)) learn([id])
      grade(id, known)
    }
    i += 1
    done += 1
    flipped = false
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
      <div class="flex items-center gap-2 border-b border-base-200 bg-base-200/40 px-4 py-2 text-xs text-base-content/55">
        <span class="badge badge-ghost badge-sm">{current.subject}</span>
        <a class="link-hover truncate" href={current.noteHref}>{current.noteTitle}</a>
      </div>

      {#if !flipped}
        <button class="flex min-h-44 w-full flex-col items-center justify-center gap-3 p-6 text-center transition-colors hover:bg-base-content/[0.02]" onclick={() => (flipped = true)}>
          <span class="font-display text-2xl font-bold leading-snug tracking-tight">
            {current.topic || '這篇的重點是什麼？'}
          </span>
          <span class="text-xs text-base-content/40">先自己回想，點一下看答案</span>
        </button>
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

<style>
  /* 卡背是筆記 `<Memorize items>` 的原文 HTML，樣式要跟筆記裡看到的一致。
     {@html} 不吃 Svelte 的作用域，得用 :global。 */
  .memorize-body :global(code) {
    display: inline-block;
    padding: 0.05em 0.4em;
    border-radius: 0.3rem;
    background: color-mix(in srgb, currentColor 9%, transparent);
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 0.92em;
    white-space: nowrap;
    max-width: 100%;
    overflow-x: auto;
    vertical-align: bottom;
  }
  .memorize-body :global(code) :global(sub) {
    font-family: inherit;
  }
  .memorize-body :global(ul) {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .memorize-body :global(li) {
    position: relative;
    padding-left: 0.85em;
    margin-top: 0.3em;
  }
  .memorize-body :global(li:first-child) {
    margin-top: 0.15em;
  }
  .memorize-body :global(li)::before {
    content: '·';
    position: absolute;
    left: 0.1em;
    font-weight: 700;
    opacity: 0.45;
  }
</style>
