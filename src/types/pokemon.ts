export interface Pokemon {
	name: string;
	description: string;
	habitat: string;
	isLegendary: boolean;
}

export interface PokemonApiResponse {
	name: string;
	is_legendary?: boolean;
	habitat?: {
		name: string;
	};
	flavor_text_entries?: Array<{
		flavor_text: string;
	}>;
}
