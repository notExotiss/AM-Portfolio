'use client'

import { useState, useEffect } from 'react'
import { signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { GraduationCap } from 'lucide-react'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const ADMIN_EMAIL = 'iamaaritmalhotra@gmail.com'

export default function SignIn() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }
    
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user)
      setLoading(false)
      if (user) {
        if (user.email === ADMIN_EMAIL) {
          router.push('/admin')
          return
        }
        // Check if student has completed onboarding
        if (db) {
          try {
            const studentDoc = await getDoc(doc(db, 'students', user.uid))
            if (!studentDoc.exists()) {
              // Student needs to complete onboarding
              setShowOnboarding(true)
            } else {
              // Student exists, redirect to dashboard
              setShowOnboarding(false)
              router.push('/student-dashboard')
            }
          } catch (error) {
            console.error('Error checking student data:', error)
            // Only show onboarding if there's a real error, not if student exists
            const studentDoc = await getDoc(doc(db, 'students', user.uid))
            if (!studentDoc.exists()) {
              setShowOnboarding(true)
            } else {
              router.push('/student-dashboard')
            }
          }
        }
      } else {
        // User signed out, reset onboarding state
        setShowOnboarding(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleStudentSignIn = async () => {
    if (!auth) {
      toast({
        title: 'Configuration Error',
        description: 'Firebase is not configured. Please set up your environment variables.',
        variant: 'destructive',
      })
      return
    }
    
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      
      if (result.user.email === ADMIN_EMAIL) {
        router.push('/admin')
        return
      }
      
      // Check if student has completed onboarding
      if (db) {
        try {
          const studentDoc = await getDoc(doc(db, 'students', result.user.uid))
          if (!studentDoc.exists()) {
            // Student needs to complete onboarding
            setShowOnboarding(true)
          } else {
            // Student exists, redirect to dashboard
            setShowOnboarding(false)
            router.push('/student-dashboard')
          }
        } catch (error) {
          console.error('Error checking student data:', error)
          // Only show onboarding if student doesn't exist
          const studentDoc = await getDoc(doc(db, 'students', result.user.uid))
          if (!studentDoc.exists()) {
            setShowOnboarding(true)
          } else {
            router.push('/student-dashboard')
          }
        }
      }
    } catch (error) {
      console.error('Error signing in:', error)
      toast({
        title: 'Sign In Failed',
        description: 'Failed to sign in. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleSignOut = async () => {
    if (!auth) return
    
    try {
      await auth.signOut()
      setShowOnboarding(false)
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (user && showOnboarding) {
    return <StudentOnboardingForm user={user} onComplete={() => router.push('/student-dashboard')} />
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-blue-50 to-red-50">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Already Signed In</CardTitle>
            <CardDescription>You are signed in as {user.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => router.push('/student-dashboard')} 
              className="w-full"
            >
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={handleSignOut} className="w-full">
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-blue-50 to-red-50 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
            A.M. Tutoring
          </h1>
          <p className="text-gray-600 text-lg">Sign in to access your account</p>
        </div>
        
        <Card className="hover:shadow-xl transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <GraduationCap className="w-8 h-8 text-red-600" />
              <CardTitle className="text-2xl">Student Sign In</CardTitle>
            </div>
            <CardDescription>
              Access your dashboard to view statistics, assignments, and tests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleStudentSignIn}
              className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StudentOnboardingForm({ user, onComplete }: { user: User, onComplete: () => void }) {
  const [satTarget, setSatTarget] = useState('')
  const [testDate, setTestDate] = useState('')
  const [goals, setGoals] = useState('')
  const [strengths, setStrengths] = useState('')
  const [weaknesses, setWeaknesses] = useState('')
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!db || !user) return

    setSaving(true)
    try {
      // Check if student already exists before creating
      const existingStudent = await getDoc(doc(db, 'students', user.uid))
      if (existingStudent.exists()) {
        // Student already exists, just redirect
        toast({
          title: 'Welcome Back',
          description: 'Your profile already exists. Redirecting to dashboard...',
        })
        onComplete()
        return
      }

      // Create new student only if doesn't exist
      await setDoc(doc(db, 'students', user.uid), {
        name: user.displayName || user.email?.split('@')[0] || 'Student',
        email: user.email || '',
        satTarget: satTarget || '',
        testDate: testDate ? new Date(testDate) : null,
        goals: goals || '',
        strengths: strengths || '',
        weaknesses: weaknesses || '',
        math: {
          currentScore: '',
          accuracy: '',
        },
        reading: {
          currentScore: '',
          accuracy: '',
        },
        writing: {
          currentScore: '',
          accuracy: '',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      
      toast({
        title: 'Success',
        description: 'Your profile has been created successfully!',
      })
      
      onComplete()
    } catch (error) {
      console.error('Error saving student data:', error)
      toast({
        title: 'Error',
        description: 'Failed to save your information. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-blue-50 to-red-50 py-12">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome! Let&apos;s set up your profile</CardTitle>
          <CardDescription>
            Please fill out this form to get started. You can update this information later from your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Target SAT Score</label>
              <input
                type="text"
                value={satTarget}
                onChange={(e) => setSatTarget(e.target.value)}
                placeholder="e.g., 1500"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Test Date (optional)</label>
              <input
                type="date"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Goals</label>
              <textarea
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="What are your goals for SAT preparation?"
                rows={3}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Strengths</label>
              <textarea
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                placeholder="What are your strengths in SAT preparation?"
                rows={3}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Weaknesses</label>
              <textarea
                value={weaknesses}
                onChange={(e) => setWeaknesses(e.target.value)}
                placeholder="What areas do you need to improve?"
                rows={3}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            
            <Button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600"
            >
              {saving ? 'Saving...' : 'Continue to Dashboard'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
