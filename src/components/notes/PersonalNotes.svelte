<script lang="ts">
  // "我的筆記" — personal notes filed under this concept tag (jotted while drilling,
  // or added here). Cached in localStorage, persisted to the Vercel DB via cloud.ts.
  import { SCHOOL_LABEL, SUBJECT_LABEL } from '@/models/question'
  import type { School, Subject } from '@/models/question'
  import { notesByTag, addNote, deleteNote } from '@/utils/notes'

  let { tag }: { tag: string } = $props()

  let list = $state(notesByTag(tag))
  let draft = $state('')

  $effect(() => {
    const refresh = () => { list = notesByTag(tag) }
    window.addEventListener('tcm:cloudloaded', refresh)
    window.addEventListener('tcm:statechange', refresh)
    return () => {
      window.removeEventListener('tcm:cloudloaded', refresh)
      window.removeEventListener('tcm:statechange', refresh)
    }
  })

  function add() {
    const t = draft.trim()
    if (!t) return
    addNote(tag, '', t)
    draft = ''
    list = notesByTag(tag)
  }
  function remove(id: string) {
    deleteNote(id)
    list = notesByTag(tag)
  }
  function source(id: string): { label: string; href: string } | null {
    const [school, year, subject, num] = id.split('-')
    if (!school || !num) return null
    return {
      label: `${SCHOOL_LABEL[school as School] ?? school} ${year} ${SUBJECT_LABEL[subject as Subject] ?? subject} 第${num}題`,
      href: `/study?school=${school}&tag=${encodeURIComponent(tag)}`,
    }
  }
  function when(ts: number): string {
    const d = new Date(ts)
    return `${d.getMonth() + 1}/${d.getDate()}`
  }
</script>

<section class="my-4" data-no-ai>
  <h2 class="mb-2 flex items-center gap-1.5 text-lg font-bold"><span aria-hidden="true">✎</span>我的筆記</h2>

  <div class="mb-3 flex flex-col gap-2 rounded-box border border-base-300 bg-base-100 p-3">
    <textarea bind:value={draft} rows="2" placeholder="記下你對這個考點的心得、易錯點、口訣…（自動存到雲端）" class="textarea textarea-bordered w-full text-sm"></textarea>
    <button type="button" class="btn btn-primary btn-sm self-start" onclick={add} disabled={!draft.trim()}>新增筆記</button>
  </div>

  {#if list.length === 0}
    <p class="text-sm text-base-content/50">還沒有筆記。刷題時按「✎ 筆記」或在上面新增，都會收進這裡。</p>
  {:else}
    <ul class="flex flex-col gap-2">
      {#each list as n (n.id)}
        <li class="rounded-box border border-base-300 bg-base-100 p-3">
          <p class="whitespace-pre-wrap text-sm leading-relaxed">{n.text}</p>
          <div class="mt-1.5 flex items-center gap-2 text-xs text-base-content/45">
            <span>{when(n.ts)}</span>
            {#if source(n.questionId)}
              <a class="hover:text-primary hover:underline" href={source(n.questionId)?.href}>← {source(n.questionId)?.label}</a>
            {/if}
            <button type="button" class="ml-auto hover:text-error" onclick={() => remove(n.id)}>刪除</button>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</section>
