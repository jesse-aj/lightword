import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  getBooks: (): Promise<string[]> =>
    ipcRenderer.invoke('bible:getBooks'),

  getChapter: (book: string, chapter: number): Promise<{ verse: number; text: string }[]> =>
    ipcRenderer.invoke('bible:getChapter', book, chapter),

  saveNote: (key: string, content: string): Promise<boolean> =>
    ipcRenderer.invoke('notes:save', key, content),

  getNote: (key: string): Promise<string | null> =>
    ipcRenderer.invoke('notes:get', key),
})