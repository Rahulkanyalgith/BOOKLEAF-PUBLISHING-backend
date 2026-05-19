import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool, PoolConfig } from 'pg';
import fs from 'fs';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required');
}

const poolConfig: PoolConfig = { connectionString };
const aivenCaBase64 = process.env.AIVEN_CA_CERT;
const aivenCaPath = process.env.AIVEN_CA_CERT_PATH;

if (aivenCaBase64 || aivenCaPath) {
  let ca: string | undefined;
  if (aivenCaBase64) {
    try {
      ca = Buffer.from(aivenCaBase64, 'base64').toString('utf8');
    } catch {
      ca = aivenCaBase64;
    }
  } else if (aivenCaPath) {
    ca = fs.readFileSync(aivenCaPath, 'utf8');
  }

  if (ca) {
    (poolConfig as { ssl?: { ca: string; rejectUnauthorized: boolean } }).ssl = {
      ca,
      rejectUnauthorized: true,
    };
  }
}

const pool = new Pool(poolConfig);
const adapter = new PrismaPg(pool);

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__prisma ??
  new PrismaClient({
    adapter,
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}
