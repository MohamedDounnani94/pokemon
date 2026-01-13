import axios from 'axios';
import { PokemonService } from '../../src/services/pokemon-service';
import cache from '../../src/utils/cache';

jest.mock('axios');
jest.mock('axios-retry', () => jest.fn()); // Mock axios-retry to prevent actual retries in tests

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PokemonService', () => {
  let pokemonService: PokemonService;

  beforeEach(() => {
    pokemonService = new PokemonService();
    cache.flush(); // Clear cache before each test
  });

  describe('getPokemonByName', () => {
    test('should return a Pokemon with standard description based on name', async () => {
      const pokemonName = 'mewtwo';

      const response = {
        data: {
          name: 'mewtwo',
          flavor_text_entries: [
            {
              flavor_text:
                "Mewtwo is a Pokémon that was created by genetic\n" +
                'manipulation. However, even though the scientific power\n' +
                "of humans created this Pokémon's body, they failed to\n" +
                'endow Mewtwo with a compassionate heart.',
            },
          ],
          habitat: { name: 'rare' },
          is_legendary: true,
        },
      };

      mockedAxios.get.mockResolvedValue(response);

      const pokemon = await pokemonService.getPokemonByName(pokemonName);
      expect(pokemon).toHaveProperty('name', 'mewtwo');
      expect(pokemon).toHaveProperty('habitat', 'rare');
      expect(pokemon).toHaveProperty('isLegendary', true);
      expect(pokemon).toHaveProperty('description');
      expect(pokemon.description).not.toContain('\n');
    });

    test('should return Pokemon with empty description and habitat when not provided', async () => {
      const pokemonName = 'ditto';

      const response = {
        data: {
          name: 'ditto',
          is_legendary: false,
        },
      };

      mockedAxios.get.mockResolvedValue(response);

      const pokemon = await pokemonService.getPokemonByName(pokemonName);
      expect(pokemon.description).toEqual('');
      expect(pokemon.habitat).toEqual('');
      expect(pokemon.isLegendary).toEqual(false);
    });

    test('should throw 404 exception when Pokemon is not found', async () => {
      const pokemonName = 'invalidpokemon';

      const mockedResponse = {
        response: {
          status: 404,
        },
      };

      mockedAxios.get.mockRejectedValue(mockedResponse);

      await expect(pokemonService.getPokemonByName(pokemonName)).rejects.toMatchObject({
        code: 404,
        message: 'The pokemon was not found',
      });
    });

    test('should throw 500 exception when API fails', async () => {
      const pokemonName = 'mewtwo';

      const mockedResponse = {
        response: {
          status: 500,
        },
      };

      mockedAxios.get.mockRejectedValue(mockedResponse);

      await expect(pokemonService.getPokemonByName(pokemonName)).rejects.toMatchObject({
        code: 500,
      });
    });

    test('should throw exception when name is not provided', async () => {
      await expect(pokemonService.getPokemonByName('')).rejects.toMatchObject({
        code: 400,
        message: 'The parameter name is mandatory',
      });
    });

    test('should throw exception when name is only whitespace', async () => {
      await expect(pokemonService.getPokemonByName('   ')).rejects.toMatchObject({
        code: 400,
        message: 'The parameter name is mandatory',
      });
    });

    test('should trim whitespace from pokemon name', async () => {
      const pokemonName = '  pikachu  ';

      const response = {
        data: {
          name: 'pikachu',
          flavor_text_entries: [
            {
              flavor_text: 'Test description',
            },
          ],
          habitat: { name: 'forest' },
          is_legendary: false,
        },
      };

      mockedAxios.get.mockResolvedValue(response);

      const pokemon = await pokemonService.getPokemonByName(pokemonName);
      expect(pokemon.name).toBe('pikachu');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/pikachu')
      );
    });

    test('should use cached data on second request for same Pokemon', async () => {
      const pokemonName = 'pikachu';

      const response = {
        data: {
          name: 'pikachu',
          flavor_text_entries: [
            {
              flavor_text: 'When several of these Pokémon gather, their electricity can build and cause lightning storms.',
            },
          ],
          habitat: { name: 'forest' },
          is_legendary: false,
        },
      };

      mockedAxios.get.mockResolvedValue(response);

      // First call - should hit the API
      const pokemon1 = await pokemonService.getPokemonByName(pokemonName);
      expect(pokemon1.name).toBe('pikachu');
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      const pokemon2 = await pokemonService.getPokemonByName(pokemonName);
      expect(pokemon2.name).toBe('pikachu');
      expect(mockedAxios.get).toHaveBeenCalledTimes(1); // Still 1, not called again
      expect(pokemon1).toEqual(pokemon2);
    });
  });

  describe('Retry Logic', () => {
    beforeEach(() => {
      cache.flush();
      jest.clearAllMocks();
      mockedAxios.get.mockReset();
    });

    test('should handle 503 service unavailable errors', async () => {
      const pokemonName = 'charizard';

      const mockedResponse = {
        response: {
          status: 503,
        },
      };

      mockedAxios.get.mockRejectedValue(mockedResponse);

      await expect(pokemonService.getPokemonByName(pokemonName)).rejects.toMatchObject({
        code: 500,
      });
    });

    test('should handle network errors', async () => {
      const pokemonName = 'bulbasaur';

      const networkError = {
        code: 'ECONNREFUSED',
        message: 'Network Error',
      };

      mockedAxios.get.mockRejectedValue(networkError);

      await expect(pokemonService.getPokemonByName(pokemonName)).rejects.toMatchObject({
        code: 500,
      });
    });

    test('should not retry on 404 errors (client errors are not retried)', async () => {
      const pokemonName = 'nonexistent';

      const notFoundError = {
        response: {
          status: 404,
        },
      };

      mockedAxios.get.mockRejectedValue(notFoundError);

      await expect(pokemonService.getPokemonByName(pokemonName)).rejects.toMatchObject({
        code: 404,
        message: 'The pokemon was not found',
      });

      // Should only be called once (4xx errors are not retried by axios-retry)
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });
});
