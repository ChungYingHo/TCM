<script lang="ts">
  // 立體異構關係判斷：兩個分子各有兩個掌性中心(C2,C3)，設各自 R/S，比較關係。
  // 全相同→同一化合物；全相反→對映異構物；部分相反→非對映異構物。
  let a2 = $state('R'), a3 = $state('S')
  let b2 = $state('S'), b3 = $state('R')

  const diff = $derived((a2 !== b2 ? 1 : 0) + (a3 !== b3 ? 1 : 0))
  const rel = $derived.by(() => {
    if (diff === 0) return { t: '同一化合物（構型完全相同）', cls: 'badge-ghost' }
    if (diff === 2) return { t: '對映異構物（鏡像，所有中心全相反）', cls: 'badge-primary' }
    return { t: '非對映異構物（只有部分中心相反）', cls: 'badge-secondary' }
  })
  const flip = (v: string) => (v === 'R' ? 'S' : 'R')
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🪞</span>
    <span class="font-display font-bold">立體異構關係判斷</span>
  </div>

  <div class="grid grid-cols-2 gap-3">
    {#each [{ id: 'A', c2: a2, c3: a3 }, { id: 'B', c2: b2, c3: b3 }] as col (col.id)}
      <div class="rounded-box bg-base-200/50 p-3">
        <div class="mb-2 font-bold">分子 {col.id}</div>
        {#each [{ pos: 'C2', val: col.c2 }, { pos: 'C3', val: col.c3 }] as cc (cc.pos)}
          <div class="mb-1.5 flex items-center gap-2 text-sm">
            <span class="w-7">{cc.pos}</span>
            <button type="button" class="btn btn-xs btn-outline w-12"
              onclick={() => { if (col.id === 'A') { if (cc.pos === 'C2') a2 = flip(a2); else a3 = flip(a3) } else { if (cc.pos === 'C2') b2 = flip(b2); else b3 = flip(b3) } }}>{cc.val}</button>
          </div>
        {/each}
      </div>
    {/each}
  </div>

  <div class="mt-3 rounded-box bg-base-200/60 p-3 text-center">
    <span class={`badge font-bold ${rel.cls}`}>{rel.t}</span>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    比較兩分子<b>每個掌性中心</b>的構型：<b>全部相反 → 對映異構物</b>（互為鏡像）；<b>只有部分相反 → 非對映異構物</b>；全相同就是同一個分子。（若分子本身有對稱面，相反組合可能變成同一個內消旋體。）
  </p>
</div>
