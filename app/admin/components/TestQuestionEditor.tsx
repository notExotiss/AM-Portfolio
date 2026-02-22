'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bold, Italic, Underline as UnderlineIcon, Image as ImageIcon, X } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import 'katex/dist/katex.min.css'

interface Question {
  id: string
  questionText: string
  questionImage?: string
  readingPassage?: string // For English questions
  options: string[]
  correctAnswer: number | string // Can be number for multiple choice or string for open-ended
  module?: number // Optional - assignments don&apos;t use modules
  section: 'english' | 'math'
  questionType?: 'multiple-choice' | 'open-ended'
}

interface TestQuestionEditorProps {
  question: Question
  onUpdate: (question: Question) => void
  onDelete: () => void
}

export default function TestQuestionEditor({ question, onUpdate, onDelete }: TestQuestionEditorProps) {
  const [showImageInput, setShowImageInput] = useState(false)
  const [imageUrl, setImageUrl] = useState(question.questionImage || '')
  const [showReadingPassageEditor, setShowReadingPassageEditor] = useState(!!question.readingPassage)
  const isUpdatingFromProps = useRef(false)

  const questionEditor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Underline,
      TextStyle,
    ],
    content: question.questionText,
    onUpdate: ({ editor }) => {
      if (isUpdatingFromProps.current) return
      const currentContent = editor.getHTML()
      onUpdate({
        ...question,
        questionText: currentContent,
      })
    },
  })

  const passageEditor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Underline,
      TextStyle,
    ],
    content: question.readingPassage || '',
    onUpdate: ({ editor }) => {
      if (isUpdatingFromProps.current) return
      const currentContent = editor.getHTML()
      onUpdate({
        ...question,
        readingPassage: currentContent,
      })
    },
  })

  // Update editors when question prop changes (only if content is different to avoid loops)
  useEffect(() => {
    if (questionEditor) {
      const currentContent = questionEditor.getHTML()
      const newContent = question.questionText || ''
      // Only update if content is actually different
      if (currentContent !== newContent) {
        isUpdatingFromProps.current = true
        questionEditor.commands.setContent(newContent)
        // Reset flag after a short delay to allow the update to complete
        setTimeout(() => {
          isUpdatingFromProps.current = false
        }, 0)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id, question.questionText])

  useEffect(() => {
    if (passageEditor) {
      const currentContent = passageEditor.getHTML()
      const newContent = question.readingPassage || ''
      // Only update if content is actually different
      if (currentContent !== newContent) {
        isUpdatingFromProps.current = true
        passageEditor.commands.setContent(newContent)
        // Reset flag after a short delay to allow the update to complete
        setTimeout(() => {
          isUpdatingFromProps.current = false
        }, 0)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id, question.readingPassage])

  useEffect(() => {
    setImageUrl(question.questionImage || '')
  }, [question.questionImage])

  useEffect(() => {
    setShowReadingPassageEditor(!!question.readingPassage)
  }, [question.readingPassage])

  const addImage = () => {
    if (imageUrl) {
      onUpdate({
        ...question,
        questionImage: imageUrl,
      })
      setShowImageInput(false)
      setImageUrl('')
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...question.options]
    newOptions[index] = value
    onUpdate({
      ...question,
      options: newOptions,
    })
  }

  const setCorrectAnswer = (index: number) => {
    onUpdate({
      ...question,
      correctAnswer: index,
    })
  }

  const setQuestionType = (type: 'multiple-choice' | 'open-ended') => {
    onUpdate({
      ...question,
      questionType: type,
      options: type === 'open-ended' ? [] : question.options.length > 0 ? question.options : ['', '', '', ''],
    })
  }

  if (!questionEditor) {
    return null
  }

  const isOpenEnded = question.questionType === 'open-ended'
  const isEnglish = question.section === 'english'

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Question {question.id} - {question.section === 'english' ? 'English' : 'Math'}
            {question.module ? ` Module ${question.module}` : ''}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onDelete} className="text-red-600">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Question Type and Section Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Question Type</Label>
            <Select
              value={question.questionType || 'multiple-choice'}
              onValueChange={(value: 'multiple-choice' | 'open-ended') => setQuestionType(value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                <SelectItem value="open-ended">Open-Ended (Student-Produced Response)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {!question.module && (
            <div>
              <Label>Section</Label>
              <Select
                value={question.section}
                onValueChange={(value: 'english' | 'math') => {
                  onUpdate({ ...question, section: value })
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="math">Math</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Reading Passage Editor (English only) */}
        {isEnglish && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Reading Passage (Optional)</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReadingPassageEditor(!showReadingPassageEditor)}
              >
                {showReadingPassageEditor ? 'Hide' : 'Show'} Passage Editor
              </Button>
            </div>
            {showReadingPassageEditor && passageEditor && (
              <div>
                <div className="border rounded p-2 min-h-[200px] mb-2">
                  {/* @ts-ignore - Tiptap EditorContent type compatibility */}
                  <EditorContent editor={passageEditor} />
                </div>
                <div className="flex gap-2 p-2 border rounded mb-2">
                  <Button
                    variant={passageEditor.isActive('bold') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => passageEditor.chain().focus().toggleBold().run()}
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={passageEditor.isActive('italic') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => passageEditor.chain().focus().toggleItalic().run()}
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={passageEditor.isActive('underline') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => passageEditor.chain().focus().toggleUnderline().run()}
                  >
                    <UnderlineIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rich Text Editor Toolbar */}
        <div>
          <Label>Question Text</Label>
          <div className="flex gap-2 p-2 border rounded mb-2">
            <Button
              variant={questionEditor.isActive('bold') ? 'default' : 'outline'}
              size="sm"
              onClick={() => questionEditor.chain().focus().toggleBold().run()}
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              variant={questionEditor.isActive('italic') ? 'default' : 'outline'}
              size="sm"
              onClick={() => questionEditor.chain().focus().toggleItalic().run()}
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              variant={questionEditor.isActive('underline') ? 'default' : 'outline'}
              size="sm"
              onClick={() => questionEditor.chain().focus().toggleUnderline().run()}
            >
              <UnderlineIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowImageInput(!showImageInput)}
            >
              <ImageIcon className="w-4 h-4" />
            </Button>
          </div>

          {/* Image Input */}
          {showImageInput && (
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Image URL or base64"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <Button onClick={addImage} size="sm">Add Image</Button>
            </div>
          )}

          {/* Question Text Editor */}
          <div className="border rounded p-2 min-h-[100px]">
            {/* @ts-ignore - Tiptap EditorContent type compatibility */}
            <EditorContent editor={questionEditor} />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Use $inline math$ for inline math and $$block math$$ for block math
          </p>
        </div>

          {/* Question Image Display */}
        {question.questionImage && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Question Image</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUpdate({ ...question, questionImage: undefined })}
                className="text-red-600"
              >
                <X className="w-4 h-4 mr-1" />
                Remove Image
              </Button>
            </div>
            <img src={question.questionImage} alt="Question" className="mt-2 max-w-full h-auto rounded border" />
          </div>
        )}

        {/* Answer Options (Multiple Choice only) */}
        {!isOpenEnded && (
          <div>
            <Label>Answer Options</Label>
            <div className="space-y-2 mt-2">
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${question.id}`}
                    checked={question.correctAnswer === index}
                    onChange={() => setCorrectAnswer(index)}
                    className="w-4 h-4"
                  />
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Open-Ended Answer */}
        {isOpenEnded && (
          <div>
            <Label>Correct Answer</Label>
            <Input
              value={question.correctAnswer !== undefined ? String(question.correctAnswer) : ''}
              onChange={(e) => {
                const value = e.target.value
                onUpdate({
                  ...question,
                  correctAnswer: value ? value : '',
                })
              }}
              placeholder="Enter the correct answer (e.g., 3.5, 2/3, -1/3)"
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the correct answer for this open-ended question. Students&apos; answers will be compared to this value.
            </p>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded mt-2">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Open-ended questions will automatically show the student-produced response instructions sidebar when students take the test.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
