"use client"

import { TrendingUp, HardDrive, Clock, FileText, BarChart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { StoredFile } from "@/lib/storage"

interface AnalyticsTabProps {
  files: StoredFile[]
}

export function AnalyticsTab({ files }: AnalyticsTabProps) {
  const totalSize = files.reduce((sum, file) => sum + file.blob.size, 0)
  const usagePercentage = Math.min((files.length / 100000) * 100, 100)

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  // File type analysis
  const fileTypes = files.reduce(
    (acc, file) => {
      const type = file.blob.type.split("/")[0] || "other"
      acc[type] = (acc[type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Size distribution
  const sizeRanges = {
    "Small (< 1MB)": files.filter((f) => f.blob.size < 1024 * 1024).length,
    "Medium (1-10MB)": files.filter((f) => f.blob.size >= 1024 * 1024 && f.blob.size < 10 * 1024 * 1024).length,
    "Large (> 10MB)": files.filter((f) => f.blob.size >= 10 * 1024 * 1024).length,
  }

  // Upload activity (last 7 days)
  const now = Date.now()
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000
  const recentUploads = files.filter((f) => f.uploadedAt > weekAgo).length

  // Get usage status color
  const getUsageColor = () => {
    if (usagePercentage < 50) return "bg-green-500"
    if (usagePercentage < 80) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getUsageStatus = () => {
    if (usagePercentage < 50) return "Good"
    if (usagePercentage < 80) return "Moderate"
    return "High"
  }

  return (
    <div className="space-y-6">
      {/* File Usage Progress */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart className="h-5 w-5" />
            <span>File Storage Usage</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">{files.length.toLocaleString()}</div>
            <p className="text-gray-600">of 100,000 files</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Usage Progress</span>
              <span className="font-medium">{usagePercentage.toFixed(1)}%</span>
            </div>
            <Progress value={usagePercentage} className="h-4" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span>25K</span>
              <span>50K</span>
              <span>75K</span>
              <span>100K</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-lg font-semibold">{(100000 - files.length).toLocaleString()}</div>
              <p className="text-xs text-gray-500">Remaining</p>
            </div>
            <div className="text-center">
              <div className={`text-lg font-semibold ${usagePercentage > 80 ? "text-red-600" : "text-green-600"}`}>
                {getUsageStatus()}
              </div>
              <p className="text-xs text-gray-500">Status</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{formatSize(totalSize)}</div>
              <p className="text-xs text-gray-500">Total Size</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Capacity</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usagePercentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mb-2">{files.length.toLocaleString()} of 100,000 files</p>
            <Progress value={usagePercentage} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatSize(totalSize)}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {files.length > 0 ? formatSize(totalSize / files.length) : "0 B"} per file
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">File Count</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{files.length}</div>
            <p className="text-xs text-muted-foreground">Total files stored</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentUploads}</div>
            <p className="text-xs text-muted-foreground">Files uploaded this week</p>
          </CardContent>
        </Card>
      </div>

      {/* File type breakdown */}
      

      {/* Size distribution */}
      

      {/* Storage warnings */}
      {usagePercentage > 80 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Storage Warning</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700">
              You're using {usagePercentage.toFixed(1)}% of your storage capacity. Consider deleting unused files to
              free up space.
            </p>
          </CardContent>
        </Card>
      )}

      {usagePercentage > 95 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Critical Storage Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              You're approaching the maximum storage limit! Only {(100000 - files.length).toLocaleString()} files
              remaining. Please delete some files to continue uploading.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
