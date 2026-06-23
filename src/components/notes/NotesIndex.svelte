<script lang="ts">
  import { NOTE_SUBJECTS, notesBySubject, tagsBySubject, type NoteSubject } from '@/models/notes'
  import Icon from '@/components/common/Icon.svelte'

  const open: Record<NoteSubject, boolean> = $state(
    Object.fromEntries(NOTE_SUBJECTS.map((s) => [s, true])) as Record<NoteSubject, boolean>,
  )

  const activeTag: Record<NoteSubject, string | null> = $state(
    Object.fromEntries(NOTE_SUBJECTS.map((s) => [s, null])) as Record<NoteSubject, string | null>,
  )

  function toggle(s: NoteSubject) {
    open[s] = !open[s]
  }

  function setTag(s: NoteSubject, tag: string | null) {
    activeTag[s] = activeTag[s] === tag ? null : tag
  }

  function filtered(s: NoteSubject) {
    const all = notesBySubject(s)
    const t = activeTag[s]
    return t ? all.filter((n) => n.tags.includes(t)) : all
  }

  function tagCls(s: NoteSubject, tag: string) {
    return activeTag[s] === tag
      ? 'rounded-full px-2.5 py-1 text-xs font-medium transition-colors bg-primary text-primary-content'
      : 'rounded-full px-2.5 py-1 text-xs font-medium transition-colors bg-base-content/8 text-base-content/65 hover:bg-base-content/12'
  }
</script>

<div class="flex flex-col gap-5">
  {#each NOTE_SUBJECTS as subject (subject)}
    {@const notes = notesBySubject(subject)}
    {@const tags = tagsBySubject(subject)}
    {@const vis = filtered(subject)}

    <section class="rounded-box border border-base-300 bg-base-100 shadow-soft">
      <!-- 科目標頭（可展開） -->
      <button
        class="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-base-content/[0.03] sm:px-5"
        onclick={() => toggle(subject)}
      >
        <span class="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/10 transition-transform" class:rotate-90={open[subject]}>
          <Icon name="chevronRight" class="h-4 w-4 text-primary" />
        </span>
        <span class="font-display text-lg font-bold">{subject}</span>
        <span class="rounded-full bg-base-content/8 px-2 py-0.5 text-xs font-medium tabular-nums text-base-content/55">
          {notes.length} 篇
        </span>
      </button>

      {#if open[subject]}
        <div class="border-t border-base-200 px-4 pb-4 pt-3 sm:px-5">
          <!-- 標籤篩選 -->
          {#if tags.length > 0}
            <div class="mb-3 flex flex-wrap gap-1.5">
              {#each tags as tag (tag)}
                <button
                  class={tagCls(subject, tag)}
                  onclick={() => setTag(subject, tag)}
                >
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
          {:else if activeTag[subject]}
            <p class="py-2 text-sm text-base-content/50">沒有「{activeTag[subject]}」標籤的筆記。</p>
          {:else}
            <p class="py-2 text-sm text-base-content/50">尚未新增筆記，敬請期待。</p>
          {/if}
        </div>
      {/if}
    </section>
  {/each}
</div>
