
<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import TextAreaEntry from '$lib/components/TextAreaEntry.svelte';
  import { fn } from '@storybook/test';

  const { Story } = defineMeta({
    title: 'Components/TextAreaEntry',
    component: TextAreaEntry,
    tags: ['autodocs'],
    argTypes: {
      value: {
        control: 'text',
      },
      label: {
        control: 'text',
      },
      placeholder: {
        control: 'text',
      },
      rows: {
        control: 'number',
      },
      required: {
        control: 'boolean',
      },
      error: {
        control: 'boolean',
      },
      errorMessage: {
        control: 'text',
      },
    },
    args: {
      oninput: fn(),
    },
  });
</script>

<!-- Basic textarea -->
<Story
  name="Default"
  args={{
    label: 'Description',
    placeholder: 'Enter your description',
    value: '',
    rows: 3,
  }}
/>

<!-- Required field -->
<Story
  name="Required"
  args={{
    label: 'Message',
    placeholder: 'Enter your message',
    required: true,
    value: '',
    rows: 4,
  }}
/>

<!-- With error state -->
<Story
  name="Error"
  args={{
    label: 'Bio',
    placeholder: 'Tell us about yourself',
    error: true,
    errorMessage: 'Bio must be at least 50 characters',
    value: 'Too short',
    rows: 5,
  }}
/>

<!-- Without label -->
<Story
  name="No Label"
  args={{
    placeholder: 'Standalone textarea',
    value: '',
    rows: 3,
  }}
/>