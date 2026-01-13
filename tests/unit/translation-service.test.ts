import axios from 'axios';
import { TranslationService } from '../../src/services/translation-service';
import { TranslateAuthor } from '../../src/types/translation';
import cache from '../../src/utils/cache';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TranslationService', () => {
  let translationService: TranslationService;

  beforeEach(() => {
    translationService = new TranslationService();
    jest.clearAllMocks();
    cache.flush();
  });

  describe('getTranslatedDescription', () => {
    test('should return Yoda translated text', async () => {
      const description = 'Hold my beer';
      const translator = TranslateAuthor.YODA;

      const response = {
        data: {
          success: {
            total: 1,
          },
          contents: {
            translated: 'My beer,  hold',
            text: 'Hold my beer',
            translation: 'yoda',
          },
        },
      };

      mockedAxios.post.mockResolvedValue(response);

      const translation = await translationService.getTranslatedDescription(
        translator,
        description,
      );
      expect(translation).toEqual('My beer,  hold');
    });

    test('should return Shakespeare translated text', async () => {
      const description = 'Hello world';
      const translator = TranslateAuthor.SHAKESPEARE;

      const response = {
        data: {
          success: {
            total: 1,
          },
          contents: {
            translated: 'Hark world',
            text: 'Hello world',
            translation: 'shakespeare',
          },
        },
      };

      mockedAxios.post.mockResolvedValue(response);

      const translation = await translationService.getTranslatedDescription(
        translator,
        description,
      );
      expect(translation).toEqual('Hark world');
    });

    test('should throw exception when translation API fails', async () => {
      const description = 'Test';
      const translator = TranslateAuthor.YODA;

      mockedAxios.post.mockRejectedValue({
        status: 500,
      });

      await expect(
        translationService.getTranslatedDescription(translator, description),
      ).rejects.toMatchObject({
        code: 500,
      });
    });

    test('should throw exception with specific message on 429 rate limit', async () => {
      const description = 'Test';
      const translator = TranslateAuthor.SHAKESPEARE;

      mockedAxios.post.mockRejectedValue({
        response: { status: 429 },
      });

      await expect(
        translationService.getTranslatedDescription(translator, description),
      ).rejects.toMatchObject({
        code: 500,
        message: 'Translation rate limit exceeded',
      });
    });

    test('should use cached translation on second request', async () => {
      const description = 'Test text';
      const translator = TranslateAuthor.YODA;

      const response = {
        data: {
          contents: {
            translated: 'Text test',
          },
        },
      };

      mockedAxios.post.mockResolvedValue(response);

      // First call - hits the API
      const result1 = await translationService.getTranslatedDescription(translator, description);
      expect(result1).toBe('Text test');
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);

      // Second call - uses cache
      const result2 = await translationService.getTranslatedDescription(translator, description);
      expect(result2).toBe('Text test');
      expect(mockedAxios.post).toHaveBeenCalledTimes(1); // Still 1
    });
  });
});
