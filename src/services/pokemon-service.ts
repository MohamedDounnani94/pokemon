import axios from "axios";
import axiosRetry from "axios-retry";
import type { Pokemon, PokemonApiResponse } from "../types/pokemon";
import { Exception } from "../utils/exception";
import cache from "../utils/cache";
import logger from "../utils/logger";

const POKEMON_BASE_ENDPOINT = "https://pokeapi.co/api/v2/pokemon-species";
const POKEMON_CACHE_TTL = 86400; // 24 hours - Pokemon data rarely changes

// Configure retry for Pokemon API
axiosRetry(axios, {
	retries: 3,
	retryDelay: axiosRetry.exponentialDelay,
	retryCondition: (error) => {
		if (error.response?.status === 429) return false;
		return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 503;
	},
	onRetry: (retryCount, error) => {
		logger.warn(`Retry attempt ${retryCount} for ${error.config?.url}`);
	},
});

export class PokemonService {
	/**
	 * Fetch Pokemon data from the API and transform it
	 * Uses cache to reduce API calls
	 */
	async getPokemonByName(name: string): Promise<Pokemon> {
		if (!name || !name.trim()) {
			throw Exception.mandatory("name");
		}

		const lowerName = name.trim().toLowerCase();
		const cacheKey = `pokemon:${lowerName}`;

		// Check cache first
		const cachedPokemon = cache.get<Pokemon>(cacheKey);
		if (cachedPokemon) {
			logger.debug(`Returning cached pokemon: ${lowerName}`);
			return cachedPokemon;
		}

		const pokemonEndpoint = `${POKEMON_BASE_ENDPOINT}/${lowerName}`;

		try {
			const { data } = await axios.get<PokemonApiResponse>(pokemonEndpoint);

			const description =
				data.flavor_text_entries && data.flavor_text_entries.length > 0
					? data.flavor_text_entries[0].flavor_text
					: "";

			const pokemon: Pokemon = {
				isLegendary: data.is_legendary || false,
				name: data.name,
				description: description ? description.replace(/\n|\f/g, " ") : "",
				habitat: data.habitat?.name || "",
			};

			cache.set(cacheKey, pokemon, POKEMON_CACHE_TTL);
			return pokemon;
		} catch (exception: any) {
			const status = exception.response?.status;
			console.log(status);
			if (status === 404 || status === 400) {
				logger.error(`Pokemon not found: ${status}`);
				throw Exception.notFound("pokemon");
			}

			if (status === 503 || !status) {
				logger.error("Pokemon API unavailable", exception);
				throw Exception.serviceUnavailable("Pokemon API is temporarily unavailable");
			}
			
			logger.error("Error fetching pokemon data", exception);
			throw Exception.generic(exception);
		}
	}
}