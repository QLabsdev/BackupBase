"use client"

import { useState, useEffect } from "react"
import { Download, Trash2, Eye, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { generateThumbnail } from "@/lib/thumbnails"
import { FilePreviewModal } from "./file-preview-modal"
import type { StoredFile } from "@/lib/storage"

interface FileWithPreview extends StoredFile {
  blobUrl: string
  thumbnail: string
}

interface EnhancedFileGridProps {
  files: StoredFile[]
  onDeleteFile: (id: string) => void
  selectedFiles: Set<string>
  onFileSelectionChange: (fileId: string, selected: boolean) => void
  onBulkDelete: () => void
}

export function EnhancedFileGrid({
  files,
  onDeleteFile,
  selectedFiles,
  onFileSelectionChange,
  onBulkDelete,
}: EnhancedFileGridProps) {
  const [filesWithPreviews, setFilesWithPreviews] = useState<FileWithPreview[]>([])
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)
  const [selectAll, setSelectAll] = useState(false)

  useEffect(() => {
    const generatePreviews = async () => {
      const previews = await Promise.all(
        files.map(async (file) => {
          const blobUrl = URL.createObjectURL(file.blob)
          const thumbnail = await generateThumbnail(file.blob)
          return {
            ...file,
            blobUrl,
            thumbnail,
          }
        }),
      )
      setFilesWithPreviews(previews)
    }

    generatePreviews()

    return () => {
      filesWithPreviews.forEach((file) => {
        URL.revokeObjectURL(file.blobUrl)
      })
    }
  }, [files])

  useEffect(() => {
    setSelectAll(files.length > 0 && selectedFiles.size === files.length)
  }, [selectedFiles.size, files.length])

  const handleDownload = (file: FileWithPreview) => {
    const a = document.createElement("a")
    a.href = file.blobUrl
    a.download = `file-${file.id}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handlePreview = (index: number) => {
    setPreviewIndex(index)
    setIsPreviewOpen(true)
  }

  const handleSelectAll = (checked: boolean) => {
    files.forEach((file) => {
      onFileSelectionChange(file.id, checked)
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (filesWithPreviews.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <div className="text-gray-400 text-2xl">📁</div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No files uploaded yet</h3>
        <p className="text-gray-500">Upload some files to get started</p>
      </div>
    )
  }

  return (
    <>
      {/* Bulk Actions Header */}
      <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg border">
        <div className="flex items-center space-x-4">
          <Checkbox
            checked={selectAll}
            onCheckedChange={handleSelectAll}
            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
          <span className="text-sm font-medium">
            {selectedFiles.size > 0 ? `${selectedFiles.size} selected` : `${files.length} files`}
          </span>
        </div>
        {selectedFiles.size > 0 && (
          <Button variant="destructive" onClick={onBulkDelete} className="flex items-center space-x-2">
            <Trash2 className="h-4 w-4" />
            <span>Delete Selected ({selectedFiles.size})</span>
          </Button>
        )}
      </div>

      {/* File Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filesWithPreviews.map((file, index) => (
          <div
            key={file.id}
            className={`group relative bg-white rounded-xl border-2 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden ${
              selectedFiles.has(file.id)
                ? "border-blue-500 ring-2 ring-blue-100"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            {/* Selection Checkbox */}
            <div className="absolute top-3 left-3 z-10">
              <Checkbox
                checked={selectedFiles.has(file.id)}
                onCheckedChange={(checked) => onFileSelectionChange(file.id, checked as boolean)}
                className="bg-white/90 backdrop-blur-sm data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
            </div>

            {/* More Actions Menu */}
            <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handlePreview(index)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownload(file)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDeleteFile(file.id)} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Thumbnail */}
            <div className="aspect-square cursor-pointer overflow-hidden" onClick={() => handlePreview(index)}>
              <img
                src={file.thumbnail || "/placeholder.svg"}
                alt="File thumbnail"
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            </div>

            {/* File Info */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  {file.blob.type.split("/")[0]?.toUpperCase() || "FILE"}
                </span>
                <span className="text-xs text-gray-500">{formatFileSize(file.blob.size)}</span>
              </div>

              <p className="text-sm text-gray-600 mb-3">Uploaded {formatDate(file.uploadedAt)}</p>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => handlePreview(index)} className="flex-1 text-xs">
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDownload(file)} className="flex-1 text-xs">
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </div>
            </div>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      <FilePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        files={filesWithPreviews}
        currentIndex={previewIndex}
        onIndexChange={setPreviewIndex}
        onDownload={handleDownload}
        onDelete={(file) => {
          onDeleteFile(file.id)
          setIsPreviewOpen(false)
        }}
      />
    </>
  )
}
