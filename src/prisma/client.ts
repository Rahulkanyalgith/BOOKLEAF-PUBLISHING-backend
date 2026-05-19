import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool, PoolConfig } from 'pg';
import fs from 'fs';
import path from 'path';
import os from 'os';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required');
}

const poolConfig: PoolConfig = { connectionString };
const aivenCaBase64 = process.env.AIVEN_CA_CERT;
let aivenCaPath = process.env.AIVEN_CA_CERT_PATH || process.env.NODE_EXTRA_CA_CERTS;

// If only base64 is provided, write it to a temp file so Node/pg can load it reliably in hosted envs
if (aivenCaBase64 && !aivenCaPath) {
  try {
    const tmpDir = os.tmpdir();
    const tmpPath = path.join(tmpDir, 'aiven-ca.pem');
    fs.writeFileSync(tmpPath, Buffer.from(aivenCaBase64, 'base64'));
    aivenCaPath = tmpPath;
    // also set NODE_EXTRA_CA_CERTS so Node picks it up for global TLS
    process.env.NODE_EXTRA_CA_CERTS = tmpPath;
    console.info(`Wrote Aiven CA to temporary path: ${tmpPath}`);
  } catch (err) {
    console.warn('Failed to write AIVEN_CA_CERT to temp file:', err);
  }
}

if (aivenCaBase64 || aivenCaPath) {
  let ca: string | undefined;
  if (aivenCaBase64) {
    try {
      ca = Buffer.from(aivenCaBase64, 'base64').toString('utf8');
    } catch {
      ca = aivenCaBase64;
    }
  } else if (aivenCaPath) {
    const resolvedPath = path.isAbsolute(aivenCaPath)
      ? aivenCaPath
      : path.resolve(process.cwd(), aivenCaPath);
    if (!fs.existsSync(resolvedPath)) {
      console.warn(`AIVEN_CA_CERT_PATH not found: ${resolvedPath}. Continuing without custom CA.`);
    } else {
      ca = fs.readFileSync(resolvedPath, 'utf8');
    }
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
