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
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL is required');
}
const poolConfig = { connectionString };
const aivenCaBase64 = process.env.AIVEN_CA_CERT;
let aivenCaPath = process.env.AIVEN_CA_CERT_PATH || process.env.NODE_EXTRA_CA_CERTS;
// If only base64 is provided, write it to a temp file so Node/pg can load it reliably in hosted envs
if (aivenCaBase64 && !aivenCaPath) {
    try {
        const tmpDir = os_1.default.tmpdir();
        const tmpPath = path_1.default.join(tmpDir, 'aiven-ca.pem');
        fs_1.default.writeFileSync(tmpPath, Buffer.from(aivenCaBase64, 'base64'));
        aivenCaPath = tmpPath;
        // also set NODE_EXTRA_CA_CERTS so Node picks it up for global TLS
        process.env.NODE_EXTRA_CA_CERTS = tmpPath;
        console.info(`Wrote Aiven CA to temporary path: ${tmpPath}`);
    }
    catch (err) {
        console.warn('Failed to write AIVEN_CA_CERT to temp file:', err);
    }
}
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
        const resolvedPath = path_1.default.isAbsolute(aivenCaPath)
            ? aivenCaPath
            : path_1.default.resolve(process.cwd(), aivenCaPath);
        if (!fs_1.default.existsSync(resolvedPath)) {
            console.warn(`AIVEN_CA_CERT_PATH not found: ${resolvedPath}. Continuing without custom CA.`);
        }
        else {
            ca = fs_1.default.readFileSync(resolvedPath, 'utf8');
        }
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