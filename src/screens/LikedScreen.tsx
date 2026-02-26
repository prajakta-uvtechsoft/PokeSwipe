import React, { useMemo } from 'react';
import { FlatList, Image, Pressable, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThemedText, ThemedView } from '../components/Themed';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../theme/ThemeContext';
import { usePokemonStore } from '../store/pokemonStore';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Liked'>;

// Gallery view that lets users review and prune their dream team.
export function LikedScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const liked = usePokemonStore(state => state.liked);
  const removeLiked = usePokemonStore(state => state.removeLiked);

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
          ‹
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
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border,
                },
              ]}
            >
              <Pressable
                hitSlop={8}
                onPress={() => removeLiked(item.id)}
                style={styles.closeChip}
              >
                <ThemedText style={styles.closeChipText} variant="caption">
                  ×
                </ThemedText>
              </Pressable>
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  resizeMode="contain"
                  style={styles.cardImage}
                />
              ) : null}
              <ThemedText style={styles.cardName} variant="subtitle">
                {item.name.toUpperCase()}
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
    fontSize: 30,
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
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  cardImage: {
    width: 90,
    height: 90,
    marginBottom: 8,
  },
  cardName: {
    fontSize: 14,
  },
  closeChip: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00000055',
  },
  closeChipText: {
    color: '#FFFFFF',
  },
});

