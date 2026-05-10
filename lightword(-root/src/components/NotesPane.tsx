import { useEffect, useState, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'

interface Props {
  book: string
  chapter: number
  fontSize: number
}

export default function NotesPane({ book, chapter, fontSize }: Props) {
  const [saved, setSaved] = useState(true)
  const [dragging, setDragging] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfName, setPdfName] = useState('')
  const noteKey = `${book}:${chapter}`

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({ multicolor: false }),
      Placeholder.configure({
        placeholder: `Notes for ${book} ${chapter}… Start typing your sermon thoughts here.`,
      }),
    ],
    content: '',
    onUpdate: () => setSaved(false),
  })

  useEffect(() => {
    if (!editor) return
    window.api.getNote(noteKey).then(content => {
      editor.commands.setContent(content ?? '')
      setSaved(true)
    })
  }, [noteKey, editor])

  const save = useCallback(() => {
    if (!editor || saved) return
    window.api.saveNote(noteKey, editor.getHTML()).then(() => setSaved(true))
  }, [editor, saved, noteKey])

  useEffect(() => {
    const interval = setInterval(save, 2000)
    return () => clearInterval(interval)
  }, [save])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'application/pdf') {
      setPdfUrl(URL.createObjectURL(file))
      setPdfName(file.name)
    }
  }

  if (!editor) return null

  return (
    <div className="notes-pane">
      {/* Header */}
      <div className="notes-pane-header">
        <div className="notes-title-area">
          <span className="notes-ref">Sermon Notes</span>
          <span className="notes-chapter-label">{book} · Chapter {chapter}</span>
        </div>
        <div className={`save-pill ${saved ? 'saved' : 'saving'}`}>
          <span>{saved ? '✓' : '●'}</span>
          {saved ? 'Saved' : 'Saving…'}
        </div>
      </div>

      {/* PDF drop zone or viewer */}
      {!pdfUrl ? (
        <div
          className={`drop-zone ${dragging ? 'dragging' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          📄 Drop a PDF sermon here to view it alongside your notes
        </div>
      ) : (
        <div className="pdf-viewer">
          <div className="pdf-header">
            <span>📄 {pdfName}</span>
            <button className="pdf-close" onClick={() => { setPdfUrl(null); setPdfName('') }}>✕</button>
          </div>
          <iframe src={pdfUrl} width="100%" height="320px" style={{ border: 'none', display: 'block' }} />
        </div>
      )}

      {/* Formatting toolbar */}
      <div className="notes-fmt-bar">
        <button
          className={`fmt-btn ${editor.isActive('bold') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleBold().run()}
        ><strong>B</strong></button>

        <button
          className={`fmt-btn ${editor.isActive('italic') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        ><em>I</em></button>

        <button
          className={`fmt-btn ${editor.isActive('strike') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        ><s>S</s></button>

        <div className="fmt-sep" />

        <button
          className={`fmt-btn ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >H2</button>

        <button
          className={`fmt-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >• List</button>

        <button
          className={`fmt-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >1. List</button>

        <button
          className={`fmt-btn ${editor.isActive('blockquote') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >❝ Quote</button>

        <div className="fmt-sep" />

        <button
          className={`fmt-btn ${editor.isActive('highlight') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        >✏️ Mark</button>

        <div className="fmt-sep" />

        <button
          className="fmt-btn"
          onClick={() => editor.chain().focus().undo().run()}
        >↩</button>

        <button
          className="fmt-btn"
          onClick={() => editor.chain().focus().redo().run()}
        >↪</button>
      </div>

      {/* Editor */}
      <div className="notes-editor" style={{ fontSize }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}