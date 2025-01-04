<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Button from '$lib/components/Button.svelte';
  import { fn } from '@storybook/test';

  const { Story } = defineMeta({
    title: 'Components/Button',
    component: Button,
    tags: ['autodocs'],
    argTypes: {
    },
    args: {
      onclick: fn(),
    }
  });
</script>

<Story 
  name="Primary" 
  args={{ 
    primary: true,
  }}>
  
  {#snippet children(args)}
    <Button {...args}>
      Test Button
    </Button>
  {/snippet}
</Story>

<Story 
  name="Secondary" 
  args={{ 
  }}>
  
  {#snippet children(args)}
    <Button {...args}>
      Test Secondary Button
    </Button>
  {/snippet}
</Story>
