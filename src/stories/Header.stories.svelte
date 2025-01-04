<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Header from '$lib/components/Header.svelte';
  import { fn } from '@storybook/test';

  const { Story } = defineMeta({
    title: 'Components/Header',
    component: Header,
    tags: ['autodocs'],
    parameters: {
      layout: 'fullscreen',
    },
    args: {
    }
  });
</script>

<Story name="Logged In" args={{ user: { apiKey: 'sk-proj-XXXXXXXXXXXXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXX' } }} />

<Story name="Logged Out" />
