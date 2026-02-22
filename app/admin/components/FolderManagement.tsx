'use client'

import { useState, useEffect } from 'react'
import { collection, doc, getDocs, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Folder, X, Edit } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Folder {
  id?: string
  name: string
}

export default function FolderManagement() {
  const [folders, setFolders] = useState<Folder[]>([])
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadFolders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadFolders = async () => {
    if (!db) return

    try {
      const foldersRef = collection(db, 'folders')
      const q = query(foldersRef, orderBy('name'))
      const querySnapshot = await getDocs(q)
      
      const foldersList: Folder[] = []
      querySnapshot.forEach((doc) => {
        foldersList.push({
          id: doc.id,
          name: doc.data().name || '',
        })
      })

      setFolders(foldersList)
    } catch (error) {
      console.error('Error loading folders:', error)
      toast({
        title: 'Error',
        description: 'Failed to load folders.',
        variant: 'destructive',
      })
    }
  }

  const handleNewFolder = () => {
    setSelectedFolder({ name: '' })
    setEditingId(null)
    setShowForm(true)
  }

  const handleEditFolder = (folder: Folder) => {
    setSelectedFolder({ ...folder })
    setEditingId(folder.id || null)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!db || !selectedFolder || !selectedFolder.name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a folder name.',
        variant: 'destructive',
      })
      return
    }

    try {
      const folderData = {
        name: selectedFolder.name.trim(),
      }

      if (editingId) {
        // Update existing folder
        const docRef = doc(db, 'folders', editingId)
        await setDoc(docRef, folderData)
        toast({
          title: 'Success',
          description: 'Folder updated successfully!',
        })
      } else {
        // Create new folder
        const foldersRef = collection(db, 'folders')
        const newDocRef = doc(foldersRef)
        await setDoc(newDocRef, folderData)
        toast({
          title: 'Success',
          description: 'Folder created successfully!',
        })
      }

      await loadFolders()
      setShowForm(false)
      setSelectedFolder(null)
      setEditingId(null)
    } catch (error) {
      console.error('Error saving folder:', error)
      toast({
        title: 'Error',
        description: 'Failed to save folder.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (folderId: string) => {
    if (!db || !confirm('Are you sure you want to delete this folder? This will not delete assignments in the folder.')) {
      return
    }

    try {
      await deleteDoc(doc(db, 'folders', folderId))
      toast({
        title: 'Success',
        description: 'Folder deleted successfully!',
      })
      await loadFolders()
    } catch (error) {
      console.error('Error deleting folder:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete folder.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Folders</h2>
          <p className="text-gray-600 text-sm">Organize assignments into folders</p>
        </div>
        <Button onClick={handleNewFolder} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Folder
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && selectedFolder && (
        <Card className="mb-6 border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{editingId ? 'Edit Folder' : 'Create New Folder'}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => {
                setShowForm(false)
                setSelectedFolder(null)
                setEditingId(null)
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
                  value={selectedFolder.name}
                  onChange={(e) => setSelectedFolder({ ...selectedFolder, name: e.target.value })}
                  className="mt-1"
                  placeholder="Enter folder name"
                />
              </div>

              <div className="flex gap-4">
                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                  {editingId ? 'Update Folder' : 'Create Folder'}
                </Button>
                <Button variant="outline" onClick={() => {
                  setShowForm(false)
                  setSelectedFolder(null)
                  setEditingId(null)
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Folders List */}
      {folders.length === 0 ? (
        <Card className="p-12 text-center">
          <Folder className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">No folders yet</h3>
          <p className="text-gray-600 mb-6">Create folders to organize assignments</p>
          <Button onClick={handleNewFolder} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create First Folder
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {folders.map((folder) => (
            <Card key={folder.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Folder className="w-8 h-8 text-blue-600" />
                    <CardTitle className="text-lg">{folder.name}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditFolder(folder)}
                      className="h-8 w-8"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => folder.id && handleDelete(folder.id)}
                      className="text-red-600 hover:text-red-700 h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

