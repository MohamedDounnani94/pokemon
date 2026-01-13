export enum TranslateAuthor {
	YODA = 'yoda',
	SHAKESPEARE = 'shakespeare',
}

export interface TranslationApiResponse {
	success: {
		total: number;
	};
	contents: {
		translated: string;
		text: string;
		translation: string;
	};
}
