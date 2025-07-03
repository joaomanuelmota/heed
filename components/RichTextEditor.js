'use client'
import { useRef, useEffect } from 'react'
import { Bold, Italic, List, ListOrdered, Quote, Link } from 'lucide-react'
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';

const RichTextEditor = ({ value, onChange, placeholder = "Write your notes here..." }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        blockquote: false,
        codeBlock: false,
        heading: false,
        horizontalRule: false,
        listItem: false,
        hardBreak: false,
      }),
      Underline,
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'min-h-[120px] p-4 outline-none',
      },
    },
  });

  // Atualiza o conteúdo se value mudar externamente
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
    }
  }, [value]);

  if (!editor) return <div className="border border-gray-300 rounded-lg bg-white p-4 text-gray-400">Carregando editor...</div>;

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-2 bg-gray-50 flex flex-wrap gap-1">
        <button type="button" onClick={() => editor.chain().focus().setParagraph().run()} className={`p-2 rounded ${editor.isActive('paragraph') ? 'bg-blue-100' : 'hover:bg-gray-200'}`}>Normal</button>
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded ${editor.isActive('bold') ? 'bg-blue-100' : 'hover:bg-gray-200'}`}>B</button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded ${editor.isActive('italic') ? 'bg-blue-100' : 'hover:bg-gray-200'}`}>I</button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-2 rounded ${editor.isActive('underline') ? 'bg-blue-100' : 'hover:bg-gray-200'}`}>U</button>
      </div>
      <EditorContent editor={editor} />
      {/* Placeholder custom */}
      {(!value || value === '') && (
        <div className="absolute top-[60px] left-4 text-gray-400 pointer-events-none" style={{ fontSize: '14px' }}>{placeholder}</div>
      )}
    </div>
  );
};

export default RichTextEditor