<script lang="ts">
  // 律詩四聯：點一聯，看它的名稱、句次與是否須對仗。以杜甫〈春望〉為例。
  type Couplet = { name: string; lines: number; couplet: boolean; text: string[] }
  const COUPLETS: Couplet[] = [
    { name: '首聯', lines: 12, couplet: false, text: ['國破山河在', '城春草木深'] },
    { name: '頷聯', lines: 34, couplet: true, text: ['感時花濺淚', '恨別鳥驚心'] },
    { name: '頸聯', lines: 56, couplet: true, text: ['烽火連三月', '家書抵萬金'] },
    { name: '尾聯', lines: 78, couplet: false, text: ['白頭搔更短', '渾欲不勝簪'] },
  ]
  let i = $state(1)
  const c = $derived(COUPLETS[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🀄</span>
    <span class="font-display font-bold">律詩四聯與對仗（以〈春望〉為例）</span>
  </div>

  <div class="space-y-1">
    {#each COUPLETS as cp, k (cp.name)}
      <button
        type="button"
        class={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm ${i === k ? 'bg-primary/15' : 'hover:bg-base-200/60'}`}
        onclick={() => (i = k)}
      >
        <span class="w-12 shrink-0 font-bold">{cp.name}</span>
        <span class="text-xs text-base-content/50">第 {Math.floor(cp.lines / 10)}–{cp.lines % 10} 句</span>
        <span class="flex-1 text-right text-base-content/75">{cp.text.join('，')}</span>
        {#if cp.couplet}<span class="badge badge-xs badge-secondary shrink-0">對仗</span>{/if}
      </button>
    {/each}
  </div>

  <div class="mt-3 rounded-box bg-base-200/60 p-3 text-sm">
    <div class="mb-1 flex items-center gap-2"><span class="font-bold text-primary">{c.name}</span>
      <span class={`badge badge-sm font-bold ${c.couplet ? 'badge-secondary' : 'badge-ghost'}`}>{c.couplet ? '必須對仗' : '不必對仗'}</span>
    </div>
    <p class="text-base-content/80">{c.text[0]}　{c.text[1]}</p>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    律詩 8 句分四聯。考試常問「哪兩聯對仗」→ <b>頷聯（3–4 句）＋頸聯（5–6 句）</b>必須對仗，首、尾聯不強制。對仗要：詞性相同、意義相對、平仄相反。
  </p>
</div>
