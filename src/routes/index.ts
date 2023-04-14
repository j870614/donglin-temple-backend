import express, { Request, Response, NextFunction } from 'express';

const router = express.Router();

/* GET home page. */
router.get('/', (_req: Request, res: Response, next: NextFunction) => {
  res.send('Hello World !!!');
});

export default router;
