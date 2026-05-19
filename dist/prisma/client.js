"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const fs_1 = __importDefault(require("fs"));
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL is required');
}
const poolConfig = { connectionString };
const aivenCaBase64 = process.env.AIVEN_CA_CERT;
const aivenCaPath = process.env.AIVEN_CA_CERT_PATH;
if (aivenCaBase64 || aivenCaPath) {
    let ca;
    if (aivenCaBase64) {
        try {
            ca = Buffer.from(aivenCaBase64, 'base64').toString('utf8');
        }
        catch {
            ca = aivenCaBase64;
        }
    }
    else if (aivenCaPath) {
        ca = fs_1.default.readFileSync(aivenCaPath, 'utf8');
    }
    if (ca) {
        poolConfig.ssl = {
            ca,
            rejectUnauthorized: true,
        };
    }
}
const pool = new pg_1.Pool(poolConfig);
const adapter = new adapter_pg_1.PrismaPg(pool);
exports.prisma = globalThis.__prisma ??
    new client_1.PrismaClient({
        adapter,
        log: [
            { emit: 'event', level: 'query' },
            { emit: 'event', level: 'error' },
            { emit: 'event', level: 'warn' },
        ],
    });
if (process.env.NODE_ENV !== 'production') {
    globalThis.__prisma = exports.prisma;
}
//# sourceMappingURL=client.js.map