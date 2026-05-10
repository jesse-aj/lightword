/// <reference types="vite/client" />

interface Window {
  api: {
    getBooks: () => Promise<string[]>
    getChapter: (book: string, chapter: number) => Promise<{ verse: number; text: string }[]>
    saveNote: (key: string, content: string) => Promise<boolean>
    getNote: (key: string) => Promise<string | null>
  }
}
