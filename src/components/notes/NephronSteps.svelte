<script lang="ts">
  // 腎元四步驟：點一步，看位置與發生的事。
  type Step = { name: string; site: string; what: string }
  const STEPS: Step[] = [
    { name: '① 過濾', site: '腎絲球 → 鮑氏囊', what: '血液在高壓下，小分子（水、鹽、葡萄糖、尿素）被推入鮑氏囊；大分子（蛋白質、血球）留在血中。靠血壓，不耗 ATP。' },
    { name: '② 再吸收', site: '近曲小管為主、亨耳氏套、遠曲小管', what: '有用的物質回到血液：約 65% 過濾液在近曲小管回收，葡萄糖、胺基酸幾乎全部回收（需主動運輸）。正常尿液不含葡萄糖。' },
    { name: '③ 分泌', site: '近曲小管＋遠曲小管', what: '血液中多餘的 H⁺、K⁺、藥物等主動分泌進腎小管液，微調血液成分與 pH。' },
    { name: '④ 排出', site: '集尿管 → 腎盂 → 輸尿管 → 膀胱', what: '經 ADH 調節水分後，濃縮的尿液排出體外。' },
  ]
  let i = $state(0)
  const s = $derived(STEPS[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🫘</span>
    <span class="font-display font-bold">腎元四大步驟</span>
  </div>

  <div class="mb-3 flex flex-wrap items-center gap-1">
    {#each STEPS as st, k (st.name)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{st.name}</button>
      {#if k < STEPS.length - 1}<span class="text-base-content/40">→</span>{/if}
    {/each}
  </div>

  <div class="rounded-box bg-base-200/60 p-3 text-sm">
    <div class="mb-1 flex flex-wrap items-center gap-2">
      <span class="font-bold text-primary">{s.name}</span>
      <span class="badge badge-sm badge-ghost">{s.site}</span>
    </div>
    <p class="text-base-content/75">{s.what}</p>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    <b>過濾靠血壓</b>（被動）；<b>再吸收與分泌靠主動運輸</b>（耗 ATP）。葡萄糖幾乎全在近曲小管回收，所以<b>正常尿液驗不到葡萄糖</b>；血糖過高超過腎閾值才會出現糖尿。
  </p>
</div>
