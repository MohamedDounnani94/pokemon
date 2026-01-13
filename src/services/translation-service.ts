import axios from "axios";
import type {
	TranslateAuthor,
	TranslationApiResponse,
} from "../types/translation";
import { Exception } from "../utils/exception";
import logger from "../utils/logger";
import cache from "../utils/cache";

const TRANSLATION_BASE_ENDPOINT = "https://api.funtranslations2.com/translate";

export class TranslationService {
	async getTranslatedDescription(
		author: TranslateAuthor,
		text: string,
	): Promise<string> {
		const cacheKey = `translation:${author}:${text}`;

		const cachedTranslation = cache.get<string>(cacheKey);
		if (cachedTranslation) {
			return cachedTranslation;
		}

		try {
			const endpoint = `${TRANSLATION_BASE_ENDPOINT}/${author}`;
			const { data } = await axios.post<TranslationApiResponse>(endpoint, { text });
			const translated = data.contents.translated;
			cache.set(cacheKey, translated, 3600);
			return translated;
		} catch (error: any) {
			if (error.response?.status === 429) {
				logger.warn("Translation API rate limit exceeded (429)");
				throw Exception.generic(error, "Translation rate limit exceeded");
			}
			logger.error("Error fetching translation");
			throw Exception.generic(error);
		}
	}
}
