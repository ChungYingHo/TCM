// 考古題線上測驗（/exam）只在本機開放：dev server 直接讀 public/q/**；
// production build 會把 q/ 從輸出刪掉（scripts/strip-exam-assets.mjs），所以線上要藏入口，
// 不然會出現一整頁破圖。PUBLIC_EXAM_ENABLED=1 可強制開（本機 astro preview 測試用），
// 同一個變數也會讓 build 保留圖片，兩邊永遠一致。
export const EXAM_ENABLED: boolean = import.meta.env.DEV || import.meta.env.PUBLIC_EXAM_ENABLED === '1'
