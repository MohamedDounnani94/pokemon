import request from 'supertest';
import axios from 'axios';
import app from '../../src/server';
import cache from '../../src/utils/cache';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Pokemon API Integration Tests', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		cache.flush(); // Clear cache before each test
	});

	afterEach(() => {
		jest.clearAllMocks();
	});
});
