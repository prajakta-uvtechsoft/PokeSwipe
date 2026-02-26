import React, { useMemo } from 'react';
import {
  Image,
  StyleSheet,
  View,
  Dimensions,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Pokemon } from '../api/pokeApi';
import { useTheme } from '../theme/ThemeContext';
import { ThemedText } from './Themed';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = Math.min(screenWidth * 0.9, 360);
const SWIPE_THRESHOLD = CARD_WIDTH * 0.25;

type Props = {
  pokemon: Pokemon | null;
  loading: boolean;
  onLike: () => void;
  onDislike: () => void;
};

// This card encapsulates all swipe animation logic so the screen component stays focused on data/state.
export function PokemonCard({ pokemon, loading, onLike, onDislike }: Props) {
  const { theme } = useTheme();
  const translateX = useSharedValue(0);
  const rotateZ = useSharedValue(0);

  const resetPosition = () => {
    translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
    rotateZ.value = withSpring(0);
  };

  const handleCompleteSwipe = (direction: 'left' | 'right') => {
    const toValue = direction === 'right' ? CARD_WIDTH * 1.5 : -CARD_WIDTH * 1.5;
    translateX.value = withTiming(toValue, { duration: 180 }, finished => {
      if (finished) {
        translateX.value = 0;
        rotateZ.value = 0;
      }
    });

    if (direction === 'right') {
      onLike();
    } else {
      onDislike();
    }
  };

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .onUpdate(event => {
          translateX.value = event.translationX;
          rotateZ.value = interpolate(
            event.translationX,
            [-CARD_WIDTH, 0, CARD_WIDTH],
            [-10, 0, 10],
          );
        })
        .onEnd(event => {
          if (event.translationX > SWIPE_THRESHOLD) {
            handleCompleteSwipe('right');
          } else if (event.translationX < -SWIPE_THRESHOLD) {
            handleCompleteSwipe('left');
          } else {
            resetPosition();
          }
        }),
    [],
  );

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotateZ: `${rotateZ.value}deg` },
    ],
  }));

  const likeLabelStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return { opacity };
  });

  const dislikeLabelStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP,
    );
    return { opacity };
  });

  if (loading || !pokemon) {
    return (
      <View
        style={[
          styles.loadingCard,
          { backgroundColor: theme.cardBackground, borderColor: theme.border },
        ]}>
        <ActivityIndicator color={theme.accent} />
        <ThemedText style={styles.loadingText} variant="caption">
          Searching for a Pokémon...
        </ThemedText>
      </View>
    );
  }

  const capitalizedName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: theme.cardBackground,
            shadowColor: theme.mode === 'dark' ? '#000' : '#0F172A',
          },
          animatedCardStyle,
        ]}>
        <View style={styles.pokeApiHeader}>
          <ThemedText style={styles.pokeApiLabel} variant="caption">
            PokéAPI
          </ThemedText>
        </View>

        {pokemon.imageUrl ? (
          <Image
            source={{ uri: pokemon.imageUrl }}
            resizeMode="contain"
            style={styles.image}
          />
        ) : null}

        <ThemedText style={styles.name} variant="title">
          {capitalizedName}
        </ThemedText>

        <View style={styles.badgeRow}>
          {pokemon.types.map(type => (
            <View
              key={type}
              style={[
                styles.typeBadge,
                { backgroundColor: theme.accentSoft, borderColor: theme.border },
              ]}>
              <ThemedText style={styles.typeLabel} variant="caption">
                {type.toUpperCase()}
              </ThemedText>
            </View>
          ))}
        </View>

        <ThemedText style={styles.sectionLabel} variant="caption">
          Abilities
        </ThemedText>
        <ThemedText style={styles.abilityText} variant="body">
          {pokemon.abilities.join(', ')}
        </ThemedText>

        <Animated.View
          pointerEvents="none"
          style={[
            styles.likeStamp,
            { borderColor: theme.like },
            likeLabelStyle,
          ]}>
          <ThemedText style={[styles.stampText, { color: theme.like }]} variant="subtitle">
            LIKE
          </ThemedText>
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={[
            styles.dislikeStamp,
            { borderColor: theme.dislike },
            dislikeLabelStyle,
          ]}>
          <ThemedText
            style={[styles.stampText, { color: theme.dislike }]}
            variant="subtitle">
            NOPE
          </ThemedText>
        </Animated.View>

        <View style={styles.buttonRow}>
          <Pressable
            onPress={() => handleCompleteSwipe('left')}
            style={[styles.actionButton, { backgroundColor: theme.dislike }]}>
            <ThemedText style={styles.actionLabel} variant="subtitle">
              Dislike
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => handleCompleteSwipe('right')}
            style={[styles.actionButton, { backgroundColor: theme.like }]}>
            <ThemedText style={styles.actionLabel} variant="subtitle">
              Like
            </ThemedText>
          </Pressable>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    alignSelf: 'center',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 6,
  },
  loadingCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.1,
    borderRadius: 24,
    padding: 24,
    alignSelf: 'center',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
  },
  pokeApiHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  pokeApiLabel: {
    letterSpacing: 2,
  },
  image: {
    width: '100%',
    height: CARD_WIDTH * 0.7,
  },
  name: {
    textAlign: 'center',
    marginTop: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  typeLabel: {
    fontWeight: '600',
  },
  sectionLabel: {
    marginTop: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  abilityText: {
    marginTop: 4,
    textAlign: 'center',
  },
  likeStamp: {
    position: 'absolute',
    top: 18,
    left: 18,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 2,
    borderRadius: 8,
    transform: [{ rotateZ: '-12deg' }],
  },
  dislikeStamp: {
    position: 'absolute',
    top: 18,
    right: 18,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 2,
    borderRadius: 8,
    transform: [{ rotateZ: '12deg' }],
  },
  stampText: {
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  actionLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

