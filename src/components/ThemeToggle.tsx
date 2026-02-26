import React, { useMemo } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ThemedText } from './Themed';

export function ThemeToggle() {
  const { mode, toggleMode, theme } = useTheme();

  // Copy switches based on current mode so the chip always describes the action.
  const label = useMemo(
    () => (mode === 'light' ? 'Dark mode' : 'Light mode'),
    [mode],
  );

  return (
    <Pressable
      accessibilityRole="button"
      onPress={toggleMode}
      style={[
        styles.container,
        { backgroundColor: theme.cardBackground, borderColor: theme.border },
      ]}>
      <ThemedText style={styles.label} variant="caption">
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-end',
  },
  label: {
    fontWeight: '600',
  },
});

