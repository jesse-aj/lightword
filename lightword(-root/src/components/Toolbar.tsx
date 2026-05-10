import { useEffect, useState } from 'react'
import { Theme } from '../App'

interface Props {
  book: string
  chapter: number
  fontSize: number
  theme: Theme
  onBookChange: (b: string) => void
  onChapterChange: (c: number) => void
  onFontSizeChange: (s: number) => void
  onThemeToggle: () => void
}

const CHAPTER_COUNTS: Record<string, number> = {
  'Genesis': 50, 'Exodus': 40, 'Leviticus': 27, 'Numbers': 36,
  'Deuteronomy': 34, 'Joshua': 24, 'Judges': 21, 'Ruth': 4,
  '1 Samuel': 31, '2 Samuel': 24, '1 Kings': 22, '2 Kings': 25,
  '1 Chronicles': 29, '2 Chronicles': 36, 'Ezra': 10, 'Nehemiah': 13,
  'Esther': 10, 'Job': 42, 'Psalms': 150, 'Proverbs': 31,
  'Ecclesiastes': 12, 'Song of Solomon': 8, 'Isaiah': 66, 'Jeremiah': 52,
  'Lamentations': 5, 'Ezekiel': 48, 'Daniel': 12, 'Hosea': 14,
  'Joel': 3, 'Amos': 9, 'Obadiah': 1, 'Jonah': 4, 'Micah': 7,
  'Nahum': 3, 'Habakkuk': 3, 'Zephaniah': 3, 'Haggai': 2,
  'Zechariah': 14, 'Malachi': 4, 'Matthew': 28, 'Mark': 16,
  'Luke': 24, 'John': 21, 'Acts': 28, 'Romans': 16,
  '1 Corinthians': 16, '2 Corinthians': 13, 'Galatians': 6,
  'Ephesians': 6, 'Philippians': 4, 'Colossians': 4,
  '1 Thessalonians': 5, '2 Thessalonians': 3, '1 Timothy': 6,
  '2 Timothy': 4, 'Titus': 3, 'Philemon': 1, 'Hebrews': 13,
  'James': 5, '1 Peter': 5, '2 Peter': 3, '1 John': 5,
  '2 John': 1, '3 John': 1, 'Jude': 1, 'Revelation': 22,
}

const THEME_ICONS: Record<Theme, string> = {
  light: '☀️',
  dark: '🌙',
  sepia: '📜',
}

export default function Toolbar({
  book, chapter, fontSize, theme,
  onBookChange, onChapterChange, onFontSizeChange, onThemeToggle
}: Props) {
  const [books, setBooks] = useState<string[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    window.api.getBooks().then(setBooks)
  }, [])

  const maxChapter = CHAPTER_COUNTS[book] ?? 50
  const chapters = Array.from({ length: maxChapter }, (_, i) => i + 1)

  const handleBookChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onBookChange(e.target.value)
    onChapterChange(1)
  }

  const prevChapter = () => {
    if (chapter > 1) {
      onChapterChange(chapter - 1)
    } else {
      const idx = books.indexOf(book)
      if (idx > 0) {
        const prevBook = books[idx - 1]
        onBookChange(prevBook)
        onChapterChange(CHAPTER_COUNTS[prevBook] ?? 1)
      }
    }
  }

  const nextChapter = () => {
    if (chapter < maxChapter) {
      onChapterChange(chapter + 1)
    } else {
      const idx = books.indexOf(book)
      if (idx < books.length - 1) {
        onBookChange(books[idx + 1])
        onChapterChange(1)
      }
    }
  }

  return (
    <div className="toolbar">
      {/* Logo */}
      <div className="app-logo">
        <div className="app-logo-icon">⚔️</div>
        <span className="app-logo-text">ISAAC APPIAH'S BIBLE APP</span>
      </div>

      <div className="toolbar-divider" />

      {/* Book select */}
      <div className="toolbar-select-wrap">
        <select className="toolbar-select" value={book} onChange={handleBookChange}>
          {books.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <span className="toolbar-select-arrow">▾</span>
      </div>

      {/* Chapter nav */}
      <div className="chapter-nav">
        <button className="nav-arrow" onClick={prevChapter} title="Previous chapter">‹</button>
        <div className="toolbar-select-wrap">
          <select
            className="toolbar-select"
            value={chapter}
            onChange={e => onChapterChange(Number(e.target.value))}
          >
            {chapters.map(c => <option key={c} value={c}>Ch. {c}</option>)}
          </select>
          <span className="toolbar-select-arrow">▾</span>
        </div>
        <button className="nav-arrow" onClick={nextChapter} title="Next chapter">›</button>
      </div>

      <div className="toolbar-divider" />

      {/* Search */}
      <div className="toolbar-search">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          placeholder="Search scripture…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Right controls */}
      <div className="toolbar-right">
        {/* Font size */}
        <div className="font-size-ctrl">
          <button
            className="font-size-btn"
            onClick={() => onFontSizeChange(Math.max(12, fontSize - 2))}
          >A−</button>
          <span className="font-size-label">{fontSize}px</span>
          <button
            className="font-size-btn"
            onClick={() => onFontSizeChange(Math.min(32, fontSize + 2))}
          >A+</button>
        </div>

        <div className="toolbar-divider" />

        {/* Theme toggle */}
        <button
          className="toolbar-icon-btn"
          onClick={onThemeToggle}
          title={`Theme: ${theme} (click to cycle)`}
        >
          {THEME_ICONS[theme]}
        </button>
      </div>
    </div>
  )
}