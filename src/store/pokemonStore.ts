import { create } from 'zustand';
import { Pokemon } from '../api/pokeApi';

type PokemonState = {
  liked: Pokemon[];
  totalSwipes: number;
  addLiked: (pokemon: Pokemon) => void;
  removeLiked: (id: number) => void;
  incrementSwipes: () => void;
  reset: () => void;
};

// Centralised, minimal state for swipe stats and liked Pokémon, shared across screens.
export const usePokemonStore = create<PokemonState>(set => ({
  liked: [],
  totalSwipes: 0,
  addLiked: pokemon =>
    set(state => ({
      liked: [...state.liked, pokemon],
    })),
  removeLiked: id =>
    set(state => ({
      liked: state.liked.filter(p => p.id !== id),
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

