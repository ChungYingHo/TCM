<script lang="ts">
  // 關係代名詞決策：選「先行詞是人/物」與「在子句中的角色」，得到該用哪個關代。
  let person = $state(true) // true=人, false=物
  let role = $state<'subj' | 'obj' | 'poss' | 'prep'>('subj')

  const result = $derived.by(() => {
    if (role === 'poss') return { word: 'whose', note: 'whose + 名詞，表所有；人或物都用 whose。' }
    if (role === 'prep') return person
      ? { word: 'whom', note: '介系詞後接 whom（人）：of whom／in whom。不可用 that／who。' }
      : { word: 'which', note: '介系詞後接 which（物）：in which／of which。不可用 that。' }
    if (person) return role === 'subj'
      ? { word: 'who（或 that）', note: '人＋主格：子句缺主詞。非限定子句只能用 who。' }
      : { word: 'whom（或 that，可省）', note: '人＋受格：子句缺受詞。限定子句受格常省略。' }
    return role === 'subj'
      ? { word: 'which（或 that）', note: '物＋主格：子句缺主詞。非限定子句只能用 which。' }
      : { word: 'which（或 that，可省）', note: '物＋受格：子句缺受詞。限定子句受格常省略。' }
  })
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🔗</span>
    <span class="font-display font-bold">關係代名詞：選對不再猜</span>
  </div>

  <div class="mb-3 space-y-2">
    <div class="flex items-center gap-2">
      <span class="w-20 text-sm text-base-content/60">先行詞</span>
      <div class="join">
        <button type="button" class={`btn btn-xs ${person ? 'btn-primary' : 'btn-outline'}`} onclick={() => (person = true)}>人</button>
        <button type="button" class={`btn btn-xs ${!person ? 'btn-primary' : 'btn-outline'}`} onclick={() => (person = false)}>物／動物</button>
      </div>
    </div>
    <div class="flex items-start gap-2">
      <span class="w-20 shrink-0 text-sm text-base-content/60">在子句中</span>
      <div class="flex flex-wrap gap-1">
        <button type="button" class={`btn btn-xs ${role === 'subj' ? 'btn-primary' : 'btn-outline'}`} onclick={() => (role = 'subj')}>主格（缺主詞）</button>
        <button type="button" class={`btn btn-xs ${role === 'obj' ? 'btn-primary' : 'btn-outline'}`} onclick={() => (role = 'obj')}>受格（缺受詞）</button>
        <button type="button" class={`btn btn-xs ${role === 'poss' ? 'btn-primary' : 'btn-outline'}`} onclick={() => (role = 'poss')}>所有格（+名詞）</button>
        <button type="button" class={`btn btn-xs ${role === 'prep' ? 'btn-primary' : 'btn-outline'}`} onclick={() => (role = 'prep')}>介系詞後</button>
      </div>
    </div>
  </div>

  <div class="rounded-box bg-primary/10 p-3 text-center">
    <span class="text-sm text-base-content/55">該用 →　</span>
    <span class="text-xl font-bold text-primary">{result.word}</span>
  </div>
  <p class="mt-2 text-xs text-base-content/70">{result.note}</p>
  <p class="mt-2 text-xs leading-relaxed text-base-content/70">
    判斷格位：把關係子句單獨拿出來，看缺的是<b>主詞→主格</b>、<b>受詞→受格</b>，還是後面接名詞<b>→所有格</b>。介系詞（of／in…）後只能接 <b>whom／which</b>。
  </p>
</div>
