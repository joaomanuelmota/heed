'use client'
import { useRef, useEffect } from 'react'
import { Bold, Italic, Underline, List, ListOrdered, Quote, Link } from 'lucide-react'

const RichTextEditor = ({ value, onChange, placeholder = "Write your notes here..." }) => {
  const editorRef = useRef(null)

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value])

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value)
    editorRef.current.focus()
    handleInput()
  }

  const insertList = (ordered = false) => {
    formatText(ordered ? 'insertOrderedList' : 'insertUnorderedList')
  }

  const insertLink = () => {
    const url = prompt('Enter URL:')
    if (url) {
      formatText('createLink', url)
    }
  }

  const setHeading = (level) => {
    if (level === '') {
      formatText('formatBlock', 'div')
    } else {
      formatText('formatBlock', `h${level}`)
    }
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-2 bg-gray-50 flex flex-wrap gap-1">
        
        {/* Headings */}
        <select 
          onChange={(e) => setHeading(e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded text-sm bg-white"
          defaultValue=""
        >
          <option value="">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
        </select>

        <div className="w-px bg-gray-300 mx-1"></div>

        {/* Basic formatting */}
        <button
          type="button"
          onClick={() => formatText('bold')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        
        <button
          type="button"
          onClick={() => formatText('italic')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        
        <button
          type="button"
          onClick={() => formatText('underline')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </button>

        <div className="w-px bg-gray-300 mx-1"></div>

        {/* Lists */}
        <button
          type="button"
          onClick={() => insertList(false)}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        
        <button
          type="button"
          onClick={() => insertList(true)}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px bg-gray-300 mx-1"></div>

        {/* Quote */}
        <button
          type="button"
          onClick={() => formatText('formatBlock', 'blockquote')}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </button>

        {/* Link */}
        <button
          type="button"
          onClick={insertLink}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Insert Link"
        >
          <Link className="w-4 h-4" />
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="p-4 min-h-[200px] outline-none focus:outline-none"
        style={{
          lineHeight: '1.6',
          fontSize: '14px'
        }}
        suppressContentEditableWarning={true}
      />

      {/* Placeholder */}
      {(!value || value === '') && (
        <div 
          className="absolute top-[60px] left-4 text-gray-400 pointer-events-none"
          style={{ fontSize: '14px' }}
        >
          {placeholder}
        </div>
      )}

      <style jsx>{`
        [contenteditable] h1 {
          font-size: 1.5rem !important;
          font-weight: 600 !important;
          margin: 1rem 0 0.5rem 0 !important;
          line-height: 1.3 !important;
        }
        
        [contenteditable] h2 {
          font-size: 1.25rem !important;
          font-weight: 600 !important;
          margin: 1rem 0 0.5rem 0 !important;
          line-height: 1.3 !important;
        }
        
        [contenteditable] h3 {
          font-size: 1.125rem !important;
          font-weight: 600 !important;
          margin: 1rem 0 0.5rem 0 !important;
          line-height: 1.3 !important;
        }
        
        [contenteditable] p {
          margin: 0.5rem 0 !important;
        }
        
        [contenteditable] ul, [contenteditable] ol {
          margin: 0.5rem 0 !important;
          padding-left: 2rem !important;
        }
        
        [contenteditable] ul {
          list-style-type: disc !important;
        }
        
        [contenteditable] ol {
          list-style-type: decimal !important;
        }
        
        [contenteditable] blockquote {
          border-left: 4px solid #e5e7eb !important;
          margin: 1rem 0 !important;
          padding-left: 1rem !important;
          color: #6b7280 !important;
          font-style: italic !important;
        }
        
        [contenteditable] a {
          color: #2563eb !important;
          text-decoration: underline !important;
        }
        
        [contenteditable] a:hover {
          color: #1d4ed8 !important;
        }
      `}</style>
    </div>
  )
}

export default RichTextEditor