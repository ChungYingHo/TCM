<script lang="ts">
  // 諸子百家：點一家，看代表人、核心主張與代表句。
  type School = { name: string; people: string; core: string; quote: string }
  const SCHOOLS: School[] = [
    { name: '儒家', people: '孔子、孟子、荀子', core: '仁義禮、修身治國；性善（孟）／性惡（荀，化性起偽）。仁愛有差等。', quote: '己所不欲，勿施於人；民為貴，社稷次之，君為輕。' },
    { name: '道家', people: '老子、莊子', core: '無為、自然、道法自然、逍遙。', quote: '上善若水（老）；天地與我並生，萬物與我為一（莊）。' },
    { name: '墨家', people: '墨子', core: '兼愛（無差等之愛）、非攻、節用、尚賢。', quote: '兼相愛，交相利。' },
    { name: '法家', people: '韓非子、商鞅', core: '法（公開律令）＋術（御臣之術）＋勢（君主權位）三者並用，依法治國。', quote: '以法治國，不別親疏；君無術則弊於上，臣無法則亂於下。' },
  ]
  let i = $state(0)
  const s = $derived(SCHOOLS[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">☯️</span>
    <span class="font-display font-bold">諸子百家核心主張</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each SCHOOLS as sc, k (sc.name)}
      <button type="button" class={`btn btn-sm ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{sc.name}</button>
    {/each}
  </div>

  <div class="rounded-box bg-base-200/60 p-3 text-sm">
    <div class="mb-1 flex flex-wrap items-center gap-2"><span class="font-bold text-primary">{s.name}</span><span class="badge badge-sm badge-ghost">{s.people}</span></div>
    <div class="text-base-content/80">{s.core}</div>
    <div class="mt-1 rounded bg-base-100 px-2 py-1 text-base-content/75">代表句：{s.quote}</div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    最常考的對比：<b>儒家「仁愛」有差等 vs 墨家「兼愛」無差等</b>。注意<b>荀子也是儒家</b>，但主張性惡、化性起偽，常被拿來和孟子的性善混淆。
  </p>
</div>
