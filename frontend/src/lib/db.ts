import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import path from "path";

let db: Database | null = null;

export async function getDb() {
  if (!db) {
    db = await open({
      filename: path.join(process.cwd(), "local.db"),
      driver: sqlite3.Database,
    });

    // Initialize tables
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        name TEXT,
        image TEXT,
        provider TEXT,
        provider_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS nutrition_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        foods TEXT,
        calories REAL,
        protein_g REAL,
        fat_g REAL,
        carbs_g REAL,
        fiber_g REAL,
        logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      INSERT OR IGNORE INTO users (id, email, name, provider)
      VALUES (1, 'guest@gizikost.local', 'Tamu (Guest)', 'guest');
    `);
  }
  return db;
}
