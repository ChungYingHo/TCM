<script lang="ts">
  // 病毒三種感染模式：點一個，看步驟與關鍵差異。
  type Cycle = { key: string; name: string; tag: string; steps: string[] }
  const CYCLES: Cycle[] = [
    {
      key: 'lytic', name: '溶裂週期', tag: '殺死宿主',
      steps: ['吸附並注入核酸', '利用宿主機制合成病毒元件', '組裝成新病毒', '宿主細胞裂解、釋出大量新病毒'],
    },
    {
      key: 'lyso', name: '溶源週期', tag: '潛伏整合',
      steps: ['病毒核酸整合進宿主染色體 → 原噬菌體（prophage）', '宿主正常分裂，原噬菌體隨之複製（無病徵）', '受刺激（UV、化學物）時脫離，轉入溶裂週期'],
    },
    {
      key: 'retro', name: '反轉錄循環', tag: 'RNA→DNA',
      steps: ['RNA 病毒（如 HIV）進入宿主細胞', '反轉錄酶把 RNA 反轉成 DNA', 'DNA 整合進宿主基因體（原病毒 provirus）', '宿主轉錄、轉譯出病毒蛋白，組裝新病毒'],
    },
  ]
  let i = $state(0)
  const c = $derived(CYCLES[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🧫</span>
    <span class="font-display font-bold">病毒的感染模式</span>
  </div>

  <div class="mb-3 join">
    {#each CYCLES as cy, k (cy.key)}
      <button type="button" class={`btn join-item btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{cy.name}</button>
    {/each}
  </div>

  <div class="rounded-box bg-base-200/60 p-3">
    <div class="mb-2 flex items-center gap-2">
      <span class="font-bold text-primary">{c.name}</span>
      <span class="badge badge-sm badge-secondary font-bold">{c.tag}</span>
    </div>
    <ol class="space-y-1">
      {#each c.steps as step, k (k)}
        <li class="flex gap-2 text-sm">
          <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">{k + 1}</span>
          <span class="text-base-content/80">{step}</span>
        </li>
      {/each}
    </ol>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    <b>溶裂</b>快速複製、裂解宿主。<b>溶源</b>先把核酸藏進宿主染色體潛伏（原噬菌體）。<b>反轉錄</b>是 RNA 病毒先把 RNA 反轉成 DNA 再整合，方向與一般「DNA→RNA」相反。
  </p>
</div>
