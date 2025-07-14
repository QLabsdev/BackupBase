"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileUploadProps {
  onFilesUploaded: (files: File[]) => void
  isUploading: boolean
}

export function FileUpload({ onFilesUploaded, isUploading }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        onFilesUploaded(files)
      }
    },
    [onFilesUploaded],
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
        onFilesUploaded(files)
      }
      // Reset input
      e.target.value = ""
    },
    [onFilesUploaded],
  )

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
      } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{isUploading ? "Uploading files..." : "Upload files"}</h3>
      <p className="text-gray-500 mb-4">Drag and drop files here, or click to select files</p>
      <input
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        id="file-input"
        disabled={isUploading}
      />
      <Button asChild disabled={isUploading}>
        <label htmlFor="file-input" className="cursor-pointer">
          Select Files
        </label>
      </Button>
    </div>
  )
}
