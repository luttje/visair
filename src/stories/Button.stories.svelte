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
      onClick: fn(),
    }
  });
</script>

<Story name="Primary" args={{ primary: true, label: 'Button' }} />

<Story name="Secondary" args={{ label: 'Button' }} />
