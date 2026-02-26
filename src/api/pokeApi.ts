import { useCallback, useEffect, useState } from 'react';

const BASE_URL = 'https://pokeapi.co/api/v2';

export type PokemonType = {
  slot: number;
  type: {
    name: string;
  };
};

export type PokemonAbility = {
  ability: {
    name: string;
  };
};

export type Pokemon = {
  id: number;
  name: string;
  imageUrl: string;
  types: string[];
  abilities: string[];
};

// Keep the pool small and recognizable so users see classic Pokémon quickly.
const FIRST_GEN_MAX_ID = 151;

function mapPokemonResponse(json: any): Pokemon {
  // Normalise just the bits of the API response we care about for the UI.
  const types: string[] = (json.types as PokemonType[]).map(t => t.type.name);
  const abilities: string[] = (json.abilities as PokemonAbility[]).map(a =>
    a.ability.name.replace(/-/g, ' '),
  );

  // Official artwork is shipped as PNG and works nicely in React Native Image.
  const artwork =
    json.sprites?.other?.['official-artwork']?.front_default ??
    json.sprites?.front_default;

  return {
    id: json.id,
    name: json.name,
    imageUrl: artwork,
    types,
    abilities,
  };
}

export async function fetchPokemonById(id: number): Promise<Pokemon> {
  const response = await fetch(`${BASE_URL}/pokemon/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to load Pokémon #${id}`);
  }

  const json = await response.json();
  return mapPokemonResponse(json);
}

export function getRandomPokemonId() {
  return Math.floor(Math.random() * FIRST_GEN_MAX_ID) + 1;
}

export function useRandomPokemon() {
  const [current, setCurrent] = useState<Pokemon | null>(null);
  const [next, setNext] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper that fetches a single random Pokémon from the configured range.
  const loadOne = useCallback(async () => {
    const id = getRandomPokemonId();
    return fetchPokemonById(id);
  }, []);

  // Prime the stack with two Pokémon so the card component can show a next preview.
  const prime = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const first = await loadOne();
      const second = await loadOne();
      setCurrent(first);
      setNext(second);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong loading Pokémon.',
      );
    } finally {
      setLoading(false);
    }
  }, [loadOne]);

  // Advance the stack: promote `next` to `current` and asynchronously fetch a new `next`.
  const refresh = useCallback(async () => {
    if (!next) {
      await prime();
      return;
    }

    setCurrent(next);
    setLoading(true);
    setError(null);

    try {
      const fresh = await loadOne();
      setNext(fresh);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong loading Pokémon.',
      );
    } finally {
      setLoading(false);
    }
  }, [loadOne, next, prime]);

  useEffect(() => {
    void prime();
  }, [prime]);

  return {
    pokemon: current,
    nextPokemon: next,
    loading,
    error,
    refresh,
  };
}

