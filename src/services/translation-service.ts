import type {
	TranslateAuthor,
} from "../types/translation";


const TRANSLATION_BASE_ENDPOINT = "https://api.funtranslations2.com/translate";

export class TranslationService {
	async getTranslatedDescription(
		_: TranslateAuthor,
		__: string,
	): Promise<any> {
		console.log(`Fetching translated description from ${TRANSLATION_BASE_ENDPOINT}...`);
	}
}
