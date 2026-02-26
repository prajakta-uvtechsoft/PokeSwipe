import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { ColorSchemeName, useColorScheme } from 'react-native';
import { AppTheme, darkTheme, lightTheme, ThemeMode } from './colors';

type ThemeContextValue = {
  theme: AppTheme;
  mode: ThemeMode;
  toggleMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

type ThemeProviderProps = PropsWithChildren<{
  initialMode?: ThemeMode | ColorSchemeName;
}>;

export function ThemeProvider({ children, initialMode }: ThemeProviderProps) {
  const systemScheme = useColorScheme();

  const modeFromPropsOrSystem: ThemeMode =
    (initialMode === 'light' || initialMode === 'dark'
      ? initialMode
      : systemScheme === 'dark')
      ? 'dark'
      : 'light';

  const [currentMode, setCurrentMode] = React.useState<ThemeMode>(modeFromPropsOrSystem);
  const [useSystem, setUseSystem] = React.useState(true);

  useEffect(() => {
    if (!useSystem) {
      return;
    }
    setCurrentMode(systemScheme === 'dark' ? 'dark' : 'light');
  }, [systemScheme, useSystem]);

  // Toggle lets the user explicitly override the system preference.
  const toggleMode = useCallback(() => {
    setUseSystem(false);
    setCurrentMode(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const theme = useMemo<AppTheme>(
    () => (currentMode === 'light' ? lightTheme : darkTheme),
    [currentMode],
  );

  const value = useMemo(
    () => ({
      theme,
      mode: currentMode,
      toggleMode,
    }),
    [theme, currentMode, toggleMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return ctx;
}

