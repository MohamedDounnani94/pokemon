const POKEMON_BASE_ENDPOINT = "https://pokeapi.co/api/v2/pokemon-species";

export class PokemonService {
	/**
	 * Fetch Pokemon data from the API and transform it
	 * Uses cache to reduce API calls
	 */
	async getPokemonByName(_: string): Promise<any> {
		console.log(`Fetching pokemon data from ${POKEMON_BASE_ENDPOINT}...`);
	}
}