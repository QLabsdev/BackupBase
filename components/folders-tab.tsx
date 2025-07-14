"use client"

import { useState } from "react"
import { Folder, FolderPlus, Edit3, Trash2, FileText, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { EnhancedFileGrid } from "./enhanced-file-grid"
import type { StoredFile, StoredFolder } from "@/lib/storage"

interface FoldersTabProps {
  files: StoredFile[]
  folders: StoredFolder[]
  onCreateFolder: (name: string) => void
  onDeleteFolder: (id: string) => void
  onRenameFolder: (id: string, newName: string) => void
  onDeleteFile: (id: string) => void
  selectedFiles: Set<string>
  onFileSelectionChange: (fileId: string, selected: boolean) => void
  onBulkDelete: () => void
  onRefresh: () => void
}

export function FoldersTab({
  files,
  folders,
  onCreateFolder,
  onDeleteFolder,
  onRenameFolder,
  onDeleteFile,
  selectedFiles,
  onFileSelectionChange,
  onBulkDelete,
  onRefresh,
}: FoldersTabProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(undefined)
  const [newFolderName, setNewFolderName] = useState("")
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const selectedFolder = folders.find((f) => f.id === selectedFolderId)
  const folderFiles = selectedFolderId
    ? files.filter((f) => f.folderId === selectedFolderId)
    : files.filter((f) => !f.folderId)

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim())
      setNewFolderName("")
      setIsCreateDialogOpen(false)
    }
  }

  const handleRenameFolder = (folderId: string) => {
    if (editName.trim()) {
      onRenameFolder(folderId, editName.trim())
      setEditingFolderId(null)
      setEditName("")
    }
  }

  const handleDeleteFolder = async (folderId: string) => {
    // Move files back to root before deleting folder
    const folderFiles = files.filter((f) => f.folderId === folderId)
    if (folderFiles.length > 0) {
      // In a real implementation, you'd want to confirm this action
      alert(`This folder contains ${folderFiles.length} files. They will be moved to the root folder.`)
    }
    onDeleteFolder(folderId)
    if (selectedFolderId === folderId) {
      setSelectedFolderId(undefined)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getFileCount = (folderId?: string) => {
    return files.filter((f) => f.folderId === folderId).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Folders</h2>
          <p className="text-gray-600">Organize your files into folders</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <FolderPlus className="h-4 w-4" />
              <span>New Folder</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Enter folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
                  Create Folder
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Folders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* All Files Folder */}
        <Card
          className={`cursor-pointer transition-all hover:shadow-lg ${
            selectedFolderId === undefined ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-md"
          }`}
          onClick={() => setSelectedFolderId(undefined)}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Folder className="h-8 w-8 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">All Files</h3>
                <p className="text-sm text-gray-500">{getFileCount(undefined)} files</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Created Folders */}
        {folders.map((folder) => (
          <Card
            key={folder.id}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedFolderId === folder.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-md"
            }`}
            onClick={() => setSelectedFolderId(folder.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Folder className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  {editingFolderId === folder.id ? (
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => handleRenameFolder(folder.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRenameFolder(folder.id)
                        if (e.key === "Escape") setEditingFolderId(null)
                      }}
                      className="text-sm"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <h3 className="font-semibold text-gray-900 truncate">{folder.name}</h3>
                  )}
                  <p className="text-sm text-gray-500">{getFileCount(folder.id)} files</p>
                  <p className="text-xs text-gray-400 flex items-center mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(folder.createdAt)}
                  </p>
                </div>
                <div className="flex flex-col space-y-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingFolderId(folder.id)
                      setEditName(folder.name)
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteFolder(folder.id)
                    }}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Current Folder Content */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold">{selectedFolder ? selectedFolder.name : "All Files"}</h3>
            <span className="text-sm text-gray-500">({folderFiles.length} files)</span>
          </div>
          <Button variant="outline" onClick={onRefresh} size="sm">
            Refresh
          </Button>
        </div>

        {folderFiles.length > 0 ? (
          <EnhancedFileGrid
            files={folderFiles}
            onDeleteFile={onDeleteFile}
            selectedFiles={selectedFiles}
            onFileSelectionChange={onFileSelectionChange}
            onBulkDelete={onBulkDelete}
          />
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedFolder ? "Folder is empty" : "No files yet"}
              </h3>
              <p className="text-gray-500">
                {selectedFolder
                  ? "Upload files or move existing files to this folder"
                  : "Upload some files to get started"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
