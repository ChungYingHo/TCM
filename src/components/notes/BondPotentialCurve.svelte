<script lang="ts">
  const points = [
    [12, 18], [22, 34], [32, 62], [42, 84], [50, 91], [58, 85], [68, 63], [78, 42], [90, 26], [108, 18],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(' ')
</script>

<figure class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 print:break-inside-avoid">
  <figcaption class="mb-3 font-display font-bold text-base-content">H₂ 的位能與鍵長</figcaption>
  <svg viewBox="0 0 130 110" class="mx-auto block w-full max-w-xl" role="img" aria-label="氫分子位能曲線">
    <line x1="12" y1="15" x2="12" y2="94" class="stroke-base-content/60" stroke-width="1" />
    <line x1="12" y1="18" x2="118" y2="18" class="stroke-base-content/30" stroke-dasharray="3 3" stroke-width="1" />
    <line x1="12" y1="94" x2="118" y2="94" class="stroke-base-content/60" stroke-width="1" />
    <polyline points={points} fill="none" class="stroke-primary" stroke-width="2.5" />
    <circle cx="50" cy="91" r="3" class="fill-primary" />
    <line x1="50" y1="91" x2="50" y2="98" class="stroke-primary" stroke-width="1" />
    <text x="52" y="106" class="fill-base-content text-[5px]">74 pm</text>
    <text x="53" y="84" class="fill-primary text-[5px] font-bold">最低能量</text>
    <text x="53" y="89" class="fill-base-content text-[4.5px]">E = −432 kJ mol⁻¹</text>
    <text x="4" y="16" class="fill-base-content text-[5px]">0</text>
    <text x="0" y="10" class="fill-base-content text-[5px]">位能 E</text>
    <text x="91" y="105" class="fill-base-content text-[5px]">核間距離 r</text>
    <text x="17" y="51" class="fill-error text-[4.5px]">核核斥力主導</text>
    <text x="72" y="61" class="fill-success text-[4.5px]">電子與核吸引減弱</text>
  </svg>
  <div class="mt-3 grid gap-2 text-sm leading-relaxed sm:grid-cols-3">
    <p><b>r &lt; 74 pm</b>：核核斥力大於吸引力，能量上升。</p>
    <p><b>r = 74 pm</b>：斥力與吸引力平衡，鍵長固定。</p>
    <p><b>r &gt; 74 pm</b>：兩核對共享電子的吸引變弱，能量上升。</p>
  </div>
</figure>
