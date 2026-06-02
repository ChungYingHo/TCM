<script lang="ts">
  let password = $state('')
  let error = $state(false)
  let busy = $state(false)

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
        window.location.href = '/study'
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
  <input
    type="password"
    class="input input-bordered w-full bg-white/80 text-base-content"
    placeholder="輸入通關密語"
    bind:value={password}
    autocomplete="off"
    aria-label="密碼"
  />
  <button type="submit" class="btn btn-primary" disabled={busy || !password}>
    {busy ? '驗證中…' : '進入'}
  </button>
  {#if error}
    <p class="text-center text-sm text-error-content/90">密碼不對，再想想？</p>
  {/if}
</form>
