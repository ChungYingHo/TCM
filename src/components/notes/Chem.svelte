<script lang="ts">
  // Chemical formula / equation renderer — high contrast, no KaTeX dependency.
  // Notation:  H2O  CH3COOH  SO4^2-  Ca^2+  2H^+ + 2e^- -> H2(g)
  //   digits after a letter/) -> subscript;  ^… -> superscript;
  //   ->  becomes →   <-> becomes ⇌   leading coefficients stay normal size.
  let { eq = '', display = false }: { eq?: string; display?: boolean } = $props()

  type Seg = { k: 'txt' | 'sub' | 'sup'; v: string }

  function parse(src: string): Seg[] {
    const s = src.replace(/<->|<=>/g, '⇌').replace(/->|=>/g, '→')
    const segs: Seg[] = []
    let txt = ''
    const flush = () => { if (txt) { segs.push({ k: 'txt', v: txt }); txt = '' } }
    for (let i = 0; i < s.length; i++) {
      const c = s[i]
      if (c === '^') {
        flush()
        let j = i + 1
        let run = ''
        while (j < s.length && /[0-9+\-−]/.test(s[j])) { run += s[j]; j++ }
        segs.push({ k: 'sup', v: run.replace(/-/g, '−') })
        i = j - 1
      } else if (/[0-9]/.test(c) && /[A-Za-z)\]]/.test(s[i - 1] ?? '')) {
        flush()
        let j = i
        let run = ''
        while (j < s.length && /[0-9]/.test(s[j])) { run += s[j]; j++ }
        segs.push({ k: 'sub', v: run })
        i = j - 1
      } else {
        txt += c
      }
    }
    flush()
    return segs
  }

  const segs = $derived(parse(eq))
</script>

<span class={display ? 'chem chem-display' : 'chem'}>
  {#each segs as s, i (i)}{#if s.k === 'sub'}<sub>{s.v}</sub>{:else if s.k === 'sup'}<sup>{s.v}</sup>{:else}{s.v}{/if}{/each}
</span>

<style>
  .chem {
    font-family: 'Cambria Math', 'Times New Roman', var(--font-body), serif;
    font-weight: 600;
    letter-spacing: 0.01em;
    white-space: nowrap;
  }
  .chem-display {
    display: block;
    margin: 0.85rem 0;
    padding: 0.7rem 1rem;
    font-size: 1.15rem;
    text-align: center;
    border: 1px solid color-mix(in oklab, var(--color-secondary) 35%, var(--color-base-300));
    border-left: 3px solid var(--color-secondary);
    border-radius: var(--radius-box);
    background: color-mix(in oklab, var(--color-secondary) 7%, var(--color-base-100));
    overflow-x: auto;
  }
  sub, sup { font-size: 0.72em; font-weight: 500; }
</style>
