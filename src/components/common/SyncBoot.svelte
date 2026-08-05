<script lang="ts">
  // 啟動雲端同步。
  //
  // 2026-08-05 移除了一段 2026-06-03 留下的一次性清庫程式：它在 `tcm.reset.v2` 這個旗標
  // 不存在時，會清掉所有 `tcm.*` localStorage **並且 PUT 一份空的 state 到雲端**。
  // 那個遷移早就跑完了，但它的觸發條件是「這台裝置沒有旗標」——所以任何**新裝置或清過
  // 瀏覽器資料的裝置**第一次開站，都會把雲端進度洗掉（Aira 常用手機／平板）。
  // 版本不相容現在由 cloud.ts 的 epoch gate 正確處理（見 vocabSrs 的 VOCAB_SRS_EPOCH），
  // 不需要也不該用「清光」來解決。
  import { onMount } from 'svelte'
  import { bootCloud } from '@/utils/cloud'

  onMount(bootCloud)
</script>
