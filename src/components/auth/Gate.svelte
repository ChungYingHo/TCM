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
  class="flex w-full max-w-sm flex-col gap-3 rounded-2xl border border-base-300 bg-base-100/90 p-5 shadow-lift backdrop-blur-sm"
>
  <div class="relative">
    <input
      type={show ? 'text' : 'password'}
      class="input input-bordered w-full pr-11"
      placeholder="輸入通關密語"
      bind:value={password}
      autocomplete="off"
      aria-label="密碼"
    />
    <button
      type="button"
      class="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-base-content/45 transition-colors hover:bg-base-200 hover:text-base-content/70"
      onclick={() => (show = !show)}
      aria-label={show ? '隱藏密碼' : '顯示密碼'}
      aria-pressed={show}
      tabindex="-1"
    >
      {#if show}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="h-[18px] w-[18px]" aria-hidden="true">
          <path d="M3 3l18 18" />
          <path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c7 0 10.5 7 10.5 7a18.4 18.4 0 0 1-3.2 4.1" />
          <path d="M6.2 6.2A18.3 18.3 0 0 0 1.5 12S5 19 12 19a10.8 10.8 0 0 0 4.3-.9" />
          <path d="M9.9 9.9a3 3 0 1 0 4.2 4.2" />
        </svg>
      {:else}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" class="h-[18px] w-[18px]" aria-hidden="true">
          <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      {/if}
    </button>
  </div>
  <button type="submit" class="btn btn-primary" disabled={busy || !password}>
    {busy ? '驗證中…' : '進入'}
  </button>
  {#if error}
    <p class="text-center text-sm font-medium text-error">密碼不對，再想想？</p>
  {/if}
</form>
