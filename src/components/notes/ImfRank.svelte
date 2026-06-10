<script lang="ts">
  // 沸點階梯：把物質依沸點由高到低排，並用顏色標出主要的分子間作用力，
  // 一眼看出「離子鍵 > 氫鍵 > 偶極-偶極 > 倫敦色散」的規律。點作用力類型可聚焦。
  type Sub = { name: string; bp: number; imf: string }
  const SUBS: Sub[] = [
    { name: 'NaCl', bp: 1413, imf: '離子鍵' },
    { name: 'H₂O', bp: 100, imf: '氫鍵' },
    { name: 'CH₃OH', bp: 65, imf: '氫鍵' },
    { name: 'NH₃', bp: -33, imf: '氫鍵' },
    { name: 'HCl', bp: -85, imf: '偶極-偶極' },
    { name: 'H₂S', bp: -60, imf: '偶極-偶極' },
    { name: 'C₂H₆', bp: -89, imf: '倫敦色散' },
    { name: 'CH₄', bp: -161, imf: '倫敦色散' },
    { name: 'Ne', bp: -246, imf: '倫敦色散' },
  ]
  const COLOR: Record<string, string> = {
    離子鍵: 'bg-error/20 text-error', 氫鍵: 'bg-primary/20 text-primary',
    '偶極-偶極': 'bg-warning/20 text-warning', 倫敦色散: 'bg-base-content/15 text-base-content/70',
  }
  const TYPES = ['離子鍵', '氫鍵', '偶極-偶極', '倫敦色散']
  let focus = $state<string | null>(null)
  const sorted = $derived([...SUBS].sort((a, b) => b.bp - a.bp))
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🪜</span>
    <span class="font-display font-bold">沸點階梯：作用力越強、沸點越高</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each TYPES as t (t)}
      <button type="button" class={`btn btn-xs ${focus === t ? 'btn-primary' : 'btn-outline'}`} onclick={() => (focus = focus === t ? null : t)}>{t}</button>
    {/each}
  </div>

  <div class="flex flex-col gap-1.5">
    {#each sorted as s (s.name)}
      <div class={`flex items-center justify-between rounded-lg px-3 py-1.5 transition-opacity ${COLOR[s.imf]} ${focus && focus !== s.imf ? 'opacity-25' : ''}`}>
        <span class="font-bold">{s.name}</span>
        <span class="text-xs">{s.imf}</span>
        <span class="tabular-nums text-sm font-semibold">{s.bp}°C</span>
      </div>
    {/each}
  </div>

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    比沸點的順序：① 先挑<b>離子化合物</b>（離子鍵最強，沸點最高）；② 再看有沒有<b>氫鍵</b>；③ 都沒有就<b>比分子量</b>（分子量大 → 倫敦色散力大 → 沸點高，如 I₂ ＞ Br₂ ＞ Cl₂ ＞ F₂）。
  </p>
</div>
