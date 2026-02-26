import React, { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThemedText, ThemedView } from '../components/Themed';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../theme/ThemeContext';
import { usePokemonStore } from '../store/pokemonStore';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Liked'>;

export function LikedScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const liked = usePokemonStore(state => state.liked);

  const emptyMessage = useMemo(
    () =>
      'You have not liked any Pokémon yet. Swipe right on favourites to build your dream team.',
    [],
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerRow}>
        <ThemedText
          variant="caption"
          style={styles.backLink}
          onPress={() => navigation.goBack()}>
          ‹ Back
        </ThemedText>
        <ThemeToggle />
      </View>

      <ThemedText variant="title" style={styles.title}>
        Pokémon you have liked
      </ThemedText>

      {liked.length === 0 ? (
        <ThemedText style={styles.emptyText} variant="body">
          {emptyMessage}
        </ThemedText>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          numColumns={2}
          columnWrapperStyle={styles.column}
          data={liked}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <View
              style={[
                styles.card,
                { backgroundColor: theme.cardBackground, borderColor: theme.border },
              ]}>
              <ThemedText style={styles.cardName} variant="subtitle">
                {item.name.toUpperCase()}
              </ThemedText>
              <ThemedText style={styles.cardTypes} variant="caption">
                {item.types.join(' / ')}
              </ThemedText>
            </View>
          )}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backLink: {
    textDecorationLine: 'underline',
  },
  title: {
    marginTop: 16,
  },
  emptyText: {
    marginTop: 20,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  column: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 18,
    borderWidth: 1,
  },
  cardName: {
    fontSize: 14,
  },
  cardTypes: {
    marginTop: 4,
  },
});

