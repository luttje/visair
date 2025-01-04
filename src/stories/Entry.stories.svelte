<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Entry from '$lib/components/Entry.svelte';
  import { fn } from '@storybook/test';

  const { Story } = defineMeta({
    title: 'Components/Entry',
    component: Entry,
    tags: ['autodocs'],
    argTypes: {
      type: {
        control: 'select',
        options: ['text', 'email', 'password', 'number', 'tel'],
      },
      value: {
        control: 'text',
      },
      label: {
        control: 'text',
      },
      placeholder: {
        control: 'text',
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

<!-- Basic text input -->
<Story 
  name="Default" 
  args={{ 
    label: 'Username',
    placeholder: 'Enter your username',
    value: '',
  }} 
/>

<!-- Required field -->
<Story 
  name="Required" 
  args={{ 
    label: 'Email',
    type: 'email',
    placeholder: 'Enter your email',
    required: true,
    value: '',
  }} 
/>

<!-- With error state -->
<Story 
  name="Error" 
  args={{ 
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
    error: true,
    errorMessage: 'Password must be at least 8 characters',
    value: 'pass',
  }} 
/>

<!-- Password input -->
<Story 
  name="Password" 
  args={{ 
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
    value: '',
  }} 
/>

<!-- Without label -->
<Story 
  name="No Label" 
  args={{ 
    placeholder: 'Standalone input',
    value: '',
  }} 
/>