import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { Bold, Italic, Underline as UnderlineIcon } from 'lucide-react'

const RichTextEditor = ({ value, onChange, placeholder = "Write your content here..." }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[120px] px-3 py-2',
      },
    },
  })

  if (!editor) {
    return null
  }

  const toggleBold = () => editor.chain().focus().toggleBold().run()
  const toggleItalic = () => editor.chain().focus().toggleItalic().run()
  const toggleUnderline = () => editor.chain().focus().toggleUnderline().run()

  return (
    <div className="border border-gray-300 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleBold}
            className={`p-2 rounded-md hover:bg-gray-200 transition-colors ${
              editor.isActive('bold') ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={toggleItalic}
            className={`p-2 rounded-md hover:bg-gray-200 transition-colors ${
              editor.isActive('italic') ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={toggleUnderline}
            className={`p-2 rounded-md hover:bg-gray-200 transition-colors ${
              editor.isActive('underline') ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
            }`}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Editor Content */}
      <div className="bg-white relative">
        <EditorContent 
          editor={editor} 
          className="min-h-[120px] px-4 py-3 prose prose-sm max-w-none"
        />
        {!editor.getText() && (
          <div className="absolute top-3 left-4 pointer-events-none text-gray-400">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  )
}

export default RichTextEditor 