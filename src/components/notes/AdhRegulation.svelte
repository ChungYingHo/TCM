<script lang="ts">
  // ADH 調尿量：拖滑桿改變體液狀態（脫水 ↔ 喝大量水），看 ADH、集尿管通透性與尿量。
  let hydration = $state(20) // 0=嚴重脫水, 100=喝大量水
  const dehydrated = $derived(hydration < 50)
  const adh = $derived(dehydrated ? '↑ 增加' : '↓ 減少')
  const perm = $derived(dehydrated ? '↑ 對水通透' : '↓ 對水不通透')
  const urine = $derived(dehydrated ? '尿量 ↓、尿液濃縮' : '尿量 ↑、尿液稀釋')
  const cls = $derived(dehydrated ? 'badge-warning' : 'badge-info')
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🚰</span>
    <span class="font-display font-bold">ADH 如何調尿量</span>
  </div>

  <label class="mb-1 flex items-center justify-between text-sm">
    <span class="font-bold">{dehydrated ? '脫水（血液滲透壓高）' : '喝大量水（血液滲透壓低）'}</span>
  </label>
  <input type="range" min="0" max="100" step="1" bind:value={hydration} class="range range-primary range-xs" />
  <div class="mb-3 flex justify-between text-[0.65rem] text-base-content/55"><span>脫水</span><span>水分充足</span></div>

  <div class="grid gap-2 text-sm sm:grid-cols-3">
    <div class="rounded-box bg-base-200/60 p-2"><div class="text-xs text-base-content/55">ADH 分泌</div><div class="font-bold">{adh}</div></div>
    <div class="rounded-box bg-base-200/60 p-2"><div class="text-xs text-base-content/55">集尿管通透性</div><div class="font-bold">{perm}</div></div>
    <div class="rounded-box bg-base-200/60 p-2"><div class="text-xs text-base-content/55">結果</div><div class="font-bold">{urine}</div></div>
  </div>
  <div class="mt-2 text-center"><span class={`badge font-bold ${cls}`}>{dehydrated ? '保水' : '排水'}</span></div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    <b>ADH（抗利尿激素）</b>由下視丘製造、腦垂體後葉釋放，作用於集尿管的<b>水通道蛋白（aquaporin）</b>。脫水時 <b>ADH↑ → 水回收↑ → 尿量↓</b>；喝大量水時 ADH↓ → 尿量↑。
  </p>
</div>
