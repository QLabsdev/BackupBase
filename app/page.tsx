"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { DashboardTab } from "@/components/dashboard-tab"
import { UploadTab } from "@/components/upload-tab"
import { FoldersTab } from "@/components/folders-tab"
import { AnalyticsTab } from "@/components/analytics-tab"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { fileStorage, type StoredFile, type StoredFolder } from "@/lib/storage"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [files, setFiles] = useState<StoredFile[]>([])
  const [folders, setFolders] = useState<StoredFolder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      setError(null)
      await fileStorage.init()
      await refreshData()
    } catch (error) {
      console.error("Failed to initialize app:", error)
      setError("Failed to initialize the application. Please refresh the page.")
    } finally {
      setIsLoading(false)
    }
  }

  const refreshData = async () => {
    try {
      const [storedFiles, storedFolders] = await Promise.all([fileStorage.getAllFiles(), fileStorage.getAllFolders()])
      setFiles(storedFiles)
      setFolders(storedFolders)
    } catch (error) {
      console.error("Failed to refresh data:", error)
      setError("Failed to load your files. Please try again.")
    }
  }

  const handleFilesUploaded = async (uploadedFiles: File[], folderId?: string) => {
    try {
      const newFiles: StoredFile[] = []

      for (const file of uploadedFiles) {
        const id = await fileStorage.storeFile(file, folderId)
        newFiles.push({
          id,
          blob: file,
          uploadedAt: Date.now(),
          folderId,
        })
      }

      setFiles((prev) => [...prev, ...newFiles])
    } catch (error) {
      console.error("Failed to upload files:", error)
      setError("Failed to upload files. Please try again.")
    }
  }

  const handleDeleteFile = async (id: string) => {
    try {
      await fileStorage.deleteFile(id)
      setFiles((prev) => prev.filter((file) => file.id !== id))
      setSelectedFiles((prev) => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    } catch (error) {
      console.error("Failed to delete file:", error)
      setError("Failed to delete file. Please try again.")
    }
  }

  const handleCreateFolder = async (name: string) => {
    try {
      const id = await fileStorage.createFolder(name)
      const newFolder: StoredFolder = {
        id,
        name,
        createdAt: Date.now(),
      }
      setFolders((prev) => [...prev, newFolder])
    } catch (error) {
      console.error("Failed to create folder:", error)
      setError("Failed to create folder. Please try again.")
    }
  }

  const handleDeleteFolder = async (id: string) => {
    try {
      // Move files back to root
      const folderFiles = files.filter((f) => f.folderId === id)
      if (folderFiles.length > 0) {
        await fileStorage.moveFilesToFolder(folderFiles.map((f) => f.id))
        setFiles((prev) => prev.map((file) => (file.folderId === id ? { ...file, folderId: undefined } : file)))
      }

      await fileStorage.deleteFolder(id)
      setFolders((prev) => prev.filter((folder) => folder.id !== id))
    } catch (error) {
      console.error("Failed to delete folder:", error)
      setError("Failed to delete folder. Please try again.")
    }
  }

  const handleRenameFolder = async (id: string, newName: string) => {
    try {
      await fileStorage.renameFolder(id, newName)
      setFolders((prev) => prev.map((folder) => (folder.id === id ? { ...folder, name: newName } : folder)))
    } catch (error) {
      console.error("Failed to rename folder:", error)
      setError("Failed to rename folder. Please try again.")
    }
  }

  const handleMoveFiles = async (fileIds: string[], folderId?: string) => {
    try {
      await fileStorage.moveFilesToFolder(fileIds, folderId)
      setFiles((prev) => prev.map((file) => (fileIds.includes(file.id) ? { ...file, folderId } : file)))
      setSelectedFiles(new Set()) // Clear selection after move
    } catch (error) {
      console.error("Failed to move files:", error)
      setError("Failed to move files. Please try again.")
    }
  }

  const handleFileSelectionChange = (fileId: string, selected: boolean) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev)
      if (selected) {
        newSet.add(fileId)
      } else {
        newSet.delete(fileId)
      }
      return newSet
    })
  }

  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) return

    try {
      await Promise.all(Array.from(selectedFiles).map((id) => fileStorage.deleteFile(id)))
      setFiles((prev) => prev.filter((file) => !selectedFiles.has(file.id)))
      setSelectedFiles(new Set())
    } catch (error) {
      console.error("Failed to delete files:", error)
      setError("Failed to delete files. Please try again.")
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

        {error && (
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
              <button onClick={() => setError(null)} className="text-xs text-red-500 underline ml-2">
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 py-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your files...</p>
            </div>
          ) : (
            <>
              {activeTab === "dashboard" && (
                <DashboardTab
                  files={files}
                  folders={folders}
                  onTabChange={setActiveTab}
                  onBulkDelete={handleBulkDelete}
                  onDeleteFile={handleDeleteFile}
                  onMoveFiles={handleMoveFiles}
                  selectedFiles={selectedFiles}
                  onFileSelectionChange={handleFileSelectionChange}
                />
              )}

              {activeTab === "upload" && <UploadTab folders={folders} onFilesUploaded={handleFilesUploaded} />}

              {activeTab === "folders" && (
                <FoldersTab
                  files={files}
                  folders={folders}
                  onCreateFolder={handleCreateFolder}
                  onDeleteFolder={handleDeleteFolder}
                  onRenameFolder={handleRenameFolder}
                  onDeleteFile={handleDeleteFile}
                  selectedFiles={selectedFiles}
                  onFileSelectionChange={handleFileSelectionChange}
                  onBulkDelete={handleBulkDelete}
                  onRefresh={refreshData}
                />
              )}

              {activeTab === "analytics" && <AnalyticsTab files={files} />}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
