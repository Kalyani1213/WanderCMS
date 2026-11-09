import dotenv from 'dotenv';
dotenv.config();

import { db } from '../src/server/db';

async function runSeed() {
  console.log('--- Starting WanderCMS Database Seeding ---');
  try {
    db.seedInitialData(true);
    const status = db.getDatabaseStatus();
    console.log('✓ Seeding completed successfully!');
    console.log('Database Status:', JSON.stringify(status, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('✗ Seeding failed:', err);
    process.exit(1);
  }
}

runSeed();
