<script lang="ts">
  import type { QuestionRecord, School, Subject } from '@/models/question'
  import { SCHOOLS, SUBJECTS, SCHOOL_LABEL, SUBJECT_LABEL } from '@/models/question'
  import { loadSchools, deriveFacets } from '@/utils/dataset'
  import { byTaxonomyOrder, tagShort, claimedNoteHref } from '@/models/taxonomy'
  import { filterQuestions, searchQuestions } from '@/utils/query'
  import MultiSelect from '@/components/common/MultiSelect.svelte'
  import QuestionCard from '@/components/question/QuestionCard.svelte'

  const PAGE = 30

  function urlParam(name: string): string | null {
    if (typeof window === 'undefined') return null
    return new URLSearchParams(window.location.search).get(name)
  }
  const initSchools = (urlParam('school')?.split(',').filter(Boolean) as School[]) || null
  const initTag = urlParam('tag')
  const initTerm = urlParam('q') // e.g. from the 高頻單字表 ("看考過這個字的題目")

  // tag/word deep-link with no school -> search all schools; otherwise default to ISU
  let schools = $state<School[]>(
    initSchools?.length ? initSchools : initTag || initTerm ? [...SCHOOLS] : ['ISU'],
  )
  let years = $state<number[]>([])
  let subjects = $state<Subject[]>([])
  let tags = $state<string[]>(initTag ? [initTag] : [])
  let term = $state(initTerm ?? '')
  let limit = $state(PAGE)
  let compact = $state(false)

  let questions = $state<QuestionRecord[]>([])
  let loading = $state(false)
  let error = $state('')

  $effect(() => {
    const sel = schools
    loading = true
    error = ''
    loadSchools(sel)
      .then((qs) => {
        questions = qs
      })
      .catch((e) => {
        error = String(e)
      })
      .finally(() => {
        loading = false
      })
  })

  const facets = $derived(deriveFacets(questions))
  const tagsBySubject = $derived.by(() => {
    // transient locals inside a $derived — recomputed wholesale, never held as
    // reactive state, so plain Map/Set are correct here.
    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    const m = new Map<Subject, Set<string>>()
    for (const q of questions) {
      if (!q.concept_tags.length) continue
      // eslint-disable-next-line svelte/prefer-svelte-reactivity
      const set = m.get(q.subject) ?? new Set<string>()
      q.concept_tags.forEach((t) => set.add(t))
      m.set(q.subject, set)
    }
    return SUBJECTS.map((s) => ({
      subject: s,
      tags: [...(m.get(s) ?? [])].sort(byTaxonomyOrder),
    })).filter((g) => g.tags.length)
  })
  const filtered = $derived(
    searchQuestions(filterQuestions(questions, { schools, years, subjects, tags }), term),
  )
  const visible = $derived(filtered.slice(0, limit))

  // reset paging + cursor when the result set changes
  $effect(() => {
    void (filtered.length, term)
    limit = PAGE
    current = 0
  })

  // keyboard drilling: J/K (or ↑/↓) move cursor, 1–5 answer, Enter reveal
  let current = $state(0)
  let cards = $state<ReturnType<typeof Object>[]>([])

  function focusCurrent() {
    if (typeof document !== 'undefined')
      document.getElementById(`sq-${current}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }

  function onKey(e: KeyboardEvent) {
    const tag = (e.target as HTMLElement)?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
    if (e.key === 'j' || e.key === 'ArrowDown') {
      current = Math.min(current + 1, visible.length - 1); focusCurrent(); e.preventDefault()
    } else if (e.key === 'k' || e.key === 'ArrowUp') {
      current = Math.max(0, current - 1); focusCurrent(); e.preventDefault()
    } else if (/^[1-5]$/.test(e.key)) {
      cards[current]?.selectByIndex?.(Number(e.key) - 1)
    } else if (e.key === 'Enter') {
      cards[current]?.reveal?.()
    }
  }

  $effect(() => {
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
</script>

<div class="grid gap-4 lg:grid-cols-[20rem_1fr]">
  <!-- Filters -->
  <aside class="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:self-start lg:overflow-y-auto custom-scrollbar">
    <div class="card border border-base-300 bg-base-100">
      <div class="card-body gap-4 p-4">
        <input
          type="search"
          class="input input-bordered w-full"
          placeholder="搜尋題目／選項文字…"
          bind:value={term}
        />
        <MultiSelect label="學校" options={SCHOOLS} bind:selected={schools} format={(s) => SCHOOL_LABEL[s]} />
        <MultiSelect label="科目" options={SUBJECTS} bind:selected={subjects} format={(s) => SUBJECT_LABEL[s]} />
        <MultiSelect label="年份（民國）" options={facets.years} bind:selected={years} />
        {#if facets.tags.length}
          <details class="rounded-box border border-base-300 bg-base-200/40" open={tags.length > 0}>
            <summary class="cursor-pointer list-none px-3 py-2 text-sm font-semibold">
              趨勢標籤（{facets.tags.length}）
              {#if tags.length}<span class="badge badge-primary badge-sm ml-1">{tags.length}</span>{/if}
            </summary>
            <div class="flex max-h-[50vh] flex-col gap-3 overflow-y-auto border-t border-base-300 p-3 custom-scrollbar">
              {#each tagsBySubject as group (group.subject)}
                <MultiSelect label={SUBJECT_LABEL[group.subject]} options={group.tags} bind:selected={tags} format={tagShort} noteHref={claimedNoteHref} />
              {/each}
            </div>
          </details>
        {/if}
      </div>
    </div>
  </aside>

  <!-- Results -->
  <section class="flex flex-col gap-3">
    <div class="flex flex-wrap items-center justify-between gap-2 text-sm opacity-80">
      <span>
        {#if loading}載入中…{:else}共 <b>{filtered.length}</b> 題{/if}
      </span>
      <div class="flex items-center gap-3">
        {#if schools.length > 0}
          <span class="hidden text-xs opacity-60 lg:inline">↑↓ / J K 移動 · 1–5 作答 · Enter 看答案</span>
          <label class="flex cursor-pointer items-center gap-1.5 text-xs">
            <input type="checkbox" class="toggle toggle-xs toggle-primary" bind:checked={compact} />
            精簡
          </label>
        {/if}
      </div>
    </div>
    {#if schools.length === 0}
      <div class="text-sm text-warning">請至少選一間學校</div>
    {/if}

    {#if error}
      <div class="alert alert-error">{error}</div>
    {/if}

    {#each visible as q, i (q.id)}
      <div id={`sq-${i}`}>
        <QuestionCard bind:this={cards[i]} question={q} mode="study" active={i === current} {compact} />
      </div>
    {/each}

    {#if visible.length < filtered.length}
      <button class="btn btn-outline" onclick={() => (limit += PAGE)}>
        顯示更多（{filtered.length - visible.length} 題）
      </button>
    {/if}

    {#if !loading && filtered.length === 0 && schools.length > 0}
      <div class="rounded-box border border-dashed border-base-300 p-8 text-center opacity-70">
        沒有符合條件的題目，試著放寬篩選。
      </div>
    {/if}
  </section>
</div>
