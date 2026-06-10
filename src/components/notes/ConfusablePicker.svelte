<script lang="ts">
  // 易混淆字四類：點一類，看常見組與區分。
  type Group = { name: string; pairs: string }
  const GROUPS: Group[] = [
    { name: '詞性區分', pairs: 'affect（動詞，影響）/ effect（名詞，效果）；rise（不及物，無受詞）/ raise（及物，要受詞）；lie 躺（lie-lay-lain）/ lay 放（lay-laid-laid）' },
    { name: '可數不可數', pairs: 'fewer + 可數 / less + 不可數；many / much；a number of / an amount of' },
    { name: '形近字', pairs: 'principle 原則 / principal 校長、主要的；stationary 靜止 / stationery 文具；dessert 甜點 / desert 沙漠' },
    { name: '義近不可換', pairs: 'borrow 借入 / lend 借出；bring 帶來 / take 帶走；economic 經濟的 / economical 節省的' },
  ]
  let i = $state(0)
  const c = $derived(GROUPS[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">⚠️</span>
    <span class="font-display font-bold">易混淆字四類</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each GROUPS as g, k (g.name)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{g.name}</button>
    {/each}
  </div>

  <div class="rounded-box bg-base-200/60 p-3 text-sm">
    <div class="mb-1 font-bold text-primary">{c.name}</div>
    <div class="leading-relaxed text-base-content/80">{c.pairs}</div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    先分形近／音近／義近，再用詞性與記憶鉤鎖定（principal 的 <b>pal</b> ＝校長是你的夥伴）。
  </p>
</div>
