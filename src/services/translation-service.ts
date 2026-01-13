import axios from "axios";
import axiosRetry from "axios-retry";
import type {
	TranslateAuthor,
	TranslationApiResponse,
} from "../types/translation";
import { Exception } from "../utils/exception";
import logger from "../utils/logger";
import cache from "../utils/cache";

const TRANSLATION_BASE_ENDPOINT = "https://api.funtranslations.com/translate";
const TRANSLATION_CACHE_TTL = 86400; // 24 hours - Translations are deterministic and API has strict rate limits

// Configure retry for Translation API  
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
			cache.set(cacheKey, translated, TRANSLATION_CACHE_TTL);
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
