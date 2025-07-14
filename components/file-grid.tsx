"use client"

import { useState, useEffect } from "react"
import { Download, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { generateThumbnail } from "@/lib/thumbnails"
import type { StoredFile } from "@/lib/storage"

interface FileWithPreview extends StoredFile {
  blobUrl: string
  thumbnail: string
}

interface FileGridProps {
  files: StoredFile[]
  onDeleteFile: (id: string) => void
}

export function FileGrid({ files, onDeleteFile }: FileGridProps) {
  const [filesWithPreviews, setFilesWithPreviews] = useState<FileWithPreview[]>([])

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

    // Cleanup blob URLs when component unmounts or files change
    return () => {
      filesWithPreviews.forEach((file) => {
        URL.revokeObjectURL(file.blobUrl)
      })
    }
  }, [files])

  const handleDownload = (file: FileWithPreview) => {
    const a = document.createElement("a")
    a.href = file.blobUrl
    a.download = `file-${file.id}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  if (filesWithPreviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No files uploaded yet</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {filesWithPreviews.map((file) => (
        <div
          key={file.id}
          className="group relative bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="aspect-square p-2">
            <img
              src={file.thumbnail || "/placeholder.svg"}
              alt="File thumbnail"
              className="w-full h-full object-cover rounded"
            />
          </div>

          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleDownload(file)}
                className="bg-white text-black hover:bg-gray-100"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onDeleteFile(file.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-2 border-t">
            <p className="text-xs text-gray-500 truncate">{new Date(file.uploadedAt).toLocaleDateString()}</p>
            <p className="text-xs text-gray-400">{(file.blob.size / 1024).toFixed(1)} KB</p>
          </div>
        </div>
      ))}
    </div>
  )
}
