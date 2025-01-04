<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import GroupTitle from '$lib/components/Chat/GroupTitle.svelte';

  const { Story } = defineMeta({
    title: 'Components/GroupTitle',
    component: GroupTitle,
    tags: ['autodocs'],
    argTypes: {
      title: {
        control: 'text',
        description: 'The title of the group',
      },
      description: {
        control: 'text',
        description: 'Optional description text below the title',
      },
      memberCount: {
        control: 'number',
        description: 'Optional number of members to display',
      }
    }
  });
</script>

<!-- Basic title only -->
<Story
  name="Default"
  args={{
    title: 'Development Team',
  }}
/>

<!-- With description -->
<Story
  name="With Description"
  args={{
    title: 'Design Team',
    description: 'Responsible for product design and user experience',
  }}
/>

<!-- With member count -->
<Story
  name="With Member Count"
  args={{
    title: 'Marketing Team',
    memberCount: 12,
  }}
/>

<!-- Complete example -->
<Story
  name="Complete"
  args={{
    title: 'Engineering Team',
    description: 'Backend and frontend development team',
    memberCount: 24,
  }}
/>