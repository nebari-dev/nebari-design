import { GLOBALS_UPDATED } from 'storybook/internal/core-events';
import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

const lightTheme = create({
  base: 'light',
  colorPrimary: '#9547c0',
  colorSecondary: '#9547c0',
  appBg: '#f8f8f8',
  appContentBg: '#ffffff',
  appHoverBg: '#eceff1',
  appPreviewBg: '#f8f8f8',
  appBorderColor: '#b7b7bb',
  textColor: '#262628',
  textMutedColor: '#70707a',
  barTextColor: '#70707a',
  barHoverColor: '#262628',
  barSelectedColor: '#9547c0',
  barBg: '#ffffff',
  inputBg: '#ffffff',
  inputBorder: '#9d9da6',
  inputTextColor: '#262628',
});

const darkTheme = create({
  base: 'dark',
  colorPrimary: '#b053e2',
  colorSecondary: '#b053e2',
  appBg: '#262628',
  appContentBg: '#353538',
  appHoverBg: '#3d4956',
  appPreviewBg: '#262628',
  appBorderColor: '#5a5a61',
  textColor: '#f8f8f8',
  textMutedColor: '#9d9da6',
  barTextColor: '#9d9da6',
  barHoverColor: '#f8f8f8',
  barSelectedColor: '#b053e2',
  barBg: '#353538',
  inputBg: '#353538',
  inputBorder: '#70707a',
  inputTextColor: '#f8f8f8',
});

export const managerThemes = {
  light: lightTheme,
  dark: darkTheme,
};

function setManagerTheme(theme: unknown) {
  addons.setConfig({
    theme: theme === 'dark' ? managerThemes.dark : managerThemes.light,
  });
}

addons.register('nebari/theme-sync', (api) => {
  setManagerTheme(api.getGlobals().theme);
  api.getChannel()?.on(GLOBALS_UPDATED, ({ globals }) => {
    setManagerTheme(globals.theme);
  });
});
