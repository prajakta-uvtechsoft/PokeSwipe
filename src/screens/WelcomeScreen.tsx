import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThemedText, ThemedView } from '../components/Themed';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../theme/ThemeContext';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

// Onboarding screen that mirrors the design brief and routes into the swipe experience.
export function WelcomeScreen({ navigation }: Props) {
  const { theme } = useTheme();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerRow}>
        <ThemeToggle />
      </View>

      <View style={styles.hero}>
        <ThemedText variant="title" style={styles.title}>
          How to Play PokéSwipe
        </ThemedText>
        <ThemedText variant="body" style={styles.subtitle}>
          Pokémon appear one at a time. Swipe or tap:
          {'\n'}Like to add them to your dream team, or Dislike to pass.
        </ThemedText>
      </View>

      <View style={styles.illustrationRow}>
        <View
          style={[
            styles.phoneCard,
            { backgroundColor: '#FFFFFF', borderColor: theme.border },
          ]}
        />
        <View
          style={[
            styles.phoneCard,
            { backgroundColor: theme.cardBackground, borderColor: theme.border },
          ]}
        />
      </View>

      <View style={styles.footer}>
        <ThemedText variant="body" style={styles.footerText}>
          Ready to build your favourite squad?
        </ThemedText>
        <View
          style={[
            styles.startButton,
            { backgroundColor: theme.accent, shadowColor: theme.accent },
          ]}>
          <ThemedText
            variant="subtitle"
            style={styles.startLabel}
            onPress={() => navigation.replace('Swipe')}>
            Let&apos;s Go!
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  headerRow: {
    alignItems: 'flex-end',
  },
  hero: {
    marginTop: 24,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 12,
    textAlign: 'center',
  },
  illustrationRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 48,
  },
  phoneCard: {
    width: 120,
    height: 220,
    borderRadius: 32,
    borderWidth: 1,
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
  },
  footerText: {
    marginBottom: 16,
    textAlign: 'center',
  },
  startButton: {
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 999,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 4,
  },
  startLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

