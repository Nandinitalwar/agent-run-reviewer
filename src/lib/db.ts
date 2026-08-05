import fs from 'fs';
import path from 'path';
import { Run } from './types';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

function initDB() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2), 'utf-8');
  }
}

export function getAllRuns(): Run[] {
  try {
    initDB();
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data) as Run[];
  } catch (error) {
    console.error('Failed to read runs database:', error);
    return [];
  }
}

export function getRunById(id: string): Run | null {
  const runs = getAllRuns();
  return runs.find(run => run.id === id) || null;
}

export function saveRun(run: Run): void {
  try {
    initDB();
    const runs = getAllRuns();
    const index = runs.findIndex(r => r.id === run.id);
    if (index >= 0) {
      runs[index] = run;
    } else {
      runs.unshift(run); // Add to beginning (newest first)
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(runs, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save run to database:', error);
  }
}

export function deleteRun(id: string): void {
  try {
    initDB();
    const runs = getAllRuns();
    const filtered = runs.filter(run => run.id !== id);
    fs.writeFileSync(DB_PATH, JSON.stringify(filtered, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to delete run:', error);
  }
}
