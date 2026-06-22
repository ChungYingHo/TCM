<script lang="ts">
  import ElementQuizSetup from '@/components/element/ElementQuizSetup.svelte'
  import ElementQuiz from '@/components/element/ElementQuiz.svelte'
  import Icon from '@/components/common/Icon.svelte'
  import type { QuestionType } from '@/utils/elementQuiz'

  type Config = { types: QuestionType[]; elementZs: number[]; count: number }

  let phase = $state<'setup' | 'quiz'>('setup')
  let config = $state<Config | null>(null)

  function handleStart(cfg: Config) {
    config = cfg
    phase = 'quiz'
  }
</script>

{#if phase === 'setup'}
  <ElementQuizSetup onstart={handleStart} />
{:else if config}
  <div class="flex flex-col gap-3">
    <button class="btn btn-ghost btn-sm self-start gap-1" onclick={() => { phase = 'setup' }}>
      <Icon name="arrow-left" class="h-4 w-4" />
      重新設定
    </button>
    <ElementQuiz
      count={config.count}
      elementZs={config.elementZs}
      questionTypes={config.types}
    />
  </div>
{/if}
