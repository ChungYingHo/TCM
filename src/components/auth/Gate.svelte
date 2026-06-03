<script lang="ts">
  let password = $state('')
  let error = $state(false)
  let busy = $state(false)
  let show = $state(false)

  async function submit(e: Event) {
    e.preventDefault()
    busy = true
    error = false
    try {
      const res = await fetch('/api/unlock', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        window.location.href = '/home'
      } else {
        error = true
      }
    } catch {
      error = true
    } finally {
      busy = false
    }
  }
</script>

<form
  onsubmit={submit}
  class="flex w-full max-w-xs flex-col gap-3 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md"
>
  <div class="relative">
    <input
      type={show ? 'text' : 'password'}
      class="input input-bordered w-full bg-white/80 pr-11 text-base-content"
      placeholder="輸入通關密語"
      bind:value={password}
      autocomplete="off"
      aria-label="密碼"
    />
    <button
      type="button"
      class="absolute right-1 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-lg leading-none text-base-content/70 hover:bg-base-200"
      onclick={() => (show = !show)}
      aria-label={show ? '隱藏密碼' : '顯示密碼'}
      aria-pressed={show}
      tabindex="-1"
    >
      {show ? '🙈' : '👁️'}
    </button>
  </div>
  <button type="submit" class="btn btn-primary" disabled={busy || !password}>
    {busy ? '驗證中…' : '進入'}
  </button>
  {#if error}
    <p class="text-center text-sm text-error-content/90">密碼不對，再想想？</p>
  {/if}
</form>
