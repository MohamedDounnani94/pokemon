import request from 'supertest';
import axios from 'axios';
import app from '../../src/server';
import cache from '../../src/utils/cache';

jest.mock('axios');
jest.mock('axios-retry', () => jest.fn()); // Prevent retries in tests

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Pokemon API Integration Tests', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		cache.flush(); // Clear cache before each test
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('GET /health', () => {
		test('should return health status', async () => {
			const response = await request(app).get('/health');

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('status', 'healthy');
			expect(response.body).toHaveProperty('timestamp');
			expect(response.body).toHaveProperty('uptime');
			expect(response.body).toHaveProperty('service', 'pokemon-api');
		});
	});

	describe('GET /pokemon/:name', () => {
		test('should return 200 with pokemon data', async () => {
			const mockPokemonData = {
				data: {
					name: 'ditto',
					flavor_text_entries: [
						{
							flavor_text: 'It can transform into anything.',
						},
					],
					habitat: { name: 'urban' },
					is_legendary: false,
				},
			};

			mockedAxios.get.mockResolvedValue(mockPokemonData);

			const response = await request(app).get('/pokemon/pikachu');

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('name');
			expect(response.body.name).toBe('ditto');
			expect(response.body.habitat).toBe('urban');
		});

		test('should return 404 when pokemon not found', async () => {
			mockedAxios.get.mockRejectedValue({
				response: { status: 404 },
			});

			const response = await request(app).get('/pokemon/invalidpokemon');

			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty('error');
			expect(response.body.error).toContain('not found');
		});

		test('should return 404 when name is empty', async () => {
			const response = await request(app).get('/pokemon/');

			expect(response.status).toBe(404);
		});

		test('should return 400 when name is only whitespace', async () => {
			const response = await request(app).get('/pokemon/%20%20%20'); // URL encoded spaces

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty('error');
			expect(response.body.error).toContain('mandatory');
		});

		test('should return 500 on API failure', async () => {
			mockedAxios.get.mockRejectedValue({
				response: { status: 500 },
			});

			const response = await request(app).get('/pokemon/errorpokemon');

			expect(response.status).toBe(500);
			expect(response.body).toHaveProperty('error');
		});

		test('should return 503 when Pokemon API is unavailable', async () => {
			mockedAxios.get.mockRejectedValue({
				response: { status: 503 },
			});

			const response = await request(app).get('/pokemon/pikachu');

			expect(response.status).toBe(503);
			expect(response.body).toHaveProperty('error');
			expect(response.body.error).toContain('unavailable');
		});

		test('should return 503 on network errors', async () => {
			mockedAxios.get.mockRejectedValue({
				code: 'ECONNREFUSED',
				message: 'Network Error',
			});

			const response = await request(app).get('/pokemon/pikachu');

			expect(response.status).toBe(503);
			expect(response.body).toHaveProperty('error');
		});
	});

	describe('GET /pokemon/translated/:name', () => {
		test('should return 200 with Yoda translation for legendary Pokemon', async () => {
			const mockPokemonData = {
				data: {
					name: 'mewtwo',
					flavor_text_entries: [
						{
							flavor_text: 'It was created by a scientist.',
						},
					],
					habitat: { name: 'rare' },
					is_legendary: true,
				},
			};

			const mockTranslationData = {
				data: {
					contents: {
						translated: 'Created by a scientist, it was.',
					},
				},
			};

			mockedAxios.get.mockResolvedValue(mockPokemonData);
			mockedAxios.post.mockResolvedValue(mockTranslationData);

			const response = await request(app).get('/pokemon/translated/mewtwo');

			expect(response.status).toBe(200);
			expect(response.body.description).toBe('Created by a scientist, it was.');
		});

		test('should return 200 with Shakespeare translation for non-legendary Pokemon', async () => {
			const mockPokemonData = {
				data: {
					name: 'ditto',
					flavor_text_entries: [
						{
							flavor_text: 'It can transform into anything.',
						},
					],
					habitat: { name: 'urban' },
					is_legendary: false,
				},
			};

			const mockTranslationData = {
				data: {
					contents: {
						translated: 'It can transform into aught.',
					},
				},
			};

			mockedAxios.get.mockResolvedValue(mockPokemonData);
			mockedAxios.post.mockResolvedValue(mockTranslationData);

		const response = await request(app).get('/pokemon/translated/ditto');

		expect(response.status).toBe(200);
		expect(response.body.description).toBe('It can transform into aught.');
	});

test('should return 200 with Yoda translation for cave habitat', async () => {
			const mockPokemonData = {
				data: {
					name: 'zubat',
					flavor_text_entries: [
						{
							flavor_text: 'Forms colonies in dark places.',
						},
					],
					habitat: { name: 'cave' },
					is_legendary: false,
				},
			};

			const mockTranslationData = {
				data: {
					contents: {
						translated: 'In dark places, forms colonies.',
					},
				},
			};

			mockedAxios.get.mockResolvedValue(mockPokemonData);
			mockedAxios.post.mockResolvedValue(mockTranslationData);

			const response = await request(app).get('/pokemon/translated/zubat');

			expect(response.status).toBe(200);
			expect(response.body.description).toBe('In dark places, forms colonies.');
		});

		test('should fallback to original description when translation fails', async () => {
			const mockPokemonData = {
				data: {
					name: 'mewtwo',
					flavor_text_entries: [
						{
							flavor_text: 'It was created by a scientist.',
						},
					],
					habitat: { name: 'rare' },
					is_legendary: true,
				},
			};

			mockedAxios.get.mockResolvedValue(mockPokemonData);
			mockedAxios.post.mockRejectedValue({
				response: { status: 500 },
			});

		const response = await request(app).get('/pokemon/translated/mewtwo');

			expect(response.status).toBe(200);
			expect(response.body.description).toBe('It was created by a scientist.');
		});

		test('should fallback to original description on 429 rate limit', async () => {
			const mockPokemonData = {
				data: {
					name: 'pikachu',
					flavor_text_entries: [
						{
							flavor_text: 'When several of these Pokémon gather, their electricity could build and cause lightning storms.',
						},
					],
					habitat: { name: 'forest' },
					is_legendary: false,
				},
			};

			mockedAxios.get.mockResolvedValue(mockPokemonData);
			mockedAxios.post.mockRejectedValue({
				response: { status: 429 },
			});

			const response = await request(app).get('/pokemon/translated/pikachu');

			expect(response.status).toBe(200);
			expect(response.body.description).toBe(
				'When several of these Pokémon gather, their electricity could build and cause lightning storms.'
			);
		});

		test('should return 404 when pokemon not found for translation', async () => {
			mockedAxios.get.mockRejectedValue({
				response: { status: 404 },
			});

			const response = await request(app).get('/pokemon/translated/invalidpokemon');

			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty('error');
		});
	});

	describe('GET /', () => {
		test('should return API status', async () => {
			const response = await request(app).get('/');

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('status', 'ok');
			expect(response.body).toHaveProperty('message');
		});
	});

	describe('Rate Limiting', () => {
		test('should return 429 after exceeding rate limit', async () => {
			const mockPokemonData = {
				data: {
					name: 'pikachu',
					flavor_text_entries: [{ flavor_text: 'Test' }],
					habitat: { name: 'forest' },
					is_legendary: false,
				},
			};

			mockedAxios.get.mockResolvedValue(mockPokemonData);

			// Make 101 requests (limit is 100 per minute)
			const requests = [];
			for (let i = 0; i < 101; i++) {
				requests.push(request(app).get('/pokemon/pikachu'));
			}

			const responses = await Promise.all(requests);
			
			// Last request should be rate limited
			const lastResponse = responses[responses.length - 1];
			expect(lastResponse.status).toBe(429);
			expect(lastResponse.text).toContain('Too many requests');
		});
	});
});
