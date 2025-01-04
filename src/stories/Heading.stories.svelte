<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Heading from '$lib/components/Heading.svelte';

  const { Story } = defineMeta({
    title: 'Components/Heading',
    component: Heading,
    tags: ['autodocs'],
    argTypes: {
      level: {
        control: 'select',
        options: [1, 2, 3, 4, 5, 6],
        description: 'The heading level (h1-h6)',
      },
      class: {
        control: 'text',
        description: 'Additional CSS classes',
      },
    },
  });
</script>

<!-- All heading levels -->
<Story 
  name="H1" 
  args={{ 
    level: 1,
  }}>
  
  {#snippet children(args)}
    <Heading {...args}>
      Test Heading 1
    </Heading>
  {/snippet}
</Story>

<Story 
  name="H2" 
  args={{ 
    level: 2,
  }}>
  
  {#snippet children(args)}
    <Heading {...args}>
      Test Heading 2
    </Heading>
  {/snippet}
</Story>

<Story 
  name="H3" 
  args={{ 
    level: 3,
  }}>
  
  {#snippet children(args)}
    <Heading {...args}>
      Test Heading 3
    </Heading>
  {/snippet}
</Story>

<Story 
  name="H4" 
  args={{ 
    level: 4,
  }}>
  
  {#snippet children(args)}
    <Heading {...args}>
      Test Heading 4
    </Heading>
  {/snippet}
</Story>

<Story 
  name="H5" 
  args={{ 
    level: 5,
  }}>
  
  {#snippet children(args)}
    <Heading {...args}>
      Test Heading 5
    </Heading>
  {/snippet}
</Story>

<Story 
  name="H6" 
  args={{ 
    level: 6,
  }}>
  
  {#snippet children(args)}
    <Heading {...args}>
      Test Heading 6
    </Heading>
  {/snippet}
</Story>