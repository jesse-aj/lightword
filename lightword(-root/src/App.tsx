import { useState } from 'react'
import Split from 'react-split'
import Toolbar from './components/Toolbar'
import BiblePane from './components/BiblePane'
import NotesPane from './components/NotesPane'
import './App.css'
// import { Theme } from './types'
export type Theme = 'light' | 'dark' | 'sepia'

export default function App() {
  const [book, setBook] = useState('John')
  const [chapter, setChapter] = useState(1)
  const [fontSize, setFontSize] = useState(18)


  const [theme, setTheme] = useState<Theme>('light')

const cycleTheme = () => {
  setTheme(t => t === 'light' ? 'dark' : t === 'dark' ? 'sepia' : 'light')
}
  return (
    <div className="app"  data-theme={theme} >
     <Toolbar
      book={book}
      chapter={chapter}
      fontSize={fontSize}
      theme={theme}
      onBookChange={setBook}
      onChapterChange={setChapter}
      onFontSizeChange={setFontSize}
      onThemeToggle={cycleTheme}
/>
    <Split
        className="split-view"
        sizes={[50, 50]}
        minSize={320}
        gutterSize={2}
        direction="horizontal"
        style={{ display: 'flex', flex: 1, overflow: 'hidden' }}
>
        <BiblePane book={book} chapter={chapter} fontSize={fontSize} />
        <NotesPane book={book} chapter={chapter} fontSize={fontSize} />
      </Split>
       <div className="status-bar">
        <span className="status-item">
          <span className="status-dot" />
          Offline · All data local
        </span>
        <span className="status-item">KJV</span>
        <span className="status-item" style={{ marginLeft: 'auto' }}>
          LightWord · Built with ♥
        </span>
      </div>

    </div>
  )
}