<script lang="ts">
  // 時間副詞 → 時態：點一個時間線索，看它指向哪個時態與結構。
  type Cue = { adv: string; tense: string; form: string; eg: string }
  const CUES: Cue[] = [
    { adv: 'since / for', tense: '現在完成', form: 'have／has + p.p.', eg: 'He has worked here for ten years.' },
    { adv: 'already / yet / just', tense: '現在完成', form: 'have／has + p.p.', eg: 'She has just left.' },
    { adv: 'yesterday / last week / ago', tense: '簡單過去', form: 'V-ed', eg: 'They built it last year.' },
    { adv: 'now / at this moment', tense: '現在進行', form: 'am／is／are + V-ing', eg: 'I am studying now.' },
    { adv: 'by the time / before（過去）', tense: '過去完成', form: 'had + p.p.', eg: 'By the time she arrived, he had left.' },
    { adv: 'tomorrow / next week / soon', tense: '簡單未來', form: 'will V／be going to V', eg: 'It will take effect next month.' },
    { adv: 'always / usually / every day', tense: '簡單現在', form: 'V／V-s', eg: 'She usually walks to school.' },
  ]
  let i = $state(0)
  const c = $derived(CUES[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">⏱️</span>
    <span class="font-display font-bold">時間副詞 → 時態</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each CUES as cu, k (cu.adv)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{cu.adv}</button>
    {/each}
  </div>

  <div class="rounded-box bg-base-200/60 p-3 text-sm">
    <div class="mb-1 flex flex-wrap items-center gap-2">
      <span class="badge badge-sm badge-ghost font-mono">{c.adv}</span>
      <span class="text-base-content/40">→</span>
      <span class="font-bold text-primary">{c.tense}</span>
    </div>
    <div class="text-base-content/70"><span class="text-base-content/50">結構：</span><span class="font-mono">{c.form}</span></div>
    <div class="mt-1 rounded bg-base-100 px-2 py-1 text-base-content/75">{c.eg}</div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    填空時態題的最快線索：<b>先找時間副詞，再定時態</b>。看到 <b>since／for</b> 就是現在完成、<b>yesterday／ago</b> 就是簡單過去、<b>by the time（過去）</b> 配過去完成。
  </p>
</div>
