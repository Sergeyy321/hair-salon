import { prisma } from './config/prisma';

async function seed() {
  const existingBarbers = await prisma.user.count({ where: { role: 'BARBER' } });
  if (existingBarbers > 0) {
    return;
  }

  const elena = await prisma.user.create({
    data: {
      logtoSub: 'barber_elena_sub',
      email: 'elena.rostova@lume.salon',
      name: 'Elena Rostova',
      role: 'BARBER',
      specialization: 'Senior Colorist',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  const marta = await prisma.user.create({
    data: {
      logtoSub: 'barber_marta_sub',
      email: 'marta.kowalska@lume.salon',
      name: 'Marta Kowalska',
      role: 'BARBER',
      specialization: 'Hair Stylist & Cut',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    },
  });

  const piotr = await prisma.user.create({
    data: {
      logtoSub: 'barber_piotr_sub',
      email: 'piotr.zielinski@lume.salon',
      name: 'Piotr Zieliński',
      role: 'BARBER',
      specialization: 'Master Barber',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  });

  const julia = await prisma.user.create({
    data: {
      logtoSub: 'barber_julia_sub',
      email: 'julia.nowak@lume.salon',
      name: 'Julia Nowak',
      role: 'BARBER',
      specialization: 'Scalp & Rituals',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    },
  });

  const balayage = await prisma.service.create({
    data: {
      name: 'Balayage & Modelowanie',
      durationMin: 150,
      price: 380.0,
      category: 'Koloryzacja',
      description: 'Multi-dimensional brush lightening with customized toning and blowout finish.',
      barbers: { connect: [{ id: elena.id }] },
    },
  });

  const damskie = await prisma.service.create({
    data: {
      name: 'Strzyżenie Autorskie Damskie',
      durationMin: 60,
      price: 190.0,
      category: 'Strzyżenie',
      description: 'Signature tailored haircut crafted to facial geometry and natural hair texture.',
      barbers: { connect: [{ id: marta.id }] },
    },
  });

  const meskie = await prisma.service.create({
    data: {
      name: 'Strzyżenie Męskie & Brody',
      durationMin: 50,
      price: 140.0,
      category: 'Barbering',
      description: 'Classic precision cut, straight-razor contouring, and nourishing argan oil finish.',
      barbers: { connect: [{ id: piotr.id }] },
    },
  });

  const keratyna = await prisma.service.create({
    data: {
      name: 'Rytuał Odbudowy Keratynowej',
      durationMin: 75,
      price: 240.0,
      category: 'Pielęgnacja',
      description: 'Deep keratin reconstructive treatment for damaged hair with therapeutic steam hydration.',
      barbers: { connect: [{ id: julia.id }, { id: marta.id }] },
    },
  });

  const client1 = await prisma.user.create({
    data: {
      logtoSub: 'client_aleksandra_sub',
      email: 'aleksandra.w@example.com',
      name: 'Aleksandra Wiśniewska',
      role: 'CLIENT',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
  });

  const client2 = await prisma.user.create({
    data: {
      logtoSub: 'client_tomasz_sub',
      email: 'tomasz.m@example.com',
      name: 'Tomasz Majewski',
      role: 'CLIENT',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
  });

  const client3 = await prisma.user.create({
    data: {
      logtoSub: 'client_karolina_sub',
      email: 'karolina.d@example.com',
      name: 'Karolina Dąbrowska',
      role: 'CLIENT',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    },
  });

  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  const d = today.getDate();

  await prisma.booking.create({
    data: {
      barberId: elena.id,
      clientId: client1.id,
      serviceId: balayage.id,
      startTime: new Date(y, m, d, 9, 30),
      endTime: new Date(y, m, d, 12, 0),
      status: 'CONFIRMED',
      notes: 'Wrażliwa skóra głowy. Używać produktów bez amoniaku.',
    },
  });

  await prisma.booking.create({
    data: {
      barberId: marta.id,
      clientId: client3.id,
      serviceId: damskie.id,
      startTime: new Date(y, m, d, 13, 0),
      endTime: new Date(y, m, d, 14, 0),
      status: 'CONFIRMED',
      notes: 'Lekkie cieniowanie końcówek.',
    },
  });

  await prisma.booking.create({
    data: {
      barberId: piotr.id,
      clientId: client2.id,
      serviceId: meskie.id,
      startTime: new Date(y, m, d, 10, 30),
      endTime: new Date(y, m, d, 11, 20),
      status: 'CONFIRMED',
      notes: 'Konturowanie brody na ostro.',
    },
  });

  await prisma.booking.create({
    data: {
      barberId: julia.id,
      clientId: client1.id,
      serviceId: keratyna.id,
      startTime: new Date(y, m, d, 14, 30),
      endTime: new Date(y, m, d, 15, 45),
      status: 'PENDING',
      notes: 'Zabieg nawilżający.',
    },
  });
}

seed()
  .catch((err) => {
    process.stderr.write(String(err));
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
