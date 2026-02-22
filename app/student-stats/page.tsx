'use client'

import { useState, useEffect } from 'react'
import { User, onAuthStateChanged, signOut } from 'firebase/auth'
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Plus, Trash2, CalendarIcon, User as UserIcon, Mail, Phone, Users } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface StudentData {
  id?: string
  name: string
  email: string
  phone: string
  parentContact: string
  satTarget: string
  testDate: Date | null
  goals: string
  strengths: string
  weaknesses: string
  math: {
    currentScore: string
    accuracy: string
    errorType: string
    pacingNotes: string
    nextSessionFocus: string
  }
  reading: {
    currentScore: string
    accuracy: string
    errorType: string
    pacingNotes: string
    nextSessionFocus: string
  }
  writing: {
    currentScore: string
    accuracy: string
    errorType: string
    pacingNotes: string
    nextSessionFocus: string
  }
  sessions: Array<{
    date: Date | null
    topicsCovered: string
    strategiesTaught: string
    homeworkAssigned: string
    notes: string
  }>
  errors: string
  practiceTests: string
  growthSummary: string
  createdAt?: Date
  updatedAt?: Date
}

const initialStudentData: StudentData = {
  name: '',
  email: '',
  phone: '',
  parentContact: '',
  satTarget: '',
  testDate: null,
  goals: '',
  strengths: '',
  weaknesses: '',
  math: {
    currentScore: '',
    accuracy: '',
    errorType: '',
    pacingNotes: '',
    nextSessionFocus: '',
  },
  reading: {
    currentScore: '',
    accuracy: '',
    errorType: '',
    pacingNotes: '',
    nextSessionFocus: '',
  },
  writing: {
    currentScore: '',
    accuracy: '',
    errorType: '',
    pacingNotes: '',
    nextSessionFocus: '',
  },
  sessions: [],
  errors: '',
  practiceTests: '',
  growthSummary: '',
}

export default function StudentStats() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [students, setStudents] = useState<StudentData[]>([])
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null)
  const [view, setView] = useState<'list' | 'detail'>('list')
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      router.push('/sign-in')
      return
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || user.email !== 'iamaaritmalhotra@gmail.com') {
        router.push('/sign-in')
        return
      }
      setUser(user)
      setLoading(false)
      await loadStudents()
    })

    return () => unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const loadStudents = async () => {
    if (!db) {
      console.error('Firestore is not initialized')
      return
    }
    
    try {
      const studentsRef = collection(db, 'students')
      const q = query(studentsRef, orderBy('name'))
      const querySnapshot = await getDocs(q)
      const studentsList: StudentData[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        studentsList.push({
          id: doc.id,
          ...data,
          testDate: data.testDate ? data.testDate.toDate() : null,
          sessions: (data.sessions || []).map((s: any) => ({
            ...s,
            date: s.date ? s.date.toDate() : null,
          })),
        } as StudentData)
      })
      
      setStudents(studentsList)
    } catch (error) {
      console.error('Error loading students:', error)
      toast({
        title: 'Error Loading Students',
        description: 'Failed to load students. Please refresh the page.',
        variant: 'destructive',
      })
    }
  }

  const handleSelectStudent = (student: StudentData) => {
    setSelectedStudent({ ...student })
    setView('detail')
  }

  const handleNewStudent = () => {
    setSelectedStudent({ ...initialStudentData })
    setView('detail')
  }

  const handleSave = async () => {
    if (!user || !db || !selectedStudent) {
      toast({
        title: 'Configuration Error',
        description: 'Firebase is not configured. Please set up your environment variables.',
        variant: 'destructive',
      })
      return
    }
    
    setSaving(true)
    try {
      const studentData = {
        ...selectedStudent,
        testDate: selectedStudent.testDate || null,
        sessions: selectedStudent.sessions.map(s => ({
          ...s,
          date: s.date || null,
        })),
        updatedAt: new Date(),
      }
      
      // Remove id from data before saving
      const { id, ...dataToSave } = studentData
      
      if (selectedStudent.id) {
        // Update existing student
        const docRef = doc(db, 'students', selectedStudent.id)
        await updateDoc(docRef, dataToSave as any)
        toast({
          title: 'Success',
          description: 'Student data saved successfully!',
        })
      } else {
        // Create new student
        const studentsRef = collection(db, 'students')
        const newDocRef = doc(studentsRef)
        await setDoc(newDocRef, {
          ...dataToSave,
          createdAt: new Date(),
        } as any)
        toast({
          title: 'Success',
          description: 'New student created successfully!',
        })
      }
      
      await loadStudents()
      setView('list')
    } catch (error) {
      console.error('Error saving data:', error)
      toast({
        title: 'Error Saving Data',
        description: 'Failed to save data. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (studentId: string) => {
    if (!db || !confirm('Are you sure you want to delete this student?')) {
      return
    }
    
    try {
      await deleteDoc(doc(db, 'students', studentId))
      toast({
        title: 'Success',
        description: 'Student deleted successfully!',
      })
      await loadStudents()
      if (selectedStudent?.id === studentId) {
        setView('list')
        setSelectedStudent(null)
      }
    } catch (error) {
      console.error('Error deleting student:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete student.',
        variant: 'destructive',
      })
    }
  }

  const handleSignOut = async () => {
    if (!auth) {
      router.push('/sign-in')
      return
    }
    try {
      await signOut(auth)
      router.push('/sign-in')
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        title: 'Error',
        description: 'Failed to sign out.',
        variant: 'destructive',
      })
    }
  }

  const addSession = () => {
    if (!selectedStudent) return
    setSelectedStudent({
      ...selectedStudent,
      sessions: [
        ...selectedStudent.sessions,
        {
          date: null,
          topicsCovered: '',
          strategiesTaught: '',
          homeworkAssigned: '',
          notes: '',
        },
      ],
    })
  }

  const updateSession = (index: number, field: keyof StudentData['sessions'][0], value: string | Date | null) => {
    if (!selectedStudent) return
    const updatedSessions = [...selectedStudent.sessions]
    updatedSessions[index] = { ...updatedSessions[index], [field]: value }
    setSelectedStudent({ ...selectedStudent, sessions: updatedSessions })
  }

  const removeSession = (index: number) => {
    if (!selectedStudent) return
    const updatedSessions = selectedStudent.sessions.filter((_, i) => i !== index)
    setSelectedStudent({ ...selectedStudent, sessions: updatedSessions })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  // Student List View
  if (view === 'list') {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-black mb-2 text-black">Student Management</h1>
              <p className="text-gray-600">Manage all your students in one place</p>
            </div>
            <div className="flex gap-4">
              <Button onClick={handleNewStudent} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Student
              </Button>
              <Button variant="outline" onClick={() => router.push('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>

          {students.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">No students yet</h3>
              <p className="text-gray-600 mb-6">Get started by adding your first student</p>
              <Button onClick={handleNewStudent} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add First Student
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map((student) => (
                <Card
                  key={student.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleSelectStudent(student)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{student.name || 'Unnamed Student'}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <Mail className="w-3 h-3" />
                            {student.email || 'No email'}
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (student.id) handleDelete(student.id)
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {student.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          {student.phone}
                        </div>
                      )}
                      {student.satTarget && (
                        <div className="text-gray-600">
                          <span className="font-semibold">SAT Target:</span> {student.satTarget}
                        </div>
                      )}
                      {student.testDate && (
                        <div className="text-gray-600">
                          <span className="font-semibold">Test Date:</span> {format(student.testDate, 'MMM dd, yyyy')}
                        </div>
                      )}
                      <div className="text-gray-600">
                        <span className="font-semibold">Sessions:</span> {student.sessions.length}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Student Detail View
  if (!selectedStudent) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => {
              setView('list')
              setSelectedStudent(null)
            }}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Students
          </Button>
          <div className="flex gap-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-black mb-8 text-black">
          {selectedStudent.id ? 'Edit Student' : 'New Student'}
        </h1>

        {/* Student Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>Basic information about the student</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={selectedStudent.name}
                  onChange={(e) => setSelectedStudent({ ...selectedStudent, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={selectedStudent.email}
                  onChange={(e) => setSelectedStudent({ ...selectedStudent, email: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={selectedStudent.phone}
                  onChange={(e) => setSelectedStudent({ ...selectedStudent, phone: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="parentContact">Parent Contact</Label>
                <Input
                  id="parentContact"
                  value={selectedStudent.parentContact}
                  onChange={(e) => setSelectedStudent({ ...selectedStudent, parentContact: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="satTarget">SAT Target</Label>
                <Input
                  id="satTarget"
                  value={selectedStudent.satTarget}
                  onChange={(e) => setSelectedStudent({ ...selectedStudent, satTarget: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="testDate">Test Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="testDate"
                      variant="outline"
                      className={cn(
                        "w-full mt-1 justify-start text-left font-normal",
                        !selectedStudent.testDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedStudent.testDate ? (
                        format(selectedStudent.testDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedStudent.testDate || undefined}
                      onSelect={(date) => setSelectedStudent({ ...selectedStudent, testDate: date || null })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="goals">Goals</Label>
                <textarea
                  id="goals"
                  value={selectedStudent.goals}
                  onChange={(e) => setSelectedStudent({ ...selectedStudent, goals: e.target.value })}
                  className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="strengths">Strengths</Label>
                <textarea
                  id="strengths"
                  value={selectedStudent.strengths}
                  onChange={(e) => setSelectedStudent({ ...selectedStudent, strengths: e.target.value })}
                  className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="weaknesses">Weaknesses</Label>
                <textarea
                  id="weaknesses"
                  value={selectedStudent.weaknesses}
                  onChange={(e) => setSelectedStudent({ ...selectedStudent, weaknesses: e.target.value })}
                  className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Diagnostic & Score Tracking */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Diagnostic & Score Tracking</CardTitle>
            <CardDescription>Track performance across Math, Reading, and Writing sections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Math Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-600">Math</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Current Score</Label>
                    <Input
                      value={selectedStudent.math.currentScore}
                      onChange={(e) => setSelectedStudent({
                        ...selectedStudent,
                        math: { ...selectedStudent.math, currentScore: e.target.value }
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Accuracy</Label>
                    <Input
                      value={selectedStudent.math.accuracy}
                      onChange={(e) => setSelectedStudent({
                        ...selectedStudent,
                        math: { ...selectedStudent.math, accuracy: e.target.value }
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Error Type (C/K/T)</Label>
                    <Input
                      value={selectedStudent.math.errorType}
                      onChange={(e) => setSelectedStudent({
                        ...selectedStudent,
                        math: { ...selectedStudent.math, errorType: e.target.value }
                      })}
                      className="mt-1"
                      placeholder="C = Careless, K = Knowledge, T = Timing"
                    />
                  </div>
                  <div>
                    <Label>Pacing Notes</Label>
                    <Input
                      value={selectedStudent.math.pacingNotes}
                      onChange={(e) => setSelectedStudent({
                        ...selectedStudent,
                        math: { ...selectedStudent.math, pacingNotes: e.target.value }
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Next Session Focus</Label>
                    <textarea
                      value={selectedStudent.math.nextSessionFocus}
                      onChange={(e) => setSelectedStudent({
                        ...selectedStudent,
                        math: { ...selectedStudent.math, nextSessionFocus: e.target.value }
                      })}
                      className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Reading Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-red-600">Reading</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Current Score</Label>
                    <Input
                      value={selectedStudent.reading.currentScore}
                      onChange={(e) => setSelectedStudent({
                        ...selectedStudent,
                        reading: { ...selectedStudent.reading, currentScore: e.target.value }
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Accuracy</Label>
                    <Input
                      value={selectedStudent.reading.accuracy}
                      onChange={(e) => setSelectedStudent({
                        ...selectedStudent,
                        reading: { ...selectedStudent.reading, accuracy: e.target.value }
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Error Type (C/K/T)</Label>
                    <Input
                      value={selectedStudent.reading.errorType}
                      onChange={(e) => setSelectedStudent({
                        ...selectedStudent,
                        reading: { ...selectedStudent.reading, errorType: e.target.value }
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Pacing Notes</Label>
                    <Input
                      value={selectedStudent.reading.pacingNotes}
                      onChange={(e) => setSelectedStudent({
                        ...selectedStudent,
                        reading: { ...selectedStudent.reading, pacingNotes: e.target.value }
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Next Session Focus</Label>
                    <textarea
                      value={selectedStudent.reading.nextSessionFocus}
                      onChange={(e) => setSelectedStudent({
                        ...selectedStudent,
                        reading: { ...selectedStudent.reading, nextSessionFocus: e.target.value }
                      })}
                      className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Writing Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-blue-600">Writing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Current Score</Label>
                    <Input
                      value={selectedStudent.writing.currentScore}
                      onChange={(e) => setSelectedStudent({
                        ...selectedStudent,
                        writing: { ...selectedStudent.writing, currentScore: e.target.value }
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Accuracy</Label>
                    <Input
                      value={selectedStudent.writing.accuracy}
                      onChange={(e) => setSelectedStudent({
                        ...selectedStudent,
                        writing: { ...selectedStudent.writing, accuracy: e.target.value }
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Error Type (C/K/T)</Label>
                    <Input
                      value={selectedStudent.writing.errorType}
                      onChange={(e) => setSelectedStudent({
                        ...selectedStudent,
                        writing: { ...selectedStudent.writing, errorType: e.target.value }
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Pacing Notes</Label>
                    <Input
                      value={selectedStudent.writing.pacingNotes}
                      onChange={(e) => setSelectedStudent({
                        ...selectedStudent,
                        writing: { ...selectedStudent.writing, pacingNotes: e.target.value }
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Next Session Focus</Label>
                    <textarea
                      value={selectedStudent.writing.nextSessionFocus}
                      onChange={(e) => setSelectedStudent({
                        ...selectedStudent,
                        writing: { ...selectedStudent.writing, nextSessionFocus: e.target.value }
                      })}
                      className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Error Type Key */}
              <div className="p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-semibold mb-2">Error Type Key:</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li><strong>C</strong> = Careless – Misreading, small mistakes, miscalculations</li>
                  <li><strong>K</strong> = Knowledge / Concept gap – Doesn&apos;t know underlying concept</li>
                  <li><strong>T</strong> = Timing / Pacing – Runs out of time or too slow</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session Log */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Session Log</CardTitle>
                <CardDescription>Track all tutoring sessions</CardDescription>
              </div>
              <Button onClick={addSession} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Session
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {selectedStudent.sessions.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No sessions logged yet. Click &quot;Add Session&quot; to get started.</p>
            ) : (
              <div className="space-y-4">
                {selectedStudent.sessions.map((session, index) => (
                  <Card key={index} className="border-2">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Session {index + 1}</CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSession(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full mt-1 justify-start text-left font-normal",
                                  !session.date && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {session.date ? (
                                  format(session.date, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={session.date || undefined}
                                onSelect={(date) => updateSession(index, 'date', date || null)}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div>
                          <Label>Topics Covered</Label>
                          <Input
                            value={session.topicsCovered}
                            onChange={(e) => updateSession(index, 'topicsCovered', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Strategies Taught</Label>
                          <Input
                            value={session.strategiesTaught}
                            onChange={(e) => updateSession(index, 'strategiesTaught', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Homework Assigned</Label>
                          <Input
                            value={session.homeworkAssigned}
                            onChange={(e) => updateSession(index, 'homeworkAssigned', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label>Notes / Progress</Label>
                          <textarea
                            value={session.notes}
                            onChange={(e) => updateSession(index, 'notes', e.target.value)}
                            className="mt-1 flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Errors & Pattern Recognition */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Errors & Pattern Recognition</CardTitle>
            <CardDescription>List recurring mistakes, traps, shortcuts, and patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={selectedStudent.errors}
              onChange={(e) => setSelectedStudent({ ...selectedStudent, errors: e.target.value })}
              className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Enter recurring errors and patterns..."
            />
          </CardContent>
        </Card>

        {/* Practice Test Review */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Practice Test Review</CardTitle>
            <CardDescription>Full review of each practice test, error analysis, timing issues, target areas</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={selectedStudent.practiceTests}
              onChange={(e) => setSelectedStudent({ ...selectedStudent, practiceTests: e.target.value })}
              className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Enter practice test reviews..."
            />
          </CardContent>
        </Card>

        {/* Growth Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Growth Summary</CardTitle>
            <CardDescription>Overall progress, key improvements, areas still needing focus</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={selectedStudent.growthSummary}
              onChange={(e) => setSelectedStudent({ ...selectedStudent, growthSummary: e.target.value })}
              className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Enter growth summary..."
            />
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-center mb-8">
          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-12 py-6 text-lg"
          >
            <Save className="w-5 h-5 mr-2" />
            {saving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
