import express, { type NextFunction, type Request, type Response } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import pokemonRouter from './routes/pokemon';
import { swaggerSpec } from './config/swagger';
import logger from './utils/logger';

const port = process.env.SERVER_PORT || 3000;
const app = express();

app.use(helmet());
app.use(express.json());

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
