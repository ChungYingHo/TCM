<script lang="ts" generics="T extends string">
  // 全站統一的分段切換器（segmented control）：柔灰底槽 + 選中項浮白卡。
  // 取代散落各頁的 daisyUI tabs-boxed 與手刻 tab 樣式，視覺語彙一致。
  let {
    options,
    value = $bindable(),
    ariaLabel = '',
    block = false,
  }: {
    options: { value: T; label: string }[]
    value: T
    ariaLabel?: string
    block?: boolean // true = 撐滿容器、等寬分段；false = 依內容寬度
  } = $props()
</script>

<div
  role="tablist"
  aria-label={ariaLabel}
  class={`gap-1 rounded-box bg-base-200 p-1 ${block ? 'grid auto-cols-fr grid-flow-col' : 'inline-flex w-fit'}`}
>
  {#each options as opt (opt.value)}
    <button
      type="button"
      role="tab"
      aria-selected={value === opt.value}
      class={`rounded-field px-4 py-2 text-sm font-semibold transition-colors ${
        value === opt.value
          ? 'bg-base-100 text-primary shadow-soft'
          : 'text-base-content/60 hover:text-base-content'
      }`}
      onclick={() => (value = opt.value)}
    >{opt.label}</button>
  {/each}
</div>
