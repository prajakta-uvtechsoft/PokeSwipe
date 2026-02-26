/**
 * Root of the application: wiring up navigation, theming and safe areas.
 */

import React, { useMemo } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
} from '@react-navigation/native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

function NavigationRoot() {
  const { theme, mode } = useTheme();
  const safeAreaInsets = useSafeAreaInsets();

  const barStyle = useMemo(
    () => (mode === 'dark' ? 'light-content' : 'dark-content'),
    [mode],
  );

  const navTheme = useMemo(
    () => ({
      ...(mode === 'dark' ? DarkTheme : DefaultTheme),
      colors: {
        ...(mode === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
        background: theme.background,
        card: theme.cardBackground,
        text: theme.textPrimary,
        border: theme.border,
      },
    }),
    [mode, theme],
  );

  return (
    <View style={[styles.root, { paddingTop: safeAreaInsets.top }]}>
      <StatusBar barStyle={barStyle} backgroundColor={theme.background} />
      <NavigationContainer theme={navTheme}>
        <RootNavigator />
      </NavigationContainer>
    </View>
  );
}

function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          <NavigationRoot />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
