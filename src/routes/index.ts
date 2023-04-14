import express, { Request, Response, NextFunction } from 'express';

const router = express.Router();
const test: string = 'test message';

/* GET home page. */
router.get('/', (_req: Request, res: Response, next: NextFunction) => {
  res.send(test);
});

export default router;
