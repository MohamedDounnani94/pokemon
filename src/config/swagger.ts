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
				Error: {
					type: 'object',
					properties: {
						error: {
							type: 'string',
							example: 'The pokemon was not found',
						},
					},
				},
			},
		},
	},
	apis: ['./src/routes/*.ts', './src/server.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
