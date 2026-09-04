import { useEffect, useRef } from 'react';
import type { ThemeMode } from '@/hooks/use-theme-preference';

const THEME_MODE_LABELS: Record<ThemeMode, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

/** Restores Storybook's toolbar-owned theme after a hook demo unmounts. */
function useReturnThemeToToolbar(toolbarIsDark: boolean) {
  const toolbarIsDarkRef = useRef(toolbarIsDark);
  toolbarIsDarkRef.current = toolbarIsDark;

  useEffect(
    () => () => {
      document.documentElement.classList.toggle(
        'dark',
        toolbarIsDarkRef.current,
      );
    },
    [],
  );
}

export { THEME_MODE_LABELS, useReturnThemeToToolbar };
