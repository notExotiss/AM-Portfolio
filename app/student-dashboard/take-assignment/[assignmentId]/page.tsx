'use client'

// This file is a simplified version of the test taking page, adapted for assignments
// Assignments don't have modules, so we use a single continuous flow

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { doc, getDoc, updateDoc, setDoc, collection } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { db, auth } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { 
  Pause, Play, ArrowLeft, ArrowRight, CheckCircle2, X, 
  ChevronDown, ChevronUp, Bookmark, BookmarkCheck, Highlighter,
  Calculator, FileText, MoreVertical, GripVertical
} from 'lucide-react'
import { format } from 'date-fns'
import 'katex/dist/katex.min.css'
import katex from 'katex'
// @ts-ignore - react-draggable Draggable type compatibility
import Draggable from 'react-draggable'

interface Question {
  id: string
  questionText: string
  questionImage?: string
  readingPassage?: string
  options: string[]
  correctAnswer: number
  section: 'english' | 'math'
  questionType?: 'multiple-choice' | 'open-ended'
}

interface Assignment {
  id: string
  title: string
  questions: Question[]
  timeLimitEnabled: boolean
  timeLimit?: number // in minutes
}

type AssignmentState = 'not-started' | 'in-progress' | 'completed'

type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink'

interface HighlightRange {
  start: number
  end: number
  id: string
  color: HighlightColor
}

const HIGHLIGHT_COLORS: Record<HighlightColor, string> = {
  yellow: '#fef08a',
  green: '#bbf7d0',
  blue: '#bfdbfe',
  pink: '#fbcfe8',
}

export default function TakeAssignmentPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(true)
  const [assignmentState, setAssignmentState] = useState<AssignmentState>('not-started')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number | string>>({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [showTimer, setShowTimer] = useState(true)
  const [showDirections, setShowDirections] = useState(false)
  const [showQuestionMenu, setShowQuestionMenu] = useState(false)
  const [highlightMode, setHighlightMode] = useState(false)
  const [showReferenceSheet, setShowReferenceSheet] = useState(false)
  const [showCalculator, setShowCalculator] = useState(false)
  const [showHighlightsNotes, setShowHighlightsNotes] = useState(false)
  const [dividerPosition, setDividerPosition] = useState(50)
  const [isDraggingDivider, setIsDraggingDivider] = useState(false)
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<string>>(new Set())
  const [crossedOutOptions, setCrossedOutOptions] = useState<Record<string, Set<number>>>({})
  const [openEndedAnswers, setOpenEndedAnswers] = useState<Record<string, string>>({})
  const [showCrossOutOptions, setShowCrossOutOptions] = useState(false)
  const [highlightToRemove, setHighlightToRemove] = useState<{questionId: string, targetKey: string, highlightId: string, position: {top: number, left: number}} | null>(null)
  const [highlights, setHighlights] = useState<Record<string, HighlightRange[]>>({})
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [showReviewPage, setShowReviewPage] = useState(false)
  const [studentName, setStudentName] = useState('Student')
  const [userId, setUserId] = useState<string | null>(null)
  const [hasStarted, setHasStarted] = useState(false)
  const [submittedScore, setSubmittedScore] = useState<string | null>(null)
  const dividerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadAssignment()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.assignmentId])

  useEffect(() => {
    if (!auth) return
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid)
        setStudentName(user.displayName || user.email?.split('@')[0] || 'Student')
      }
    })
    return () => unsubscribe()
  }, [])

  const loadAssignment = async () => {
    if (!db || !params.assignmentId) return

    try {
      const assignmentDoc = await getDoc(doc(db, 'assignments', params.assignmentId as string))
      if (assignmentDoc.exists()) {
        const data = assignmentDoc.data()
        setAssignment({
          id: assignmentDoc.id,
          title: data.title || '',
          questions: data.questions || [],
          timeLimitEnabled: data.timeLimitEnabled || false,
          timeLimit: data.timeLimit || 0,
        })
      }
    } catch (error) {
      console.error('Error loading assignment:', error)
      toast({
        title: 'Error',
        description: 'Failed to load assignment.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const saveProgress = async () => {
    if (!db || !assignment || !userId || assignmentState === 'not-started' || assignmentState === 'completed') return
    
    try {
      const progressRef = doc(collection(db, 'assignmentProgress'), `${assignment.id}_${userId}`)
      await setDoc(progressRef, {
        assignmentId: assignment.id,
        userId: userId,
        assignmentState: assignmentState,
        currentQuestionIndex: currentQuestionIndex,
        answers: answers,
        openEndedAnswers: openEndedAnswers,
        timeRemaining: timeRemaining,
        isPaused: isPaused,
        bookmarkedQuestions: Array.from(bookmarkedQuestions),
        crossedOutOptions: Object.fromEntries(
          Object.entries(crossedOutOptions).map(([k, v]) => [k, Array.from(v)])
        ),
        highlights: highlights,
        updatedAt: new Date(),
      } as any)
    } catch (error) {
      console.error('Error saving progress:', error)
    }
  }

  const normalizeHighlights = (rawHighlights: any): Record<string, HighlightRange[]> => {
    if (!rawHighlights || typeof rawHighlights !== 'object') {
      return {}
    }

    return Object.fromEntries(
      Object.entries(rawHighlights).map(([targetKey, value]) => {
        const safeValue = Array.isArray(value) ? value : []
        const normalized = safeValue
          .filter((item: any) => item && typeof item.start === 'number' && typeof item.end === 'number')
          .map((item: any) => {
            const color: HighlightColor =
              item.color === 'green' || item.color === 'blue' || item.color === 'pink' || item.color === 'yellow'
                ? item.color
                : 'yellow'
            return {
              start: item.start,
              end: item.end,
              id: typeof item.id === 'string' ? item.id : `${Date.now()}-${Math.random()}`,
              color,
            }
          })
        return [targetKey, normalized]
      })
    )
  }

  const getPassageTargetKey = (questionId: string) => questionId
  const getQuestionTargetKey = (questionId: string) => `${questionId}::question`
  const getOptionTargetKey = (questionId: string, optionIndex: number) => `${questionId}::option::${optionIndex}`

  const loadProgress = async () => {
    if (!db || !assignment || !userId) return
    
    try {
      const progressRef = doc(collection(db, 'assignmentProgress'), `${assignment.id}_${userId}`)
      const progressDoc = await getDoc(progressRef)
      
      if (progressDoc.exists()) {
        const data = progressDoc.data()
        setHasStarted(true)
        if (data.assignmentState && data.assignmentState !== 'completed') {
          setAssignmentState(data.assignmentState as AssignmentState)
          setCurrentQuestionIndex(data.currentQuestionIndex || 0)
          setAnswers(data.answers || {})
          setOpenEndedAnswers(data.openEndedAnswers || {})
          setTimeRemaining(data.timeRemaining || 0)
          setIsPaused(data.isPaused || false)
          setBookmarkedQuestions(new Set(data.bookmarkedQuestions || []))
          const crossedOut = data.crossedOutOptions || {}
          setCrossedOutOptions(
            Object.fromEntries(
              Object.entries(crossedOut).map(([k, v]) => [k, new Set(v as number[])])
            )
          )
          setHighlights(normalizeHighlights(data.highlights))
        }
      }
    } catch (error) {
      console.error('Error loading progress:', error)
    }
  }

  useEffect(() => {
    if (assignment && userId) {
      loadProgress()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignment, userId])

  useEffect(() => {
    if (assignment && userId && assignmentState !== 'not-started' && assignmentState !== 'completed') {
      const saveInterval = setInterval(() => {
        saveProgress()
      }, 30000)
      
      return () => clearInterval(saveInterval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignment, userId, assignmentState, answers, openEndedAnswers, timeRemaining, currentQuestionIndex, bookmarkedQuestions, crossedOutOptions, highlights])

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (assignment && userId && assignmentState !== 'not-started' && assignmentState !== 'completed') {
        saveProgress()
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (assignment && userId && assignmentState !== 'not-started' && assignmentState !== 'completed') {
        saveProgress()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignment, userId, assignmentState, answers, openEndedAnswers, timeRemaining, currentQuestionIndex, bookmarkedQuestions, crossedOutOptions, highlights])

  useEffect(() => {
    if (assignmentState !== 'not-started' && assignmentState !== 'completed' && timeRemaining > 0) {
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimeUp()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentState, timeRemaining])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingDivider && dividerRef.current) {
        const container = dividerRef.current.parentElement
        if (container) {
          const rect = container.getBoundingClientRect()
          const newPosition = ((e.clientX - rect.left) / rect.width) * 100
          setDividerPosition(Math.max(20, Math.min(80, newPosition)))
        }
      }
    }

    const handleMouseUp = () => {
      setIsDraggingDivider(false)
    }

    if (isDraggingDivider) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDraggingDivider])

  useEffect(() => {
    if (assignment && userId && assignmentState === 'completed') {
      const loadScore = async () => {
        if (!db) return
        try {
          const submissionDoc = await getDoc(doc(collection(db, 'assignmentSubmissions'), `${assignment.id}_${userId}`))
          if (submissionDoc.exists()) {
            setSubmittedScore(submissionDoc.data().score || 'N/A')
          }
        } catch (error) {
          console.error('Error loading score:', error)
        }
      }
      loadScore()
    }
  }, [assignment, userId, assignmentState])

  const startAssignment = async () => {
    const newState: AssignmentState = assignmentState === 'not-started' ? 'in-progress' : assignmentState
    setAssignmentState(newState)
    setHasStarted(true)
    if (assignment?.timeLimitEnabled && assignment.timeLimit) {
      if (timeRemaining === 0) {
        setTimeRemaining(assignment.timeLimit * 60)
      }
    }
    await saveProgress()
  }

  const handlePause = () => {
    setIsPaused(!isPaused)
  }

  const handleTimeUp = () => {
    toast({
      title: 'Time Up',
      description: 'Time has run out for this assignment.',
      variant: 'destructive',
    })
    handleSubmitAssignment()
  }

  const handleSubmitAssignment = async () => {
    if (!assignment || !db || !userId) return

    try {
      let correct = 0
      let total = assignment.questions.length
      const questionResults: Record<string, { correct: boolean, studentAnswer: number | string, correctAnswer: number | string }> = {}
      
      assignment.questions.forEach(question => {
        if (question.questionType === 'open-ended') {
          // Compare student answer with correct answer (normalize for comparison)
          const studentAnswer = openEndedAnswers[question.id]?.trim() || ''
          const correctAnswer = String(question.correctAnswer || '').trim()
          let isCorrect = false
          if (studentAnswer && correctAnswer) {
            // Normalize answers for comparison (handle fractions, decimals, etc.)
            const normalizedStudent = studentAnswer.replace(/\s+/g, '')
            const normalizedCorrect = correctAnswer.replace(/\s+/g, '')
            if (normalizedStudent === normalizedCorrect) {
              isCorrect = true
              correct++
            }
          }
          questionResults[question.id] = { correct: isCorrect, studentAnswer, correctAnswer }
        } else {
          const isCorrect = answers[question.id] === question.correctAnswer
          if (isCorrect) correct++
          questionResults[question.id] = { 
            correct: isCorrect, 
            studentAnswer: answers[question.id] ?? '', 
            correctAnswer: question.correctAnswer 
          }
        }
      })

      const score = `${correct}/${total} (${Math.round((correct / total) * 100)}%)`

      // Save to assignment document
      await updateDoc(doc(db, 'assignments', assignment.id), {
        completed: true,
        completedDate: new Date(),
        score: score,
        answers: answers,
        openEndedAnswers: openEndedAnswers,
      } as any)

      // Save student submission with results
      await setDoc(doc(collection(db, 'assignmentSubmissions'), `${assignment.id}_${userId}`), {
        assignmentId: assignment.id,
        userId: userId,
        studentName: studentName,
        score: score,
        correct: correct,
        total: total,
        answers: answers,
        openEndedAnswers: openEndedAnswers,
        questionResults: questionResults,
        submittedAt: new Date(),
      } as any)

      setAssignmentState('completed')
      toast({
        title: 'Assignment Submitted',
        description: `Your score: ${score}`,
      })
    } catch (error) {
      console.error('Error submitting assignment:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit assignment.',
        variant: 'destructive',
      })
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const toggleBookmark = (questionId: string) => {
    setBookmarkedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  const toggleCrossOut = (questionId: string, optionIndex: number) => {
    if (answers[questionId] === optionIndex) {
      const newAnswers = { ...answers }
      delete newAnswers[questionId]
      setAnswers(newAnswers)
    }
    setCrossedOutOptions(prev => {
      const newMap = { ...prev }
      if (!newMap[questionId]) {
        newMap[questionId] = new Set()
      }
      const optionSet = new Set(newMap[questionId])
      if (optionSet.has(optionIndex)) {
        optionSet.delete(optionIndex)
      } else {
        optionSet.add(optionIndex)
      }
      newMap[questionId] = optionSet
      return newMap
    })
  }

  const handleTextSelection = (targetKey: string, container: HTMLElement) => {
    if (!highlightMode) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return

    const range = selection.getRangeAt(0)
    if (!container.contains(range.commonAncestorContainer)) return

    const selectedText = selection.toString().trim()
    if (!selectedText) return

    const startRange = range.cloneRange()
    startRange.selectNodeContents(container)
    startRange.setEnd(range.startContainer, range.startOffset)
    const startOffset = startRange.toString().length

    const endRange = range.cloneRange()
    endRange.selectNodeContents(container)
    endRange.setEnd(range.endContainer, range.endOffset)
    const endOffset = endRange.toString().length

    if (endOffset <= startOffset) {
      selection.removeAllRanges()
      return
    }

    const highlightId = `${Date.now()}-${Math.random()}`
    setHighlights((prev) => ({
      ...prev,
      [targetKey]: [
        ...(prev[targetKey] || []),
        { start: startOffset, end: endOffset, id: highlightId, color: 'yellow' },
      ],
    }))
    setHighlightToRemove(null)
    selection.removeAllRanges()
  }

  const removeHighlight = (targetKey: string, highlightId: string) => {
    setHighlights((prev) => {
      if (!prev[targetKey]) return prev
      const nextHighlights = prev[targetKey].filter((highlight) => highlight.id !== highlightId)
      const next = { ...prev }
      if (nextHighlights.length > 0) {
        next[targetKey] = nextHighlights
      } else {
        delete next[targetKey]
      }
      return next
    })
  }

  const updateHighlightColor = (targetKey: string, highlightId: string, color: HighlightColor) => {
    setHighlights((prev) => {
      if (!prev[targetKey]) return prev
      return {
        ...prev,
        [targetKey]: prev[targetKey].map((highlight) =>
          highlight.id === highlightId ? { ...highlight, color } : highlight
        ),
      }
    })
  }

  const handleHighlightClick = (event: any) => {
    const target = event.target as HTMLElement
    const highlightMark = target.closest('mark[data-highlight-id]') as HTMLElement | null
    if (!highlightMark) return

    event.preventDefault()
    event.stopPropagation()

    const highlightId = highlightMark.getAttribute('data-highlight-id')
    const targetKey = highlightMark.getAttribute('data-highlight-target-key')
    const markQuestionId = highlightMark.getAttribute('data-question-id')
    if (!highlightId || !targetKey || !markQuestionId) return

    const rect = highlightMark.getBoundingClientRect()
    setHighlightToRemove({
      questionId: markQuestionId,
      targetKey,
      highlightId,
      position: {
        top: Math.max(8, rect.top - 52),
        left: rect.left + (rect.width / 2),
      },
    })
  }

  const renderContentWithHighlights = (content: string, questionId: string, targetKey: string) => {
    const targetHighlights = highlights[targetKey]
    if (!targetHighlights || targetHighlights.length === 0) {
      return content
    }

    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = content
    const sortedHighlights = [...targetHighlights].sort((a, b) => b.start - a.start)

    sortedHighlights.forEach((highlight) => {
      if (highlight.end <= highlight.start) return

      let currentPos = 0
      const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT, null)
      let node: Node | null = null
      let startNode: Node | null = null
      let endNode: Node | null = null
      let startOffset = 0
      let endOffset = 0

      while ((node = walker.nextNode())) {
        const nodeLength = node.textContent?.length || 0
        if (currentPos <= highlight.start && highlight.start < currentPos + nodeLength) {
          startNode = node
          startOffset = highlight.start - currentPos
        }
        if (currentPos <= highlight.end && highlight.end <= currentPos + nodeLength) {
          endNode = node
          endOffset = highlight.end - currentPos
          break
        }
        currentPos += nodeLength
      }

      if (startNode && endNode) {
        const range = document.createRange()
        range.setStart(startNode, startOffset)
        range.setEnd(endNode, endOffset)

        const mark = document.createElement('mark')
        mark.style.backgroundColor = HIGHLIGHT_COLORS[highlight.color || 'yellow']
        mark.style.cursor = 'pointer'
        mark.style.borderRadius = '2px'
        mark.style.padding = '0 1px'
        mark.setAttribute('data-highlight-id', highlight.id)
        mark.setAttribute('data-highlight-target-key', targetKey)
        mark.setAttribute('data-question-id', questionId)

        try {
          range.surroundContents(mark)
        } catch (error) {
          const contents = range.extractContents()
          mark.appendChild(contents)
          range.insertNode(mark)
        }
      }
    })

    return tempDiv.innerHTML
  }

  // Process math expressions in text (replace $...$ with KaTeX)
  const processMathInText = (text: string): string => {
    if (!text) return text
    // Process inline math: $...$
    const inlineMathRegex = /\$([^$]+)\$/g
    let processed = text.replace(inlineMathRegex, (match, formula) => {
      try {
        return katex.renderToString(formula.trim(), { throwOnError: false, displayMode: false })
      } catch (e) {
        return match
      }
    })
    
    // Process display math: $$...$$
    const displayMathRegex = /\$\$([^$]+)\$\$/g
    processed = processed.replace(displayMathRegex, (match, formula) => {
      try {
        return katex.renderToString(formula.trim(), { throwOnError: false, displayMode: true })
      } catch (e) {
        return match
      }
    })
    
    return processed
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.more-menu-container')) {
        setShowMoreMenu(false)
      }
      if (highlightToRemove && !target.closest('.highlight-menu') && !target.closest('mark[data-highlight-id]')) {
        setHighlightToRemove(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMoreMenu, highlightToRemove])

  const currentQuestion = assignment?.questions[currentQuestionIndex]
  const isEnglish = currentQuestion?.section === 'english'
  const isMath = currentQuestion?.section === 'math'
  const isOpenEnded = currentQuestion?.questionType === 'open-ended'
  const activeHighlightColor = highlightToRemove
    ? (highlights[highlightToRemove.targetKey]?.find((highlight) => highlight.id === highlightToRemove.highlightId)?.color || 'yellow')
    : 'yellow'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-xl">Loading assignment...</div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Assignment not found.</p>
          <Button onClick={() => router.push('/student-dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (assignmentState === 'not-started') {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="max-w-4xl w-full">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-4">{assignment.title}</h1>
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Assignment Details:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Total Questions: {assignment.questions.length}</li>
                {assignment.timeLimitEnabled && assignment.timeLimit && (
                  <li>Time Limit: {assignment.timeLimit} minutes</li>
                )}
              </ul>
            </div>
            <div className="flex gap-4">
              <Button onClick={startAssignment} className="bg-blue-600 hover:bg-blue-700">
                {hasStarted ? 'Resume Assignment' : 'Start Assignment'}
              </Button>
              <Button variant="outline" onClick={() => router.push('/student-dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show unscheduled break UI when paused
  if (isPaused && assignmentState === 'in-progress') {
    return (
      <div className="min-h-screen bg-[#2a2a2a] flex flex-col text-white relative">
        <div className="flex-1 flex items-center justify-between p-12">
          {/* Left side - Timer */}
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="text-gray-900 text-lg font-semibold mb-2">Time Remaining:</div>
              <div className="text-gray-900 text-5xl font-bold">{formatTime(timeRemaining)}</div>
            </div>
          </div>
          
          {/* Right side - Instructions */}
          <div className="flex-1 pl-12">
            <h1 className="text-3xl font-bold mb-6">Unscheduled Break</h1>
            <ul className="list-disc list-inside space-y-3 text-lg mb-8">
              <li>If you&apos;re testing with a laptop, don&apos;t close it.</li>
              <li>If time runs out while you&apos;re on break, your assignment will be submitted automatically.</li>
            </ul>
            <Button 
              onClick={() => setIsPaused(false)}
              className="bg-[#ffd23f] hover:bg-[#ffc800] text-black px-8 py-3 text-lg font-semibold rounded-lg"
            >
              Resume Testing
            </Button>
          </div>
        </div>
        
        {/* Student name at bottom left */}
        <div className="absolute bottom-4 left-4 text-white text-sm">
          {studentName}
        </div>
      </div>
    )
  }

  if (assignmentState === 'completed') {
    const score = submittedScore || 'N/A'
    
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <h1 className="text-3xl font-bold">Assignment Completed</h1>
            </div>
            <div className="mb-6">
              <p className="text-lg mb-4">You have successfully completed the assignment!</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-2 text-blue-900">Your Score</h2>
                <p className="text-3xl font-bold text-blue-600">{score}</p>
              </div>
            </div>
            <Button onClick={() => router.push('/student-dashboard')} className="bg-blue-600 hover:bg-blue-700">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (showReviewPage) {
    const answeredCount = assignment.questions.filter(q => answers[q.id] !== undefined || openEndedAnswers[q.id]).length
    const bookmarkedCount = assignment.questions.filter(q => bookmarkedQuestions.has(q.id)).length
    const unansweredCount = assignment.questions.length - answeredCount
    
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="px-6 py-3 relative" style={{ backgroundColor: '#eaedfc' }}>
          <div className="absolute bottom-0 left-0 right-0 h-px" style={{ 
            backgroundImage: 'repeating-linear-gradient(to right, #86858b 0px, #86858b 8px, transparent 8px, transparent 16px)',
            height: '1px'
          }}></div>
          <h2 className="text-sm font-semibold text-gray-900">Review Your Answers</h2>
        </header>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-4">Assignment Review</h1>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{answeredCount}</div>
                  <div className="text-sm text-gray-600">Answered</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{bookmarkedCount}</div>
                  <div className="text-sm text-gray-600">Bookmarked</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{unansweredCount}</div>
                  <div className="text-sm text-gray-600">Unanswered</div>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold mb-4">Question Overview</h3>
              <div className="grid grid-cols-10 gap-2">
                {assignment.questions.map((q, index) => {
                  const hasAnswer = answers[q.id] !== undefined || openEndedAnswers[q.id]
                  const isBookmarked = bookmarkedQuestions.has(q.id)
                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setShowReviewPage(false)
                        setCurrentQuestionIndex(index)
                      }}
                      className={`w-10 h-10 rounded border-2 flex items-center justify-center text-sm font-semibold ${
                        hasAnswer
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : isBookmarked
                          ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                          : 'border-gray-300 bg-gray-50 text-gray-700'
                      }`}
                      title={`Question ${index + 1}${isBookmarked ? ' (Bookmarked)' : ''}${hasAnswer ? ' (Answered)' : ''}`}
                    >
                      {index + 1}
                    </button>
                  )
                })}
              </div>
            </div>
            
            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => setShowReviewPage(false)}
                className="rounded-full"
              >
                Go Back
              </Button>
              <Button
                onClick={handleSubmitAssignment}
                className="rounded-full text-white"
                style={{ backgroundColor: '#314dcc' }}
              >
                Submit Assignment
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Header */}
      <header className="px-6 py-3 flex items-center justify-between relative" style={{ backgroundColor: '#eaedfc' }}>
        <div className="absolute bottom-0 left-0 right-0" style={{ 
          backgroundImage: 'repeating-linear-gradient(to right, #86858b 0px, #86858b 24px, transparent 24px, transparent 32px)',
          height: '3px'
        }}></div>
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-sm font-semibold leading-tight text-gray-900">
              {assignment?.title || (isEnglish ? 'Reading and Writing' : 'Math')}
            </h2>
            <button
              onClick={() => setShowDirections(!showDirections)}
              className="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1 mt-0.5"
            >
              Directions {showDirections ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>
        
        <div className="absolute left-1/2 transform -translate-x-1/2">
          {assignment.timeLimitEnabled && showTimer && (
            <div className="text-center">
              <h1 className="text-2xl font-bold leading-tight text-gray-900">{formatTime(timeRemaining)}</h1>
              <button
                onClick={() => setShowTimer(false)}
                className="text-xs text-gray-600 hover:text-gray-800 mt-0.5"
              >
                Hide
              </button>
            </div>
          )}
          {!showTimer && assignment.timeLimitEnabled && (
            <button
              onClick={() => setShowTimer(true)}
              className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 border border-gray-300 rounded"
            >
              Show Timer
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isEnglish && (
            <button
              onClick={() => setHighlightMode(!highlightMode)}
              className={`p-2 rounded ${highlightMode ? 'bg-blue-600' : 'hover:bg-blue-800'}`}
              title="Highlights & Notes"
            >
              <Highlighter className="w-5 h-5" />
            </button>
          )}
          
          {isMath && (
            <>
              <button
                onClick={() => setShowCalculator(!showCalculator)}
                className={`p-2 rounded ${showCalculator ? 'bg-blue-600' : 'hover:bg-blue-800'}`}
                title="Calculator"
              >
                <Calculator className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowReferenceSheet(!showReferenceSheet)}
                className={`p-2 rounded ${showReferenceSheet ? 'bg-blue-600' : 'hover:bg-blue-800'}`}
                title="Reference"
              >
                <FileText className="w-5 h-5" />
              </button>
            </>
          )}
          
          <div className="relative more-menu-container">
            <button 
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 rounded hover:bg-blue-800"
              title="More"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {showMoreMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl z-50 min-w-[200px]">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowHighlightsNotes(!showHighlightsNotes)
                      setShowMoreMenu(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Highlights & Notes
                  </button>
                  <button
                    onClick={() => {
                      handlePause()
                      setShowMoreMenu(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {isPaused ? 'Resume' : 'Pause'}
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm('Are you sure you want to exit? Your progress will be saved.')) {
                        await saveProgress()
                        router.push('/student-dashboard')
                      }
                      setShowMoreMenu(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Exit Assignment
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {showDirections && (
        <div className="bg-gray-100 border-b px-6 py-4">
          <div className="max-w-4xl mx-auto text-sm text-gray-700">
            {isEnglish ? (
              <div>
                <p className="font-semibold mb-3">DIRECTIONS</p>
                <p className="mb-2">The questions in this section address a number of important reading and writing skills.</p>
                <p className="mb-2">Each question includes one or more passages, which may include a table or graph.</p>
                <p className="mb-2">Read each passage and question carefully, and then choose the best answer to the question based on the passage(s).</p>
                <p>All questions in this section are multiple-choice with four answer choices. Each question has a single best answer.</p>
              </div>
            ) : (
              <div>
                <p className="font-semibold mb-3">DIRECTIONS</p>
                <p className="mb-2">The questions in this section address a number of important math skills.</p>
                <p className="mb-2">Use of a <strong>calculator is permitted for all questions</strong>. A reference sheet, calculator, and these directions can be accessed throughout the test.</p>
                <p className="mb-2 font-semibold">Unless otherwise indicated:</p>
                <ul className="list-disc list-inside mb-2 space-y-1">
                  <li>All variables and expressions represent <strong>real numbers</strong>.</li>
                  <li>Figures provided are drawn <strong>to scale</strong>.</li>
                  <li>All figures lie in a <strong>plane</strong>.</li>
                  <li>The domain of a given function <em>f</em> is the set of all <strong>real numbers <em>x</em> for which <em>f(x)</em> is a real number</strong>.</li>
                </ul>
                <p className="mb-2">For <strong>multiple-choice questions</strong>, solve each problem and choose the correct answer from the choices provided. Each multiple-choice question has a <strong>single correct answer</strong>.</p>
                <p>For <strong>student-produced response questions</strong>, solve each problem and enter your answer as described in the student-produced response directions.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden relative">
        {isEnglish && currentQuestion?.readingPassage && (
          <>
            <div 
              className="overflow-y-auto p-6 border-r"
              style={{ width: `${dividerPosition}%` }}
            >
              <div 
                className="prose max-w-none"
                data-question-id={currentQuestion.id}
                data-highlight-target-key={getPassageTargetKey(currentQuestion.id)}
                style={{ 
                  fontFamily: 'var(--font-noto-serif), serif',
                  userSelect: highlightMode ? 'text' : 'auto',
                  cursor: highlightMode ? 'text' : 'default'
                }}
                onMouseUp={(event) =>
                  handleTextSelection(getPassageTargetKey(currentQuestion.id), event.currentTarget)
                }
                onClick={handleHighlightClick}
                dangerouslySetInnerHTML={{ 
                  __html: renderContentWithHighlights(
                    currentQuestion.readingPassage || '',
                    currentQuestion.id,
                    getPassageTargetKey(currentQuestion.id)
                  )
                }}
              />
            </div>
            
            <div
              ref={dividerRef}
              className="w-1 bg-gray-300 cursor-col-resize hover:bg-gray-400 relative group"
              onMouseDown={() => setIsDraggingDivider(true)}
            >
              <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 flex items-center">
                <GripVertical className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100" />
              </div>
            </div>
          </>
        )}

        {isMath && isOpenEnded && (
          <div className="w-1/2 overflow-y-auto p-6 border-r bg-gray-50" style={{ width: '50%' }}>
            <h3 className="font-semibold mb-4">Student-produced response directions</h3>
            <p className="text-sm mb-3">For <strong>student-produced response questions</strong>, solve each problem and enter your answer as described below.</p>
            <ul className="text-sm space-y-2 mb-6">
              <li>• If you find more than one correct answer, <strong>enter only one answer</strong>.</li>
              <li>• You can enter up to <strong>5 characters for a positive answer</strong> and up to <strong>6 characters</strong> (including the negative sign) <strong>for a negative answer</strong>.</li>
              <li>• If your answer is a fraction that doesn&apos;t fit in the provided space, enter the <strong>decimal equivalent</strong>.</li>
              <li>• If your answer is a decimal that doesn&apos;t fit in the provided space, enter it by <strong>truncating or rounding at the fourth digit</strong>.</li>
              <li>• If your answer is a mixed number (such as 3<sup>1</sup>/<sub>2</sub>), enter it as an <strong>improper fraction</strong> (<sup>7</sup>/<sub>2</sub>) or its <strong>decimal equivalent</strong> (3.5).</li>
              <li>• <strong>Don&apos;t enter symbols</strong> such as a percent sign, comma, or dollar sign.</li>
            </ul>
            
            <div className="text-sm">
              <p className="font-semibold mb-2">EXAMPLES</p>
              <table className="w-full text-xs border-collapse border border-gray-300">
                <thead>
                  <tr className="border-b border-gray-300 bg-gray-100">
                    <th className="text-left p-2 border-r border-gray-300">Acceptable ways to enter answer</th>
                    <th className="text-left p-2">Unacceptable: will NOT receive credit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-300">
                    <td className="p-2 border-r border-gray-300 font-semibold">3.5</td>
                    <td className="p-2"></td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="p-2 border-r border-gray-300">3.50, <sup>7</sup>/<sub>2</sub></td>
                    <td className="p-2">3<sup>1</sup>/<sub>2</sub>, 3 1/2</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="p-2 border-r border-gray-300 font-semibold"><sup>2</sup>/<sub>3</sub></td>
                    <td className="p-2"></td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="p-2 border-r border-gray-300">0.66, .6666, .6667, 0.666, 0.667</td>
                    <td className="p-2">.66, 0.67, .67</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-gray-300 font-semibold">-<sup>1</sup>/<sub>3</sub></td>
                    <td className="p-2"></td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-gray-300">-1/3, -.3333, -0.333</td>
                    <td className="p-2">-.33, -0.33</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

         <div 
          className={`overflow-y-auto p-6 ${
            isMath && isOpenEnded ? 'w-1/2' : 
            isMath && !isOpenEnded ? 'flex-1' : 
            isEnglish && currentQuestion?.readingPassage ? 'flex-1' : 
            'w-full'
          }`}
          style={isMath && !isOpenEnded && showCalculator ? { marginLeft: '850px', maxWidth: 'calc(100% - 850px)' } : {}}
        >
          {!currentQuestion ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No questions available.</p>
            </div>
          ) : currentQuestion && (
            <div>
               <div className="flex items-center gap-4 mb-6 p-4 rounded-lg" style={{ backgroundColor: '#eaedfc' }}>
                 <div className="bg-black text-white w-10 h-10 flex items-center justify-center font-bold text-lg flex-shrink-0">
                   {currentQuestionIndex + 1}
                 </div>
                 <button
                   onClick={() => toggleBookmark(currentQuestion.id)}
                   className="p-1 hover:bg-gray-100 rounded flex items-center gap-2"
                   title="Bookmark"
                 >
                   {bookmarkedQuestions.has(currentQuestion.id) ? (
                     <BookmarkCheck className="w-5 h-5 text-blue-600 fill-blue-600" />
                   ) : (
                     <Bookmark className="w-5 h-5 text-gray-400" />
                   )}
                   <span className="text-sm">Mark for Review</span>
                 </button>
                 {isEnglish && !isOpenEnded && (
                   <button 
                     onClick={() => setShowCrossOutOptions(!showCrossOutOptions)}
                     className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm font-semibold ml-auto"
                   >
                     {showCrossOutOptions ? 'Hide Cross Out' : 'Cross Out Options'}
                   </button>
                 )}
               </div>

              <div
                className="prose max-w-none mb-6"
                data-question-id={currentQuestion.id}
                data-highlight-target-key={getQuestionTargetKey(currentQuestion.id)}
                style={{
                  fontFamily: 'var(--font-noto-serif), serif',
                  userSelect: isEnglish && highlightMode ? 'text' : 'auto',
                  cursor: isEnglish && highlightMode ? 'text' : 'default',
                }}
                onMouseUp={(event) => {
                  if (!isEnglish) return
                  handleTextSelection(getQuestionTargetKey(currentQuestion.id), event.currentTarget)
                }}
                onClick={isEnglish ? handleHighlightClick : undefined}
                dangerouslySetInnerHTML={{
                  __html: renderContentWithHighlights(
                    processMathInText(currentQuestion.questionText),
                    currentQuestion.id,
                    getQuestionTargetKey(currentQuestion.id)
                  ),
                }}
              />

               {currentQuestion.questionImage && (
                 <div className="mb-6 flex justify-center">
                   <img
                     src={currentQuestion.questionImage}
                     alt="Question"
                     className={`max-w-full max-h-[500px] w-auto h-auto rounded object-contain ${
                       isMath && !isOpenEnded ? 'max-w-[50%]' : isMath && isOpenEnded ? 'max-w-full' : ''
                     }`}
                     style={{ 
                       maxWidth: isMath && !isOpenEnded ? '50%' : isMath && isOpenEnded ? '100%' : '100%',
                       height: 'auto',
                       display: 'block',
                       margin: '0 auto'
                     }}
                   />
                 </div>
               )}

               {!isOpenEnded && (
                 <div className={`space-y-2 ${isMath ? 'max-w-[50%] mx-auto' : ''}`}>
                   {currentQuestion.options.map((option, index) => {
                     const isCrossedOut = crossedOutOptions[currentQuestion.id]?.has(index)
                     return (
                       <label
                         key={index}
                          className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors relative ${
                            answers[currentQuestion.id] === index
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          } ${isCrossedOut ? 'opacity-50' : ''}`}
                          onClick={(event) => {
                            if (isEnglish && highlightMode && !(event.target as HTMLElement).closest('button')) {
                              event.preventDefault()
                            }
                          }}
                        >
                         <div className="flex items-center gap-3 flex-1">
                           <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                             answers[currentQuestion.id] === index
                               ? 'border-blue-600 bg-blue-600'
                               : 'border-gray-400'
                           }`}>
                             {answers[currentQuestion.id] === index && (
                               <div className="w-3 h-3 rounded-full bg-white"></div>
                             )}
                           </div>
                           <input
                             type="radio"
                             name={`question-${currentQuestion.id}`}
                             checked={answers[currentQuestion.id] === index}
                             onChange={() => setAnswers({ ...answers, [currentQuestion.id]: index })}
                             className="sr-only"
                           />
                          <span className="font-semibold w-8 text-lg flex-shrink-0">{String.fromCharCode(65 + index)}</span>
                          <span 
                            className={`flex-1 ${isCrossedOut ? 'line-through' : ''}`}
                            data-question-id={currentQuestion.id}
                            data-highlight-target-key={getOptionTargetKey(currentQuestion.id, index)}
                            style={{
                              userSelect: isEnglish && highlightMode ? 'text' : 'auto',
                              cursor: isEnglish && highlightMode ? 'text' : 'default',
                            }}
                            onMouseUp={(event) => {
                              if (!isEnglish) return
                              handleTextSelection(
                                getOptionTargetKey(currentQuestion.id, index),
                                event.currentTarget
                              )
                            }}
                            onClick={isEnglish ? handleHighlightClick : undefined}
                            dangerouslySetInnerHTML={{
                              __html: renderContentWithHighlights(
                                processMathInText(option),
                                currentQuestion.id,
                                getOptionTargetKey(currentQuestion.id, index)
                              ),
                            }}
                          />
                         </div>
                         {isEnglish && showCrossOutOptions && (
                           <button
                             onClick={(e) => {
                               e.stopPropagation()
                               e.preventDefault()
                               toggleCrossOut(currentQuestion.id, index)
                             }}
                             className="p-2 hover:bg-gray-200 rounded text-gray-500 ml-2 flex-shrink-0"
                             title="Cross out option"
                           >
                             <X className="w-5 h-5" />
                           </button>
                         )}
                       </label>
                     )
                   })}
                 </div>
               )}

              {isOpenEnded && (
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      value={openEndedAnswers[currentQuestion.id] || ''}
                      onChange={(e) => setOpenEndedAnswers({
                        ...openEndedAnswers,
                        [currentQuestion.id]: e.target.value
                      })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-600 focus:outline-none"
                      placeholder="Enter your answer"
                      maxLength={6}
                    />
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="font-semibold mb-1">Answer Preview:</p>
                    <p className="font-mono text-lg">{openEndedAnswers[currentQuestion.id] || '(empty)'}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {highlightToRemove && highlightToRemove.questionId === currentQuestion?.id && (
        <div
          className="fixed bg-white border border-gray-300 rounded shadow-lg p-2 z-50 pointer-events-auto highlight-menu"
          style={{
            top: `${highlightToRemove.position.top}px`,
            left: `${highlightToRemove.position.left}px`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="flex items-center gap-1 mb-1">
            {(Object.keys(HIGHLIGHT_COLORS) as HighlightColor[]).map((color) => (
              <button
                key={color}
                onClick={() => {
                  updateHighlightColor(highlightToRemove.targetKey, highlightToRemove.highlightId, color)
                  setHighlightToRemove(null)
                }}
                className={`w-5 h-5 rounded border ${
                  activeHighlightColor === color ? 'border-gray-900' : 'border-gray-300'
                }`}
                style={{ backgroundColor: HIGHLIGHT_COLORS[color] }}
                title={`Set ${color} highlight`}
              />
            ))}
          </div>
          <button
            onClick={() => {
              removeHighlight(highlightToRemove.targetKey, highlightToRemove.highlightId)
              setHighlightToRemove(null)
            }}
            className="text-xs text-red-600 hover:text-red-800 px-2 py-1 whitespace-nowrap w-full text-left"
          >
            Remove Highlight
          </button>
        </div>
      )}

      <footer className="text-gray-900 px-6 py-3 flex items-center justify-between relative" style={{ backgroundColor: '#eaedfc' }}>
        <div className="absolute top-0 left-0 right-0" style={{ 
          backgroundImage: 'repeating-linear-gradient(to right, #86858b 0px, #86858b 24px, transparent 24px, transparent 32px)',
          height: '3px'
        }}></div>
        <div className="text-sm font-medium">{studentName}</div>
        
        <div className="flex-1 flex justify-center">
          <button
            onClick={() => setShowQuestionMenu(!showQuestionMenu)}
            className="flex items-center gap-2 px-3 py-1 rounded text-white"
            style={{ backgroundColor: '#1e1f1b' }}
          >
            <span className="text-sm">Question <span className="font-semibold">{currentQuestionIndex + 1}</span> of {assignment.questions.length}</span>
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
            style={{ backgroundColor: '#314dcc', color: 'white' }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={() => {
              if (currentQuestionIndex < assignment.questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1)
              } else {
                setShowReviewPage(true)
              }
            }}
            className="rounded-full text-white"
            style={{ backgroundColor: '#314dcc' }}
          >
            {currentQuestionIndex < assignment.questions.length - 1 ? (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              'Review'
            )}
          </Button>
        </div>
      </footer>

      {showQuestionMenu && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-white border-2 border-gray-300 rounded-lg shadow-xl p-6 z-50 max-w-4xl w-[90%]">
          <div className="mb-4 text-sm font-semibold text-gray-700">Select a question:</div>
          <div className="grid grid-cols-10 gap-2 max-h-96 overflow-y-auto">
            {assignment.questions.map((q, index) => {
              const hasAnswer = answers[q.id] !== undefined || openEndedAnswers[q.id]
              const isBookmarked = bookmarkedQuestions.has(q.id)
              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setCurrentQuestionIndex(index)
                    setShowQuestionMenu(false)
                  }}
                  className={`w-10 h-10 rounded border-2 flex items-center justify-center text-sm font-semibold ${
                    currentQuestionIndex === index
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : hasAnswer
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : isBookmarked
                      ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                      : 'border-gray-300 bg-gray-50 text-gray-700'
                  }`}
                  title={`Question ${index + 1}${isBookmarked ? ' (Bookmarked)' : ''}${hasAnswer ? ' (Answered)' : ''}`}
                >
                  {index + 1}
                </button>
              )
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 bg-blue-50 rounded"></div>
              <span>Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-green-500 bg-green-50 rounded"></div>
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-yellow-500 bg-yellow-50 rounded"></div>
              <span>Bookmarked</span>
            </div>
          </div>
        </div>
      )}

      {showReferenceSheet && (
        // @ts-ignore - react-draggable Draggable type compatibility
        <Draggable handle=".drag-handle" bounds="parent">
          <div className="fixed top-20 right-20 bg-white border-2 border-gray-300 rounded-lg shadow-2xl z-50 w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gray-100 px-4 py-2 flex items-center justify-between drag-handle cursor-move border-b">
              <span className="font-semibold text-sm">REFERENCE</span>
              <button
                onClick={() => setShowReferenceSheet(false)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto p-4">
              <img
                src="/referencesheet.jpg"
                alt="Reference Sheet"
                className="w-full h-auto"
              />
            </div>
          </div>
        </Draggable>
      )}

      {showCalculator && (
        // @ts-ignore - react-draggable Draggable type compatibility
        <Draggable handle=".drag-handle" bounds="parent">
          <div className="fixed top-20 right-20 bg-white border-2 border-gray-300 rounded-lg shadow-2xl z-50 w-[800px] h-[600px] flex flex-col">
            <div className="bg-gray-100 px-4 py-2 flex items-center justify-between drag-handle cursor-move border-b">
              <span className="font-semibold text-sm">Calculator</span>
              <button
                onClick={() => setShowCalculator(false)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1">
              <iframe
                src="https://www.desmos.com/testing/cb-sat-ap/graphing"
                className="w-full h-full border-0"
                title="Desmos Calculator"
                allow="clipboard-read; clipboard-write"
              />
            </div>
          </div>
        </Draggable>
      )}
    </div>
  )
}
