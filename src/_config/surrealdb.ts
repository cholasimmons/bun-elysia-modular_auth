import { Surreal } from 'surrealdb.js';
import { SurrealdbNodeEngine } from 'surrealdb.node';

let db: Surreal | undefined;

export async function initDb(): Promise<Surreal | undefined> {
    if (db) return db;
    db = new Surreal();
    try {
        await db.connect("http://127.0.0.1:8000/rpc");
        await db.use({ namespace: "test", database: "test" });
        return db;
    } catch (err) {
        console.error("Failed to connect to SurrealDB:", err);
        throw err;
    }
}

export async function closeDb(): Promise<void> {
    if (!db) return;
    await db.close();
    db = undefined;
}

export function getDb(): Surreal | undefined {
    return db;
}