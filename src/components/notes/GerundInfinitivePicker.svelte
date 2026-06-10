<script lang="ts">
  // 接 V-ing 還是 to V：點一類，看常見字與例句。
  type Group = { name: string; items: string; eg: string }
  const GROUPS: Group[] = [
    { name: '只接 V-ing', items: 'enjoy, avoid, finish, mind, suggest, consider, admit, deny, practice', eg: 'He avoided answering the question.' },
    { name: '只接 to V', items: 'want, hope, decide, plan, agree, refuse, promise, manage, afford', eg: 'She refused to sign the form.' },
    { name: '介系詞後 V-ing', items: 'in / on / by / before / after / without', eg: 'You stay healthy by exercising.' },
    { name: 'to 是介系詞→V-ing', items: 'be used to, look forward to, object to', eg: 'I look forward to hearing from you.' },
  ]
  let i = $state(0)
  const c = $derived(GROUPS[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🔧</span>
    <span class="font-display font-bold">接 V-ing 還是 to V</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each GROUPS as g, k (g.name)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{g.name}</button>
    {/each}
  </div>

  <div class="rounded-box bg-base-200/60 p-3 text-sm">
    <div class="mb-1 font-bold text-primary">{c.name}</div>
    <div class="text-base-content/80"><span class="text-base-content/50">常見字：</span>{c.items}</div>
    <div class="mt-1 rounded bg-base-100 px-2 py-1 text-base-content/75">{c.eg}</div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    <b>used to + 原形 V</b>（過去常常）≠ <b>be used to + V-ing</b>（習慣於）。
  </p>
</div>
