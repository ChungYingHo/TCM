<script lang="ts">
  // One vocabulary card: headword + KK phonetic + 中文 + a bilingual example (the
  // example is the point — it's how Aira likes to memorise). Reused by the daily
  // plan, the vocab browser, and the flashcard study mode.
  import type { VocabWord } from '@/models/vocab'
  import Icon from '@/components/common/Icon.svelte'

  let { word, onstudied }: { word: VocabWord; onstudied?: () => void } = $props()

  // Split the example so the headword (and its inflections) can be bolded.
  const parts = $derived.by(() => {
    if (!word.example) return null
    const re = new RegExp(`(${word.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\w*)`, 'i')
    const m = word.example.match(re)
    if (!m || m.index === undefined) return [word.example, '', '']
    return [word.example.slice(0, m.index), m[0], word.example.slice(m.index + m[0].length)]
  })
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

  <p class="text-[15px] leading-snug">{word.zh}</p>

  {#if parts}
    <div class="mt-1 rounded-lg bg-base-200/60 p-2.5 text-sm">
      <p class="leading-relaxed">{parts[0]}<strong class="text-primary">{parts[1]}</strong>{parts[2]}</p>
      {#if word.example_zh}<p class="mt-0.5 text-base-content/60">{word.example_zh}</p>{/if}
      {#if word.draft}<span class="mt-1 inline-block rounded bg-base-300/60 px-1 text-[10px] text-base-content/50">AI 草稿例句</span>{/if}
    </div>
  {/if}

  {#if onstudied}
    <button class="btn btn-ghost btn-xs mt-1 self-end text-primary" onclick={onstudied}>記起來了 <Icon name="check" class="h-3.5 w-3.5" /></button>
  {/if}
</article>
