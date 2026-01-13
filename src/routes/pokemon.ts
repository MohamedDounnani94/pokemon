import { type NextFunction, type Request, type Response, Router } from 'express';
import { PokemonService } from '../services/pokemon-service';
import { TranslationService } from '../services/translation-service';
import { TranslateAuthor } from '../types/translation';

const router = Router();
const pokemonService = new PokemonService();
const translationService = new TranslationService();

router.get('/pokemon/:name', async (req: Request, res: Response, next: NextFunction) => {
	const name = req.params.name as string;
	
	if (!name || !name.trim()) {
		res.status(400).send({ error: 'The parameter name is mandatory' });
		return;
	}
	
	try {
		const pokemon = await pokemonService.getPokemonByName(name);
		res.status(200).send(pokemon);
	} catch (e) {
		next(e);
	}
});


router.get('/pokemon/translated/:name', async (req: Request, res: Response, next: NextFunction) => {
	const name = req.params.name as string;
	
	if (!name || !name.trim()) {
		res.status(400).send({ error: 'The parameter name is mandatory' });
		return;
	}
	
	try {
		const pokemon = await pokemonService.getPokemonByName(name);
		
		// Determine translation type based on Pokemon attributes
		const translator = pokemon.isLegendary || pokemon.habitat === 'cave' 
			? TranslateAuthor.YODA 
			: TranslateAuthor.SHAKESPEARE;
		
		try {
			pokemon.description = await translationService.getTranslatedDescription(
				translator,
				pokemon.description,
			);
		} catch {
			// Keep original description if translation fails
		}
		
		res.status(200).send(pokemon);
	} catch (e) {
		next(e);
	}
});

export default router;

