import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const globalDatabase = globalThis as typeof globalThis & {
  roomsDatabase?: DatabaseSync;
};
export function database() {
  if (!globalDatabase.roomsDatabase) {
    const filename = resolve(
      process.env.DATABASE_PATH || "./data/rooms.sqlite",
    );
    mkdirSync(dirname(filename), { recursive: true });
    const db = new DatabaseSync(filename);
    db.exec(`PRAGMA journal_mode = WAL;
      PRAGMA busy_timeout = 5000;
      CREATE TABLE IF NOT EXISTS rooms (
        pin TEXT PRIMARY KEY, body TEXT NOT NULL,
        revision INTEGER NOT NULL DEFAULT 0, expires INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS rooms_expires ON rooms(expires);`);
    globalDatabase.roomsDatabase = db;
  }
  return globalDatabase.roomsDatabase;
}
