// src/seeds/admin.seed.ts
import 'dotenv/config';
import { connectionSource } from '../config/typeorm';
import * as bcrypt          from 'bcrypt';

export async function seedAdmin() {
  if (!connectionSource.isInitialized) {
    await connectionSource.initialize();
  }

  const passwordHash = bcrypt.hashSync('Henry25b!', 10);

  // INSERT con ON CONFLICT
  await connectionSource.query(`
    INSERT INTO "user" (
      id, email, name, password, role, "createdAt"
    )
    VALUES (
      uuid_generate_v4(),
      'heroescercanos@gmail.com',
      'Heroes Cercanos',
      '${passwordHash}',
      'admin',
      NOW()
    )
    ON CONFLICT (email) DO NOTHING;
  `);

  console.log('✅ Seed de admin completado');
}

seedAdmin()
  .catch(err => {
    console.error('❌ Error en seed:', err);
    process.exit(1);
  });
