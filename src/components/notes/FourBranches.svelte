<script lang="ts">
  // 四部分類：點經／史／子／集，看收錄內容、代表典籍與易混陷阱。
  type Branch = { name: string; content: string; works: string; trap: string }
  const BRANCHES: Branch[] = [
    { name: '經部', content: '儒家經典及其注疏。', works: '五經（詩、書、禮、易、春秋）；四書（論、孟、學、庸）。', trap: '四書屬經部（不是子部）；詩經也在經部（不是集部）。' },
    { name: '史部', content: '各種體例的史書。', works: '史記、漢書、資治通鑑、三國志。', trap: '《資治通鑑》在史部，但因是編年體，不算正史（不在二十四史）。' },
    { name: '子部', content: '諸子百家、醫書、佛道。', works: '老子、莊子、墨子、韓非子、孫子兵法。', trap: '老子、莊子屬子部（道家），不是集部。' },
    { name: '集部', content: '個人詩文集、文學總集。', works: '楚辭、文選；李白集、杜甫詩集。', trap: '《楚辭》屬集部（文學總集），不是經部。' },
  ]
  let i = $state(0)
  const b = $derived(BRANCHES[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🗂️</span>
    <span class="font-display font-bold">四部分類：經史子集</span>
  </div>

  <div class="mb-3 flex flex-wrap items-center gap-1">
    {#each BRANCHES as br, k (br.name)}
      <button type="button" class={`btn btn-sm ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{br.name}</button>
      {#if k < BRANCHES.length - 1}<span class="text-base-content/40">·</span>{/if}
    {/each}
  </div>

  <div class="rounded-box bg-base-200/60 p-3 text-sm">
    <div class="mb-1 font-bold text-primary">{b.name}</div>
    <div class="text-base-content/80">{b.content}</div>
    <div class="mt-1 text-base-content/70"><span class="text-base-content/50">代表典籍：</span>{b.works}</div>
    <div class="mt-2 rounded bg-warning/15 px-2 py-1 text-xs text-base-content/80"><b>易混：</b>{b.trap}</div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    順序「<b>經史子集</b>」。最常考的辨別：<b>四書在經部</b>、<b>老莊在子部</b>、<b>楚辭在集部</b>。
  </p>
</div>
