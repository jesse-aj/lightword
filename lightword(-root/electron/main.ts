import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import { initDB, getBooks, getChapter, saveNote, getNote } from './db/database'

const DEV_URL = 'http://localhost:5173'
let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'LightWord',
    webPreferences: {
      preload: path.join(
        path.dirname(decodeURIComponent(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, '$1')),
        'preload.mjs'
      ),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (!app.isPackaged) {
    win.loadURL(DEV_URL)
    win.webContents.openDevTools()
  } else {
    win.loadFile(
      path.join(
        path.dirname(decodeURIComponent(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, '$1')),
        '../dist/index.html'
      )
    )
  }
}

app.whenReady().then(() => {
  initDB()
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

ipcMain.handle('bible:getBooks', () => getBooks())
ipcMain.handle('bible:getChapter', (_e, book: string, chapter: number) => getChapter(book, chapter))
ipcMain.handle('notes:save', (_e, key: string, content: string) => saveNote(key, content))
ipcMain.handle('notes:get', (_e, key: string) => getNote(key))