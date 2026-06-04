<script lang="ts">
  // 各時代文學代表：點一個時代，看它的代表文類與重要作家作品。
  type Era = { name: string; genre: string; items: string }
  const ERAS: Era[] = [
    { name: '先秦', genre: '諸子散文＋楚辭', items: '儒（孔孟）、道（老莊）、墨（墨子）、法（韓非子）；屈原《楚辭·離騷》。' },
    { name: '兩漢', genre: '史書＋漢賦', items: '司馬遷《史記》（紀傳體通史）、班固《漢書》（斷代史）；司馬相如漢大賦。' },
    { name: '唐', genre: '詩的黃金時代', items: '李白（詩仙·浪漫）、杜甫（詩聖·現實）、王維（山水田園）、白居易（新樂府）；古文運動：韓愈、柳宗元。' },
    { name: '宋', genre: '詞的黃金時代', items: '婉約派：柳永、李清照；豪放派：蘇軾、辛棄疾；散文：歐陽修。' },
    { name: '元', genre: '戲曲（元曲）', items: '元曲四大家：關漢卿（《竇娥冤》）、白樸、馬致遠（〈天淨沙〉）、鄭光祖；王實甫《西廂記》。' },
    { name: '明清', genre: '小說鼎盛', items: '四大名著：《三國演義》羅貫中、《水滸傳》施耐庵、《西遊記》吳承恩、《紅樓夢》曹雪芹；《儒林外史》吳敬梓（諷刺）。' },
    { name: '現當代／台灣', genre: '台灣文學與流派', items: '楊逵、吳濁流、鍾肇政（日治到戰後）；流派：原住民／女性／同志／鄉土文學。' },
  ]
  let i = $state(2)
  const e = $derived(ERAS[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">📚</span>
    <span class="font-display font-bold">各時代文學代表</span>
  </div>

  <div class="mb-3 flex flex-wrap items-center gap-1">
    {#each ERAS as er, k (er.name)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{er.name}</button>
      {#if k < ERAS.length - 1}<span class="text-base-content/40">›</span>{/if}
    {/each}
  </div>

  <div class="rounded-box bg-base-200/60 p-3 text-sm">
    <div class="mb-1 flex items-center gap-2"><span class="font-bold text-primary">{e.name}</span><span class="badge badge-sm badge-secondary">{e.genre}</span></div>
    <p class="text-base-content/80">{e.items}</p>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    一句話記時代代表：<b>唐詩、宋詞、元曲、明清小說</b>。配對題先想自己最熟的代表作，再用<b>時代</b>排除（詞人是宋的，不會是元的）。
  </p>
</div>
