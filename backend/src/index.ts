import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import servicesRoutes from './modules/services/services.routes';
import bookingsRoutes from './modules/bookings/booking.routes';
import barbersRoutes from './modules/barbers/barber.routes';
import authRoutes from './modules/auth/auth.routes';
import clientsRoutes from './modules/clients/clients.routes';
import { BookingsController } from './modules/bookings/bookings.controller';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

const apiRouter = express.Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok', atelier: 'Lumé', time: new Date().toISOString() });
});

apiRouter.get('/my-bookings', BookingsController.getMyBookings);
apiRouter.use('/services', servicesRoutes);
apiRouter.use('/bookings', bookingsRoutes);
apiRouter.use('/barbers', barbersRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/clients', clientsRoutes);

app.use('/api', apiRouter);
app.use('/', apiRouter);

if (!process.env.VERCEL) {
  app.listen(port, () => {
    process.stdout.write(` server running on port ${port}\n`);
  });
}

export default app;
