<script lang="ts">
  // 主動詞一致規則：點一類，看規則與例句。
  type Rule = { name: string; rule: string; eg: string }
  const RULES: Rule[] = [
    { name: '恆單數', rule: 'each / every / one of + 複數N；不可數名詞；動名詞主詞', eg: 'Each student has a locker.' },
    { name: 'a/the number', rule: 'a number of → 複數；the number of → 單數', eg: 'A number of people are… / The number of people is…' },
    { name: '就近原則', rule: 'either…or / neither…nor / not only…but also → 跟最靠近的主詞', eg: 'Neither he nor they are right.' },
    { name: '插入語不算', rule: 'along with / as well as / together with 不改變主詞', eg: 'Exercise, along with diet, is key.' },
  ]
  let i = $state(0)
  const c = $derived(RULES[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🧩</span>
    <span class="font-display font-bold">主動詞一致規則</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each RULES as r, k (r.name)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{r.name}</button>
    {/each}
  </div>

  <div class="rounded-box bg-base-200/60 p-3 text-sm">
    <div class="mb-1 font-bold text-primary">{c.name}</div>
    <div class="text-base-content/80">{c.rule}</div>
    <div class="mt-1 rounded bg-base-100 px-2 py-1 text-base-content/75">{c.eg}</div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    動詞跟「<b>真主詞</b>」一致；插入語與修飾片語都不算。
  </p>
</div>
