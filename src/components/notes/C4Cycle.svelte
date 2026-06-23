<script lang="ts">
  import Segmented from '@/components/common/Segmented.svelte'

  let mode = $state<'C3' | 'C4'>('C4')
</script>

<div class="my-4 rounded-xl border border-base-300 bg-base-100 p-4">
  <div class="mb-3">
    <Segmented
      ariaLabel="光合作用類型"
      bind:value={mode}
      options={[
        { value: 'C3', label: 'C3 植物' },
        { value: 'C4', label: 'C4 植物' },
      ]}
    />
  </div>

  <div class="grid gap-3 sm:grid-cols-2">
    <div class="rounded-lg bg-base-200 p-3 text-sm">
      <h4 class="mb-1 font-bold">{mode === 'C4' ? '葉肉細胞（前哨站）' : '葉肉細胞'}</h4>
      {#if mode === 'C4'}
        <p>CO₂ 先被 <b>PEP 羧化酶</b> 抓住，變成<b>四碳</b>化合物（草醋酸）。這支酵素不會誤抓 O₂，所以不怕光呼吸。</p>
        <div class="mt-2 animate-fade-in-up text-2xl">CO₂ → 🟦🟦🟦🟦 (4C)</div>
      {:else}
        <p>CO₂ 直接交給 <b>Rubisco</b> 進入卡爾文循環。天氣熱、氣孔關閉時，Rubisco 會誤抓 O₂ 發生<b>光呼吸</b>，浪費能量。</p>
        <div class="mt-2 animate-fade-in-up text-2xl">CO₂ / O₂ → Rubisco 🟨</div>
      {/if}
    </div>

    <div class="rounded-lg bg-base-200 p-3 text-sm">
      <h4 class="mb-1 font-bold">{mode === 'C4' ? '維管束鞘細胞（工廠）' : '同一個細胞'}</h4>
      {#if mode === 'C4'}
        <p>四碳化合物被送進來、釋放出<b>高濃度 CO₂</b>，Rubisco 在這裡安心做卡爾文循環。<b>空間上分工</b>是 C4 的關鍵。</p>
        <div class="mt-2 animate-fade-in-up text-2xl">🟦🟦🟦🟦 → CO₂ → 🍬</div>
      {:else}
        <p>固碳與卡爾文循環都在<b>同一個葉肉細胞</b>完成，沒有額外的濃縮機制。</p>
        <div class="mt-2 animate-fade-in-up text-2xl">→ 🍬</div>
      {/if}
    </div>
  </div>

  <p class="mt-3 text-xs opacity-70">
    一句話記：<b>C4 把抓 CO₂ 和用 CO₂ 分到兩種細胞做</b>，先濃縮再進循環，所以在炎熱乾燥的環境特別有效率。
  </p>
</div>
