<script lang="ts">
  import type { Snippet } from "svelte";
  import { onMount } from "svelte";
 
  type Props = {
    children?: Snippet;
    class?: string;
    glowColor?: string;
    animationDuration?: number;
  };
  
  const {
    children,
    class: className = '',
    glowColor = '#8b5cf6',
    animationDuration = 4,
    ...attrs
  }: Props = $props();

  const baseStyles = [
    'font-bold', 'relative',
    'text-violet-400',
  ].join(' ');
  
  let textContent = '';
  let spanElements: HTMLSpanElement[] = [];
  const glowWindowLetters = 50;

  onMount(() => {
    const container = document.querySelector('.glow-container');
    if (container) {
      textContent = container.textContent || '';
      container.textContent = '';
      
      // Create individual spans for each character
      spanElements = Array.from(textContent).map((char, index) => {
        const delay = index * (animationDuration * 1) / (textContent.length + glowWindowLetters);
        const span = document.createElement('span');

        span.textContent = char === ' ' ? '\u00A0' : char;
        span.className = 'glow-letter';
        span.style.setProperty('--animation-duration', animationDuration.toString());
        span.style.setProperty('--animation-delay', `${delay}s`);

        container.appendChild(span);
        return span;
      });
    }
  });
</script>

<span
  {...attrs}
  class={[baseStyles, 'glow-container', className].join(' ')}
>
  {@render children?.()}
</span>