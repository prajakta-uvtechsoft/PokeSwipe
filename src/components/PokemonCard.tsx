import React, { useMemo, useState } from 'react';
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
  runOnJS,
  withDelay,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Pokemon } from '../api/pokeApi';
import { useTheme } from '../theme/ThemeContext';
import { ThemedText } from './Themed';

const { width: screenWidth } = Dimensions.get('window');
// Card gets a max width so it feels like a centred Tinder-style stack on tablets as well.
const CARD_WIDTH = Math.min(screenWidth * 0.9, 360);
// Strong swipe: 75% of card width from center so accidental drags do not trigger a decision.
const SWIPE_THRESHOLD = CARD_WIDTH * 0.75;

type Props = {
  pokemon: Pokemon | null;
  nextPokemon?: Pokemon | null;
  loading: boolean;
  onLike: () => void;
  onDislike: () => void;
};

// This card encapsulates all swipe / layout logic so the screen stays focused on data and actions.
export function PokemonCard({
  pokemon,
  nextPokemon,
  loading,
  onLike,
  onDislike,
}: Props) {
  const { theme } = useTheme();
  // Shared values drive the drag and exit animations on the JS-independent UI thread.
  const translateX = useSharedValue(0);
  const rotateZ = useSharedValue(0);
  const feedbackOpacity = useSharedValue(0.9);
  const feedbackScale = useSharedValue(0.9);

  // Bring the card back to centre when the gesture is not strong enough.
  const resetPosition = () => {
    translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
    rotateZ.value = withSpring(0);
  };

  // Send the card off-screen and then notify the parent about the final decision.
  const handleCompleteSwipe = (direction: 'left' | 'right') => {
    const toValue =
      direction === 'right' ? CARD_WIDTH * 1.5 : -CARD_WIDTH * 1.5;
    const rotateTo = direction === 'right' ? 10 : -10;

    // Smooth swipe-out, then trigger next card
    translateX.value = withTiming(toValue, { duration: 400 }, finished => {
      if (!finished) {
        return;
      }

      translateX.value = 0;
      rotateZ.value = 0;

      if (direction === 'right') {
        runOnJS(onLike)();
      } else {
        runOnJS(onDislike)();
      }
    });

    rotateZ.value = withTiming(rotateTo, { duration: 400 });
  };

  // Memoised pan gesture so we do not recreate the gesture handlers on every render.
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
            runOnJS(handleCompleteSwipe)('right');
          } else if (event.translationX < -SWIPE_THRESHOLD) {
            runOnJS(handleCompleteSwipe)('left');
          } else {
            runOnJS(resetPosition)();
          }
        }),
    [handleCompleteSwipe, resetPosition, rotateZ, translateX],
  );

  // Core card transform: translate with the finger and rotate slightly for depth.
  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotateZ: `${rotateZ.value}deg` },
    ],
  }));

  // Fade in the LIKE label as the card moves to the right.
  const likeLabelStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return { opacity };
  });

  // Fade in the NOPE label as the card moves to the left.
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
        ]}
      >
        <ActivityIndicator color={theme.accent} />
        <ThemedText style={styles.loadingText} variant="caption">
          Searching for a Pokémon...
        </ThemedText>
      </View>
    );
  }

  const capitalizedName =
    pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.stackContainer}>
        {/* Real "next" card sitting behind the active one */}
        {nextPokemon ? (
          <View
            pointerEvents="none"
            style={[
              styles.nextCard,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
                shadowColor: theme.mode === 'dark' ? '#000' : '#0F172A',
              },
            ]}
          >
            {nextPokemon.imageUrl ? (
              <Image
                source={{ uri: nextPokemon.imageUrl }}
                resizeMode="contain"
                style={styles.nextImage}
              />
            ) : null}
          </View>
        ) : null}

        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: theme.cardBackground,
              shadowColor: theme.mode === 'dark' ? '#000' : '#0F172A',
            },
            animatedCardStyle,
          ]}
        >
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
                {
                  backgroundColor: theme.accentSoft,
                  borderColor: theme.border,
                },
              ]}
            >
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
          ]}
        >
          <ThemedText
            style={[styles.stampText, { color: theme.like }]}
            variant="subtitle"
          >
            LIKE
          </ThemedText>
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={[
            styles.dislikeStamp,
            { borderColor: theme.dislike },
            dislikeLabelStyle,
          ]}
        >
          <ThemedText
            style={[styles.stampText, { color: theme.dislike }]}
            variant="subtitle"
          >
            NOPE
          </ThemedText>
        </Animated.View>

        <View style={styles.buttonRow}>
          <Pressable
            onPress={() => handleCompleteSwipe('left')}
            style={[styles.actionButton, { backgroundColor: theme.dislike }]}
          >
            <ThemedText style={styles.actionLabel} variant="subtitle">
              Dislike
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => handleCompleteSwipe('right')}
            style={[styles.actionButton, { backgroundColor: theme.like }]}
          >
            <ThemedText style={styles.actionLabel} variant="subtitle">
              Like
            </ThemedText>
          </Pressable>
        </View>
      </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  stackContainer: {
    alignSelf: 'center',
    paddingBottom: 24,
  },
  nextCard: {
    position: 'absolute',
    width: CARD_WIDTH,
    borderRadius: 24,
    borderWidth: 1,
    top: 10,
    alignSelf: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 3,
    // minHeight: CARD_WIDTH * 1.1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextImage: {
    width: '80%',
    height: CARD_WIDTH * 0.6,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    minHeight: CARD_WIDTH * 1.1,
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
  feedbackContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackIcon: {
    fontSize: 56,
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
