import express, { type NextFunction, type Request, type Response } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import pokemonRouter from './routes/pokemon';
import { swaggerSpec } from './config/swagger';
import logger from './utils/logger';
import cache from './utils/cache';

const port = process.env.SERVER_PORT || 3000;
const app = express();

// Rate limiting configuration
const limiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 100, // 100 requests per minute
	message: 'Too many requests from this IP, please try again later.',
	standardHeaders: true,
	legacyHeaders: false,
});


app.use(helmet());
app.use(express.json());
app.use(limiter);


/**
 * @swagger
 * /:
 *   get:
 *     summary: API root endpoint
 *     description: Returns basic API status information
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Pokemon API is running
 */
app.get('/', (_req: Request, res: Response) => {
	res.status(200).send({ status: 'ok', message: 'Pokemon API is running' });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns service health status with uptime information
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthStatus'
 */
app.get('/health', (_req: Request, res: Response) => {
	const cacheStats = cache.getStats();
	
	res.status(200).send({ 
		status: 'healthy',
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
		service: 'pokemon-api',
		cache: {
			hits: cacheStats.hits,
			misses: cacheStats.misses,
			keys: cacheStats.keys,
		},
	});
});

// API routes
app.use('/', pokemonRouter);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
	customSiteTitle: 'Pokemon API Documentation',
	customCss: '.swagger-ui .topbar { display: none }',
}));

// Error handler middleware
function errorHandler(error: any, _req: Request, res: Response, _next: NextFunction) {
	logger.error(error);
	res.status(error.code || 500).send({ error: error.message || 'Internal server error' });
}

app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
	app.listen(port, () => logger.info(`Server listening at port ${port}`));
}

export default app;
