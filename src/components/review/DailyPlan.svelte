<script lang="ts">
  import classicsJson from '@/data/classics.json'
  import { onMount } from 'svelte'
  import type { VocabData } from '@/models/vocab'
  import { loadVocab } from '@/utils/vocabData'
  import type { ClassicsData } from '@/models/classics'
  import { dueIds, dumpVocabSrs } from '@/utils/vocabSrs'
  import { dueIds as classicDueIds, grade as gradeClassic } from '@/utils/classicSrs'
  import { composeReview, seededSample } from '@/utils/reviewSample'
  import { todayKey } from '@/utils/date'
  import VocabCard from '@/components/vocab/VocabCard.svelte'
  import VocabStudy from '@/components/vocab/VocabStudy.svelte'
  import ElementQuiz from '@/components/element/ElementQuiz.svelte'
  import AminoAcidQuiz from '@/components/amino/AminoAcidQuiz.svelte'
  import ClassicReader from '@/components/classics/ClassicReader.svelte'
  import Icon from '@/components/common/Icon.svelte'

  const classics = classicsJson as unknown as ClassicsData
  const classicById = new Map(classics.classics.map((c) => [c.id, c]))

  let vocab = $state<VocabData | null>(null)
  const wordById = $derived(new Map((vocab?.words ?? []).map((w) => [w.id, w])))
  onMount(async () => {
    vocab = await loadVocab()
  })

  const today = todayKey()

  let reviewIds = $state<string[]>([])
  let showReview = $state(false)
  let showElement = $state(false)
  let showAmino = $state(false)
  let reviewClassicId = $state<string | null>(null)

  function refresh() {
    reviewIds = composeReview(
      dueIds(),
      Object.keys(dumpVocabSrs()),
      60,
      60,
      today,
    )
    reviewClassicId = classicDueIds()[0] ?? null
  }

  $effect(() => {
    refresh()
    const on = () => refresh()
    window.addEventListener('tcm:statechange', on)
    window.addEventListener('tcm:cloudloaded', on)
    return () => {
      window.removeEventListener('tcm:statechange', on)
      window.removeEventListener('tcm:cloudloaded', on)
    }
  })

  const randomWords = $derived.by(() => {
    if (!vocab) return []
    return seededSample(vocab.words, 20, today)
  })

  const reviewWords = $derived(
    reviewIds.map((id) => wordById.get(id)).filter(Boolean),
  )

  const todayClassic = $derived.by(() => {
    const all = classics.classics
    if (!all.length) return null
    return seededSample(all, 1, today)[0] ?? null
  })

  const reviewClassic = $derived(reviewClassicId ? classicById.get(reviewClassicId) : null)

  function gradeReviewClassic(known: boolean) {
    if (reviewClassicId) gradeClassic(reviewClassicId, known)
    refresh()
  }
</script>

<div class="flex flex-col gap-5">
  {#if !vocab}
    <div class="flex justify-center py-16"><span class="loading loading-spinner loading-lg text-primary"></span></div>
  {:else}

  <!-- 1. 今日單字（隨機 20 個） -->
  {#if randomWords.length}
    <section class="rounded-box border border-base-300 border-l-[3px] border-l-primary bg-base-100 p-4 shadow-soft sm:p-5">
      <h2 class="section-heading mb-3">今日單字 · {randomWords.length} 個</h2>
      <div class="grid gap-2.5 sm:grid-cols-2">
        {#each randomWords as w (w.id)}<VocabCard word={w} />{/each}
      </div>
    </section>
  {/if}

  <!-- 2. 複習單字（SRS 到期 + 隨機補滿）— 翻卡作答回寫間隔重複 -->
  {#if reviewWords.length}
    <section class="rounded-box border border-base-300 border-l-[3px] border-l-info bg-base-100 p-4 shadow-soft sm:p-5">
      <h2 class="section-heading mb-3">複習單字 · {reviewWords.length} 個</h2>
      {#if showReview}
        <VocabStudy words={reviewWords} ids={reviewWords.map((w) => w.id)} />
      {:else}
        <p class="mb-3 text-sm text-base-content/55">SRS 到期的優先、再隨機抽樣補滿。翻卡作答，選「認識／不熟」會自動安排下次複習時間。</p>
        <div class="mb-3 flex flex-wrap gap-1.5">
          {#each reviewWords.slice(0, 30) as w (w.id)}
            <span class="rounded-full border border-base-300 bg-base-200/50 px-2.5 py-1 text-sm" title={w.zh}>{w.word}</span>
          {/each}
          {#if reviewWords.length > 30}<span class="px-1 py-1 text-sm text-base-content/50">…還有 {reviewWords.length - 30} 個</span>{/if}
        </div>
        <button class="btn btn-primary btn-sm" onclick={() => (showReview = true)}>開始複習（{reviewWords.length} 個）<Icon name="arrowRight" class="h-4 w-4" /></button>
      {/if}
    </section>
  {/if}

  <!-- 3. 今日元素 · 週期表地基 -->
  <section class="rounded-box border border-base-300 border-l-[3px] border-l-success bg-base-100 p-4 shadow-soft sm:p-5">
    <h2 class="section-heading mb-3">今日元素 · 週期表地基</h2>
    <p class="mb-3 text-sm text-base-content/55">原子序↔元素、A 族價電子、常用原子量、英中符號、3d/4d/5d 系列。每天抽考，答對自動排間隔複習。</p>
    {#if showElement}
      <ElementQuiz />
    {:else}
      <button class="btn btn-primary btn-sm" onclick={() => (showElement = true)}>開始測驗 <Icon name="sparkles" class="h-4 w-4" /></button>
    {/if}
  </section>

  <!-- 4. 今日胺基酸 -->
  <section class="rounded-box border border-base-300 border-l-[3px] border-l-warning bg-base-100 p-4 shadow-soft sm:p-5">
    <h2 class="section-heading mb-3">今日胺基酸 · 結構對照</h2>
    <p class="mb-3 text-sm text-base-content/55"><b>結構 ↔ 中文 ↔ 英文 ↔ 簡寫</b>四者互相對照——把 20 個胺基酸練熟，答對自動排間隔複習。</p>
    {#if showAmino}
      <AminoAcidQuiz />
    {:else}
      <button class="btn btn-primary btn-sm" onclick={() => (showAmino = true)}>開始測驗 <Icon name="sparkles" class="h-4 w-4" /></button>
    {/if}
  </section>

  <!-- 5. 今日古文（隨機一篇） -->
  {#if todayClassic}
    <section class="rounded-box border border-base-300 border-l-[3px] border-l-accent bg-base-100 p-4 shadow-soft sm:p-5">
      <h2 class="section-heading mb-3">今日古文</h2>
      <p class="mb-3 text-sm text-base-content/55">先讀原文、試著回想語意與讀音，再翻開「白話翻譯」對照。</p>
      <ClassicReader classic={todayClassic} open={false} />
    </section>
  {/if}

  <!-- 6. 複習古文（SRS 到期；先回想再翻譯，選記得／不熟安排下次） -->
  {#if reviewClassic}
    <section class="rounded-box border border-base-300 border-l-[3px] border-l-secondary bg-base-100 p-4 shadow-soft sm:p-5">
      <h2 class="section-heading mb-1">複習古文</h2>
      <p class="mb-3 text-sm text-base-content/55">之前讀過、今天該回顧的一篇——先讀原文回想語意與讀音，再翻開對照，然後選「記得／不熟」安排下次複習。</p>
      <ClassicReader classic={reviewClassic} open={false} />
      <div class="mt-3 grid grid-cols-2 gap-2">
        <button class="btn btn-outline btn-error" onclick={() => gradeReviewClassic(false)}>不熟</button>
        <button class="btn btn-success" onclick={() => gradeReviewClassic(true)}>記得 <Icon name="check" class="h-4 w-4" /></button>
      </div>
    </section>
  {/if}
  {/if}
</div>
