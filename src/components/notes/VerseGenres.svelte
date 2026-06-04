<script lang="ts">
  // 四大韻文體裁：點一個，看時代、外觀特徵與辨識關鍵。
  type Genre = { name: string; era: string; look: string; key: string }
  const GENRES: Genre[] = [
    { name: '古體詩', era: '先秦～唐（唐前為主）', look: '句數、字數不限；押韻較自由。', key: '四言（詩經）、五言古詩、樂府' },
    { name: '近體詩', era: '唐代定型', look: '律詩 8 句、絕句 4 句；嚴格平仄與押韻。', key: '五言律詩、七言絕句' },
    { name: '詞', era: '唐末五代、宋代鼎盛', look: '長短句；依詞牌填詞，格律由詞牌決定。', key: '詞牌名（水調歌頭、念奴嬌）' },
    { name: '曲', era: '元代（元曲鼎盛）', look: '散曲＋雜劇；可加「襯字」，較口語化。', key: '宮調、曲牌（天淨沙）' },
    { name: '賦', era: '漢代最盛', look: '介於散文與詩之間；鋪陳排比、多辭藻。', key: '漢大賦（司馬相如）；魏晉抒情小賦' },
  ]
  let i = $state(1)
  const g = $derived(GENRES[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">📖</span>
    <span class="font-display font-bold">四大韻文體裁</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each GENRES as ge, k (ge.name)}
      <button type="button" class={`btn btn-sm ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{ge.name}</button>
    {/each}
  </div>

  <div class="rounded-box bg-base-200/60 p-3 text-sm">
    <div class="mb-1 flex flex-wrap items-center gap-2"><span class="font-bold text-primary">{g.name}</span><span class="badge badge-sm badge-ghost">{g.era}</span></div>
    <div class="text-base-content/80">{g.look}</div>
    <div class="mt-1 text-base-content/70"><span class="text-base-content/50">辨識關鍵：</span>{g.key}</div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    辨體裁口訣：<b>古體</b>字數自由；<b>近體（律絕）</b>嚴格平仄；<b>詞</b>有詞牌、長短句；<b>曲</b>可加襯字、最口語；<b>賦</b>用排比鋪陳。看到「○○（詞牌）」就是詞，看到「襯字」就是曲。
  </p>
</div>
