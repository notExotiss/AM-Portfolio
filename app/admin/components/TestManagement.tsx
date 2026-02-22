'use client'

import { useState, useEffect, useRef } from 'react'
import { collection, doc, getDocs, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Trash2, CalendarIcon, FileText, X, Edit, Save, ChevronLeft, ChevronRight, Users, Eye } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import TestQuestionEditor from './TestQuestionEditor'

interface Question {
  id: string
  questionText: string
  questionImage?: string
  readingPassage?: string
  options: string[]
  correctAnswer: number | string // Can be number for multiple choice or string for open-ended
  module?: number // Optional - assignments don't use modules
  section: 'english' | 'math'
  questionType?: 'multiple-choice' | 'open-ended'
}

interface Test {
  id?: string
  title: string
  description: string
  studentIds: string[] // Changed to array for multiple students
  studentNames?: string[]
  dueDate: Date | null
  assignedDate: Date | null
  questions: Question[]
  timeLimitEnabled: boolean
  englishModule1Time?: number
  englishModule2Time?: number
  mathModule1Time?: number
  mathModule2Time?: number
  breakTime?: number
}

interface Student {
  id: string
  name: string
  email: string
}

const DIGITAL_SAT_STRUCTURE = {
  english: {
    module1: { count: 27, defaultTime: 32 },
    module2: { count: 27, defaultTime: 32 },
  },
  math: {
    module1: { count: 22, defaultTime: 35 },
    module2: { count: 22, defaultTime: 35 },
  },
  breakTime: 10,
}

export default function TestManagement() {
  const [tests, setTests] = useState<Test[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedTest, setSelectedTest] = useState<Test | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingTest, setEditingTest] = useState<Test | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [activeModule, setActiveModule] = useState<'english-m1' | 'english-m2' | 'math-m1' | 'math-m2'>('english-m1')
  const [activeQuestionTab, setActiveQuestionTab] = useState<string | undefined>(undefined)
  const [activeModules, setActiveModules] = useState({
    englishM1: true,
    englishM2: true,
    mathM1: true,
    mathM2: true,
  })
  const [viewingSubmissions, setViewingSubmissions] = useState<Test | null>(null)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null)
  const [submissionActiveModule, setSubmissionActiveModule] = useState<'english-m1' | 'english-m2' | 'math-m1' | 'math-m2'>('english-m1')
  const { toast } = useToast()

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
    if (!db) return
    
    try {
      const studentsRef = collection(db, 'students')
      const studentsSnapshot = await getDocs(query(studentsRef, orderBy('name')))
      const studentsList: Student[] = []
      studentsSnapshot.forEach((doc) => {
        const data = doc.data()
        studentsList.push({
          id: doc.id,
          name: data.name || '',
          email: data.email || '',
        })
      })
      setStudents(studentsList)

      const testsRef = collection(db, 'tests')
      const q = query(testsRef, orderBy('assignedDate', 'desc'))
      const querySnapshot = await getDocs(q)
      
      const testsList: Test[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        const studentIds = data.studentIds || (data.studentId ? [data.studentId] : [])
        const studentNames = studentIds.map((sid: string) => {
          const student = studentsList.find(s => s.id === sid)
          return student?.name || 'Unknown'
        })
        
        testsList.push({
          id: doc.id,
          title: data.title || '',
          description: data.description || '',
          studentIds: studentIds,
          studentNames: studentNames,
          dueDate: data.dueDate ? data.dueDate.toDate() : null,
          assignedDate: data.assignedDate ? data.assignedDate.toDate() : null,
          questions: data.questions || [],
          timeLimitEnabled: data.timeLimitEnabled !== false,
          englishModule1Time: data.englishModule1Time || DIGITAL_SAT_STRUCTURE.english.module1.defaultTime,
          englishModule2Time: data.englishModule2Time || DIGITAL_SAT_STRUCTURE.english.module2.defaultTime,
          mathModule1Time: data.mathModule1Time || DIGITAL_SAT_STRUCTURE.math.module1.defaultTime,
          mathModule2Time: data.mathModule2Time || DIGITAL_SAT_STRUCTURE.math.module2.defaultTime,
          breakTime: data.breakTime || DIGITAL_SAT_STRUCTURE.breakTime,
        })
      })

      setTests(testsList)
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load data.',
        variant: 'destructive',
      })
    }
  }

  const handleNewTest = () => {
    const newTest: Test = {
      title: '',
      description: '',
      studentIds: [],
      dueDate: null,
      assignedDate: new Date(),
      questions: [],
      timeLimitEnabled: true,
      englishModule1Time: DIGITAL_SAT_STRUCTURE.english.module1.defaultTime,
      englishModule2Time: DIGITAL_SAT_STRUCTURE.english.module2.defaultTime,
      mathModule1Time: DIGITAL_SAT_STRUCTURE.math.module1.defaultTime,
      mathModule2Time: DIGITAL_SAT_STRUCTURE.math.module2.defaultTime,
      breakTime: DIGITAL_SAT_STRUCTURE.breakTime,
    }
    setSelectedTest(newTest)
    setEditingTest(newTest)
    setShowForm(true)
    setCurrentQuestionIndex(0)
  }

  const handleEditTest = (test: Test) => {
    setSelectedTest(test)
    setEditingTest({ ...test })
    setShowForm(true)
    setActiveModule('english-m1')
    // Find first question in English Module 1, or default to 0
    const firstEngM1Index = test.questions.findIndex(q => q.section === 'english' && q.module === 1)
    setCurrentQuestionIndex(firstEngM1Index >= 0 ? firstEngM1Index : 0)
  }


  const handleViewSubmissions = async (test: Test) => {
    if (!db || !test.id) return
    
    try {
      setViewingSubmissions(test)
      const submissionsRef = collection(db, 'testSubmissions')
      const q = query(submissionsRef, orderBy('submittedAt', 'desc'))
      const querySnapshot = await getDocs(q)
      
      const submissionsList: any[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        if (data.testId === test.id) {
          submissionsList.push({
            id: doc.id,
            ...data,
            submittedAt: data.submittedAt?.toDate() || null,
          })
        }
      })
      
      setSubmissions(submissionsList)
      if (submissionsList.length > 0) {
        setSelectedSubmission(submissionsList[0])
        setSubmissionActiveModule('english-m1')
      }
    } catch (error) {
      console.error('Error loading submissions:', error)
      toast({
        title: 'Error',
        description: 'Failed to load submissions.',
        variant: 'destructive',
      })
    }
  }

  const initializeQuestions = (test: Test): Test => {
    const questions: Question[] = []
    
    if (activeModules.englishM1) {
      for (let i = 1; i <= DIGITAL_SAT_STRUCTURE.english.module1.count; i++) {
        questions.push({
          id: `eng-m1-q${i}`,
          questionText: '',
          readingPassage: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          module: 1,
          section: 'english',
          questionType: 'multiple-choice',
        })
      }
    }
    
    if (activeModules.englishM2) {
      for (let i = 1; i <= DIGITAL_SAT_STRUCTURE.english.module2.count; i++) {
        questions.push({
          id: `eng-m2-q${i}`,
          questionText: '',
          readingPassage: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          module: 2,
          section: 'english',
          questionType: 'multiple-choice',
        })
      }
    }
    
    if (activeModules.mathM1) {
      for (let i = 1; i <= DIGITAL_SAT_STRUCTURE.math.module1.count; i++) {
        questions.push({
          id: `math-m1-q${i}`,
          questionText: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          module: 1,
          section: 'math',
          questionType: 'multiple-choice',
        })
      }
    }
    
    if (activeModules.mathM2) {
      for (let i = 1; i <= DIGITAL_SAT_STRUCTURE.math.module2.count; i++) {
        questions.push({
          id: `math-m2-q${i}`,
          questionText: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          module: 2,
          section: 'math',
          questionType: 'multiple-choice',
        })
      }
    }
    
    return { ...test, questions }
  }

  const handleSaveTest = async () => {
    if (!db || !editingTest || !editingTest.title) {
      toast({
        title: 'Error',
        description: 'Please fill in the test title.',
        variant: 'destructive',
      })
      return
    }

    try {
      let testToSave = editingTest
      if (testToSave.questions.length === 0) {
        testToSave = initializeQuestions(testToSave)
      }

      // Get student emails for security rules
      const studentEmails = (testToSave.studentIds || []).map((sid: string) => {
        const student = students.find(s => s.id === sid)
        return student?.email || ''
      }).filter((email: string) => email !== '')
      
      const testData = {
        title: testToSave.title,
        description: testToSave.description,
        studentIds: testToSave.studentIds || [],
        studentEmails: studentEmails, // Store emails for security rules
        dueDate: testToSave.dueDate || null,
        assignedDate: testToSave.assignedDate || new Date(),
        questions: testToSave.questions,
        timeLimitEnabled: testToSave.timeLimitEnabled,
        englishModule1Time: testToSave.englishModule1Time,
        englishModule2Time: testToSave.englishModule2Time,
        mathModule1Time: testToSave.mathModule1Time,
        mathModule2Time: testToSave.mathModule2Time,
        breakTime: testToSave.breakTime,
        completed: false,
      }

      if (editingTest.id) {
        const docRef = doc(db, 'tests', editingTest.id)
        await setDoc(docRef, testData as any)
        toast({
          title: 'Success',
          description: 'Test updated successfully!',
        })
      } else {
        const testsRef = collection(db, 'tests')
        const newDocRef = doc(testsRef)
        await setDoc(newDocRef, testData as any)
        toast({
          title: 'Success',
          description: 'Test created successfully!',
        })
      }

      await loadData()
      setShowForm(false)
      setSelectedTest(null)
      setEditingTest(null)
      setCurrentQuestionIndex(0)
    } catch (error) {
      console.error('Error saving test:', error)
      toast({
        title: 'Error',
        description: 'Failed to save test.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (testId: string) => {
    if (!db || !confirm('Are you sure you want to delete this test?')) {
      return
    }

    try {
      await deleteDoc(doc(db, 'tests', testId))
      toast({
        title: 'Success',
        description: 'Test deleted successfully!',
      })
      await loadData()
    } catch (error) {
      console.error('Error deleting test:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete test.',
        variant: 'destructive',
      })
    }
  }

  const updateQuestion = (questionId: string, updatedQuestion: Question) => {
    if (!editingTest) return
    const updatedQuestions = editingTest.questions.map(q =>
      q.id === questionId ? updatedQuestion : q
    )
    setEditingTest({ ...editingTest, questions: updatedQuestions })
  }

  const deleteQuestion = (questionId: string) => {
    if (!editingTest) return
    const updatedQuestions = editingTest.questions.filter(q => q.id !== questionId)
    setEditingTest({ ...editingTest, questions: updatedQuestions })
    if (currentQuestionIndex >= updatedQuestions.length) {
      setCurrentQuestionIndex(Math.max(0, updatedQuestions.length - 1))
    }
  }

  const addQuestion = () => {
    if (!editingTest) return
    // Determine module and section from activeModule
    const moduleSection = activeModule.startsWith('english') ? 'english' : 'math'
    const moduleNumber = activeModule === 'english-m1' || activeModule === 'math-m1' ? 1 : 2
    
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      module: moduleNumber,
      section: moduleSection,
      questionType: 'multiple-choice',
    }
    const newQuestions = [...editingTest.questions, newQuestion]
    const newIndex = newQuestions.length - 1
    // Update both states together
    setEditingTest({ ...editingTest, questions: newQuestions })
    setCurrentQuestionIndex(newIndex)
  }

  const toggleStudent = (studentId: string) => {
    if (!editingTest) return
    const currentIds = editingTest.studentIds || []
    if (currentIds.includes(studentId)) {
      setEditingTest({
        ...editingTest,
        studentIds: currentIds.filter(id => id !== studentId),
      })
    } else {
      setEditingTest({
        ...editingTest,
        studentIds: [...currentIds, studentId],
      })
    }
  }

  // Separate unassigned tests
  const unassignedTests = tests.filter(test => !test.studentIds || test.studentIds.length === 0)
  
  // Group assigned tests by student
  const testsByStudent = new Map<string, Test[]>()
  tests.forEach(test => {
    if (test.studentIds && test.studentIds.length > 0) {
      test.studentIds.forEach(studentId => {
        if (!testsByStudent.has(studentId)) {
          testsByStudent.set(studentId, [])
        }
        testsByStudent.get(studentId)!.push(test)
      })
    }
  })

  if (showForm && editingTest) {
    // Initialize questions if needed
    if (editingTest.questions.length === 0) {
      const initialized = initializeQuestions(editingTest)
      setEditingTest(initialized)
    }

    const currentQuestion = editingTest.questions[currentQuestionIndex]
    const totalQuestions = editingTest.questions.length

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Create/Edit Test</h2>
          <Button variant="outline" onClick={() => {
            setShowForm(false)
            setSelectedTest(null)
            setEditingTest(null)
            setCurrentQuestionIndex(0)
          }}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>

        {/* Test Information Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={editingTest.title}
                onChange={(e) => setEditingTest({ ...editingTest, title: e.target.value })}
                className="mt-1"
                placeholder="Test title"
              />
            </div>

            <div>
              <Label>Description</Label>
              <textarea
                value={editingTest.description}
                onChange={(e) => setEditingTest({ ...editingTest, description: e.target.value })}
                className="mt-1 flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Test description..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Assigned Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full mt-1 justify-start text-left font-normal",
                        !editingTest.assignedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editingTest.assignedDate ? (
                        format(editingTest.assignedDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editingTest.assignedDate || undefined}
                      onSelect={(date) => setEditingTest({ ...editingTest, assignedDate: date || new Date() })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Due Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full mt-1 justify-start text-left font-normal",
                        !editingTest.dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editingTest.dueDate ? (
                        format(editingTest.dueDate, "PPP")
                      ) : (
                        <span>Pick a date (optional)</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editingTest.dueDate || undefined}
                      onSelect={(date) => setEditingTest({ ...editingTest, dueDate: date || null })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Module Toggles */}
            <div className="border-t pt-4">
              <Label className="mb-3 block">Modules to Include</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="eng-m1"
                    checked={activeModules.englishM1}
                    onCheckedChange={(checked: boolean) => setActiveModules({ ...activeModules, englishM1: checked })}
                  />
                  <Label htmlFor="eng-m1" className="cursor-pointer">English M1</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="eng-m2"
                    checked={activeModules.englishM2}
                    onCheckedChange={(checked: boolean) => setActiveModules({ ...activeModules, englishM2: checked })}
                  />
                  <Label htmlFor="eng-m2" className="cursor-pointer">English M2</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="math-m1"
                    checked={activeModules.mathM1}
                    onCheckedChange={(checked: boolean) => setActiveModules({ ...activeModules, mathM1: checked })}
                  />
                  <Label htmlFor="math-m1" className="cursor-pointer">Math M1</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="math-m2"
                    checked={activeModules.mathM2}
                    onCheckedChange={(checked: boolean) => setActiveModules({ ...activeModules, mathM2: checked })}
                  />
                  <Label htmlFor="math-m2" className="cursor-pointer">Math M2</Label>
                </div>
              </div>
              <Button
                onClick={() => {
                  const initialized = initializeQuestions(editingTest)
                  setEditingTest(initialized)
                }}
                className="mt-4"
                variant="outline"
              >
                Initialize Questions
              </Button>
            </div>

            {/* Time Limit Settings */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <Label>Enable Time Limits</Label>
                <Switch
                  checked={editingTest.timeLimitEnabled}
                  onCheckedChange={(checked: boolean) => setEditingTest({ ...editingTest, timeLimitEnabled: checked })}
                />
              </div>

              {editingTest.timeLimitEnabled && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <Label>English M1 (min)</Label>
                    <Input
                      type="number"
                      value={editingTest.englishModule1Time}
                      onChange={(e) => setEditingTest({ ...editingTest, englishModule1Time: parseInt(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>English M2 (min)</Label>
                    <Input
                      type="number"
                      value={editingTest.englishModule2Time}
                      onChange={(e) => setEditingTest({ ...editingTest, englishModule2Time: parseInt(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Math M1 (min)</Label>
                    <Input
                      type="number"
                      value={editingTest.mathModule1Time}
                      onChange={(e) => setEditingTest({ ...editingTest, mathModule1Time: parseInt(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Math M2 (min)</Label>
                    <Input
                      type="number"
                      value={editingTest.mathModule2Time}
                      onChange={(e) => setEditingTest({ ...editingTest, mathModule2Time: parseInt(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Assign to Students */}
            <div className="border-t pt-4">
              <Label className="mb-3 block">Assign to Students</Label>
              <div className="max-h-40 overflow-y-auto border rounded p-3 space-y-2">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`student-${student.id}`}
                      checked={editingTest.studentIds?.includes(student.id) || false}
                      onCheckedChange={() => toggleStudent(student.id)}
                    />
                    <Label htmlFor={`student-${student.id}`} className="cursor-pointer flex-1">
                      {student.name} ({student.email})
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleSaveTest} className="w-full bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Save Test
            </Button>
          </CardContent>
        </Card>

        {/* Question Tabs */}
        {totalQuestions > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Questions</CardTitle>
                <Button variant="outline" onClick={addQuestion}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeModule} onValueChange={(value: string) => {
                const newModule = value as 'english-m1' | 'english-m2' | 'math-m1' | 'math-m2'
                setActiveModule(newModule)
              }}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="english-m1">English Module 1</TabsTrigger>
                  <TabsTrigger value="english-m2">English Module 2</TabsTrigger>
                  <TabsTrigger value="math-m1">Math Module 1</TabsTrigger>
                  <TabsTrigger value="math-m2">Math Module 2</TabsTrigger>
                </TabsList>
                
                {(['english-m1', 'english-m2', 'math-m1', 'math-m2'] as const).map((module) => {
                  const moduleQuestions = editingTest.questions.filter(q => {
                    if (module === 'english-m1') return q.section === 'english' && q.module === 1
                    if (module === 'english-m2') return q.section === 'english' && q.module === 2
                    if (module === 'math-m1') return q.section === 'math' && q.module === 1
                    if (module === 'math-m2') return q.section === 'math' && q.module === 2
                    return false
                  })
                  
                  // Get the module section and number for creating new questions
                  const moduleSection = module.startsWith('english') ? 'english' : 'math'
                  const moduleNumber = module === 'english-m1' || module === 'math-m1' ? 1 : 2
                  
                  // Determine how many question slots to show (at least 27, or more if questions exist)
                  const questionSlots = Math.max(27, moduleQuestions.length)
                  
                  // Get the currently selected question in this module
                  const currentQuestionInModule = currentQuestionIndex >= 0 && currentQuestionIndex < editingTest.questions.length
                    ? editingTest.questions[currentQuestionIndex]
                    : null
                  const isCurrentQuestionInThisModule = currentQuestionInModule && 
                    currentQuestionInModule.section === moduleSection && 
                    currentQuestionInModule.module === moduleNumber
                  
                  // Determine the active tab value
                  const activeTabValue = activeQuestionTab && moduleQuestions.find(q => `q-${q.id}` === activeQuestionTab)
                    ? activeQuestionTab
                    : isCurrentQuestionInThisModule && currentQuestionInModule
                    ? `q-${currentQuestionInModule.id}`
                    : moduleQuestions.length > 0
                    ? `q-${moduleQuestions[0].id}`
                    : undefined
                  
                  return (
                    <TabsContent key={module} value={module} className="mt-4">
                      <Tabs 
                        value={activeTabValue}
                        onValueChange={(value: string) => {
                          setActiveQuestionTab(value)
                          const questionId = value.replace('q-', '')
                          const questionIndex = editingTest.questions.findIndex(q => q.id === questionId)
                          if (questionIndex >= 0) {
                            setCurrentQuestionIndex(questionIndex)
                          }
                        }}
                      >
                        <TabsList className="flex-wrap h-auto gap-1 mb-4">
                          {Array.from({ length: questionSlots }, (_, idx) => {
                            const question = moduleQuestions[idx]
                            const questionId = question?.id || `new-${idx}`
                            const questionTabValue = `q-${questionId}`
                            
                            return (
                              <TabsTrigger 
                                key={questionId}
                                value={questionTabValue}
                                onClick={() => {
                                  if (!question) {
                                    // Create new question for this position
                                    const newQuestion: Question = {
                                      id: `q-${Date.now()}-${idx}`,
                                      questionText: '',
                                      options: ['', '', '', ''],
                                      correctAnswer: 0,
                                      module: moduleNumber,
                                      section: moduleSection,
                                      questionType: 'multiple-choice' as const,
                                    }
                                    const allQuestions = [...editingTest.questions, newQuestion]
                                    const newIndex = allQuestions.length - 1
                                    setEditingTest({ ...editingTest, questions: allQuestions })
                                    setCurrentQuestionIndex(newIndex)
                                    setActiveQuestionTab(`q-${newQuestion.id}`)
                                  } else {
                                    setActiveQuestionTab(`q-${question.id}`)
                                    const questionIndex = editingTest.questions.findIndex(q => q.id === question.id)
                                    if (questionIndex >= 0) {
                                      setCurrentQuestionIndex(questionIndex)
                                    }
                                  }
                                }}
                                className="min-w-[50px]"
                              >
                                {idx + 1}
                              </TabsTrigger>
                            )
                          })}
                        </TabsList>
                        
                        {moduleQuestions.map((question) => {
                          const questionTabValue = `q-${question.id}`
                          
                          return (
                            <TabsContent key={questionTabValue} value={questionTabValue}>
                              <TestQuestionEditor
                                question={question}
                                onUpdate={(updated) => updateQuestion(question.id, updated)}
                                onDelete={() => deleteQuestion(question.id)}
                              />
                            </TabsContent>
                          )
                        })}
                        
                        {/* Empty state for new questions */}
                        {moduleQuestions.length === 0 && (
                          <div className="text-center py-12 text-gray-500">
                            <p>Click on a question number above to create a question.</p>
                          </div>
                        )}
                      </Tabs>
                    </TabsContent>
                  )
                })}
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Tests</h2>
          <p className="text-gray-600 text-sm">Create and manage Digital SAT tests</p>
        </div>
        <Button onClick={handleNewTest} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Test
        </Button>
      </div>

      {tests.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">No tests yet</h3>
          <p className="text-gray-600 mb-6">Create your first Digital SAT test</p>
          <Button onClick={handleNewTest} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create First Test
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Unassigned Tests */}
          {unassignedTests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  Unassigned Tests
                </CardTitle>
                <CardDescription>Tests that haven&apos;t been assigned to any students yet</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {unassignedTests.map((test) => (
                    <div key={test.id} className="border-l-4 border-gray-500 pl-4 py-3 bg-gray-50 rounded-r">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{test.title}</h3>
                            <Badge>{test.questions.length} questions</Badge>
                            {test.timeLimitEnabled && <Badge variant="secondary">Timed</Badge>}
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{test.description}</p>
                          <div className="flex gap-4 text-xs text-gray-500">
                            {test.assignedDate && (
                              <span>Created: {format(test.assignedDate, 'MMM dd, yyyy')}</span>
                            )}
                            {test.dueDate && (
                              <span>Due: {format(test.dueDate, 'MMM dd, yyyy')}</span>
                            )}
                          </div>
                        </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewSubmissions(test)}
                              title="View Submissions"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditTest(test)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => test.id && handleDelete(test.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Assigned Tests by Student */}
          {Array.from(testsByStudent.entries()).map(([studentId, studentTests]) => {
            const student = students.find(s => s.id === studentId)
            return (
              <Card key={studentId}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-red-600" />
                    {student?.name || 'Unknown Student'}
                  </CardTitle>
                  <CardDescription>{student?.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {studentTests.map((test) => (
                      <div key={test.id} className="border-l-4 border-red-500 pl-4 py-3 bg-gray-50 rounded-r">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{test.title}</h3>
                              <Badge>{test.questions.length} questions</Badge>
                              {test.timeLimitEnabled && <Badge variant="secondary">Timed</Badge>}
                              {test.studentIds && test.studentIds.length > 1 && (
                                <Badge variant="outline">
                                  <Users className="w-3 h-3 mr-1" />
                                  {test.studentIds.length} students
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{test.description}</p>
                            <div className="flex gap-4 text-xs text-gray-500">
                              {test.assignedDate && (
                                <span>Assigned: {format(test.assignedDate, 'MMM dd, yyyy')}</span>
                              )}
                              {test.dueDate && (
                                <span>Due: {format(test.dueDate, 'MMM dd, yyyy')}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewSubmissions(test)}
                              title="View Submissions"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditTest(test)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => test.id && handleDelete(test.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* View Submissions Modal */}
      {viewingSubmissions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Submissions: {viewingSubmissions.title}</CardTitle>
                  <CardDescription>{submissions.length} submission{submissions.length !== 1 ? 's' : ''}</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => {
                  setViewingSubmissions(null)
                  setSubmissions([])
                  setSelectedSubmission(null)
                }}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden flex flex-col">
              {submissions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No submissions yet.</p>
                </div>
              ) : (
                <div className="flex gap-4 h-full overflow-hidden">
                  {/* Student List */}
                  <div className="w-64 border-r pr-4 overflow-y-auto">
                    <h3 className="font-semibold mb-3">Students</h3>
                    <div className="space-y-2">
                      {submissions.map((submission) => (
                        <button
                          key={submission.id}
                          onClick={() => {
                            setSelectedSubmission(submission)
                            setSubmissionActiveModule('english-m1')
                          }}
                          className={`w-full text-left p-3 rounded border-2 transition-colors ${
                            selectedSubmission?.id === submission.id
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-semibold">{submission.studentName}</div>
                          {submission.score && (
                            <div className="text-sm font-medium text-blue-600 mt-1">
                              Score: {submission.score}
                            </div>
                          )}
                          {submission.submittedAt && (
                            <div className="text-xs text-gray-500 mt-1">
                              {format(submission.submittedAt, 'MMM dd, yyyy HH:mm')}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Question View */}
                  {selectedSubmission && viewingSubmissions && (
                    <div className="flex-1 overflow-y-auto flex flex-col">
                      <Tabs value={submissionActiveModule} onValueChange={(value: string) => {
                        setSubmissionActiveModule(value as 'english-m1' | 'english-m2' | 'math-m1' | 'math-m2')
                      }}>
                        <TabsList className="grid w-full grid-cols-4 mb-4">
                          <TabsTrigger value="english-m1">English Module 1</TabsTrigger>
                          <TabsTrigger value="english-m2">English Module 2</TabsTrigger>
                          <TabsTrigger value="math-m1">Math Module 1</TabsTrigger>
                          <TabsTrigger value="math-m2">Math Module 2</TabsTrigger>
                        </TabsList>
                        
                        {(['english-m1', 'english-m2', 'math-m1', 'math-m2'] as const).map((module) => {
                          const questionsByModule = (viewingSubmissions.questions || []).filter((q: any) => {
                            if (module === 'english-m1') return q.section === 'english' && q.module === 1
                            if (module === 'english-m2') return q.section === 'english' && q.module === 2
                            if (module === 'math-m1') return q.section === 'math' && q.module === 1
                            if (module === 'math-m2') return q.section === 'math' && q.module === 2
                            return false
                          })
                          
                          return (
                            <TabsContent key={module} value={module}>
                              <h3 className="text-lg font-semibold mb-4">{selectedSubmission.studentName}&apos;s Answers</h3>
                              
                              <div className="space-y-8">
                                {questionsByModule.map((question: any, index: number) => {
                                  const questionResult = selectedSubmission.questionResults?.[question.id]
                                  const studentAnswer = question.questionType === 'open-ended' 
                                    ? selectedSubmission.openEndedAnswers?.[question.id]
                                    : selectedSubmission.answers?.[question.id]
                                  const isCorrect = questionResult?.correct || false
                                  const correctAnswer = question.correctAnswer
                                  
                                  return (
                                    <div key={question.id} className="space-y-4 pb-8 border-b last:border-b-0">
                                      <div className="p-4 rounded-lg" style={{ backgroundColor: '#eaedfc' }}>
                                        <div className="flex items-center gap-2 mb-2">
                                          <div className="bg-black text-white w-8 h-8 flex items-center justify-center font-bold text-sm">
                                            {index + 1}
                                          </div>
                                          <Badge className={isCorrect ? 'bg-green-600' : 'bg-red-600'}>
                                            {isCorrect ? 'Correct' : 'Incorrect'}
                                          </Badge>
                                        </div>
                                      </div>
                                      
                                      <div
                                        className="prose max-w-none mb-4"
                                        dangerouslySetInnerHTML={{ __html: question.questionText }}
                                      />
                                      
                                      {question.questionImage && (
                                        <div className="mb-4">
                                          <img
                                            src={question.questionImage}
                                            alt="Question"
                                            className="max-w-full max-h-[400px] rounded"
                                          />
                                        </div>
                                      )}
                                      
                                      {question.readingPassage && (
                                        <div className="mb-4 p-4 border rounded bg-gray-50">
                                          <div
                                            className="prose max-w-none"
                                            dangerouslySetInnerHTML={{ __html: question.readingPassage }}
                                          />
                                        </div>
                                      )}
                                      
                                      {question.questionType === 'open-ended' ? (
                                        <div className="space-y-2">
                                          <div className="p-4 border-2 rounded-lg">
                                            <div className="text-sm text-gray-600 mb-1">Student Answer:</div>
                                            <div className="text-lg font-mono">{studentAnswer || '(empty)'}</div>
                                          </div>
                                          <div className={`p-4 border-2 rounded-lg ${isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                                            <div className="text-sm text-gray-600 mb-1">Correct Answer:</div>
                                            <div className="text-lg font-mono">{String(correctAnswer)}</div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="space-y-2">
                                          {question.options.map((option: string, optIndex: number) => {
                                            const isSelected = studentAnswer === optIndex
                                            const isCorrectOption = correctAnswer === optIndex
                                            return (
                                              <div
                                                key={optIndex}
                                                className={`p-4 border-2 rounded-lg ${
                                                  isCorrectOption
                                                    ? 'border-green-500 bg-green-50'
                                                    : isSelected
                                                    ? 'border-red-500 bg-red-50'
                                                    : 'border-gray-200'
                                                }`}
                                              >
                                                <div className="flex items-center gap-2">
                                                  <span className="font-semibold w-6">{String.fromCharCode(65 + optIndex)}</span>
                                                  <span>{option}</span>
                                                  {isCorrectOption && (
                                                    <Badge className="ml-auto bg-green-600">Correct</Badge>
                                                  )}
                                                  {isSelected && !isCorrectOption && (
                                                    <Badge className="ml-auto bg-red-600">Selected</Badge>
                                                  )}
                                                </div>
                                              </div>
                                            )
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </TabsContent>
                          )
                        })}
                      </Tabs>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
