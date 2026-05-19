"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("./client");
const SAMPLE_PATH = path_1.default.resolve(__dirname, '../../bookleaf_sample_data.json');
function loadSampleData() {
    const raw = fs_1.default.readFileSync(SAMPLE_PATH, 'utf-8');
    return JSON.parse(raw);
}
function parseDate(value) {
    if (!value) {
        return undefined;
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}
function mapBookStatus(value) {
    if (!value) {
        return 'MANUSCRIPT_RECEIVED';
    }
    const normalized = value.toLowerCase();
    if (normalized.includes('published'))
        return 'PUBLISHED_LIVE';
    if (normalized.includes('cover'))
        return 'COVER_DESIGN';
    if (normalized.includes('typesetting'))
        return 'TYPESETTING';
    if (normalized.includes('proof'))
        return 'PROOFREADING';
    if (normalized.includes('isbn'))
        return 'ISBN_ASSIGNMENT';
    if (normalized.includes('printing'))
        return 'PRINTING';
    if (normalized.includes('distribution'))
        return 'DISTRIBUTION_SETUP';
    if (normalized.includes('editing'))
        return 'EDITING';
    return 'MANUSCRIPT_RECEIVED';
}
async function main() {
    console.log('Seeding BookLeaf database from sample JSON...');
    const adminPassword = await bcryptjs_1.default.hash('admin@123', 12);
    await client_1.prisma.user.upsert({
        where: { email: 'admin@bookleaf.com' },
        update: {
            name: 'BookLeaf Admin',
            password: adminPassword,
            role: 'ADMIN',
        },
        create: {
            name: 'BookLeaf Admin',
            email: 'admin@bookleaf.com',
            password: adminPassword,
            role: 'ADMIN',
        },
    });
    const authorPassword = await bcryptjs_1.default.hash('author@123', 12);
    const sampleData = loadSampleData();
    const authors = Array.isArray(sampleData.authors) ? sampleData.authors : [];
    if (authors.length === 0) {
        throw new Error('No authors found in sample data.');
    }
    let authorCount = 0;
    let bookCount = 0;
    let skippedBooks = 0;
    for (const author of authors) {
        const joinedDate = parseDate(author.joined_date ?? undefined);
        const createData = {
            name: author.name,
            email: author.email,
            password: authorPassword,
            role: 'AUTHOR',
            ...(joinedDate ? { createdAt: joinedDate } : {}),
        };
        const authorUser = await client_1.prisma.user.upsert({
            where: { email: author.email },
            update: { name: author.name },
            create: createData,
        });
        authorCount += 1;
        const books = Array.isArray(author.books) ? author.books : [];
        for (const book of books) {
            const isbn = book.isbn?.trim();
            if (!isbn) {
                skippedBooks += 1;
                continue;
            }
            await client_1.prisma.book.upsert({
                where: { isbn },
                update: {
                    authorId: authorUser.id,
                    title: book.title,
                    genre: book.genre || 'Unknown',
                    status: mapBookStatus(book.status),
                    publicationDate: parseDate(book.publication_date),
                    mrp: Number(book.mrp ?? 0),
                    totalCopiesSold: Number(book.total_copies_sold ?? 0),
                    royaltyEarned: Number(book.total_royalty_earned ?? 0),
                    royaltyPaid: Number(book.royalty_paid ?? 0),
                    royaltyPending: Number(book.royalty_pending ?? 0),
                },
                create: {
                    authorId: authorUser.id,
                    title: book.title,
                    isbn,
                    genre: book.genre || 'Unknown',
                    status: mapBookStatus(book.status),
                    publicationDate: parseDate(book.publication_date),
                    mrp: Number(book.mrp ?? 0),
                    totalCopiesSold: Number(book.total_copies_sold ?? 0),
                    royaltyEarned: Number(book.total_royalty_earned ?? 0),
                    royaltyPaid: Number(book.royalty_paid ?? 0),
                    royaltyPending: Number(book.royalty_pending ?? 0),
                },
            });
            bookCount += 1;
        }
    }
    console.log(`Seeded ${authorCount} authors and ${bookCount} books.`);
    if (skippedBooks > 0) {
        console.log(`Skipped ${skippedBooks} books with missing ISBN.`);
    }
    console.log('\nSeed credentials:');
    console.log('  Admin:  admin@bookleaf.com / admin@123');
    console.log('  Author: all sample authors use author@123');
}
main()
    .catch(console.error)
    .finally(() => client_1.prisma.$disconnect());
//# sourceMappingURL=seed.js.map