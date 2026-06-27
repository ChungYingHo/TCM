<script lang="ts">
  // 每日刷題：每科從「筆記例題＋考古題」混合池，依日期 seeded 隨機抽 10 題。
  // 四科各一張可收合卡——點開才載入該科題庫並顯示，不一進首頁就拉滿資料。
  import type { QuestionRecord, Subject } from '@/models/question'
  import { SUBJECTS, SUBJECT_LABEL, SCHOOLS } from '@/models/question'
  import type { NoteExample } from '@/utils/noteExamples'
  import { loadSchools } from '@/utils/dataset'
  import { loadNoteDrillData } from '@/utils/noteExamplesData'
  import { seededSample } from '@/utils/reviewSample'
  import { todayKey } from '@/utils/date'
  import QuestionCard from '@/components/question/QuestionCard.svelte'
  import ExampleQuestion from '@/components/notes/ExampleQuestion.svelte'
  import Icon from '@/components/common/Icon.svelte'

  const PER_SUBJECT = 10
  const today = todayKey()

  type DrillItem =
    | { kind: 'exam'; key: string; q: QuestionRecord }
    | { kind: 'example'; key: string; e: NoteExample }

  let questions = $state<QuestionRecord[]>([])
  let examples = $state<NoteExample[]>([])
  // 每科筆記涵蓋的考點 tag（由 NoteStats/RelatedQuestions 宣告）→ 考古題只抽這些 tag 的題
  let coveredTags = $state<Partial<Record<string, string[]>>>({})
  let loading = $state(false)
  let loaded = $state(false)
  let error = $state('')
  const open = $state<Record<Subject, boolean>>(
    Object.fromEntries(SUBJECTS.map((s) => [s, false])) as Record<Subject, boolean>,
  )

  async function ensureLoaded() {
    if (loaded || loading) return
    loading = true
    error = ''
    try {
      const [qs, drill] = await Promise.all([loadSchools([...SCHOOLS]), loadNoteDrillData()])
      questions = qs
      examples = drill.examples
      coveredTags = drill.coveredTags
      loaded = true
    } catch (e) {
      error = String(e)
    } finally {
      loading = false
    }
  }

  function toggle(s: Subject) {
    open[s] = !open[s]
    if (open[s]) void ensureLoaded()
  }

  function drawFor(subject: Subject): DrillItem[] {
    const label = SUBJECT_LABEL[subject]
    const covered = coveredTags[label] ?? []
    // 考古題只取筆記真的有教（concept_tag ∈ 筆記宣告的考點）的題目，避免抽到沒寫過的考點
    const examItems: DrillItem[] = covered.length
      ? questions
          .filter((q) => q.subject === subject && q.concept_tags.some((t) => covered.includes(t)))
          .map((q): DrillItem => ({ kind: 'exam', key: `q:${q.id}`, q }))
      : []
    const pool: DrillItem[] = [
      ...examples
        .filter((e) => e.subject === label)
        .map((e): DrillItem => ({ kind: 'example', key: `ex:${e.id}`, e })),
      ...examItems,
    ]
    return seededSample(pool, PER_SUBJECT, `drill:${subject}:${today}`)
  }
</script>

<section class="rounded-box border border-base-300 border-l-[3px] border-l-primary bg-base-100 p-4 shadow-soft sm:p-5">
  <h2 class="section-heading mb-1">今日刷題 · 各科 {PER_SUBJECT} 題</h2>
  <p class="mb-3 text-sm text-base-content/55"><b>只考筆記教過的範圍</b>：每科從筆記例題＋對應考點的考古題隨機抽 {PER_SUBJECT} 題，每天換一批。考古題答錯會自動進錯題本。</p>

  {#if error}
    <div class="alert alert-error text-sm">{error}</div>
  {/if}

  <div class="flex flex-col gap-2.5">
    {#each SUBJECTS as subject (subject)}
      <div class="overflow-hidden rounded-xl border border-base-300">
        <button
          class="flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-base-content/[0.03]"
          onclick={() => toggle(subject)}
          aria-expanded={open[subject]}
        >
          <span class="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/10 transition-transform" class:rotate-90={open[subject]}>
            <Icon name="chevronRight" class="h-3.5 w-3.5 text-primary" />
          </span>
          <span class="font-display font-bold">{SUBJECT_LABEL[subject]}</span>
          <span class="ml-auto text-xs text-base-content/45">{open[subject] ? '收起' : '開始測驗'}</span>
        </button>

        {#if open[subject]}
          <div class="border-t border-base-200 p-3.5">
            {#if loading && !loaded}
              <div class="flex justify-center py-8"><span class="loading loading-spinner text-primary"></span></div>
            {:else}
              {@const items = drawFor(subject)}
              {#if items.length === 0}
                <p class="py-4 text-center text-sm text-base-content/50">這科還沒有筆記，先去寫／讀筆記，之後才會出對應的考古題複習。</p>
              {:else}
                <div class="flex flex-col gap-3">
                  {#each items as item (item.key)}
                    {#if item.kind === 'exam'}
                      <QuestionCard question={item.q} mode="study" />
                    {:else}
                      <ExampleQuestion
                        n={item.e.n}
                        q={item.e.q}
                        options={item.e.options}
                        answer={item.e.answer}
                        steps={item.e.steps}
                      />
                    {/if}
                  {/each}
                </div>
              {/if}
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</section>
