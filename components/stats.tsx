"use client"

interface StatsProps {
  fileCount: number
  totalSize: number
}

export function Stats({ fileCount, totalSize }: StatsProps) {
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  const usagePercentage = Math.min((fileCount / 100000) * 100, 100)

  return (
    <div className="bg-white rounded-lg border p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Storage Stats</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-500">Files Stored</p>
          <p className="text-2xl font-bold">{fileCount.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Total Size</p>
          <p className="text-2xl font-bold">{formatSize(totalSize)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Capacity Used</p>
          <p className="text-2xl font-bold">{usagePercentage.toFixed(1)}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
        </div>
      </div>
      {fileCount > 90000 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">⚠️ Approaching storage limit (100,000 files)</p>
        </div>
      )}
    </div>
  )
}
