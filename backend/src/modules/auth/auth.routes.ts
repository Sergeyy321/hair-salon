import { Router } from 'express';
import { AuthController } from './auth.controller';

const router = Router();

router.post('/sync', AuthController.sync);

export default router;
