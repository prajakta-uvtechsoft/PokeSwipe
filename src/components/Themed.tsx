import React, { PropsWithChildren, useMemo } from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  View as RNView,
  ViewProps as RNViewProps,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

// Simple wrapper around View that automatically picks up the current background colour.
export function ThemedView(props: PropsWithChildren<RNViewProps>) {
  const { theme } = useTheme();

  const viewStyle = useMemo(
    () => [styles.view, { backgroundColor: theme.background }, props.style],
    [props.style, theme.background],
  );

  return (
    <RNView {...props} style={viewStyle}>
      {props.children}
    </RNView>
  );
}

type TextProps = RNTextProps & {
  variant?: 'title' | 'subtitle' | 'body' | 'caption';
};

// Typography helper so we can switch variants without repeating font sizes everywhere.
export function ThemedText({ variant = 'body', style, ...rest }: TextProps) {
  const { theme } = useTheme();

  const textStyle = useMemo(
    () => [
      styles.baseText,
      variant === 'title' && styles.title,
      variant === 'subtitle' && styles.subtitle,
      variant === 'caption' && styles.caption,
      { color: theme.textPrimary },
      style,
    ],
    [style, theme.textPrimary, variant],
  );

  return <RNText {...rest} style={textStyle} />;
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
  },
  baseText: {
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  caption: {
    fontSize: 13,
  },
});

