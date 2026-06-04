<script lang="ts">
  // 逐空判詞性：點一個「空格前後線索」，看它需要填什麼詞性。
  type Clue = { ctx: string; pos: string; eg: string }
  const CLUES: Clue[] = [
    { ctx: '冠詞（a／an／the）＋ ___', pos: '名詞', eg: 'the (treatment)' },
    { ctx: 'be 動詞 ＋ ___', pos: '形容詞／現在分詞／過去分詞', eg: 'is (effective／surprising／broken)' },
    { ctx: '情態動詞（may／can／will）＋ ___', pos: '原形動詞', eg: 'may (trigger)、can (alleviate)' },
    { ctx: '___ ＋ 名詞', pos: '形容詞 或 冠詞', eg: '(chronic) pain' },
    { ctx: '主詞 ＋ ___ ＋ 受詞', pos: '動詞', eg: 'trials (showed) results' },
    { ctx: '動詞 ＋ ___', pos: '副詞 或 受詞（名詞／代名詞）', eg: 'effectively、reduce (it)' },
    { ctx: '___ ＋ 完整句子', pos: '連接詞 或 副詞連接語', eg: 'Although …, Therefore, …' },
  ]
  let i = $state(2)
  const c = $derived(CLUES[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🔠</span>
    <span class="font-display font-bold">逐空判詞性：看前後線索</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each CLUES as cl, k (cl.ctx)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{cl.ctx}</button>
    {/each}
  </div>

  <div class="rounded-box bg-base-200/60 p-3 text-sm">
    <div class="mb-1 flex flex-wrap items-center gap-2">
      <span class="font-mono text-base-content/70">{c.ctx}</span>
      <span class="text-base-content/40">→</span>
      <span class="badge badge-primary font-bold">{c.pos}</span>
    </div>
    <div class="rounded bg-base-100 px-2 py-1 text-base-content/75">例：{c.eg}</div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    每個空格<b>先判需要的詞性</b>，詞性不對就直接刪，不用想語意。最常考：<b>情態動詞（may／can）後接原形動詞</b>（trigger，不是 triggered／triggering／to trigger）。
  </p>
</div>
