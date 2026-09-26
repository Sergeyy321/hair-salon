import type { BarberApi, ServiceApi } from '../lib/api';

export const DEFAULT_DIRECTOR_AVATAR =
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80';

export const DEFAULT_CLIENT_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';

export const DEFAULT_DIRECTOR_NAME = 'Sarah Mitchell';
export const DEFAULT_CLIENT_NAME = 'Lumé Client';

export const DEFAULT_BARBERS: BarberApi[] = [
  {
    id: 'st-1',
    name: 'Elena Rostova',
    email: 'elena.rostova@lume.salon',
    role: 'BARBER',
    specialization: 'Senior Colorist',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'st-2',
    name: 'Marta Kowalska',
    email: 'marta.kowalska@lume.salon',
    role: 'BARBER',
    specialization: 'Hair Stylist & Cut',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'st-3',
    name: 'Piotr Zieliński',
    email: 'piotr.zielinski@lume.salon',
    role: 'BARBER',
    specialization: 'Master Barber',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'st-4',
    name: 'Julia Nowak',
    email: 'julia.nowak@lume.salon',
    role: 'BARBER',
    specialization: 'Scalp & Rituals',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  },
];

export const DEFAULT_SERVICES: ServiceApi[] = [
  {
    id: 'srv-1',
    name: 'Balayage & Modelowanie',
    durationMin: 150,
    price: 380,
    category: 'Coloring',
    description: 'Multi-dimensional brush lightening with toning & blowout finish.',
  },
  {
    id: 'srv-2',
    name: 'Strzyżenie Autorskie Damskie',
    durationMin: 60,
    price: 190,
    category: 'Cut & Style',
    description: 'Signature tailored haircut crafted to face architecture and natural texture.',
  },
  {
    id: 'srv-3',
    name: 'Strzyżenie Męskie & Brody',
    durationMin: 50,
    price: 140,
    category: 'Barbering',
    description: 'Classic shear work, straight razor contours, and nourishing argan oil grooming.',
  },
  {
    id: 'srv-4',
    name: 'Rytuał Odbudowy Keratynowej',
    durationMin: 75,
    price: 240,
    category: 'Care Rituals',
    description: 'Intense keratin reconstructive treatment with steam hydration.',
  },
];
