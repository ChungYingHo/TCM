<script lang="ts">
  // 橫橋循環四步：點一步，看肌凝蛋白頭的狀態與 ATP 角色。
  type Step = { name: string; atp: string; head: string; angle: number }
  const STEPS: Step[] = [
    { name: '① 結合 ATP', atp: 'ATP 結合', head: '頭部與細肌絲脫離（鬆手）', angle: 90 },
    { name: '② ATP 水解', atp: 'ATP → ADP + Pi', head: '頭部「上膛」成高能階構造、翹起', angle: 45 },
    { name: '③ 形成橫橋', atp: '（仍帶 ADP + Pi）', head: '頭部結合肌動蛋白，形成橫橋', angle: 50 },
    { name: '④ 動力衝程', atp: '釋放 ADP + Pi', head: '頭部回擺，把細肌絲拉向肌節中央', angle: 110 },
  ]
  let i = $state(0)
  const s = $derived(STEPS[i])
  // 頭部末端座標（以角度畫一條桿）
  const hx = $derived(60 + 26 * Math.cos((s.angle * Math.PI) / 180))
  const hy = $derived(56 - 26 * Math.sin((s.angle * Math.PI) / 180))
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🔗</span>
    <span class="font-display font-bold">橫橋循環：ATP 的角色</span>
  </div>

  <div class="mb-3 flex flex-wrap items-center gap-1">
    {#each STEPS as st, k (st.name)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{st.name}</button>
      {#if k < STEPS.length - 1}<span class="text-base-content/40">→</span>{/if}
    {/each}
    <span class="text-base-content/40">↺</span>
  </div>

  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
    <svg viewBox="0 0 120 72" class="mx-auto h-24 w-32 shrink-0 sm:mx-0" role="img" aria-label="肌凝蛋白頭狀態">
      <!-- 細肌絲（上） -->
      <line x1="6" y1="14" x2="114" y2="14" class="stroke-primary" stroke-width="4" />
      <!-- 粗肌絲（下） -->
      <line x1="6" y1="60" x2="114" y2="60" class="stroke-secondary" stroke-width="4" />
      <!-- 肌凝蛋白頭桿 -->
      <line x1="60" y1="56" x2={hx} y2={hy} class="stroke-secondary" stroke-width="3" style="transition:all .35s" />
      <circle cx={hx} cy={hy} r="4" class="fill-secondary" style="transition:all .35s" />
    </svg>
    <div class="text-sm">
      <div class="font-bold text-primary">{s.name}</div>
      <div class="mt-1"><span class="badge badge-sm badge-ghost">{s.atp}</span></div>
      <div class="mt-1 text-base-content/75">{s.head}</div>
    </div>
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    口訣：<b>ATP 結合＝鬆手</b>、<b>ATP 水解＝上膛（高能階）</b>、<b>釋放 ADP/Pi＝拉動（動力衝程）</b>。肌凝蛋白頭在<b>粗肌絲</b>上。死後沒有新 ATP 來「鬆手」，頭部卡死 → <b>屍僵</b>。
  </p>
</div>
