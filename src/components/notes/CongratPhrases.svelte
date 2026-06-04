<script lang="ts">
  // 題辭依場合：選場合，看適用題辭。場合選錯就鬧笑話。
  type Occasion = { name: string; phrases: string[]; note: string }
  const OCCASIONS: Occasion[] = [
    { name: '祝壽', phrases: ['南山獻壽', '福如東海、壽比南山', '松鶴延年', '耄耋之慶', '壽域宏開'], note: '耄耋之慶用於八、九十歲高齡。' },
    { name: '婚慶', phrases: ['鸞鳳和鳴', '瓊花並蒂', '百年好合', '宜室宜家'], note: '「瓊花並蒂」是婚慶（雙人喜事），不是生子！' },
    { name: '生男', phrases: ['弄璋之喜', '夢熊之兆'], note: '璋是玉器、熊象徵男 → 生男孩。' },
    { name: '生女', phrases: ['弄瓦之喜', '夢蘭之兆'], note: '瓦是紡錘、蘭象徵女 → 生女孩。' },
    { name: '祝子孫', phrases: ['綿綿瓜瓞', '麟趾呈祥', '慶衍螽斯'], note: '螽斯多子 → 祝多子多孫（非祝壽）。' },
    { name: '喪葬輓聯', phrases: ['音容宛在', '駕鶴西歸', '千古流芳'], note: '悼念死者；「駕鶴西歸」多用於高齡。' },
    { name: '開業喬遷', phrases: ['開張大吉', '生意興隆', '鴻圖大展'], note: '店家開業、事業開展。' },
  ]
  let i = $state(0)
  const o = $derived(OCCASIONS[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🎏</span>
    <span class="font-display font-bold">題辭依場合選用</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each OCCASIONS as oc, k (oc.name)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{oc.name}</button>
    {/each}
  </div>

  <div class="rounded-box bg-primary/10 p-3">
    <div class="mb-2 text-sm font-bold text-primary">{o.name}</div>
    <div class="flex flex-wrap gap-1.5">
      {#each o.phrases as p (p)}<span class="badge badge-outline badge-lg">{p}</span>{/each}
    </div>
    <p class="mt-2 text-xs text-base-content/70">{o.note}</p>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    題辭<b>選錯場合就鬧笑話</b>，是考試愛挖的坑。最常考：生男用<b>弄璋／夢熊</b>、生女用<b>弄瓦／夢蘭</b>；<b>「瓊花並蒂」是婚慶不是生子</b>；「慶衍螽斯」是祝多子、不是祝壽。
  </p>
</div>
