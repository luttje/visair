import type { Preview } from '@storybook/svelte';
import { themes } from '@storybook/theming';

import '../src/app.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
    darkMode: {
      dark: {
        ...themes.dark,
        appContentBg: 'black',
        appPreviewBg: 'black',
      },
    },
    docs: {
      theme: themes.dark,
    },
  },
};

export default preview;