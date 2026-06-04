<script lang="ts">
  // 分類階層：由大到小八階，點一階看人類/家犬的例子。條寬代表「包含種類數」（越下面越少、共同特徵越多）。
  type Rank = { en: string; zh: string; human: string; dog: string }
  const RANKS: Rank[] = [
    { en: 'Domain', zh: '域', human: 'Eukarya 真核域', dog: 'Eukarya 真核域' },
    { en: 'Kingdom', zh: '界', human: 'Animalia 動物界', dog: 'Animalia 動物界' },
    { en: 'Phylum', zh: '門', human: 'Chordata 脊索動物門', dog: 'Chordata 脊索動物門' },
    { en: 'Class', zh: '綱', human: 'Mammalia 哺乳綱', dog: 'Mammalia 哺乳綱' },
    { en: 'Order', zh: '目', human: 'Primates 靈長目', dog: 'Carnivora 食肉目' },
    { en: 'Family', zh: '科', human: 'Hominidae 人科', dog: 'Canidae 犬科' },
    { en: 'Genus', zh: '屬', human: 'Homo', dog: 'Canis' },
    { en: 'Species', zh: '種', human: 'Homo sapiens', dog: 'Canis lupus familiaris' },
  ]
  let i = $state(2)
  const r = $derived(RANKS[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🪜</span>
    <span class="font-display font-bold">分類階層：域→種</span>
  </div>

  <div class="space-y-1">
    {#each RANKS as rank, k (rank.en)}
      <button
        type="button"
        class={`flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left text-sm transition-colors ${i === k ? 'bg-primary/15' : 'hover:bg-base-200/60'}`}
        onclick={() => (i = k)}
      >
        <span class="w-20 shrink-0 font-mono text-xs text-base-content/60">{rank.en}</span>
        <span class="w-8 shrink-0 font-bold">{rank.zh}</span>
        <span class="h-3 rounded-full bg-primary/60" style={`width:${(8 - k) * 11 + 6}%`}></span>
      </button>
    {/each}
  </div>

  <div class="mt-3 grid grid-cols-2 gap-2 text-sm">
    <div class="rounded-box bg-base-200/60 p-2"><div class="text-xs text-base-content/55">人類的{r.zh}</div><div class="font-bold italic">{r.human}</div></div>
    <div class="rounded-box bg-base-200/60 p-2"><div class="text-xs text-base-content/55">家犬的{r.zh}</div><div class="font-bold italic">{r.dog}</div></div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    口訣「<b>界門綱目，科屬種</b>」（域在界之上）。<b>階層越高（越上面）包含種類越多、共同特徵越少；越低則親緣越近</b>。人與犬到「綱」都還相同（都是哺乳綱），到「目」才分家。
  </p>
</div>
