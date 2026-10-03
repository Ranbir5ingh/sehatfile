import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

export interface Person {
  id: number;
  name: string;
  relation: string;
  conditions_json: string;
  created_at: string;
}

export interface Report {
  id: number;
  person_id: number;
  report_date: string | null;
  lab: string | null;
  test_name: string | null;
  summary: string;
  key_values_json: string;
  created_at: string;
}

export interface Medicine {
  id: number;
  person_id: number;
  name: string;
  dosage: string | null;
  frequency: string | null;
  active: number;
  created_at: string;
}

export interface Brief {
  id: number;
  person_id: number;
  content: string;
  created_at: string;
}

let dbInstance: DatabaseSync | null = null;

export function getDatabase(): DatabaseSync {
  if (dbInstance) {
    return dbInstance;
  }

  const dbDir = path.join(process.cwd(), '.data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, 'sehatfile.db');
  const db = new DatabaseSync(dbPath);

  // Enable WAL mode and foreign keys
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');

  // Initialize schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS people (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      relation TEXT NOT NULL DEFAULT '',
      conditions_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      person_id INTEGER NOT NULL REFERENCES people(id),
      report_date TEXT,
      lab TEXT,
      test_name TEXT,
      summary TEXT NOT NULL DEFAULT '',
      key_values_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS medicines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      person_id INTEGER NOT NULL REFERENCES people(id),
      name TEXT NOT NULL,
      dosage TEXT,
      frequency TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(person_id, name)
    );

    CREATE TABLE IF NOT EXISTS briefs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      person_id INTEGER NOT NULL REFERENCES people(id),
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  dbInstance = db;
  return dbInstance;
}

// Data Access Helpers
export function getAllPeople(): Person[] {
  const db = getDatabase();
  return db.prepare('SELECT * FROM people ORDER BY created_at ASC').all() as unknown as Person[];
}

export function getPersonById(id: number): Person | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM people WHERE id = ?').get(id);
  return (row as unknown as Person) || null;
}

export function createPerson(name: string, relation: string = ''): Person {
  const db = getDatabase();
  const stmt = db.prepare('INSERT INTO people (name, relation, conditions_json) VALUES (?, ?, ?)');
  const res = stmt.run(name.trim(), relation.trim(), '[]');
  const id = Number(res.lastInsertRowid);
  return getPersonById(id)!;
}

export function updatePersonConditions(id: number, conditions: string[]): void {
  const db = getDatabase();
  db.prepare('UPDATE people SET conditions_json = ? WHERE id = ?').run(JSON.stringify(conditions), id);
}

export function getReportsByPersonId(personId: number): Report[] {
  const db = getDatabase();
  return db
    .prepare('SELECT * FROM reports WHERE person_id = ? ORDER BY report_date DESC, created_at DESC')
    .all(personId) as unknown as Report[];
}

export function addReport(
  personId: number,
  reportDate: string | null,
  lab: string | null,
  testName: string | null,
  summary: string,
  keyValuesJson: string
): Report {
  const db = getDatabase();
  const stmt = db.prepare(
    'INSERT INTO reports (person_id, report_date, lab, test_name, summary, key_values_json) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const res = stmt.run(personId, reportDate, lab, testName, summary, keyValuesJson);
  const id = Number(res.lastInsertRowid);
  const row = db.prepare('SELECT * FROM reports WHERE id = ?').get(id);
  return row as unknown as Report;
}

export function getMedicinesByPersonId(personId: number): Medicine[] {
  const db = getDatabase();
  return db
    .prepare('SELECT * FROM medicines WHERE person_id = ? ORDER BY active DESC, name ASC')
    .all(personId) as unknown as Medicine[];
}

export function upsertMedicine(
  personId: number,
  name: string,
  dosage: string | null = null,
  frequency: string | null = null
): Medicine {
  const db = getDatabase();
  const cleanName = name.trim();
  const cleanDosage = dosage ? dosage.trim() : null;
  const cleanFreq = frequency ? frequency.trim() : null;

  // Insert or update on conflict (re-activate if stopped)
  const stmt = db.prepare(`
    INSERT INTO medicines (person_id, name, dosage, frequency, active)
    VALUES (?, ?, ?, ?, 1)
    ON CONFLICT(person_id, name) DO UPDATE SET
      dosage = COALESCE(excluded.dosage, medicines.dosage),
      frequency = COALESCE(excluded.frequency, medicines.frequency),
      active = 1
  `);
  stmt.run(personId, cleanName, cleanDosage, cleanFreq);

  const row = db
    .prepare('SELECT * FROM medicines WHERE person_id = ? AND name = ?')
    .get(personId, cleanName);
  return row as unknown as Medicine;
}

export function toggleMedicineActive(id: number, active: number): Medicine | null {
  const db = getDatabase();
  db.prepare('UPDATE medicines SET active = ? WHERE id = ?').run(active, id);
  const row = db.prepare('SELECT * FROM medicines WHERE id = ?').get(id);
  return (row as unknown as Medicine) || null;
}

export function getLatestBriefByPersonId(personId: number): Brief | null {
  const db = getDatabase();
  const row = db
    .prepare('SELECT * FROM briefs WHERE person_id = ? ORDER BY created_at DESC LIMIT 1')
    .get(personId);
  return (row as unknown as Brief) || null;
}

export function saveBrief(personId: number, content: string): Brief {
  const db = getDatabase();
  const stmt = db.prepare('INSERT INTO briefs (person_id, content) VALUES (?, ?)');
  const res = stmt.run(personId, content);
  const id = Number(res.lastInsertRowid);
  const row = db.prepare('SELECT * FROM briefs WHERE id = ?').get(id);
  return row as unknown as Brief;
}

export function deletePerson(id: number): boolean {
  const db = getDatabase();
  db.exec('BEGIN TRANSACTION;');
  try {
    db.prepare('DELETE FROM reports WHERE person_id = ?').run(id);
    db.prepare('DELETE FROM medicines WHERE person_id = ?').run(id);
    db.prepare('DELETE FROM briefs WHERE person_id = ?').run(id);
    const res = db.prepare('DELETE FROM people WHERE id = ?').run(id);
    db.exec('COMMIT;');
    return Number(res.changes) > 0;
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

export function clearAllPeople(): void {
  const db = getDatabase();
  db.exec('BEGIN TRANSACTION;');
  try {
    db.prepare('DELETE FROM reports').run();
    db.prepare('DELETE FROM medicines').run();
    db.prepare('DELETE FROM briefs').run();
    db.prepare('DELETE FROM people').run();
    try {
      db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('people', 'reports', 'medicines', 'briefs')").run();
    } catch {
      // sqlite_sequence may not exist if no autoincrement rows were inserted
    }
    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

