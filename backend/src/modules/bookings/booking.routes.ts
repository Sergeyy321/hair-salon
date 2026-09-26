import { Router } from 'express';
import { BookingsController } from './bookings.controller';

const router = Router();

router.get('/my', BookingsController.getMyBookings);
router.get('/', BookingsController.getDaySchedule);
router.post('/', BookingsController.create);
router.get('/availability', BookingsController.getAvailability);
router.patch('/:id/status', BookingsController.updateStatus);
router.patch('/:id/cancel', BookingsController.cancel);
router.patch('/:id/reschedule', BookingsController.reschedule);
router.delete('/:id', BookingsController.delete);

export default router;
