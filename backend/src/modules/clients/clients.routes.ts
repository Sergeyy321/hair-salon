import { Router } from 'express';
import { ClientsController } from './clients.controller';

const router = Router();

router.get('/', ClientsController.getAll);

export default router;
