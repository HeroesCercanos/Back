// src/seeds/quarter.seed.ts
import 'dotenv/config';
import { connectionSource } from '../config/typeorm';

export async function seedQuarter() {
  // 1) Inicializa la conexión si hace falta
  if (!connectionSource.isInitialized) {
    await connectionSource.initialize();
  }

  // 2) Inserción idempotente del cuartel
  await connectionSource.query(`
    INSERT INTO "quarter" (
      id,
      name,
      address,
      location,
      phone,
      email,
      description
    )
    VALUES (
      1,
      'Cuartel Monte Caseros',
      'Colón N° 643',
      POINT(-30.249865048616716, -57.63056297116415),
      '+543775422207',
      'bomberosvoluntarioamontecaseros@hotmail.com.ar',
      'Bomberos Voluntarios de Monte Caseros'
    )
    ON CONFLICT (id) DO NOTHING;
  `);

  console.log('✅ Seed de cuartel completado');
}

seedQuarter()
  .catch(err => {
    console.error('❌ Error en seed:', err);
    process.exit(1);
  });