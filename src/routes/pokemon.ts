import { type NextFunction, type Request, type Response, Router } from 'express';

const router = Router();

router.get('/pokemon/:name', async (_: Request, res: Response, __: NextFunction) => {
	res.status(200).send({'success': 'ok'});
});


router.get('/pokemon/translated/:name', async (_: Request, res: Response, __: NextFunction) => {
	res.status(200).send({'success': 'ok'});
});

export default router;

