<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
	import PrivateShield from '$lib/components/Chat/PrivateShield.svelte';

  const { Story } = defineMeta({
    title: 'Components/PrivateShield',
    component: PrivateShield,
    tags: ['autodocs'],
    argTypes: {
    }
  });
</script>

<!-- Default small size -->
<Story
  name="Small"
  args={{
  }}
/>

<!-- Medium size -->
<Story
  name="Medium"
  args={{
  }}
/>
