import { Router } from 'express';
import { BarbersController } from './barber.controller';

const router = Router();

router.get('/', BarbersController.getAll);

export default router;
