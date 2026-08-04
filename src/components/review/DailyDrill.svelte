<script lang="ts">
  // 今日練習題：各科從「筆記例題」依日期 seeded 抽 N 題，每天換一批。
  // 2026-08-04 起不再混考古題——考古題退成 /exam 的線上測驗，練習只考筆記真的教過的東西。
  import type { NoteSubject } from '@/models/notes'
  import { NOTE_SUBJECTS } from '@/models/notes'
  import type { NoteExample } from '@/utils/noteReview'
  import { seededSample } from '@/utils/reviewSample'
  import ExampleQuestion from '@/components/notes/ExampleQuestion.svelte'
  import Icon from '@/components/common/Icon.svelte'

  const PER_SUBJECT = 6

  let { examples, today }: { examples: NoteExample[]; today: string } = $props()

  const open = $state<Record<NoteSubject, boolean>>(
    Object.fromEntries(NOTE_SUBJECTS.map((s) => [s, false])) as Record<NoteSubject, boolean>,
  )

  const counts = $derived(
    Object.fromEntries(
      NOTE_SUBJECTS.map((s) => [s, examples.filter((e) => e.subject === s).length]),
    ) as Record<NoteSubject, number>,
  )

  function drawFor(subject: NoteSubject): NoteExample[] {
    return seededSample(
      examples.filter((e) => e.subject === subject),
      PER_SUBJECT,
      `drill:${subject}:${today}`,
    )
  }
</script>

<div class="flex flex-col gap-2.5">
  {#each NOTE_SUBJECTS as subject (subject)}
    <div class="overflow-hidden rounded-xl border border-base-300">
      <button
        class="flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-base-content/[0.03] disabled:opacity-45"
        onclick={() => (open[subject] = !open[subject])}
        aria-expanded={open[subject]}
        disabled={counts[subject] === 0}
      >
        <span class="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/10 transition-transform" class:rotate-90={open[subject]}>
          <Icon name="chevronRight" class="h-3.5 w-3.5 text-primary" />
        </span>
        <span class="font-display font-bold">{subject}</span>
        <span class="ml-auto text-xs text-base-content/45">
          {#if counts[subject] === 0}還沒有例題{:else}{open[subject] ? '收起' : '開始練習'}{/if}
        </span>
      </button>

      {#if open[subject]}
        <div class="border-t border-base-200 p-3.5">
          <div class="flex flex-col gap-3">
            {#each drawFor(subject) as e (e.id)}
              <ExampleQuestion n={e.n} q={e.q} options={e.options} answer={e.answer} steps={e.steps} />
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/each}
</div>
