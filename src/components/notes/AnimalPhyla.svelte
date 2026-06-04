<script lang="ts">
  // 動物主要門：點一個門，看對稱/體腔、神經系統、循環、代表動物。由簡單到複雜排列。
  type Phylum = { name: string; sym: string; nerve: string; circ: string; rep: string }
  const PHYLA: Phylum[] = [
    { name: '刺胞動物', sym: '輻射對稱、無體腔', nerve: '神經網（無腦、無中樞）', circ: '無循環系統', rep: '水母、珊瑚、水螅' },
    { name: '扁形動物', sym: '兩側對稱、無體腔', nerve: '兩條神經索＋頭神經節', circ: '無（靠擴散）', rep: '渦蟲、絛蟲' },
    { name: '環節動物', sym: '兩側對稱、真體腔', nerve: '腹神經索', circ: '閉鎖式', rep: '蚯蚓、水蛭' },
    { name: '軟體動物', sym: '兩側對稱、真體腔', nerve: '神經節', circ: '多為開放式（頭足類為閉鎖式）', rep: '蝸牛、章魚' },
    { name: '節肢動物', sym: '兩側對稱、真體腔', nerve: '腹神經索', circ: '開放式', rep: '昆蟲、蝦蟹' },
    { name: '棘皮動物', sym: '幼體兩側、成體輻射', nerve: '神經環（無腦）', circ: '水管系統', rep: '海星、海膽' },
    { name: '脊索動物', sym: '兩側對稱、真體腔', nerve: '背中空神經索（→腦＋脊髓）', circ: '閉鎖式', rep: '魚、人' },
  ]
  let i = $state(0)
  const p = $derived(PHYLA[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🐙</span>
    <span class="font-display font-bold">動物主要門：特徵速查</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each PHYLA as ph, k (ph.name)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{ph.name}</button>
    {/each}
  </div>

  <div class="grid gap-2 text-sm sm:grid-cols-2">
    <div class="rounded-box bg-base-200/60 p-2"><div class="text-xs text-base-content/55">對稱／體腔</div><div class="font-bold">{p.sym}</div></div>
    <div class="rounded-box bg-base-200/60 p-2"><div class="text-xs text-base-content/55">神經系統</div><div class="font-bold">{p.nerve}</div></div>
    <div class="rounded-box bg-base-200/60 p-2"><div class="text-xs text-base-content/55">循環</div><div class="font-bold">{p.circ}</div></div>
    <div class="rounded-box bg-base-200/60 p-2"><div class="text-xs text-base-content/55">代表動物</div><div class="font-bold">{p.rep}</div></div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    由簡單到複雜：<b>神經網只有刺胞動物</b>（最原始、無中樞），越高等神經越集中（頭化）。<b>閉鎖式循環</b>＝環節＋頭足類＋脊椎動物；節肢與多數軟體為開放式。
  </p>
</div>
