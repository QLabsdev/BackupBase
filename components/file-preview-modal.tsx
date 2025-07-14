"use client"

import { useState, useEffect } from "react"
import { X, ChevronLeft, ChevronRight, Download, Trash2, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import type { StoredFile } from "@/lib/storage"

interface FileWithPreview extends StoredFile {
  blobUrl: string
  thumbnail: string
}

interface FilePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  files: FileWithPreview[]
  currentIndex: number
  onIndexChange: (index: number) => void
  onDownload: (file: FileWithPreview) => void
  onDelete: (file: FileWithPreview) => void
}

export function FilePreviewModal({
  isOpen,
  onClose,
  files,
  currentIndex,
  onIndexChange,
  onDownload,
  onDelete,
}: FilePreviewModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const currentFile = files[currentIndex]

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case "Escape":
          onClose()
          break
        case "ArrowLeft":
          if (currentIndex > 0) onIndexChange(currentIndex - 1)
          break
        case "ArrowRight":
          if (currentIndex < files.length - 1) onIndexChange(currentIndex + 1)
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, currentIndex, files.length, onClose, onIndexChange])

  if (!currentFile) return null

  const canShowInIframe = (file: FileWithPreview) => {
    const type = file.blob.type
    return (
      type.startsWith("image/") ||
      type.startsWith("video/") ||
      type.startsWith("audio/") ||
      type.includes("pdf") ||
      type.startsWith("text/")
    )
  }

  const getIframeSrc = (file: FileWithPreview) => {
    if (file.blob.type.includes("pdf")) {
      return `${file.blobUrl}#toolbar=1&navpanes=1&scrollbar=1`
    }
    return file.blobUrl
  }

  const renderPreview = () => {
    if (currentFile.blob.type.startsWith("image/")) {
      return (
        <img
          src={currentFile.blobUrl || "/placeholder.svg"}
          alt="Preview"
          className="max-w-full max-h-full object-contain"
          style={{ maxHeight: isFullscreen ? "100vh" : "70vh" }}
        />
      )
    }

    if (currentFile.blob.type.startsWith("video/")) {
      return (
        <video
          src={currentFile.blobUrl}
          controls
          className="max-w-full max-h-full"
          style={{ maxHeight: isFullscreen ? "100vh" : "70vh" }}
        />
      )
    }

    if (currentFile.blob.type.startsWith("audio/")) {
      return (
        <div className="flex flex-col items-center space-y-4">
          <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
            <div className="text-white text-4xl">♪</div>
          </div>
          <audio src={currentFile.blobUrl} controls className="w-full max-w-md" />
        </div>
      )
    }

    if (canShowInIframe(currentFile)) {
      return (
        <iframe
          src={getIframeSrc(currentFile)}
          className="w-full border-0 rounded-lg"
          style={{ height: isFullscreen ? "100vh" : "70vh" }}
          title="File preview"
        />
      )
    }

    return (
      <div className="flex flex-col items-center space-y-4 p-8">
        <img
          src={currentFile.thumbnail || "/placeholder.svg"}
          alt="File thumbnail"
          className="w-48 h-48 object-cover rounded-lg"
        />
        <p className="text-gray-500">Preview not available for this file type</p>
        <Button onClick={() => onDownload(currentFile)}>
          <Download className="h-4 w-4 mr-2" />
          Download to View
        </Button>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`${isFullscreen ? "max-w-none w-screen h-screen" : "max-w-6xl w-full max-h-[90vh]"} p-0`}
      >
        <div className="relative flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-white">
            <div className="flex items-center space-x-4">
              <h3 className="font-semibold truncate">
                File {currentIndex + 1} of {files.length}
              </h3>
              <span className="text-sm text-gray-500">
                {currentFile.blob.type || "Unknown type"} • {formatFileSize(currentFile.blob.size)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDownload(currentFile)}>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(currentFile)}>
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 flex items-center justify-center bg-gray-50 relative overflow-hidden">
            {renderPreview()}

            {/* Navigation Arrows */}
            {files.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                  onClick={() => onIndexChange(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                  onClick={() => onIndexChange(Math.min(files.length - 1, currentIndex + 1))}
                  disabled={currentIndex === files.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {/* Thumbnail Slider */}
          {files.length > 1 && (
            <div className="p-4 border-t bg-white">
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {files.map((file, index) => (
                  <button
                    key={file.id}
                    onClick={() => onIndexChange(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentIndex
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={file.thumbnail || "/placeholder.svg"}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
}
