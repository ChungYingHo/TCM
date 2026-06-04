<script lang="ts">
  // 複製叉示意：點一個角色，看它在哪、做什麼。領先股連續、延遲股做成岡崎片段。
  type Role = { key: string; name: string; does: string }
  const ROLES: Role[] = [
    { key: 'helicase', name: '解旋酶', does: '在複製叉最前方打開雙股、解開鹼基間氫鍵，形成複製叉。' },
    { key: 'primase', name: '引子酶', does: '先合成一小段 RNA 引子，提供 3′-OH 端讓 DNA 聚合酶起始。' },
    { key: 'leading', name: '領先股', does: '模板方向與複製叉一致 → DNA 聚合酶 III 連續 5′→3′ 合成一長條新鏈。' },
    { key: 'lagging', name: '延遲股', does: '模板方向與複製叉相反 → 只能反覆起始、分段合成，產生多個岡崎片段。' },
    { key: 'ligase', name: '連接酶', does: '把延遲股相鄰的岡崎片段以磷酸二酯鍵封口，接成連續的鏈。' },
  ]
  let sel = $state('leading')
  const hl = (k: string) => (sel === k ? 'opacity-100' : 'opacity-25')
  const r = $derived(ROLES.find((x) => x.key === sel)!)
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🧬</span>
    <span class="font-display font-bold">複製叉：誰做什麼</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each ROLES as role (role.key)}
      <button type="button" class={`btn btn-xs ${sel === role.key ? 'btn-primary' : 'btn-outline'}`} onclick={() => (sel = role.key)}>{role.name}</button>
    {/each}
  </div>

  <svg viewBox="0 0 320 160" class="w-full" role="img" aria-label="複製叉示意圖">
    <!-- 未解開的母股（左側） -->
    <line x1="10" y1="74" x2="150" y2="74" class="stroke-base-content/50" stroke-width="3" />
    <line x1="10" y1="86" x2="150" y2="86" class="stroke-base-content/50" stroke-width="3" />
    <!-- 解旋酶位置（叉口） -->
    <circle cx="152" cy="80" r="11" class={`fill-warning ${hl('helicase')}`} />
    <text x="152" y="84" text-anchor="middle" class="fill-base-100 text-[8px] font-bold">解</text>
    <!-- 上模板 + 領先股（連續） -->
    <line x1="152" y1="74" x2="300" y2="48" class="stroke-base-content/40" stroke-width="2.5" />
    <line x1="160" y1="70" x2="295" y2="46" class={`stroke-primary ${hl('leading')}`} stroke-width="3.5" />
    <text x="250" y="38" text-anchor="middle" class={`fill-primary text-[8px] font-bold ${hl('leading')}`}>領先股 5′→3′</text>
    <!-- 下模板 + 延遲股（岡崎片段，分段） -->
    <line x1="152" y1="86" x2="300" y2="112" class="stroke-base-content/40" stroke-width="2.5" />
    <line x1="175" y1="98" x2="205" y2="103" class={`stroke-secondary ${hl('lagging')}`} stroke-width="3.5" />
    <line x1="218" y1="105" x2="248" y2="110" class={`stroke-secondary ${hl('lagging')}`} stroke-width="3.5" />
    <line x1="261" y1="112" x2="291" y2="117" class={`stroke-secondary ${hl('lagging')}`} stroke-width="3.5" />
    <!-- 連接酶封口（片段之間的縫） -->
    <circle cx="211" cy="104" r="4" class={`fill-accent ${hl('ligase')}`} />
    <circle cx="254" cy="111" r="4" class={`fill-accent ${hl('ligase')}`} />
    <!-- 引子（每段起點的小紅點） -->
    <circle cx="175" cy="98" r="4" class={`fill-error ${hl('primase')}`} />
    <circle cx="218" cy="105" r="4" class={`fill-error ${hl('primase')}`} />
    <circle cx="261" cy="112" r="4" class={`fill-error ${hl('primase')}`} />
    <text x="250" y="135" text-anchor="middle" class={`fill-secondary text-[8px] font-bold ${hl('lagging')}`}>延遲股＝岡崎片段</text>
  </svg>

  <div class="mt-2 rounded-box bg-base-200/60 p-3 text-sm">
    <span class="font-bold text-primary">{r.name}</span>：{r.does}
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    DNA 聚合酶只能 <b>5′→3′</b> 合成，所以面對複製叉時，一股能連續做（<b>領先股</b>），另一股只能回頭分段做（<b>延遲股</b>，產生岡崎片段，最後由連接酶封口）。
  </p>
</div>
