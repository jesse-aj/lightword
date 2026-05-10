import { useEffect, useState } from 'react'

interface Verse {
  verse: number
  text: string
}

interface Props {
  book: string
  chapter: number
  fontSize: number
}

type HighlightColor = 'yellow' | 'green' | 'blue' | 'red' | 'purple' | null

const COLORS: { key: HighlightColor; cls: string; dot: string; label: string }[] = [
  { key: 'yellow', cls: 'c-yellow', dot: '#FACC15', label: 'Gold' },
  { key: 'green',  cls: 'c-green',  dot: '#4ADE80', label: 'Green' },
  { key: 'blue',   cls: 'c-blue',   dot: '#60A5FA', label: 'Blue' },
  { key: 'red',    cls: 'c-red',    dot: '#FC814A', label: 'Orange' },
  { key: 'purple', cls: 'c-purple', dot: '#C084FC', label: 'Purple' },
]

export default function BiblePane({ book, chapter, fontSize }: Props) {
  const [verses, setVerses] = useState<Verse[]>([])
  const [loading, setLoading] = useState(true)
  const [highlights, setHighlights] = useState<Record<number, HighlightColor>>({})
  const [pickerVerse, setPickerVerse] = useState<number | null>(null)

  useEffect(() => {
    setLoading(true)
    setPickerVerse(null)
    window.api.getChapter(book, chapter).then(v => {
      setVerses(v)
      setLoading(false)
    })
    // Load highlights from localStorage
    const stored = localStorage.getItem(`hl:${book}:${chapter}`)
    if (stored) setHighlights(JSON.parse(stored))
    else setHighlights({})
  }, [book, chapter])

  const saveHighlights = (updated: Record<number, HighlightColor>) => {
    setHighlights(updated)
    localStorage.setItem(`hl:${book}:${chapter}`, JSON.stringify(updated))
  }

  const applyColor = (verseNum: number, color: HighlightColor) => {
    const updated = { ...highlights }
    if (color === null || updated[verseNum] === color) {
      delete updated[verseNum]
    } else {
      updated[verseNum] = color
    }
    saveHighlights(updated)
    setPickerVerse(null)
  }

  const copyVerse = (v: Verse) => {
    const text = `${book} ${chapter}:${v.verse} (KJV) — ${v.text}`
    navigator.clipboard.writeText(text)
    setPickerVerse(null)
  }

  if (loading) {
    return (
      <div className="bible-pane">
        <div className="pane-loading">Loading scripture…</div>
      </div>
    )
  }

  return (
    <div className="bible-pane" onClick={() => setPickerVerse(null)}>
      <div className="pane-label">Holy Bible · KJV</div>
      <div className="chapter-title">{book} — Chapter {chapter}</div>

      {verses.map(v => {
        const hl = highlights[v.verse]
        const isPickerOpen = pickerVerse === v.verse

        return (
          <div
            key={v.verse}
            className={`verse-row${hl ? ` hl-${hl}` : ''}`}
            onClick={e => {
              e.stopPropagation()
              setPickerVerse(isPickerOpen ? null : v.verse)
            }}
          >
            <span className="verse-num">{v.verse}</span>
            <span className="verse-text" style={{ fontSize }}>{v.text}</span>

            {/* Hover actions */}
            <div className="verse-actions" onClick={e => e.stopPropagation()}>
              <button
                className="verse-action-btn"
                onClick={e => { e.stopPropagation(); copyVerse(v) }}
              >
                Copy
              </button>
              <button
                className="verse-action-btn"
                onClick={e => {
                  e.stopPropagation()
                  setPickerVerse(isPickerOpen ? null : v.verse)
                }}
              >
                🎨 Color
              </button>
            </div>

            {/* Color picker */}
            {isPickerOpen && (
              <div className="color-picker" onClick={e => e.stopPropagation()}>
                {COLORS.map(c => (
                  <div
                    key={c.key}
                    className="color-dot"
                    style={{
                      background: c.dot,
                      outline: hl === c.key ? '2px solid #1C1917' : 'none',
                      outlineOffset: 1,
                    }}
                    title={c.label}
                    onClick={() => applyColor(v.verse, c.key)}
                  />
                ))}
                <div
                  className="color-dot c-clear"
                  title="Clear highlight"
                  onClick={() => applyColor(v.verse, null)}
                >✕</div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}