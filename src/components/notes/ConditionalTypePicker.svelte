<script lang="ts">
  // 條件句三型＋混合：點一型，看觸發條件、結構與例句。
  type Case = { name: string; when: string; form: string; eg: string }
  const CASES: Case[] = [
    { name: '真實條件', when: '可能發生的條件', form: 'if + 現在式 …, S will / can + 原形 V', eg: 'If it rains, we will stay home.' },
    { name: '與現在相反', when: '與現在事實相反', form: 'if + 過去式（be→were）…, S would / could + 原形 V', eg: 'If I were you, I would rest.' },
    { name: '與過去相反', when: '與過去事實相反', form: 'if + had + p.p. …, S would / could have + p.p.', eg: 'If she had taken it, she would have recovered.' },
    { name: '混合條件', when: '過去的因、現在的果', form: 'if + had p.p. …, S would + 原形 V', eg: 'If I had saved money, I would be rich now.' },
  ]
  let i = $state(0)
  const c = $derived(CASES[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🔮</span>
    <span class="font-display font-bold">條件句三型＋混合</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each CASES as ca, k (ca.name)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{ca.name}</button>
    {/each}
  </div>

  <div class="rounded-box bg-base-200/60 p-3 text-sm">
    <div class="mb-1 font-bold text-primary">{c.name}</div>
    <div class="text-base-content/70"><span class="text-base-content/50">用在：</span>{c.when}</div>
    <div class="mt-1 text-base-content/80"><span class="text-base-content/50">結構：</span><span class="font-mono">{c.form}</span></div>
    <div class="mt-1 rounded bg-base-100 px-2 py-1 text-base-content/75">{c.eg}</div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    口訣：if 子句「<b>往前推一個時態</b>」就是與事實相反；be 動詞一律用 <b>were</b>。
  </p>
</div>
