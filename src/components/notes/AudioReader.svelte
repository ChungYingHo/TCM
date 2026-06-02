<script lang="ts">
  // Drive-time review: reads the note's key points aloud via the browser's
  // built-in speech synthesis (no API, works offline). Pick a Chinese voice.
  import { onDestroy } from 'svelte'

  let { text }: { text: string } = $props()

  let status = $state<'idle' | 'playing' | 'paused'>('idle')
  let rate = $state(1)
  let supported = $state(true)
  let voice: SpeechSynthesisVoice | null = null

  function pickVoice() {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      supported = false
      return
    }
    const voices = window.speechSynthesis.getVoices()
    voice =
      voices.find((v) => /zh[-_]TW/i.test(v.lang)) ||
      voices.find((v) => /zh[-_]HK/i.test(v.lang)) ||
      voices.find((v) => v.lang.toLowerCase().startsWith('zh')) ||
      null
  }

  $effect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      supported = false
      return
    }
    pickVoice()
    window.speechSynthesis.addEventListener('voiceschanged', pickVoice)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', pickVoice)
  })

  function play() {
    if (!supported) return
    const synth = window.speechSynthesis
    if (status === 'paused') {
      synth.resume()
      status = 'playing'
      return
    }
    synth.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'zh-TW'
    if (voice) u.voice = voice
    u.rate = rate
    u.onend = () => (status = 'idle')
    u.onerror = () => (status = 'idle')
    synth.speak(u)
    status = 'playing'
  }

  function pause() {
    window.speechSynthesis.pause()
    status = 'paused'
  }

  function stop() {
    window.speechSynthesis.cancel()
    status = 'idle'
  }

  function changeRate(r: number) {
    rate = r
    if (status === 'playing') {
      stop()
      play()
    }
  }

  onDestroy(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel()
  })
</script>

{#if supported}
  <div class="my-4 flex flex-wrap items-center gap-2 rounded-xl border border-base-300 bg-base-100 p-3">
    <span class="flex items-center gap-1.5 text-sm font-semibold"><span aria-hidden="true">🎧</span>語音複習</span>
    {#if status !== 'playing'}
      <button class="btn btn-primary btn-sm" onclick={play}>{status === 'paused' ? '繼續' : '播放重點'}</button>
    {:else}
      <button class="btn btn-sm" onclick={pause}>暫停</button>
    {/if}
    {#if status !== 'idle'}
      <button class="btn btn-ghost btn-sm" onclick={stop}>停止</button>
    {/if}
    <span class="ml-auto flex items-center gap-1 text-xs opacity-70">
      速度
      <select class="select select-bordered select-xs" value={rate} onchange={(e) => changeRate(Number((e.target as HTMLSelectElement).value))}>
        <option value={0.8}>0.8x</option>
        <option value={1}>1x</option>
        <option value={1.25}>1.25x</option>
        <option value={1.5}>1.5x</option>
      </select>
    </span>
  </div>
{:else}
  <p class="my-3 text-xs opacity-60">（此瀏覽器不支援語音朗讀）</p>
{/if}
