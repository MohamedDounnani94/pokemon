import axios from 'axios';
import cache from '../../src/utils/cache';
jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TranslationService', () => {
  beforeEach(() => {
    cache.flush(); // Clear cache before each test
  });
});
