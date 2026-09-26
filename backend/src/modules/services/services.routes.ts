import { Router } from 'express';
import { ServicesController } from './services.controller';

const router = Router();

router.get('/', ServicesController.getAll);
router.get('/:id', ServicesController.getById);

export default router;
