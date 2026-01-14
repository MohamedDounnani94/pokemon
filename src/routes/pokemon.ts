import { type NextFunction, type Request, type Response, Router } from 'express';
import { PokemonService } from '../services/pokemon-service';
import { TranslationService } from '../services/translation-service';
import { TranslateAuthor } from '../types/translation';

const router = Router();
const pokemonService = new PokemonService();
const translationService = new TranslationService();

/**
 * @swagger
 * /pokemon/{name}:
 *   get:
 *     summary: Get Pokemon by name
 *     description: Retrieve basic Pokemon information including name, description, habitat, and legendary status.
 *     tags: [Pokemon]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Pokemon name (case-insensitive)
 *         example: mewtwo
 *     responses:
 *       200:
 *         description: Pokemon found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pokemon'
 *       400:
 *         description: Invalid input - name parameter missing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Pokemon not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:name', async (req: Request, res: Response, next: NextFunction) => {
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

/**
 * @swagger
 * /pokemon/translated/{name}:
 *   get:
 *     summary: Get Pokemon with translated description
 *     description: Returns Pokemon with fun translated description. Legendary Pokemon or cave dwellers get Yoda translation, others get Shakespeare translation.
 *     tags: [Pokemon]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Pokemon name (case-insensitive)
 *         example: mewtwo
 *     responses:
 *       200:
 *         description: Pokemon found with translated description
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pokemon'
 *       404:
 *         description: Pokemon not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/translated/:name', async (req: Request, res: Response, next: NextFunction) => {
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

