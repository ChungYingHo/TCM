<script lang="ts">
  // 十大修辭格：點一個，看定義、辨識關鍵與例句。
  type R = { name: string; def: string; key: string; eg: string }
  const RHET: R[] = [
    { name: '譬喻', def: '用「像、如、是」連結本體與喻體。', key: '有喻詞（像／如／是／彷彿）；暗喻用「是」直接連。', eg: '瓶身描繪的牡丹一如你初妝' },
    { name: '轉化（擬人）', def: '把無生命事物當作人來描寫。', key: '無生物出現人的動作或感情。', eg: '簾外芭蕉惹驟雨（芭蕉「惹」事）' },
    { name: '轉化（擬物）', def: '把人比作物來描寫。', key: '人出現物的特徵。', eg: '我變成一棵樹，靜靜在風中等你' },
    { name: '轉品（活用）', def: '把某詞性的字臨時用作另一詞性。', key: '名詞→動詞、形容詞→動詞。', eg: '春風風人（第二個「風」由名詞轉動詞）' },
    { name: '借代', def: '不直說本體，用相關事物代替。', key: '找不到喻詞；能問「代替的是什麼」。', eg: '杜康代酒、絲竹代音樂、帆代船' },
    { name: '誇飾', def: '故意誇大或縮小事實以加強語氣。', key: '現實上不可能、極度誇張。', eg: '白髮三千丈、隔江千萬里' },
    { name: '映襯（對比）', def: '兩種相反事物並列、互相映照。', key: '前後形成強烈意義反差。', eg: '朱門酒肉臭，路有凍死骨' },
    { name: '排比', def: '三組以上結構相似、意義相關的句子並列。', key: '至少三組，結構平行。', eg: '芭蕉惹驟雨，門環惹銅綠，惹了你' },
    { name: '對偶（對仗）', def: '上下兩句字數相等、結構相對、詞性對應。', key: '恰好兩句，且一一對應。', eg: '無邊落木蕭蕭下，不盡長江滾滾來' },
    { name: '類疊（疊字）', def: '重複同一字詞以加強語氣或節奏。', key: '連續重複同字。', eg: '蕭蕭、滾滾、嫋嫋' },
  ]
  let i = $state(0)
  const r = $derived(RHET[i])
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🎭</span>
    <span class="font-display font-bold">十大修辭格速查</span>
  </div>

  <div class="mb-3 flex flex-wrap gap-1">
    {#each RHET as rh, k (rh.name)}
      <button type="button" class={`btn btn-xs ${i === k ? 'btn-primary' : 'btn-outline'}`} onclick={() => (i = k)}>{rh.name}</button>
    {/each}
  </div>

  <div class="rounded-box bg-base-200/60 p-3 text-sm">
    <div class="mb-1 font-bold text-primary">{r.name}</div>
    <div class="text-base-content/80">{r.def}</div>
    <div class="mt-1 text-base-content/70"><span class="text-base-content/50">辨識關鍵：</span>{r.key}</div>
    <div class="mt-1 rounded bg-base-100 px-2 py-1 text-base-content/75">例：{r.eg}</div>
  </div>
  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    判修辭先抓<b>辨識關鍵</b>：有喻詞→譬喻；無喻詞而本體被替換→借代；無生物有人的動作→擬人；詞性臨時改變→轉品。一個句子可同時含多種修辭。
  </p>
</div>
