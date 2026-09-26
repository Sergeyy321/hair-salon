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

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', atelier: 'Lumé', time: new Date().toISOString() });
});

app.get('/api/my-bookings', BookingsController.getMyBookings);
app.use('/api/services', servicesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/barbers', barbersRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientsRoutes);

app.listen(port, () => {
  process.stdout.write(`Lumé server running on port ${port}\n`);
});

export default app;
