'use client'

import { useState, useEffect } from 'react'
import { collection, doc, getDocs, setDoc, deleteDoc, updateDoc, query, orderBy } from 'firebase/firestore'
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
import { Plus, Trash2, CalendarIcon, BookOpen, Folder, X, Edit, Save, ChevronLeft, ChevronRight, Users, Eye } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TestQuestionEditor from './TestQuestionEditor'

interface AssignmentQuestion {
  id: string
  questionText: string
  questionImage?: string
  readingPassage?: string
  options: string[]
  correctAnswer: number | string // Can be number for multiple choice or string for open-ended
  section: 'english' | 'math'
  questionType?: 'multiple-choice' | 'open-ended'
}

interface Assignment {
  id?: string
  title: string
  description: string
  studentIds: string[]
  studentNames?: string[]
  folderId?: string
  folderName?: string
  dueDate: Date | null
  assignedDate: Date | null
  questions: AssignmentQuestion[]
  timeLimitEnabled: boolean
  timeLimit?: number // in minutes
}

interface Student {
  id: string
  name: string
  email: string
}

interface Folder {
  id: string
  name: string
  studentIds?: string[]
}

function DroppableFolder({ id, name, description, children, onAssign, onDelete }: { 
  id: string, 
  name: string, 
  description: string, 
  children: React.ReactNode,
  onAssign?: () => void,
  onDelete?: () => void
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  })

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        "transition-colors",
        isOver && "border-blue-500 bg-blue-50"
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-blue-600" />
            <CardTitle>{name}</CardTitle>
          </div>
          <div className="flex gap-2">
            {onAssign && (
              <Button variant="outline" size="sm" onClick={onAssign}>
                <Users className="w-4 h-4 mr-2" />
                Assign
              </Button>
            )}
            {onDelete && id !== 'unassigned' && (
              <Button variant="outline" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}

function SortableAssignmentItem({ assignment, onDelete, onEdit, onViewSubmissions }: { 
  assignment: Assignment, 
  onDelete: (id: string) => void,
  onEdit: (assignment: Assignment) => void,
  onViewSubmissions: (assignment: Assignment) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: assignment.id || '' })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r mb-2"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2 flex-1">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing mt-1"
          >
            <div className="w-4 h-4 border-2 border-gray-400 rounded"></div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{assignment.title}</h3>
            <p className="text-gray-600 text-sm mb-2">{assignment.description}</p>
            <div className="flex gap-4 text-xs text-gray-500">
              {assignment.assignedDate && (
                <span>Assigned: {format(assignment.assignedDate, 'MMM dd, yyyy')}</span>
              )}
              {assignment.dueDate && (
                <span>Due: {format(assignment.dueDate, 'MMM dd, yyyy')}</span>
              )}
              {assignment.questions && assignment.questions.length > 0 && (
                <span>{assignment.questions.length} questions</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => onViewSubmissions(assignment)} title="View Submissions">
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(assignment)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => assignment.id && onDelete(assignment.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function AssignmentManagement() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [newFolderName, setNewFolderName] = useState('')
  const [showFolderForm, setShowFolderForm] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showAssignFolderDialog, setShowAssignFolderDialog] = useState<Folder | null>(null)
  const [viewingSubmissions, setViewingSubmissions] = useState<Assignment | null>(null)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null)
  const { toast } = useToast()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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

      const foldersRef = collection(db, 'folders')
      const foldersSnapshot = await getDocs(query(foldersRef, orderBy('name')))
      const foldersList: Folder[] = []
      foldersSnapshot.forEach((doc) => {
        const data = doc.data()
        foldersList.push({
          id: doc.id,
          name: data.name || '',
          studentIds: data.studentIds || [],
        })
      })
      setFolders(foldersList)

      await loadAssignments(studentsList, foldersList)
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load data.',
        variant: 'destructive',
      })
    }
  }

  const loadAssignments = async (studentsList: Student[], foldersList: Folder[]) => {
    if (!db) return

    try {
      const assignmentsRef = collection(db, 'assignments')
      const q = query(assignmentsRef, orderBy('assignedDate', 'desc'))
      const querySnapshot = await getDocs(q)
      
      const assignmentsList: Assignment[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        const studentIds = data.studentIds || (data.studentId ? [data.studentId] : [])
        const studentNames = studentIds.map((sid: string) => {
          const student = studentsList.find(s => s.id === sid)
          return student?.name || 'Unknown'
        })
        const folder = foldersList.find(f => f.id === data.folderId)
        
        assignmentsList.push({
          id: doc.id,
          title: data.title || '',
          description: data.description || '',
          folderId: data.folderId || '',
          folderName: folder?.name,
          studentIds: studentIds,
          studentNames: studentNames,
          dueDate: data.dueDate ? data.dueDate.toDate() : null,
          assignedDate: data.assignedDate ? data.assignedDate.toDate() : null,
          questions: data.questions || [],
          timeLimitEnabled: data.timeLimitEnabled || false,
          timeLimit: data.timeLimit || 0,
        })
      })

      setAssignments(assignmentsList)
    } catch (error) {
      console.error('Error loading assignments:', error)
    }
  }

  const handleNewAssignment = () => {
    const newAssignment: Assignment = {
      title: '',
      description: '',
      studentIds: [],
      dueDate: null,
      assignedDate: new Date(),
      questions: [],
      timeLimitEnabled: false,
      timeLimit: 0,
    }
    setSelectedAssignment(newAssignment)
    setEditingAssignment(newAssignment)
    setShowForm(true)
    setCurrentQuestionIndex(0)
  }

  const handleEditAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setEditingAssignment({ ...assignment })
    setShowForm(true)
    setCurrentQuestionIndex(0)
  }

  const handleViewSubmissions = async (assignment: Assignment) => {
    if (!db || !assignment.id) return
    
    try {
      setViewingSubmissions(assignment)
      const submissionsRef = collection(db, 'assignmentSubmissions')
      const q = query(submissionsRef, orderBy('submittedAt', 'desc'))
      const querySnapshot = await getDocs(q)
      
      const submissionsList: any[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        if (data.assignmentId === assignment.id) {
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

  const handleSaveAssignment = async () => {
    if (!db || !editingAssignment || !editingAssignment.title) {
      toast({
        title: 'Error',
        description: 'Please fill in the assignment title.',
        variant: 'destructive',
      })
      return
    }

    try {
      // Remove computed fields (folderName, studentNames) before saving
      const { folderName, studentNames, ...cleanAssignment } = editingAssignment
      // Get student emails for security rules
      const studentEmails = (cleanAssignment.studentIds || []).map((sid: string) => {
        const student = students.find(s => s.id === sid)
        return student?.email || ''
      }).filter((email: string) => email !== '')
      
      const assignmentData = {
        title: cleanAssignment.title,
        description: cleanAssignment.description,
        studentIds: cleanAssignment.studentIds || [],
        studentEmails: studentEmails, // Store emails for security rules
        folderId: cleanAssignment.folderId || null,
        dueDate: cleanAssignment.dueDate || null,
        assignedDate: cleanAssignment.assignedDate || new Date(),
        questions: cleanAssignment.questions || [],
        timeLimitEnabled: cleanAssignment.timeLimitEnabled || false,
        timeLimit: cleanAssignment.timeLimit || 0,
        completed: false,
      }

      if (editingAssignment.id) {
        const docRef = doc(db, 'assignments', editingAssignment.id)
        await setDoc(docRef, assignmentData as any)
        toast({
          title: 'Success',
          description: 'Assignment updated successfully!',
        })
      } else {
        const assignmentsRef = collection(db, 'assignments')
        const newDocRef = doc(assignmentsRef)
        await setDoc(newDocRef, assignmentData as any)
        toast({
          title: 'Success',
          description: 'Assignment created successfully!',
        })
      }

      await loadData()
      setShowForm(false)
      setSelectedAssignment(null)
      setEditingAssignment(null)
      setCurrentQuestionIndex(0)
    } catch (error) {
      console.error('Error saving assignment:', error)
      toast({
        title: 'Error',
        description: 'Failed to save assignment.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (assignmentId: string) => {
    if (!db || !confirm('Are you sure you want to delete this assignment?')) {
      return
    }

    try {
      await deleteDoc(doc(db, 'assignments', assignmentId))
      toast({
        title: 'Success',
        description: 'Assignment deleted successfully!',
      })
      await loadData()
    } catch (error) {
      console.error('Error deleting assignment:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete assignment.',
        variant: 'destructive',
      })
    }
  }

  const handleCreateFolder = async () => {
    if (!db || !newFolderName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a folder name.',
        variant: 'destructive',
      })
      return
    }

    try {
      const foldersRef = collection(db, 'folders')
      const newDocRef = doc(foldersRef)
      await setDoc(newDocRef, { name: newFolderName.trim() })

      toast({
        title: 'Success',
        description: 'Folder created successfully!',
      })

      setNewFolderName('')
      setShowFolderForm(false)
      await loadData()
    } catch (error) {
      console.error('Error creating folder:', error)
      toast({
        title: 'Error',
        description: 'Failed to create folder.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteFolder = async (folderId: string) => {
    if (!db || !confirm('Are you sure you want to delete this folder? Assignments in this folder will be moved to unassigned.')) {
      return
    }

    try {
      // Move all assignments in this folder to unassigned
      const folderAssignments = assignments.filter(a => a.folderId === folderId)
      for (const assignment of folderAssignments) {
        const { folderName, studentNames, ...assignmentData } = assignment
        const assignmentRef = doc(db, 'assignments', assignment.id || '')
        await updateDoc(assignmentRef, {
          ...assignmentData,
          folderId: null,
        })
      }

      // Delete the folder
      await deleteDoc(doc(db, 'folders', folderId))

      toast({
        title: 'Success',
        description: 'Folder deleted successfully!',
      })

      await loadData()
    } catch (error) {
      console.error('Error deleting folder:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete folder.',
        variant: 'destructive',
      })
    }
  }

  const handleAssignFolder = async (folder: Folder, studentIds: string[]) => {
    if (!db) return

    try {
      const folderRef = doc(db, 'folders', folder.id)
      await setDoc(folderRef, {
        name: folder.name,
        studentIds: studentIds,
      } as any)

      // Also assign all assignments in the folder to these students
      const folderAssignments = assignments.filter(a => a.folderId === folder.id)
      for (const assignment of folderAssignments) {
        if (assignment.id) {
          const assignmentRef = doc(db, 'assignments', assignment.id)
          const currentStudentIds = assignment.studentIds || []
          const newStudentIds = Array.from(new Set([...currentStudentIds, ...studentIds]))
          // Remove computed fields before saving
          const { folderName, studentNames, ...assignmentData } = assignment
          // Get student emails for security rules
          const studentEmails = newStudentIds.map((sid: string) => {
            const student = students.find(s => s.id === sid)
            return student?.email || ''
          }).filter((email: string) => email !== '')
          
          await setDoc(assignmentRef, {
            ...assignmentData,
            studentIds: newStudentIds,
            studentEmails: studentEmails, // Store emails for security rules
          } as any)
        }
      }

      toast({
        title: 'Success',
        description: 'Folder assigned successfully!',
      })

      await loadData()
      setShowAssignFolderDialog(null)
    } catch (error) {
      console.error('Error assigning folder:', error)
      toast({
        title: 'Error',
        description: 'Failed to assign folder.',
        variant: 'destructive',
      })
    }
  }

  const handleDragEnd = async (event: any) => {
    const { active, over } = event

    if (!over) {
      setActiveId(null)
      return
    }

    const assignmentId = active.id as string
    const targetId = over.id as string

    const targetFolder = folders.find(f => f.id === targetId)
    const isUnassigned = targetId === 'unassigned'

    const assignment = assignments.find(a => a.id === assignmentId)
    if (!assignment || !db) {
      setActiveId(null)
      return
    }

    if (targetFolder || isUnassigned) {
      try {
        const assignmentRef = doc(db, 'assignments', assignmentId)
        // Remove folderName and other computed fields before saving
        const { folderName, studentNames, ...assignmentData } = assignment
        // Get student emails for security rules
        const studentEmails = (assignmentData.studentIds || []).map((sid: string) => {
          const student = students.find(s => s.id === sid)
          return student?.email || ''
        }).filter((email: string) => email !== '')
        
        await setDoc(assignmentRef, {
          ...assignmentData,
          studentEmails: studentEmails, // Store emails for security rules
          folderId: isUnassigned ? null : targetFolder?.id || null,
        } as any)

        toast({
          title: 'Success',
          description: 'Assignment moved successfully!',
        })

        await loadData()
      } catch (error) {
        console.error('Error moving assignment:', error)
        toast({
          title: 'Error',
          description: 'Failed to move assignment.',
          variant: 'destructive',
        })
      }
    }

    setActiveId(null)
  }

  const updateQuestion = (questionId: string, updatedQuestion: AssignmentQuestion) => {
    if (!editingAssignment) return
    const updatedQuestions = editingAssignment.questions.map(q =>
      q.id === questionId ? updatedQuestion : q
    )
    setEditingAssignment({ ...editingAssignment, questions: updatedQuestions })
  }

  const deleteQuestion = (questionId: string) => {
    if (!editingAssignment) return
    const updatedQuestions = editingAssignment.questions.filter(q => q.id !== questionId)
    setEditingAssignment({ ...editingAssignment, questions: updatedQuestions })
    if (currentQuestionIndex >= updatedQuestions.length) {
      setCurrentQuestionIndex(Math.max(0, updatedQuestions.length - 1))
    }
  }

  const addQuestion = () => {
    if (!editingAssignment) return
    const newQuestion: AssignmentQuestion = {
      id: `q-${Date.now()}`,
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      section: 'english',
      questionType: 'multiple-choice',
    }
    setEditingAssignment({
      ...editingAssignment,
      questions: [...editingAssignment.questions, newQuestion],
    })
    setCurrentQuestionIndex(editingAssignment.questions.length)
  }

  const toggleStudent = (studentId: string) => {
    if (!editingAssignment) return
    const currentIds = editingAssignment.studentIds || []
    if (currentIds.includes(studentId)) {
      setEditingAssignment({
        ...editingAssignment,
        studentIds: currentIds.filter(id => id !== studentId),
      })
    } else {
      setEditingAssignment({
        ...editingAssignment,
        studentIds: [...currentIds, studentId],
      })
    }
  }

  // Group assignments by folder
  const assignmentsByFolder = new Map<string, Assignment[]>()
  const unassignedAssignments: Assignment[] = []

  assignments.forEach(assignment => {
    if (assignment.folderId) {
      if (!assignmentsByFolder.has(assignment.folderId)) {
        assignmentsByFolder.set(assignment.folderId, [])
      }
      assignmentsByFolder.get(assignment.folderId)!.push(assignment)
    } else {
      unassignedAssignments.push(assignment)
    }
  })

  const activeAssignment = activeId ? assignments.find(a => a.id === activeId) : null

  if (showForm && editingAssignment) {
    const currentQuestion = editingAssignment.questions[currentQuestionIndex]
    const totalQuestions = editingAssignment.questions.length

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Create/Edit Assignment</h2>
          <Button variant="outline" onClick={() => {
            setShowForm(false)
            setSelectedAssignment(null)
            setEditingAssignment(null)
            setCurrentQuestionIndex(0)
          }}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Assignment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={editingAssignment.title}
                onChange={(e) => setEditingAssignment({ ...editingAssignment, title: e.target.value })}
                className="mt-1"
                placeholder="Assignment title"
              />
            </div>

            <div>
              <Label>Description</Label>
              <textarea
                value={editingAssignment.description}
                onChange={(e) => setEditingAssignment({ ...editingAssignment, description: e.target.value })}
                className="mt-1 flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Assignment description..."
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
                        !editingAssignment.assignedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editingAssignment.assignedDate ? (
                        format(editingAssignment.assignedDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  {/* @ts-ignore - Radix UI PopoverContent type compatibility */}
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editingAssignment.assignedDate || undefined}
                      onSelect={(date) => setEditingAssignment({ ...editingAssignment, assignedDate: date || new Date() })}
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
                        !editingAssignment.dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editingAssignment.dueDate ? (
                        format(editingAssignment.dueDate, "PPP")
                      ) : (
                        <span>Pick a date (optional)</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editingAssignment.dueDate || undefined}
                      onSelect={(date) => setEditingAssignment({ ...editingAssignment, dueDate: date || null })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label>Folder (Optional)</Label>
                <Select
                  value={editingAssignment.folderId || 'none'}
                  onValueChange={(value: string) => setEditingAssignment({ ...editingAssignment, folderId: value === 'none' ? undefined : value })}
                >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a folder (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Folder</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <Label>Enable Time Limit</Label>
                <Switch
                  checked={editingAssignment.timeLimitEnabled}
                  onCheckedChange={(checked: boolean) => setEditingAssignment({ ...editingAssignment, timeLimitEnabled: checked })}
                />
              </div>

              {editingAssignment.timeLimitEnabled && (
                <div>
                  <Label>Time Limit (minutes)</Label>
                  <Input
                    type="number"
                    value={editingAssignment.timeLimit}
                    onChange={(e) => setEditingAssignment({ ...editingAssignment, timeLimit: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="mb-3">
                <Label>Assign to Students</Label>
              </div>
              <div className="max-h-40 overflow-y-auto border rounded p-3 space-y-2">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`student-${student.id}`}
                      checked={editingAssignment.studentIds?.includes(student.id) || false}
                      onCheckedChange={() => toggleStudent(student.id)}
                    />
                    <Label htmlFor={`student-${student.id}`} className="cursor-pointer flex-1">
                      {student.name} ({student.email})
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleSaveAssignment} className="w-full bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Save Assignment
            </Button>
          </CardContent>
        </Card>

        {/* Question Carousel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Questions ({totalQuestions})
              </CardTitle>
              <Button variant="outline" onClick={addQuestion}>
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {totalQuestions > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                      disabled={currentQuestionIndex === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium">
                      Question {currentQuestionIndex + 1} of {totalQuestions}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentQuestionIndex(Math.min(totalQuestions - 1, currentQuestionIndex + 1))}
                      disabled={currentQuestionIndex === totalQuestions - 1}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {currentQuestion && (
                  <TestQuestionEditor
                    question={{
                      ...currentQuestion,
                      module: undefined, // Assignments don't use modules
                    }}
                    onUpdate={(updated) => {
                      const { module, ...questionData } = updated
                      updateQuestion(currentQuestion.id, questionData)
                    }}
                    onDelete={() => deleteQuestion(currentQuestion.id)}
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No questions yet. Click &quot;Add Question&quot; to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Assignments</h2>
          <p className="text-gray-600 text-sm">Create and manage assignments for students</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFolderForm(true)}
          >
            <Folder className="w-4 h-4 mr-2" />
            New Folder
          </Button>
          <Button onClick={handleNewAssignment} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Assignment
          </Button>
        </div>
      </div>

      {/* Create Folder Form */}
      {showFolderForm && (
        <Card className="mb-6 border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Create New Folder</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => {
                setShowFolderForm(false)
                setNewFolderName('')
              }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Folder Name</Label>
                <Input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="mt-1"
                  placeholder="Enter folder name"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateFolder()
                    }
                  }}
                />
              </div>
              <div className="flex gap-4">
                <Button onClick={handleCreateFolder} className="bg-blue-600 hover:bg-blue-700">
                  Create Folder
                </Button>
                <Button variant="outline" onClick={() => {
                  setShowFolderForm(false)
                  setNewFolderName('')
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assign Folder Dialog */}
      {showAssignFolderDialog && (
        <Card className="mb-6 border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Assign Folder: {showAssignFolderDialog.name}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowAssignFolderDialog(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Label>Select Students</Label>
              <div className="max-h-60 overflow-y-auto border rounded p-3 space-y-2">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`folder-student-${student.id}`}
                      checked={showAssignFolderDialog.studentIds?.includes(student.id) || false}
                      onCheckedChange={(checked: boolean) => {
                        const currentIds = showAssignFolderDialog.studentIds || []
                        if (checked) {
                          setShowAssignFolderDialog({
                            ...showAssignFolderDialog,
                            studentIds: [...currentIds, student.id],
                          })
                        } else {
                          setShowAssignFolderDialog({
                            ...showAssignFolderDialog,
                            studentIds: currentIds.filter(id => id !== student.id),
                          })
                        }
                      }}
                    />
                    <Label htmlFor={`folder-student-${student.id}`} className="cursor-pointer flex-1">
                      {student.name} ({student.email})
                    </Label>
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={() => handleAssignFolder(showAssignFolderDialog, showAssignFolderDialog.studentIds || [])}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Assign Folder
                </Button>
                <Button variant="outline" onClick={() => setShowAssignFolderDialog(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
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
                          }}
                          className={`w-full text-left p-3 rounded border-2 transition-colors ${
                            selectedSubmission?.id === submission.id
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-semibold">{submission.studentName}</div>
                          <div className="text-sm text-gray-600">{submission.score}</div>
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
                    <div className="flex-1 overflow-y-auto">
                      <h3 className="text-lg font-semibold mb-4">{selectedSubmission.studentName}&apos;s Answers</h3>
                      
                      <div className="space-y-8">
                        {viewingSubmissions.questions.map((question: any, index: number) => {
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
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Assignments and Folders with Drag and Drop */}
      {/* @ts-ignore - dnd-kit DndContext type compatibility */}
      <DndContext
         sensors={sensors}
         collisionDetection={closestCenter}
         onDragStart={(event) => setActiveId(event.active.id as string)}
         onDragEnd={handleDragEnd}
       >
        <div className="space-y-6">
          {/* Unassigned Assignments */}
          {unassignedAssignments.length > 0 && (
            <DroppableFolder id="unassigned" name="Unassigned Assignments" description="Drag assignments here or to folders">
              <SortableContext
                items={unassignedAssignments.map(a => a.id || '')}
                strategy={verticalListSortingStrategy}
              >
                {unassignedAssignments.map((assignment) => (
                  <SortableAssignmentItem
                    key={assignment.id}
                    assignment={assignment}
                    onDelete={handleDelete}
                    onEdit={handleEditAssignment}
                    onViewSubmissions={handleViewSubmissions}
                  />
                ))}
              </SortableContext>
            </DroppableFolder>
          )}

          {/* Folders with Assignments */}
          {Array.from(assignmentsByFolder.entries()).map(([folderId, folderAssignments]) => {
            const folder = folders.find(f => f.id === folderId)
            return (
              <DroppableFolder
                key={folderId}
                id={folderId || ''}
                name={folder?.name || 'Unknown Folder'}
                description="Drop assignments here to organize them"
                onAssign={() => folder && setShowAssignFolderDialog(folder)}
                onDelete={() => folder && handleDeleteFolder(folder.id)}
              >
                <SortableContext
                  items={folderAssignments.map(a => a.id || '')}
                  strategy={verticalListSortingStrategy}
                >
                  {folderAssignments.map((assignment) => (
                    <SortableAssignmentItem
                      key={assignment.id}
                      assignment={assignment}
                      onDelete={handleDelete}
                      onEdit={handleEditAssignment}
                      onViewSubmissions={handleViewSubmissions}
                    />
                  ))}
                </SortableContext>
              </DroppableFolder>
            )
          })}

          {/* Empty Folders */}
          {folders.filter(f => !assignmentsByFolder.has(f.id)).map((folder) => (
            <DroppableFolder
              key={folder.id}
              id={folder.id}
              name={folder.name}
              description="Empty folder - drag assignments here"
              onAssign={() => setShowAssignFolderDialog(folder)}
              onDelete={() => handleDeleteFolder(folder.id)}
            >
              <div className="text-center py-8 text-gray-500 text-sm">
                No assignments in this folder
              </div>
            </DroppableFolder>
          ))}

          {/* Empty State */}
          {assignments.length === 0 && (
            <Card className="p-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">No assignments yet</h3>
              <p className="text-gray-600 mb-6">Create your first assignment to get started</p>
              <Button onClick={handleNewAssignment} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create First Assignment
              </Button>
            </Card>
          )}
        </div>

        {/* @ts-ignore - dnd-kit DragOverlay type compatibility */}
        <DragOverlay>
          {activeAssignment ? (
            <div className="border-l-4 border-blue-500 pl-4 py-3 bg-white rounded shadow-lg">
              <h3 className="font-semibold text-lg">{activeAssignment.title}</h3>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
