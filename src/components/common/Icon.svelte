<script lang="ts">
  // 全站共用 icon 元件：<Icon name="arrowRight" class="h-4 w-4" />。
  // 圖庫在 src/utils/icons.ts；filled 給星號等需填色的狀態用。
  import { ICONS, type IconName } from '@/utils/icons'

  interface Props {
    name: IconName
    class?: string
    stroke?: number
    filled?: boolean
  }
  let { name, class: cls = 'h-5 w-5', stroke = 2, filled = false }: Props = $props()
</script>

<svg
  viewBox="0 0 24 24"
  fill={filled ? 'currentColor' : 'none'}
  stroke="currentColor"
  stroke-width={stroke}
  stroke-linecap="round"
  stroke-linejoin="round"
  class={cls}
  aria-hidden="true">{@html ICONS[name]}</svg>
