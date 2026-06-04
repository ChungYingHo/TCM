<script lang="ts">
  // 六書：點一種，看定義與例字。形聲字最多（約 80%）。
  type S = { name: string; kind: '造字' | '用字'; def: string; egs: string[]; most?: boolean }
  const SCRIPTS: S[] = [
    { name: '象形', kind: '造字', def: '描摹實物的形狀。', egs: ['日', '月', '山', '水'] },
    { name: '指事', kind: '造字', def: '用符號指示抽象概念。', egs: ['上', '下', '本（木下加點）', '末（木上加點）'] },
    { name: '會意', kind: '造字', def: '兩個以上字義合成新義。', egs: ['明（日＋月）', '休（人＋木）', '森（三木）'] },
    { name: '形聲', kind: '造字', def: '一部分表義（形旁）、一部分表音（聲旁）。', egs: ['清（氵＋青）', '時（日＋寺）', '江（氵＋工）'], most: true },
    { name: '轉注', kind: '用字', def: '同義互訓，字義相通可互相解釋。', egs: ['老', '考（兩字互訓）'] },
    { name: '假借', kind: '用字', def: '借同音字表示新詞，不另造字。', egs: ['令（命令→縣令）', '然（燃燒→語助詞）'] },
  ]
  let i = $state(3)
  const s = $derived(SCRIPTS[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">㊗️</span>
    <span class="font-display font-bold">六書：漢字造字與用字法</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each SCRIPTS as sc, k (sc.name)}
      <button type="button" class={`btn btn-sm ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{sc.name}</button>
    {/each}
  </div>

  <div class="rounded-box bg-base-200/60 p-3 text-sm">
    <div class="mb-1 flex flex-wrap items-center gap-2">
      <span class="font-bold text-primary">{s.name}</span>
      <span class={`badge badge-sm ${s.kind === '造字' ? 'badge-info' : 'badge-ghost'}`}>{s.kind}法</span>
      {#if s.most}<span class="badge badge-sm badge-success font-bold">最多 ~80%</span>{/if}
    </div>
    <div class="text-base-content/80">{s.def}</div>
    <div class="mt-1.5 flex flex-wrap gap-1">
      {#each s.egs as eg (eg)}<span class="badge badge-outline">{eg}</span>{/each}
    </div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    考試最常問「哪種造字法最多」→ 永遠是<b>形聲</b>（佔 80% 以上）。<b>轉注、假借是「用字法」</b>不是造字法。象形指事是純圖象、會意是兩義合一。
  </p>
</div>
