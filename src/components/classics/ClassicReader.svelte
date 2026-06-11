<script lang="ts">
  // Renders one 古文: original (authoritative) + collapsible 白話翻譯 + 註釋. Reused
  // inline on the daily plan and inside the 古文 list modal.
  import type { Classic } from '@/models/classics'
  import Icon from '@/components/common/Icon.svelte'

  let { classic, open = true }: { classic: Classic; open?: boolean } = $props()
  let showTranslation = $state(open)
</script>

<div class="flex flex-col gap-3">
  <header class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
    <h3 class="font-display text-xl font-bold tracking-tight">{classic.title}</h3>
    <span class="text-sm text-base-content/60">{classic.author}</span>
    <span class="badge badge-primary badge-sm">{classic.dynasty}</span>
    {#if classic.examRelevance.count}
      <span class="badge badge-ghost badge-sm" title="題庫中與此篇作者/篇名相關的題數">相關題 {classic.examRelevance.count}</span>
    {/if}
    {#if classic.source}<span class="text-xs text-base-content/40">{classic.source}</span>{/if}
  </header>

  <p class="whitespace-pre-wrap font-serif text-[17px] leading-loose tracking-wide">{classic.original}</p>

  <div class="flex items-center gap-2">
    <button class="btn btn-xs" class:btn-primary={showTranslation} onclick={() => (showTranslation = !showTranslation)}>
      白話翻譯 <Icon name="chevronDown" class={`h-3.5 w-3.5 transition-transform ${showTranslation ? 'rotate-180' : ''}`} />
    </button>
    {#each classic.tags as t (t)}<span class="badge badge-ghost badge-xs">{t}</span>{/each}
  </div>

  {#if showTranslation}
    <div class="rounded-box bg-base-200/60 p-3 text-[15px] leading-relaxed">
      <p class="whitespace-pre-wrap">{classic.translation}</p>
      {#if classic.draft}<p class="mt-1.5 text-xs text-base-content/40">※ 白話翻譯與註釋為 AI 草稿，原文為公共領域</p>{/if}
    </div>

    {#if classic.annotation.length}
      <div class="text-sm">
        <p class="mb-1 font-semibold text-base-content/70">註釋</p>
        <dl class="grid gap-1">
          {#each classic.annotation as a (a.term)}
            <div class="flex gap-2">
              <dt class="shrink-0 font-medium text-primary">{a.term}</dt>
              <dd class="text-base-content/70">{a.note}</dd>
            </div>
          {/each}
        </dl>
      </div>
    {/if}
  {/if}
</div>
