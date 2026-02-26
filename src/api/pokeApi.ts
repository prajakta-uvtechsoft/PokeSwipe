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

// Limit to first generation for nicer card names and consistent artwork.
const FIRST_GEN_MAX_ID = 151;

function mapPokemonResponse(json: any): Pokemon {
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
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch a fresh random Pokémon and update local state.
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const nextId = getRandomPokemonId();
      const nextPokemon = await fetchPokemonById(nextId);
      setPokemon(nextPokemon);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong loading Pokémon.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    pokemon,
    loading,
    error,
    refresh,
  };
}

