<script lang="ts">
  // 焰色試驗速查（靜態全畫，供 GoodNotes/PDF 直接看，無互動）。
  // 色塊用實際焰色的 hex（物理顏色，非主題色），故用 inline style；Mg 白光加深邊框才看得見。
  type Ion = { ion: string; name: string; color: string; light?: boolean }
  const IA: Ion[] = [
    { ion: 'Li⁺', name: '深紅', color: '#b91c1c' },
    { ion: 'Na⁺', name: '金黃', color: '#f0b400' },
    { ion: 'K⁺', name: '淺紫', color: '#c084e0' },
    { ion: 'Rb⁺', name: '紫', color: '#8b3fd6' },
    { ion: 'Cs⁺', name: '藍', color: '#2563eb' },
  ]
  const IIA: Ion[] = [
    { ion: 'Mg²⁺', name: '強烈白光', color: '#f8fafc', light: true },
    { ion: 'Ca²⁺', name: '橘紅', color: '#ea580c' },
    { ion: 'Sr²⁺', name: '磚紅', color: '#c0392b' },
    { ion: 'Ba²⁺', name: '黃綠', color: '#84cc16' },
  ]
</script>

<div class="not-prose my-5 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5 print:break-inside-avoid">
  <div class="mb-3 flex items-center gap-2">
    <span aria-hidden="true">🔥</span>
    <span class="font-display font-bold">常見離子焰色</span>
  </div>

  {#each [{ label: 'IA 鹼金屬', rows: IA }, { label: 'IIA 鹼土金屬', rows: IIA }] as group (group.label)}
    <div class="mb-2 last:mb-0">
      <div class="mb-1.5 text-sm font-semibold text-base-content/70">{group.label}</div>
      <div class="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {#each group.rows as f (f.ion)}
          <div class="flex flex-col items-center rounded-lg border border-base-300 bg-base-200/40 p-2 text-center print:break-inside-avoid">
            <span
              class={`h-9 w-9 rounded-full ${f.light ? 'border-2 border-base-content/30' : ''}`}
              style={`background-color:${f.color}`}
              aria-hidden="true"
            ></span>
            <div class="mt-1.5 font-bold">{f.ion}</div>
            <div class="text-sm text-base-content/70">{f.name}</div>
          </div>
        {/each}
      </div>
    </div>
  {/each}

  <p class="mt-3 text-xs leading-relaxed text-base-content/70">
    金屬離子放光多落在<b>可見光區</b>（肉眼可辨、可鑑定），非金屬多落在可見光區外。<b>Na⁺ 金黃最強</b>，微量鈉污染就蓋掉其他色，故觀察 K⁺ 淺紫要透過<b>藍鈷玻璃</b>濾掉黃光。
  </p>
</div>
