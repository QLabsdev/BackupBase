"use client"

import { useState } from "react"
import { Upload, Trash2, TrendingUp, FolderOpen, Move } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { StoredFile, StoredFolder } from "@/lib/storage"
import { EnhancedFileGrid } from "./enhanced-file-grid"

interface DashboardTabProps {
  files: StoredFile[]
  folders: StoredFolder[]
  onTabChange: (tab: string) => void
  onBulkDelete: () => void
  onDeleteFile: (id: string) => void
  onMoveFiles: (fileIds: string[], folderId?: string) => void
  selectedFiles: Set<string>
  onFileSelectionChange: (fileId: string, selected: boolean) => void
}

export function DashboardTab({
  files,
  folders,
  onTabChange,
  onBulkDelete,
  onDeleteFile,
  onMoveFiles,
  selectedFiles,
  onFileSelectionChange,
}: DashboardTabProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string>("")
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false)

  const totalSize = files.reduce((sum, file) => sum + file.blob.size, 0)
  const usagePercentage = Math.min((files.length / 100000) * 100, 100)

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  const handleMoveFiles = () => {
    if (selectedFiles.size === 0) return

    const folderId = selectedFolderId === "root" ? undefined : selectedFolderId
    onMoveFiles(Array.from(selectedFiles), folderId)
    setIsMoveDialogOpen(false)
    setSelectedFolderId("")
  }

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{files.length.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {files.length > 90000 ? "⚠️ Approaching limit" : `${(100000 - files.length).toLocaleString()} remaining`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatSize(totalSize)}</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Folders</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{folders.length}</div>
            <p className="text-xs text-muted-foreground">Organized collections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usagePercentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">of 100,000 files</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => onTabChange("upload")} className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Upload Files</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => onTabChange("folders")}
              className="flex items-center space-x-2 bg-transparent"
            >
              <FolderOpen className="h-4 w-4" />
              <span>Manage Folders</span>
            </Button>
            {selectedFiles.size > 0 && (
              <>
                <Dialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                      <Move className="h-4 w-4" />
                      <span>Move to Folder ({selectedFiles.size})</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Move {selectedFiles.size} files to folder</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a folder" />
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
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsMoveDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleMoveFiles} disabled={!selectedFolderId}>
                          Move Files
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  onClick={onBulkDelete}
                  className="flex items-center space-x-2 bg-transparent text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Selected ({selectedFiles.size})</span>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* All Files Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">All Files</h2>
          {files.length > 0 && <p className="text-sm text-gray-500">{files.length} files total</p>}
        </div>
        <EnhancedFileGrid
          files={files}
          onDeleteFile={onDeleteFile}
          selectedFiles={selectedFiles}
          onFileSelectionChange={onFileSelectionChange}
          onBulkDelete={onBulkDelete}
        />
      </div>
    </div>
  )
}
