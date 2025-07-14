"use client"

import type React from "react"
import { motion, AnimatePresence } from "framer-motion" // Import motion and AnimatePresence
import { useState, useCallback } from "react"
import { Upload, CheckCircle, XCircle, AlertCircle, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { StoredFolder } from "@/lib/storage"

interface UploadTabProps {
  folders: StoredFolder[]
  onFilesUploaded: (files: File[], folderId?: string) => void
}

interface UploadProgress {
  id: string // Add an ID for unique key in animations
  file: File
  progress: number
  status: "uploading" | "success" | "error"
  error?: string
}

export function UploadTab({ folders, onFilesUploaded }: UploadTabProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFolderId, setSelectedFolderId] = useState<string>("")

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleUpload(files)
      }
    },
    [selectedFolderId],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      if (files.length > 0) {
        handleUpload(files)
      }
      // Reset input
      e.target.value = ""
    },
    [selectedFolderId],
  )

  const handleUpload = async (filesToUpload: File[]) => {
    setIsUploading(true)

    // Initialize progress tracking for each file with a unique ID
    const initialProgress: UploadProgress[] = filesToUpload.map((file) => ({
      id: crypto.randomUUID(), // Generate unique ID for each file
      file,
      progress: 0,
      status: "uploading" as const,
    }))
    setUploadProgress(initialProgress)

    const folderId = selectedFolderId === "root" ? undefined : selectedFolderId || undefined

    const uploadPromises = filesToUpload.map(async (file, index) => {
      const uploadItem = initialProgress[index]
      try {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise((resolve) => setTimeout(resolve, 50)) // Faster simulation
          setUploadProgress((prev) => prev.map((item) => (item.id === uploadItem.id ? { ...item, progress } : item)))
        }
        // Mark as complete
        setUploadProgress((prev) =>
          prev.map((item) => (item.id === uploadItem.id ? { ...item, status: "success" } : item)),
        )
        return file // Return the file on success
      } catch (error) {
        console.error(`Upload failed for ${file.name}:`, error)
        setUploadProgress((prev) =>
          prev.map((item) => (item.id === uploadItem.id ? { ...item, status: "error", error: "Upload failed" } : item)),
        )
        return null // Return null on error
      }
    })

    const uploadedFiles = (await Promise.all(uploadPromises)).filter(Boolean) as File[] // Filter out nulls

    // Call the upload handler with folder ID for successfully uploaded files
    if (uploadedFiles.length > 0) {
      onFilesUploaded(uploadedFiles, folderId)
    }

    // Clear progress after a delay
    setTimeout(() => {
      setUploadProgress([])
    }, 2000)
    setIsUploading(false)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  const selectedFolder = folders.find((f) => f.id === selectedFolderId)

  return (
    <div className="space-y-6">
      {/* Folder Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FolderOpen className="h-5 w-5" />
            <span>Upload Destination</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Select folder for uploaded files:</label>
            <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a folder (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="root">📁 All Files (Root)</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    📂 {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedFolder && (
              <p className="text-sm text-gray-500">
                Files will be uploaded to: <span className="font-medium">{selectedFolder.name}</span>
              </p>
            )}
            {selectedFolderId === "root" && (
              <p className="text-sm text-gray-500">
                Files will be uploaded to: <span className="font-medium">All Files (Root)</span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
            } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {isUploading ? "Uploading files..." : "Drop files here"}
            </h3>
            <p className="text-gray-500 mb-6">Drag and drop files here, or click to select files</p>
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
              disabled={isUploading}
            />
            <Button asChild disabled={isUploading} size="lg">
              <label htmlFor="file-input" className="cursor-pointer">
                Select Files
              </label>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <AnimatePresence>
                {uploadProgress.map((item) => (
                  <motion.div
                    key={item.id} // Use unique ID as key
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    layout // Enable smooth layout transitions
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {item.status === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {item.status === "error" && <XCircle className="h-5 w-5 text-red-500" />}
                        {item.status === "uploading" && <AlertCircle className="h-5 w-5 text-blue-500" />}
                        <div>
                          <p className="text-sm font-medium truncate max-w-xs">{item.file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(item.file.size)}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{item.progress}%</span>
                    </div>
                    <Progress value={item.progress} className="h-2" />
                    {item.error && <p className="text-xs text-red-500">{item.error}</p>}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
