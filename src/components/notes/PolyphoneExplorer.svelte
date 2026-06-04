<script lang="ts">
  // 破音字探索：點一個字，看兩種讀音各用在什麼詞。先判詞義，再定讀音。
  type Poly = { char: string; a: { pron: string; use: string }; b: { pron: string; use: string } }
  const CHARS: Poly[] = [
    { char: '行', a: { pron: 'ㄏㄤˊ', use: '行伍、行列（行業、排列）' }, b: { pron: 'ㄒㄧㄥˊ', use: '行走、行動（走、做）' } },
    { char: '調', a: { pron: 'ㄉㄧㄠˋ', use: '調動、調查（移動、查核）' }, b: { pron: 'ㄊㄧㄠˊ', use: '調和、調味（混合、協調）' } },
    { char: '難', a: { pron: 'ㄋㄢˊ', use: '困難、難題（不容易）' }, b: { pron: 'ㄋㄢˋ', use: '災難、難民（災禍）' } },
    { char: '重', a: { pron: 'ㄓㄨㄥˋ', use: '重量、重要（份量、要緊）' }, b: { pron: 'ㄔㄨㄥˊ', use: '重複、重來（再一次）' } },
    { char: '處', a: { pron: 'ㄔㄨˋ', use: '處所、住處（地方，名詞）' }, b: { pron: 'ㄔㄨˇ', use: '處理、處置（辦理，動詞）' } },
    { char: '好', a: { pron: 'ㄏㄠˇ', use: '好人、好看（良善、形容詞）' }, b: { pron: 'ㄏㄠˋ', use: '好學、嗜好（喜愛，動詞）' } },
    { char: '長', a: { pron: 'ㄔㄤˊ', use: '長短、漫長（距離、形容詞）' }, b: { pron: 'ㄓㄤˇ', use: '成長、師長（生長、年長）' } },
    { char: '數', a: { pron: 'ㄕㄨˋ', use: '數字、數量（名詞）' }, b: { pron: 'ㄕㄨˇ', use: '數一數二（點數，動詞）' } },
  ]
  let i = $state(0)
  const c = $derived(CHARS[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🔤</span>
    <span class="font-display font-bold">破音字探索：先判詞義，再定音</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each CHARS as ch, k (ch.char)}
      <button type="button" class={`btn btn-sm font-bold ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{ch.char}</button>
    {/each}
  </div>

  <div class="grid gap-2 sm:grid-cols-2">
    <div class="rounded-box bg-base-200/60 p-3">
      <div class="flex items-baseline gap-2"><span class="text-2xl font-bold text-primary">{c.char}</span><span class="badge badge-sm badge-primary">{c.a.pron}</span></div>
      <p class="mt-1 text-sm text-base-content/75">{c.a.use}</p>
    </div>
    <div class="rounded-box bg-base-200/60 p-3">
      <div class="flex items-baseline gap-2"><span class="text-2xl font-bold text-secondary">{c.char}</span><span class="badge badge-sm badge-secondary">{c.b.pron}</span></div>
      <p class="mt-1 text-sm text-base-content/75">{c.b.use}</p>
    </div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    破音字＝同字因<b>詞義不同</b>而有不同讀音。考試問「哪個讀法正確」時，先判斷它在詞中的<b>意思與詞性</b>（名詞？動詞？），再對應讀音，不要死背音。
  </p>
</div>
