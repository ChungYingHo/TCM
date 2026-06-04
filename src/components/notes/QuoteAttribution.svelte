<script lang="ts">
  // 名句配作者自測：看名句，先想是誰說的，再翻牌看作者、學派與重點。
  type Card = { quote: string; author: string; school: string; note: string }
  const CARDS: Card[] = [
    { quote: '天行有常，不為堯存，不為桀亡', author: '荀子', school: '儒家', note: '自然有常規，不因聖君暴君而改變。⚠ 最常被誤植成孟子！' },
    { quote: '聖人不仁，以百姓為芻狗', author: '老子', school: '道家', note: '芻狗＝草紮的狗；喻天道無私、任萬物自生自滅。' },
    { quote: '人皆知有用之用，而莫知無用之用也', author: '莊子', school: '道家', note: '無用方能保全，是逍遙的智慧。' },
    { quote: '君無術則弊於上，臣無法則亂於下', author: '韓非子', school: '法家', note: '術＝御臣之術，法＝公開的律令；法術勢並用。' },
    { quote: '民為貴，社稷次之，君為輕', author: '孟子', school: '儒家', note: '民本思想，見《孟子·盡心下》。' },
    { quote: '兼相愛，交相利', author: '墨子', school: '墨家', note: '兼愛（無差等）的核心表述。' },
    { quote: '上善若水，水善利萬物而不爭', author: '老子', school: '道家', note: '以水喻道：謙下、不爭、利萬物。' },
    { quote: '天行健，君子以自強不息', author: '《易經》', school: '群經之首', note: '剛健不息的精神，非諸子個人語。' },
  ]
  let i = $state(0)
  let revealed = $state(false)
  const c = $derived(CARDS[i])
  const next = () => { i = (i + 1) % CARDS.length; revealed = false }
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🗣️</span>
    <span class="font-display font-bold">名句配作者自測</span>
    <span class="ml-auto text-xs text-base-content/50">{i + 1} / {CARDS.length}</span>
  </div>

  <div class="rounded-box bg-base-200/60 p-4 text-center">
    <p class="text-lg font-bold leading-relaxed">「{c.quote}」</p>
    {#if revealed}
      <div class="mt-3 border-t border-base-300 pt-2 text-sm">
        <span class="badge badge-success badge-lg font-bold">{c.author}</span>
        <span class="badge badge-ghost ml-1">{c.school}</span>
        <p class="mt-2 text-base-content/75">{c.note}</p>
      </div>
    {/if}
  </div>

  <div class="mt-3 flex gap-2">
    {#if !revealed}
      <button type="button" class="btn btn-primary btn-sm flex-1" onclick={() => (revealed = true)}>翻牌看作者</button>
    {:else}
      <button type="button" class="btn btn-outline btn-sm flex-1" onclick={next}>下一題 →</button>
    {/if}
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    「這句話是誰說的」是最高頻題型。把名句配人記熟，特別小心誤植陷阱：<b>「天行有常」是荀子</b>（非孟子）、<b>「聖人不仁」是老子</b>、<b>「無用之用」是莊子</b>。
  </p>
</div>
