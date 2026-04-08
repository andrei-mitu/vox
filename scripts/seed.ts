/**
 * Runs all SQL files in db/seeds/ in filename order.
 * Each file is executed as a single transaction.
 *
 * Usage: bun run db:seed
 */
import postgres from 'postgres';
import {readdir, readFile} from 'node:fs/promises';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

function requireEnv(name: string): string {
    const v = process.env[name]?.trim();
    if (!v) {
        console.error(`Missing required env: ${name}`);
        process.exit(1);
    }
    return v;
}

async function main() {
    const connectionString = requireEnv('DATABASE_URL');
    const sql = postgres(connectionString, {max: 1});

    const seedsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'db', 'seeds');
    const files = (await readdir(seedsDir))
        .filter((f) => f.endsWith('.sql'))
        .sort();

    if (files.length === 0) {
        console.log('No seed files found.');
        await sql.end();
        return;
    }

    for (const file of files) {
        const filePath = join(seedsDir, file);
        const query = await readFile(filePath, 'utf8');
        console.log(`Running seed: ${file}`);
        await sql.unsafe(query);
        console.log(`  Done: ${file}`);
    }

    console.log('All seeds complete.');
    await sql.end();
}

main().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
