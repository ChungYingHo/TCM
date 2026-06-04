<script lang="ts">
  // 下視丘—腦下腺—甲狀腺軸的負回饋：選甲狀腺素過高/正常/過低，看上游 TRH、TSH 怎麼反應。
  let level = $state<'high' | 'normal' | 'low'>('high')
  // 負回饋：甲狀腺素高 → 抑制上游（TRH、TSH 下降）；低 → 上游上升。
  const up = $derived(level === 'high' ? '↓ 受抑制' : level === 'low' ? '↑ 增加' : '— 穩定')
  const upCls = $derived(level === 'high' ? 'text-info' : level === 'low' ? 'text-error' : 'text-base-content/60')
  const note = $derived(
    level === 'high'
      ? '甲狀腺素過高 → 負回饋抑制下視丘（TRH↓）與腦下腺前葉（TSH↓）→ 甲狀腺分泌減少 → 濃度回落。'
      : level === 'low'
        ? '甲狀腺素過低 → 解除抑制，下視丘（TRH↑）與腦下腺前葉（TSH↑）→ 刺激甲狀腺分泌 → 濃度回升。'
        : '甲狀腺素正常 → 上游維持穩定分泌，系統處於動態平衡。'
  )
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex flex-wrap items-center gap-2">
    <span aria-hidden="true">🔁</span>
    <span class="font-display font-bold">負回饋：下視丘—腦下腺—甲狀腺軸</span>
    <div class="join ml-auto">
      <button type="button" class={`btn btn-xs ${level === 'high' ? 'btn-primary' : 'btn-outline'}`} onclick={() => (level = 'high')}>甲狀腺素高</button>
      <button type="button" class={`btn btn-xs ${level === 'normal' ? 'btn-primary' : 'btn-outline'}`} onclick={() => (level = 'normal')}>正常</button>
      <button type="button" class={`btn btn-xs ${level === 'low' ? 'btn-primary' : 'btn-outline'}`} onclick={() => (level = 'low')}>低</button>
    </div>
  </div>

  <div class="space-y-1 text-sm">
    <div class="flex items-center justify-between rounded-box bg-base-200/60 p-2">
      <span>下視丘 → <b>TRH</b>（促甲狀腺釋放素）</span><span class={`font-bold ${upCls}`}>{up}</span>
    </div>
    <div class="text-center text-base-content/40">↓</div>
    <div class="flex items-center justify-between rounded-box bg-base-200/60 p-2">
      <span>腦下腺前葉 → <b>TSH</b>（促甲狀腺素）</span><span class={`font-bold ${upCls}`}>{up}</span>
    </div>
    <div class="text-center text-base-content/40">↓</div>
    <div class="flex items-center justify-between rounded-box bg-primary/10 p-2">
      <span>甲狀腺 → <b>T₃／T₄</b></span>
      <span class={`badge font-bold ${level === 'high' ? 'badge-error' : level === 'low' ? 'badge-warning' : 'badge-success'}`}>{level === 'high' ? '過高' : level === 'low' ? '過低' : '正常'}</span>
    </div>
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">{note}</p>
  <p class="mt-1 text-xs leading-relaxed text-base-content/60">
    這就是<b>負回饋</b>：效應激素過多就抑制上游、過少就刺激上游，把濃度穩定在設定點。幾乎所有激素軸都用這套邏輯。
  </p>
</div>
