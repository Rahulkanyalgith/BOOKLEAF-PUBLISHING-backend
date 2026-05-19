import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { BookStatus } from '@prisma/client';
import { prisma } from './client';
const SAMPLE_PATH = path.resolve(__dirname, '../../bookleaf_sample_data.json');

type SampleBook = {
  title: string;
  isbn?: string | null;
  genre?: string | null;
  publication_date?: string | null;
  status?: string | null;
  mrp?: number | null;
  total_copies_sold?: number | null;
  total_royalty_earned?: number | null;
  royalty_paid?: number | null;
  royalty_pending?: number | null;
};

type SampleAuthor = {
  name: string;
  email: string;
  joined_date?: string | null;
  books?: SampleBook[];
};

type SampleData = {
  authors?: SampleAuthor[];
};

function loadSampleData(): SampleData {
  const raw = fs.readFileSync(SAMPLE_PATH, 'utf-8');
  return JSON.parse(raw) as SampleData;
}

function parseDate(value?: string | null): Date | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function mapBookStatus(value?: string | null): BookStatus {
  if (!value) {
    return 'MANUSCRIPT_RECEIVED';
  }

  const normalized = value.toLowerCase();
  if (normalized.includes('published')) return 'PUBLISHED_LIVE';
  if (normalized.includes('cover')) return 'COVER_DESIGN';
  if (normalized.includes('typesetting')) return 'TYPESETTING';
  if (normalized.includes('proof')) return 'PROOFREADING';
  if (normalized.includes('isbn')) return 'ISBN_ASSIGNMENT';
  if (normalized.includes('printing')) return 'PRINTING';
  if (normalized.includes('distribution')) return 'DISTRIBUTION_SETUP';
  if (normalized.includes('editing')) return 'EDITING';
  return 'MANUSCRIPT_RECEIVED';
}

async function main() {
  console.log('Seeding BookLeaf database from sample JSON...');

  const adminPassword = await bcrypt.hash('admin@123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@bookleaf.com' },
    update: {},
    create: {
      name: 'BookLeaf Admin',
      email: 'admin@bookleaf.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const authorPassword = await bcrypt.hash('author@123', 12);
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
      role: 'AUTHOR' as const,
      ...(joinedDate ? { createdAt: joinedDate } : {}),
    };

    const authorUser = await prisma.user.upsert({
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

      await prisma.book.upsert({
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
  .finally(() => prisma.$disconnect());
