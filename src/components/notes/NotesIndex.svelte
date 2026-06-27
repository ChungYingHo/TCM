<script lang="ts">
  import {
    DEFAULT_CATEGORY,
    NOTE_CATEGORIES,
    NOTE_SUBJECTS,
    notesIn,
    tagsIn,
    type NoteCategory,
    type NoteSubject,
  } from '@/models/notes'
  import Icon from '@/components/common/Icon.svelte'

  const key = (c: NoteCategory, s: NoteSubject) => `${c}::${s}`

  // 分類整塊可收合：只有主分類（考點筆記）預設展開；快速複習等預設收起（速查、置頂、不佔版面）
  const catOpen: Record<NoteCategory, boolean> = $state(
    Object.fromEntries(NOTE_CATEGORIES.map((c) => [c, c === DEFAULT_CATEGORY])) as Record<NoteCategory, boolean>,
  )

  // 分類展開後，預設展開有筆記的科目，空科目收起（保留「分四科」結構但不吵）
  const open: Record<string, boolean> = $state(
    Object.fromEntries(
      NOTE_CATEGORIES.flatMap((c) =>
        NOTE_SUBJECTS.map((s) => [key(c, s), notesIn(c, s).length > 0]),
      ),
    ),
  )

  const activeTag: Record<string, string | null> = $state(
    Object.fromEntries(
      NOTE_CATEGORIES.flatMap((c) => NOTE_SUBJECTS.map((s) => [key(c, s), null])),
    ),
  )

  function toggle(c: NoteCategory, s: NoteSubject) {
    open[key(c, s)] = !open[key(c, s)]
  }

  function setTag(c: NoteCategory, s: NoteSubject, tag: string | null) {
    const k = key(c, s)
    activeTag[k] = activeTag[k] === tag ? null : tag
  }

  function filtered(c: NoteCategory, s: NoteSubject) {
    const all = notesIn(c, s)
    const t = activeTag[key(c, s)]
    return t ? all.filter((n) => n.tags.includes(t)) : all
  }

  function tagCls(c: NoteCategory, s: NoteSubject, tag: string) {
    return activeTag[key(c, s)] === tag
      ? 'rounded-full px-2.5 py-1 text-xs font-medium transition-colors bg-primary text-primary-content'
      : 'rounded-full px-2.5 py-1 text-xs font-medium transition-colors bg-base-content/8 text-base-content/65 hover:bg-base-content/12'
  }
</script>

<div class="flex flex-col gap-8">
  {#each NOTE_CATEGORIES as category (category)}
    {@const total = NOTE_SUBJECTS.reduce((n, s) => n + notesIn(category, s).length, 0)}
    <div class="flex flex-col gap-4">
      <button
        class="flex w-full items-center gap-2 text-left"
        onclick={() => (catOpen[category] = !catOpen[category])}
        aria-expanded={catOpen[category]}
      >
        <span class="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-base-content/5 transition-transform" class:rotate-90={catOpen[category]}>
          <Icon name="chevronRight" class="h-3 w-3 text-base-content/45" />
        </span>
        <h2 class="font-display text-sm font-bold tracking-wide text-base-content/45">{category}</h2>
        <span class="rounded-full bg-base-content/8 px-2 py-0.5 text-[0.65rem] font-medium tabular-nums text-base-content/45">{total} 篇</span>
      </button>

      {#if catOpen[category]}
      <div class="flex flex-col gap-5">
        {#each NOTE_SUBJECTS as subject (subject)}
          {@const notes = notesIn(category, subject)}
          {@const tags = tagsIn(category, subject)}
          {@const vis = filtered(category, subject)}
          {@const isOpen = open[key(category, subject)]}

          <section class="rounded-box border border-base-300 bg-base-100 shadow-soft">
            <!-- 科目標頭（可展開） -->
            <button
              class="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-base-content/[0.03] sm:px-5"
              onclick={() => toggle(category, subject)}
            >
              <span class="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/10 transition-transform" class:rotate-90={isOpen}>
                <Icon name="chevronRight" class="h-4 w-4 text-primary" />
              </span>
              <span class="font-display text-lg font-bold">{subject}</span>
              <span class="rounded-full bg-base-content/8 px-2 py-0.5 text-xs font-medium tabular-nums text-base-content/55">
                {notes.length} 篇
              </span>
            </button>

            {#if isOpen}
              <div class="border-t border-base-200 px-4 pb-4 pt-3 sm:px-5">
                <!-- 標籤篩選 -->
                {#if tags.length > 0}
                  <div class="mb-3 flex flex-wrap gap-1.5">
                    {#each tags as tag (tag)}
                      <button class={tagCls(category, subject, tag)} onclick={() => setTag(category, subject, tag)}>
                        {tag}
                      </button>
                    {/each}
                  </div>
                {/if}

                <!-- 筆記列表 -->
                {#if vis.length > 0}
                  <div class="grid gap-2.5 sm:grid-cols-2">
                    {#each vis as note, i (note.id)}
                      <a href={note.href} class="panel-hover group flex items-start gap-3 rounded-xl border border-base-200 bg-base-100 p-3.5 transition-colors hover:border-primary/25 sm:p-4">
                        <span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 font-display text-sm font-bold text-primary transition-colors group-hover:bg-primary/15">
                          {i + 1}
                        </span>
                        <div class="flex min-w-0 flex-col gap-0.5">
                          <div class="flex flex-wrap items-center gap-1.5">
                            <span class="font-display text-[0.95rem] font-bold leading-tight">{note.title}</span>
                            {#each note.tags as t (t)}
                              <span class="rounded-full bg-primary/12 px-1.5 py-0.5 text-[0.6rem] font-semibold text-primary">{t}</span>
                            {/each}
                          </div>
                          <p class="text-[0.8rem] leading-relaxed text-base-content/55">{note.desc}</p>
                        </div>
                        <Icon name="arrowRight" class="ml-auto mt-0.5 h-4 w-4 shrink-0 text-base-content/25 transition-colors group-hover:text-primary" />
                      </a>
                    {/each}
                  </div>
                {:else if activeTag[key(category, subject)]}
                  <p class="py-2 text-sm text-base-content/50">沒有「{activeTag[key(category, subject)]}」標籤的筆記。</p>
                {:else}
                  <p class="py-2 text-sm text-base-content/50">尚未新增筆記，敬請期待。</p>
                {/if}
              </div>
            {/if}
          </section>
        {/each}
      </div>
      {/if}
    </div>
  {/each}
</div>
