<script lang="ts">
  // 每日複習（2026-08-04 改版，Aira 定案）：白天的複習夥伴只做兩件事——
  //   ① 單字（新字＋SRS 複習），每天不可斷
  //   ② 快速複習需要記憶的基礎知識＝各篇筆記的必背卡（SRS 回想卡）＋筆記例題
  // 拿掉的：Unit Factor 測驗、今日／複習古文、元素小遊戲、胺基酸小遊戲、考古題刷題。
  // 元素與胺基酸沒有消失，是改以必背卡的形式跟其他化學一起排班（見 /api/note-review）。
  import { onMount } from 'svelte'
  import { prefixById, type PrefixGroup, type VocabData } from '@/models/vocab'
  import { loadVocab } from '@/utils/vocabData'
  import { seenVocabIds, vocabForDay } from '@/utils/vocabSchedule'
  import { dueIds, dumpVocabSrs, learn } from '@/utils/vocabSrs'
  import { dueIds as cardDueIds } from '@/utils/noteCardSrs'
  import type { NoteCard, NoteExample } from '@/utils/noteReview'
  import { loadNoteReviewData } from '@/utils/noteReviewData'
  import { composeReview } from '@/utils/reviewSample'
  import { todayKey } from '@/utils/date'
  import VocabCard from '@/components/vocab/VocabCard.svelte'
  import VocabStudy from '@/components/vocab/VocabStudy.svelte'
  import MemorizeDrill from '@/components/review/MemorizeDrill.svelte'
  import DailyDrill from '@/components/review/DailyDrill.svelte'
  import Icon from '@/components/common/Icon.svelte'

  const today = todayKey()

  let vocab = $state<VocabData | null>(null)
  let cards = $state<NoteCard[]>([])
  let examples = $state<NoteExample[]>([])
  let notesFailed = $state(false)

  const wordById = $derived(new Map((vocab?.words ?? []).map((w) => [w.id, w])))

  onMount(async () => {
    const [v, n] = await Promise.allSettled([loadVocab(), loadNoteReviewData()])
    if (v.status === 'fulfilled') vocab = v.value
    if (n.status === 'fulfilled') {
      cards = n.value.cards
      examples = n.value.examples
    } else {
      notesFailed = true
    }
    seedSchedule()
    refresh()
  })

  let reviewIds = $state<string[]>([])
  let showReview = $state(false)
  let showCards = $state(false)

  // 今日單字先遮中文，逼自己用字首字根推一次再翻答案（Aira 2026-08-05）。純 UI 偏好，
  // 直接寫 localStorage——不走 createJsonStore，那個會發 statechange 觸發雲端同步與本頁 refresh。
  const MASK_KEY = 'tcm.vocabMask.v1'
  let maskZh = $state(true)
  onMount(() => {
    maskZh = localStorage.getItem(MASK_KEY) !== 'off'
  })
  function toggleMask() {
    maskZh = !maskZh
    localStorage.setItem(MASK_KEY, maskZh ? 'on' : 'off')
  }

  // 把「到今天為止看過的今日單字」種進 SRS 排程（含回填起算日至今）。冪等：learn 只補新卡、
  // 不動已學的（見 leitner.ts）。這步是為了打破 bootstrap 死結——複習清單只撈排程內的字，新字
  // 若從沒被種過，複習區永遠是空的，那個唯一能造卡的複習流程也就永遠開不了。也扛住 cloud 把
  // 本地排程覆寫成空（cloud.ts）後的重新種子：learn 若沒補到新卡不寫入、不會迴圈。
  function seedSchedule() {
    if (vocab) learn(seenVocabIds(vocab.words, today))
  }

  function refresh() {
    // 今日單字已單獨列在上方，複習區把它們濾掉，避免同一天上下重複同 20 個字。
    const todayIds = new Set(vocab ? vocabForDay(vocab.words, today).map((w) => w.id) : [])
    reviewIds = composeReview(
      dueIds().filter((id) => !todayIds.has(id)),
      Object.keys(dumpVocabSrs()).filter((id) => !todayIds.has(id)),
      60,
      60,
      today,
    )
    dueCards = cardDueIds().length
  }

  let dueCards = $state(0)

  $effect(() => {
    refresh()
    const on = () => {
      seedSchedule()
      refresh()
    }
    window.addEventListener('tcm:statechange', on)
    window.addEventListener('tcm:cloudloaded', on)
    return () => {
      window.removeEventListener('tcm:statechange', on)
      window.removeEventListener('tcm:cloudloaded', on)
    }
  })

  const todayWords = $derived(vocab ? vocabForDay(vocab.words, today) : [])
  const todayGroups = $derived(
    [...new Set(todayWords.map((w) => w.prefixId))]
      .map((id) => (id === undefined ? undefined : prefixById(id)))
      .filter((g): g is PrefixGroup => g !== undefined),
  )
  const reviewWords = $derived(reviewIds.map((id) => wordById.get(id)).filter(Boolean))
</script>

<div class="flex flex-col gap-5">
  {#if !vocab}
    <div class="flex justify-center py-16"><span class="loading loading-spinner loading-lg text-primary"></span></div>
  {:else}

  <!-- 1. 今日單字（依字根順序，每天 20 個、字根組跨日連續） -->
  {#if todayWords.length}
    <section class="rounded-box border border-base-300 border-l-[3px] border-l-primary bg-base-100 p-4 shadow-soft sm:p-5">
      <div class="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h2 class="section-heading">今日單字 · {todayWords.length} 個</h2>
        <label class="flex cursor-pointer items-center gap-1.5 text-xs text-base-content/60">
          <input type="checkbox" class="toggle toggle-xs toggle-primary" checked={maskZh} onchange={toggleMask} />
          先遮中文
        </label>
      </div>
      <p class="mb-3 text-sm text-base-content/55">涵蓋字首 {todayGroups.map((g) => g.forms.join('／')).join('、')}；依字根順序每天 {todayWords.length} 個、字根組跨日連續（非隨機）。</p>
      <div class="grid gap-2.5 sm:grid-cols-2">
        {#each todayWords as w (w.id)}<VocabCard word={w} masked={maskZh} />{/each}
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

  <!-- 3. 今日必背（各篇筆記的必背項目，SRS 回想卡） -->
  <section class="rounded-box border border-base-300 border-l-[3px] border-l-accent bg-base-100 p-4 shadow-soft sm:p-5">
    <h2 class="section-heading mb-1">
      今日必背
      {#if dueCards}<span class="section-sub tabular-nums">到期 {dueCards} 張</span>{/if}
    </h2>
    {#if notesFailed}
      <p class="text-sm text-error">必背卡載入失敗，重新整理看看。</p>
    {:else if showCards}
      <MemorizeDrill {cards} {today} />
    {:else}
      <p class="mb-3 text-sm text-base-content/55">內膜系統、訊號傳遞、軌域這些<b>要記的地基</b>——正面只給主題，先自己回想再翻開對答案。內容直接來自各篇筆記的必背區，共 {cards.length} 張。</p>
      <button class="btn btn-primary btn-sm" onclick={() => (showCards = true)} disabled={!cards.length}>
        開始回想 <Icon name="sparkles" class="h-4 w-4" />
      </button>
    {/if}
  </section>

  <!-- 4. 今日練習題（筆記例題，各科每天換一批） -->
  <section class="rounded-box border border-base-300 border-l-[3px] border-l-success bg-base-100 p-4 shadow-soft sm:p-5">
    <h2 class="section-heading mb-1">今日練習題</h2>
    <p class="mb-3 text-sm text-base-content/55">各科從筆記例題隨機抽幾題，每天換一批，只考筆記教過的範圍。想寫整份考古題到<a class="link link-primary" href="/exam">線上測驗</a>。</p>
    <DailyDrill {examples} {today} />
  </section>
  {/if}
</div>
