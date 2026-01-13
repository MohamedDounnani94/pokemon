import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Pokemon API',
			version: '1.0.0',
			description: 'A Pokemon API with fun translations',
		},
		servers: [
			{
				url: 'http://localhost:3000',
				description: 'Development server',
			},
		],
		components: {
			schemas: {
				Pokemon: {
					type: 'object',
					properties: {
						name: {
							type: 'string',
							example: 'mewtwo',
						},
						description: {
							type: 'string',
							example: 'It was created by a scientist after years of horrific gene splicing and DNA engineering experiments.',
						},
						habitat: {
							type: 'string',
							example: 'rare',
						},
						isLegendary: {
							type: 'boolean',
							example: true,
						},
					},
				},
				HealthStatus: {
					type: 'object',
					properties: {
						status: {
							type: 'string',
							example: 'healthy',
						},
						timestamp: {
							type: 'string',
							format: 'date-time',
						},
						uptime: {
							type: 'number',
							description: 'Server uptime in seconds',
						},
						service: {
							type: 'string',
							example: 'pokemon-api',
						},
						cache: {
							type: 'object',
							properties: {
								hits: {
									type: 'number',
								},
								misses: {
									type: 'number',
								},
								keys: {
									type: 'number',
								},
							},
						},
					},
				},
				Error: {
					type: 'object',
					properties: {
						error: {
							type: 'string',
							example: 'The pokemon was not found',
						},
					},
				},
				RateLimitError: {
					type: 'string',
					example: 'Too many requests from this IP, please try again later.',
				},
			},
			responses: {
				TooManyRequests: {
					description: 'Rate limit exceeded - too many requests',
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/RateLimitError',
							},
						},
					},
					headers: {
						'RateLimit-Limit': {
							schema: {
								type: 'integer',
							},
							description: 'Maximum requests per window',
						},
						'RateLimit-Remaining': {
							schema: {
								type: 'integer',
							},
							description: 'Remaining requests in current window',
						},
						'RateLimit-Reset': {
							schema: {
								type: 'integer',
							},
							description: 'Time when rate limit resets (Unix timestamp)',
						},
					},
				},
			},
		},
	},
	apis: ['./src/routes/*.ts', './src/server.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
