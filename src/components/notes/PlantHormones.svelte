<script lang="ts">
  // 五大植物激素：點一個，看縮寫、合成部位與代表功能。
  type Hormone = { name: string; abbr: string; site: string; fn: string }
  const HORMONES: Hormone[] = [
    { name: '生長素', abbr: 'IAA（Auxin）', site: '莖頂端、嫩葉', fn: '促細胞伸長、頂端優勢、向光性／向地性（極性運輸：頂→基）' },
    { name: '吉貝素', abbr: 'GA', site: '種子、嫩葉', fn: '促莖伸長、打破種子休眠、誘導開花（長日植物）' },
    { name: '細胞分裂素', abbr: 'CK（Cytokinin）', site: '根尖', fn: '促細胞分裂、延緩葉片老化（抑制黃化）' },
    { name: '離層酸', abbr: 'ABA', site: '葉片、種子', fn: '促休眠、乾旱時關閉氣孔（促 K⁺ 外流）、促落葉' },
    { name: '乙烯', abbr: 'Ethylene', site: '熟果、受傷組織', fn: '促果實成熟、促落葉落果、幼苗三重反應' },
  ]
  let i = $state(0)
  const h = $derived(HORMONES[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🌱</span>
    <span class="font-display font-bold">五大植物激素</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each HORMONES as hm, k (hm.name)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{hm.name}</button>
    {/each}
  </div>

  <div class="rounded-box bg-base-200/60 p-3 text-sm">
    <div class="mb-1 flex flex-wrap items-center gap-2">
      <span class="font-bold text-primary">{h.name}</span>
      <span class="badge badge-sm badge-ghost">{h.abbr}</span>
    </div>
    <div class="text-base-content/70"><span class="text-base-content/50">合成部位：</span>{h.site}</div>
    <div class="mt-1 text-base-content/80"><span class="text-base-content/50">代表功能：</span>{h.fn}</div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    口訣「<b>生吉細離乙</b>」＝生長素、吉貝素、細胞分裂素、離層酸、乙烯。常考對比：<b>關氣孔＝ABA</b>、<b>果熟＝乙烯</b>、<b>頂端優勢＝IAA</b>、<b>延緩老化＝CK</b>。
  </p>
</div>
