'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextStyle from '@tiptap/extension-text-style'
import TextAlign from '@tiptap/extension-text-align'
import Color from '@tiptap/extension-color'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Image from '@tiptap/extension-image'
import { ProcessedImage, processImage, revokeImageUrls } from '@/lib/image-utils'
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Heading1,
  Heading2,
  Quote
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Toggle } from "@/components/ui/toggle"
import { toast } from "sonner"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  onSave?: () => void
  onCancel?: () => void
  placeholder?: string
  className?: string
  minHeight?: string
  disabled?: boolean
  onImageUpload?: (files: File[]) => Promise<string[]>
  onImagesChange?: (images: ProcessedImage[]) => void
}

export function RichTextEditor({ 
  content, 
  onChange,
  onSave,
  onCancel,
  placeholder = 'Write something...',
  className,
  minHeight = '500px',
  disabled = false,
  onImageUpload,
  onImagesChange
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState('')
  const [localImages, setLocalImages] = useState<ProcessedImage[]>([])

  useEffect(() => {
    return () => {
      localImages.forEach(image => revokeImageUrls(image))
    }
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: {
          depth: 100,
          newGroupDelay: 500
        },
        heading: {
          levels: [1, 2]
        },
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc pl-6 mb-4'
          }
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal pl-6 mb-4'
          }
        }
      }),
      TextStyle,
      Color,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline'
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-2xl mx-auto cursor-pointer transition-transform hover:scale-105',
          loading: 'lazy'
        },
        allowBase64: true
      })
    ],
    content: content || '<p></p>',
    editable: !disabled,
    autofocus: 'end',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none',
          'prose-img:mx-auto prose-img:max-h-96 prose-img:object-contain',
          'prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4',
          'prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4',
          'prose-p:mb-4',
          'prose-headings:mt-4 prose-headings:mb-2'
        ),
        style: `min-height: ${minHeight}`
      }
    }
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '<p></p>')
    }
  }, [content, editor])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editor) return

    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    try {
      console.log('Processing files for upload:', files.map(f => ({ name: f.name, type: f.type, size: f.size })))
      
      const newImages = await Promise.all(files.map(processImage))
      console.log('Processed images:', newImages)
      
      newImages.forEach(image => {
        console.log('Inserting image into editor:', {
          id: image.id,
          thumbnailUrl: image.thumbnailUrl
        })

        // Insert image with data attributes to help with URL replacement
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'image',
            attrs: {
              src: image.thumbnailUrl,
              alt: image.file.name,
              title: image.file.name,
              'data-local-id': image.id,
              class: 'rounded-lg max-w-2xl mx-auto cursor-pointer transition-transform hover:scale-105',
              loading: 'lazy'
            }
          })
          .run()
      })

      const updatedImages = [...localImages, ...newImages]
      console.log('Updated local images state:', updatedImages)
      
      setLocalImages(updatedImages)
      onImagesChange?.(updatedImages)

      toast.success(`Added ${files.length} image${files.length > 1 ? 's' : ''}`)
    } catch (error) {
      console.error("Error processing images:", error)
      toast.error("Failed to process images")
    }

    e.target.value = ""
  }

  useEffect(() => {
    if (!editor) return

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (target.tagName === 'IMG') {
        const imageId = target.getAttribute('data-id')
        const image = localImages.find(img => img.id === imageId)
        if (image) {
          window.open(image.originalUrl, '_blank')
        }
      }
    }

    const editorElement = editor.view.dom
    editorElement.addEventListener('click', handleClick)

    return () => {
      editorElement.removeEventListener('click', handleClick)
    }
  }, [editor, localImages])

  if (!editor) {
    return null
  }

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run()
      setLinkUrl('')
    }
  }

  return (
    <div className={cn("border rounded-md flex flex-col bg-background", className)}>
      <div className="border-b p-2 flex flex-wrap gap-1 bg-muted/50 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
        >
          <Heading2 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-muted' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-muted' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'bg-muted' : ''}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-muted' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-muted' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-muted' : ''}
        >
          <Quote className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'bg-muted' : ''}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'bg-muted' : ''}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'bg-muted' : ''}
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm">
              <LinkIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="flex gap-2">
              <Input
                placeholder="Enter URL"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addLink()}
              />
              <Button onClick={addLink}>Add</Button>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm">
              <Palette className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40">
            <div className="grid grid-cols-5 gap-1">
              {['#000000', '#ef4444', '#22c55e', '#3b82f6', '#a855f7'].map((color) => (
                <button
                  key={color}
                  className="w-6 h-6 rounded-md border"
                  style={{ backgroundColor: color }}
                  onClick={() => editor.chain().focus().setColor(color).run()}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <div className="relative">
          <Toggle size="sm" asChild>
            <label htmlFor="image-upload" className="cursor-pointer">
              <ImageIcon className="h-4 w-4" />
            </label>
          </Toggle>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            multiple
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleImageUpload}
          />
        </div>
      </div>

      <EditorContent 
        editor={editor} 
        className="p-4 flex-1 overflow-auto"
      />

      {(onSave || onCancel) && (
        <div className="border-t p-2 flex justify-end gap-2 bg-muted/50 flex-shrink-0">
          {onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
          {onSave && (
            <Button size="sm" onClick={onSave}>
              Save
            </Button>
          )}
        </div>
      )}
    </div>
  )
} 