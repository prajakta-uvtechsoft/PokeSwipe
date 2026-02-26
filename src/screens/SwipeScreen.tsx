import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRandomPokemon } from '../api/pokeApi';
import { PokemonCard } from '../components/PokemonCard';
import { ThemedText, ThemedView } from '../components/Themed';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../theme/ThemeContext';
import { usePokemonStore } from '../store/pokemonStore';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Swipe'>;

export function SwipeScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { pokemon, loading, error, refresh } = useRandomPokemon();
  const liked = usePokemonStore(state => state.liked);
  const totalSwipes = usePokemonStore(state => state.totalSwipes);
  const addLiked = usePokemonStore(state => state.addLiked);
  const incrementSwipes = usePokemonStore(state => state.incrementSwipes);

  const likeCount = liked.length;

  const handleLike = useCallback(() => {
    if (!pokemon) return;
    addLiked(pokemon);
    incrementSwipes();
    void refresh();
  }, [addLiked, incrementSwipes, pokemon, refresh]);

  const handleDislike = useCallback(() => {
    if (!pokemon) return;
    incrementSwipes();
    void refresh();
  }, [incrementSwipes, pokemon, refresh]);

  const subtitle = useMemo(
    () =>
      likeCount === 0
        ? 'Swipe right to start building your favourites.'
        : `You have liked ${likeCount} Pokémon so far.`,
    [likeCount],
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerRow}>
        <ThemeToggle />
      </View>

      <View style={styles.titleBlock}>
        <ThemedText variant="title">Gotta Swipe &apos;Em All!</ThemedText>
        <ThemedText style={styles.subtitle} variant="body">
          {subtitle}
        </ThemedText>
      </View>

      <View style={styles.cardWrapper}>
        <PokemonCard
          pokemon={pokemon}
          loading={loading}
          onLike={handleLike}
          onDislike={handleDislike}
        />
      </View>

      {error ? (
        <ThemedText style={styles.errorText} variant="caption">
          {error}
        </ThemedText>
      ) : null}

      <View style={styles.footerRow}>
        <ThemedText
          variant="caption"
          style={{ color: theme.textSecondary }}>
          Swiped {totalSwipes} Pokémon
        </ThemedText>
        <ThemedText
          variant="caption"
          style={styles.link}
          onPress={() => navigation.navigate('Liked')}>
          View liked ({likeCount})
        </ThemedText>
      </View>
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
    alignItems: 'flex-end',
  },
  titleBlock: {
    marginTop: 12,
    alignItems: 'center',
  },
  subtitle: {
    marginTop: 8,
    textAlign: 'center',
  },
  cardWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  link: {
    textDecorationLine: 'underline',
  },
});

