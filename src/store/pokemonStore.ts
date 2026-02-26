import { create } from 'zustand';
import { Pokemon } from '../api/pokeApi';

type PokemonState = {
  liked: Pokemon[];
  totalSwipes: number;
  addLiked: (pokemon: Pokemon) => void;
  incrementSwipes: () => void;
  reset: () => void;
};

// Global store keeps swipe statistics and liked Pokémon shared across screens.
export const usePokemonStore = create<PokemonState>(set => ({
  liked: [],
  totalSwipes: 0,
  addLiked: pokemon =>
    set(state => ({
      liked: [...state.liked, pokemon],
    })),
  incrementSwipes: () =>
    set(state => ({
      totalSwipes: state.totalSwipes + 1,
    })),
  reset: () => ({
    liked: [],
    totalSwipes: 0,
  }),
}));

