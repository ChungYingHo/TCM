<script lang="ts">
  // One vocabulary card: headword + KK phonetic + 中文 + a bilingual example (the
  // example is the point — it's how Aira likes to memorise). The example also reuses
  // other 考過 words on purpose: those are underlined and tap to peek their meaning, so
  // reading one card doubles as a mini-review. Reused by the daily plan, the vocab
  // browser, and the flashcard study mode.
  import type { VocabWord } from '@/models/vocab'
  import Icon from '@/components/common/Icon.svelte'
  import { touch } from '@/utils/vocabSrs'

  let { word, onstudied }: { word: VocabWord; onstudied?: () => void } = $props()

  // Which reused word's gloss is currently revealed (tap to toggle).
  let peek = $state<{ s: string; zh: string } | null>(null)

  type Seg = { t: string; kind: 'text' | 'head' | 'reuse'; w?: string; zh?: string }

  // Slice the example into plain text, the bolded headword, and tappable reused words.
  // Ranges come from the headword match + each precomputed reuse surface; overlaps are
  // dropped (first wins) so rendering is a single clean pass.
  const segments = $derived.by<Seg[]>(() => {
    const ex = word.example
    if (!ex) return []
    const ranges: { start: number; end: number; kind: 'head' | 'reuse'; w?: string; zh?: string }[] = []
    const headRe = new RegExp(`\\b${word.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\w*`, 'i')
    const hm = ex.match(headRe)
    if (hm && hm.index !== undefined) ranges.push({ start: hm.index, end: hm.index + hm[0].length, kind: 'head' })
    for (const r of word.reuses ?? []) {
      const i = ex.indexOf(r.s)
      if (i >= 0) ranges.push({ start: i, end: i + r.s.length, kind: 'reuse', w: r.w, zh: r.zh })
    }
    ranges.sort((a, b) => a.start - b.start)
    const out: Seg[] = []
    let pos = 0
    for (const rg of ranges) {
      if (rg.start < pos) continue
      if (rg.start > pos) out.push({ t: ex.slice(pos, rg.start), kind: 'text' })
      out.push({ t: ex.slice(rg.start, rg.end), kind: rg.kind, w: rg.w, zh: rg.zh })
      pos = rg.end
    }
    if (pos < ex.length) out.push({ t: ex.slice(pos), kind: 'text' })
    return out
  })

  const hasReuse = $derived((word.reuses?.length ?? 0) > 0)

  // Tapping a reused word reveals its gloss AND counts as a light incidental review of
  // that word (touch is a no-op for words not yet learned).
  function tapReuse(t: string, w: string, zh: string) {
    if (peek?.s === t) {
      peek = null
      return
    }
    peek = { s: t, zh }
    if (w) touch([w])
  }
</script>

<article class="flex flex-col gap-1.5 rounded-box border border-base-300 bg-base-100 p-4 shadow-soft">
  <div class="flex items-baseline justify-between gap-2">
    <h3 class="font-display text-xl font-bold tracking-tight">{word.word}</h3>
    {#if word.examCount}
      <span class="badge badge-warning badge-sm shrink-0 font-medium" title="此字在後中三校考古題出現過">後中考過 {word.examCount} 次</span>
    {/if}
  </div>

  <div class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
    {#if word.phonetic}<span class="text-base-content/55">/{word.phonetic}/</span>{/if}
    {#if word.pos}<span class="text-base-content/45">{word.pos}</span>{/if}
    {#each word.tags.filter((t) => ['gre', 'toefl', 'ielts'].includes(t)) as t (t)}
      <span class="badge badge-ghost badge-xs uppercase">{t}</span>
    {/each}
  </div>

  {#if word.parts?.length}
    <div class="flex flex-wrap items-center gap-1 text-sm">
      {#each word.parts as p, i (i)}
        {#if i > 0}<span class="text-base-content/30" aria-hidden="true">＋</span>{/if}
        <span class="inline-flex items-baseline gap-1 rounded-md bg-primary/10 px-1.5 py-0.5">
          <span class="font-semibold text-primary">{p.text}</span>
          <span class="text-xs text-base-content/60">{p.gloss}</span>
        </span>
      {/each}
    </div>
  {/if}

  <p class="leading-snug {word.parts?.length ? 'text-sm text-base-content/70' : 'text-[15px]'}">{word.zh}</p>

  {#if word.etymology}
    <p class="border-l-2 border-primary/25 pl-2 text-[13px] leading-relaxed text-base-content/70">
      <span class="mr-1 font-medium text-primary/70">字源</span>{word.etymology}
    </p>
  {/if}

  {#if word.derivatives?.length}
    <div class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[13px] text-base-content/65">
      <span class="font-medium text-base-content/45">衍</span>
      {#each word.derivatives as d, i (i)}
        <span><span class="font-medium text-base-content/85">{d.word}</span>{#if d.pos}&nbsp;<span class="text-base-content/45">{d.pos}</span>{/if}{#if d.zh}&nbsp;{d.zh}{/if}</span>
      {/each}
    </div>
  {/if}

  {#if word.example}
    <div class="mt-1 rounded-lg bg-base-200/60 p-2.5 text-sm">
      <p class="leading-relaxed">
        {#each segments as seg, i (i)}{#if seg.kind === 'head'}<strong class="text-primary">{seg.t}</strong>{:else if seg.kind === 'reuse'}<button
              type="button"
              class="border-b border-dotted border-primary/50 transition-colors hover:text-primary {peek?.s === seg.t ? 'text-primary' : 'text-base-content/90'}"
              title="點看字義（考過的字）"
              onclick={() => tapReuse(seg.t, seg.w ?? '', seg.zh ?? '')}>{seg.t}</button>{:else}{seg.t}{/if}{/each}
      </p>

      {#if peek}
        <p class="mt-1.5 flex items-baseline gap-1.5 rounded bg-primary/10 px-2 py-1 text-xs">
          <strong class="shrink-0 text-primary">{peek.s}</strong>
          <span class="text-base-content/75">{peek.zh}</span>
        </p>
      {/if}

      {#if word.example_zh}<p class="mt-0.5 text-base-content/60">{word.example_zh}</p>{/if}

      <div class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
        {#if word.draft}<span class="inline-block rounded bg-base-300/60 px-1 text-[10px] text-base-content/50">AI 草稿例句</span>{/if}
        {#if hasReuse}<span class="text-[10px] text-base-content/40">點<span class="border-b border-dotted border-primary/50">底線字</span>複習考過的字</span>{/if}
      </div>
    </div>
  {/if}

  {#if onstudied}
    <button class="btn btn-ghost btn-xs mt-1 self-end text-primary" onclick={onstudied}>記起來了 <Icon name="check" class="h-3.5 w-3.5" /></button>
  {/if}
</article>
