import { app } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import Database from 'better-sqlite3'

function getDirname(): string {
  return path.dirname(
    decodeURIComponent(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, '$1')
  )
}

let db: Database.Database

export function initDB(): void {
  const dbPath = path.join(app.getPath('userData'), 'lightword.db')
  db = new Database(dbPath)

  db.exec(`
    CREATE TABLE IF NOT EXISTS verses (
      id INTEGER PRIMARY KEY,
      book TEXT NOT NULL,
      chapter INTEGER NOT NULL,
      verse INTEGER NOT NULL,
      text TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_book_chapter ON verses(book, chapter);

    CREATE TABLE IF NOT EXISTS notes (
      key TEXT PRIMARY KEY,
      content TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS highlights (
      book TEXT, chapter INTEGER, verse INTEGER,
      color TEXT,
      PRIMARY KEY (book, chapter, verse)
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      book TEXT, chapter INTEGER, verse INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (book, chapter, verse)
    );
  `)

  seedIfEmpty()
}

function seedIfEmpty(): void {
  const count = (db.prepare('SELECT COUNT(*) as c FROM verses').get() as { c: number }).c
  if (count > 0) return

const dataPath = path.join(app.getAppPath(), 'data', 'kjv.json')
  if (!fs.existsSync(dataPath)) {
    console.warn('⚠️ kjv.json not found at', dataPath)
    return
  }

  const raw = JSON.parse(fs.readFileSync(dataPath, 'utf-8').replace(/^\uFEFF/, ''))
  const insert = db.prepare(
    'INSERT INTO verses (book, chapter, verse, text) VALUES (?, ?, ?, ?)'
  )

  const insertMany = db.transaction((books: any[]) => {
    for (const book of books) {
      const bookName: string = book.name
      for (let chIdx = 0; chIdx < book.chapters.length; chIdx++) {
        const chapter: string[] = book.chapters[chIdx]
        for (let vIdx = 0; vIdx < chapter.length; vIdx++) {
          insert.run(bookName, chIdx + 1, vIdx + 1, chapter[vIdx])
        }
      }
    }
  })

  insertMany(raw)
  console.log('✅ KJV Bible seeded!')
}

export function getBooks(): string[] {
  return (db.prepare('SELECT DISTINCT book FROM verses').all() as { book: string }[])
    .map(r => r.book)
}

export function getChapter(book: string, chapter: number): { verse: number; text: string }[] {
  return db.prepare(
    'SELECT verse, text FROM verses WHERE book = ? AND chapter = ? ORDER BY verse'
  ).all(book, chapter) as { verse: number; text: string }[]
}

export function saveNote(key: string, content: string): boolean {
  db.prepare(`
    INSERT INTO notes (key, content, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET
      content = excluded.content,
      updated_at = excluded.updated_at
  `).run(key, content)
  return true
}

export function getNote(key: string): string | null {
  const row = db.prepare('SELECT content FROM notes WHERE key = ?').get(key) as
    | { content: string }
    | undefined
  return row?.content ?? null
}