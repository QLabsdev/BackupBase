"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { UploadCloud, X, FolderOpen, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface UploadProgress {
  id: string
  name: string
  progress: number
  status: "pending" | "uploading" | "success" | "failed"
  error?: string
}

interface UploadTabProps {
  folders: { id: string; name: string }[]
  onFilesUploaded: (files: File[], folderId?: string) => void
}
export function UploadTab({ folders, onFilesUploaded }: UploadTabProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadQueue, setUploadQueue] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    setUploadQueue((prev) => [...prev, ...files])
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadQueue((prev) => [...prev, ...files])
  }, [])

  const startUpload = useCallback(async () => {
    if (uploadQueue.length === 0 || isUploading) return

    setIsUploading(true)
    const filesToUpload = [...uploadQueue]
    setUploadQueue([]) // Clear the queue once we start processing

    const initialProgress: UploadProgress[] = filesToUpload.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      name: file.name,
      progress: 0,
      status: "pending",
    }))
    setUploadProgress((prev) => [...prev, ...initialProgress])

    const uploadPromises = filesToUpload.map(async (file, index) => {
      const progressItem = initialProgress[index]
      setUploadProgress((prev) =>
        prev.map((item) => (item.id === progressItem.id ? { ...item, status: "uploading" } : item)),
      )

      try {
        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
          await new Promise((resolve) => setTimeout(resolve, 100))
          setUploadProgress((prev) =>
            prev.map((item) => (item.id === progressItem.id ? { ...item, progress: i } : item)),
          )
        }

        onFilesUploaded([file], selectedFolderId || undefined) // Use the addFile from context
        setUploadProgress((prev) =>
          prev.map((item) => (item.id === progressItem.id ? { ...item, progress: 100, status: "success" } : item)),
        )
      } catch (error: any) {
        console.error("Upload failed:", error)
        setUploadProgress((prev) =>
          prev.map((item) =>
            item.id === progressItem.id ? { ...item, status: "failed", error: error.message || "Unknown error" } : item,
          ),
        )
      }
    })

    await Promise.all(uploadPromises)
    setIsUploading(false)
  }, [uploadQueue, isUploading, onFilesUploaded, selectedFolderId])

  const removeFileFromQueue = useCallback((indexToRemove: number) => {
    setUploadQueue((prev) => prev.filter((_, index) => index !== indexToRemove))
  }, [])

  const clearCompletedUploads = useCallback(() => {
    setUploadProgress((prev) => prev.filter((item) => item.status !== "success" && item.status !== "failed"))
  }, [])

  const handleFolderChange = useCallback((folderId: string) => {
    setSelectedFolderId(folderId === "root" ? null : folderId)
  }, [])

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Upload Files</CardTitle>
          <CardDescription>Drag and drop your files here or click to select.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver ? "border-primary bg-primary/10" : "border-gray-300 dark:border-gray-700"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Drag & drop files here or</p>
            <Input id="file-upload" type="file" multiple className="hidden" onChange={handleFileSelect} />
            <Label
              htmlFor="file-upload"
              className="mt-2 inline-flex cursor-pointer items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 bg-primary text-primary-foreground shadow"
            >
              Browse Files
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <Label htmlFor="folder-select" className="text-sm font-medium">
              Upload to:
            </Label>
            <Select onValueChange={handleFolderChange} value={selectedFolderId || "root"}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="root">All Files (Root)</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {uploadQueue.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Files in Queue ({uploadQueue.length})</h3>
              <AnimatePresence>
                {uploadQueue.map((file, index) => (
                  <motion.div
                    key={file.name + index} // Simple key for queue, will get unique ID on actual upload
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center justify-between rounded-md bg-gray-100 p-3 dark:bg-gray-800"
                  >
                    <span className="text-sm font-medium truncate">{file.name}</span>
                    <Button variant="ghost" size="icon" onClick={() => removeFileFromQueue(index)} className="h-7 w-7">
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
              <Button onClick={startUpload} disabled={isUploading} className="w-full">
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                  </>
                ) : (
                  `Upload ${uploadQueue.length} File(s)`
                )}
              </Button>
            </div>
          )}

          {uploadProgress.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Upload Progress</h3>
              <AnimatePresence>
                {uploadProgress.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    layout
                    className="flex flex-col gap-2 rounded-md bg-gray-100 p-3 dark:bg-gray-800"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{item.name}</span>
                      <span
                        className={`text-xs font-semibold ${
                          item.status === "success"
                            ? "text-green-500"
                            : item.status === "failed"
                              ? "text-red-500"
                              : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {item.status === "uploading" ? `${item.progress}%` : item.status.toUpperCase()}
                      </span>
                    </div>
                    <Progress value={item.progress} className="w-full" />
                    {item.error && <p className="text-xs text-red-500 mt-1">{item.error}</p>}
                  </motion.div>
                ))}
              </AnimatePresence>
              {uploadProgress.some((item) => item.status === "success" || item.status === "failed") && (
                <Button variant="outline" onClick={clearCompletedUploads} className="w-full bg-transparent">
                  Clear Completed
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
