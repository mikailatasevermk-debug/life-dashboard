"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Placeholder from "@tiptap/extension-placeholder"
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Image as ImageIcon,
  Mic,
  Palette
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TipTapEditorProps {
  content?: any
  onChange?: (content: any) => void
  placeholder?: string
  className?: string
}

export function TipTapEditor({
  content,
  onChange,
  placeholder = "Start writing...",
  className
}: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON())
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[400px] p-4",
          className
        ),
      },
    },
  })

  if (!editor) {
    return null
  }

  const addImage = () => {
    const url = window.prompt("Enter image URL:")
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm">
      <div className="border-b border-gray-200 p-2 flex gap-1 flex-wrap">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            "p-2 rounded hover:bg-gray-100 transition-colors",
            editor.isActive("bold") && "bg-gray-100"
          )}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "p-2 rounded hover:bg-gray-100 transition-colors",
            editor.isActive("italic") && "bg-gray-100"
          )}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            "p-2 rounded hover:bg-gray-100 transition-colors",
            editor.isActive("bulletList") && "bg-gray-100"
          )}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            "p-2 rounded hover:bg-gray-100 transition-colors",
            editor.isActive("orderedList") && "bg-gray-100"
          )}
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <div className="w-px bg-gray-200 mx-1" />
        <button
          onClick={addImage}
          className="p-2 rounded hover:bg-gray-100 transition-colors"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => console.log("Record audio")}
          className="p-2 rounded hover:bg-gray-100 transition-colors"
        >
          <Mic className="w-4 h-4" />
        </button>
        <button
          onClick={() => console.log("Open doodle canvas")}
          className="p-2 rounded hover:bg-gray-100 transition-colors"
        >
          <Palette className="w-4 h-4" />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}