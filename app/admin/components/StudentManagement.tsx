'use client'

import { useState, useEffect } from 'react'
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, Plus, Trash2, CalendarIcon, User as UserIcon, Mail, Phone, Users, ArrowLeft } from 'lucide-react'
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

export default function StudentManagement() {
  const [saving, setSaving] = useState(false)
  const [students, setStudents] = useState<StudentData[]>([])
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null)
  const [view, setView] = useState<'list' | 'detail'>('list')
  const { toast } = useToast()

  useEffect(() => {
    loadStudents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    if (!db || !selectedStudent) {
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
      
      const { id, ...dataToSave } = studentData
      
      if (selectedStudent.id) {
        const docRef = doc(db, 'students', selectedStudent.id)
        await updateDoc(docRef, dataToSave as any)
        toast({
          title: 'Success',
          description: 'Student data saved successfully!',
        })
      } else {
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

  // Student List View
  if (view === 'list') {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Students</h2>
            <p className="text-gray-600 text-sm">Manage all your students</p>
          </div>
          <Button onClick={handleNewStudent} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Student
          </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => (
              <Card
                key={student.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleSelectStudent(student)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{student.name || 'Unnamed Student'}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1 text-xs">
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
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    {student.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-3 h-3" />
                        {student.phone}
                      </div>
                    )}
                    {student.satTarget && (
                      <div className="text-gray-600">
                        <span className="font-semibold">Target:</span> {student.satTarget}
                      </div>
                    )}
                    {student.testDate && (
                      <div className="text-gray-600">
                        <span className="font-semibold">Test:</span> {format(student.testDate, 'MMM dd, yyyy')}
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
    )
  }

  // Student Detail View
  if (!selectedStudent) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
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
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>

      <h2 className="text-3xl font-bold mb-6">
        {selectedStudent.id ? 'Edit Student' : 'New Student'}
      </h2>

      {/* Student Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
          <CardDescription>Basic information about the student</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="strengths">Strengths</Label>
              <textarea
                id="strengths"
                value={selectedStudent.strengths}
                onChange={(e) => setSelectedStudent({ ...selectedStudent, strengths: e.target.value })}
                className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="weaknesses">Weaknesses</Label>
              <textarea
                id="weaknesses"
                value={selectedStudent.weaknesses}
                onChange={(e) => setSelectedStudent({ ...selectedStudent, weaknesses: e.target.value })}
                className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diagnostic & Score Tracking */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Diagnostic & Score Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Math */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-blue-600">Math</h3>
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
                    className="mt-1 flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Reading */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-red-600">Reading</h3>
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
                    className="mt-1 flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Writing */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-blue-600">Writing</h3>
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
                    className="mt-1 flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
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
            <p className="text-center py-8 text-gray-500">No sessions logged yet.</p>
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
                        className="text-red-600 hover:text-red-700"
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
                              {session.date ? format(session.date, "PPP") : <span>Pick a date</span>}
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
                          className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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

      {/* Additional sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Errors & Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={selectedStudent.errors}
              onChange={(e) => setSelectedStudent({ ...selectedStudent, errors: e.target.value })}
              className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Recurring errors and patterns..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Practice Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={selectedStudent.practiceTests}
              onChange={(e) => setSelectedStudent({ ...selectedStudent, practiceTests: e.target.value })}
              className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Practice test reviews..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Growth Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={selectedStudent.growthSummary}
              onChange={(e) => setSelectedStudent({ ...selectedStudent, growthSummary: e.target.value })}
              className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Growth summary..."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

