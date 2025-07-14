export function generateThumbnail(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    canvas.width = 300
    canvas.height = 300

    if (!ctx) {
      reject(new Error("Canvas context not available"))
      return
    }

    // Set background with subtle gradient
    const gradient = ctx.createLinearGradient(0, 0, 300, 300)
    gradient.addColorStop(0, "#f8fafc")
    gradient.addColorStop(1, "#f1f5f9")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 300, 300)

    if (blob.type.startsWith("image/")) {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        // Calculate dimensions to fit within canvas while maintaining aspect ratio
        const scale = Math.min(280 / img.width, 280 / img.height)
        const width = img.width * scale
        const height = img.height * scale
        const x = (300 - width) / 2
        const y = (300 - height) / 2

        // Add subtle shadow
        ctx.shadowColor = "rgba(0, 0, 0, 0.1)"
        ctx.shadowBlur = 10
        ctx.shadowOffsetY = 4

        // Draw rounded rectangle background
        ctx.fillStyle = "#ffffff"
        roundRect(ctx, x - 5, y - 5, width + 10, height + 10, 8)
        ctx.fill()

        // Reset shadow
        ctx.shadowColor = "transparent"
        ctx.shadowBlur = 0
        ctx.shadowOffsetY = 0

        // Draw image with rounded corners
        ctx.save()
        roundRect(ctx, x, y, width, height, 4)
        ctx.clip()
        ctx.drawImage(img, x, y, width, height)
        ctx.restore()

        resolve(canvas.toDataURL("image/jpeg", 0.9))
      }
      img.onerror = () => {
        drawFileIcon(ctx, blob.type, blob.size)
        resolve(canvas.toDataURL("image/jpeg", 0.9))
      }
      img.src = URL.createObjectURL(blob)
    } else {
      drawFileIcon(ctx, blob.type, blob.size)
      resolve(canvas.toDataURL("image/jpeg", 0.9))
    }
  })
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

function drawFileIcon(ctx: CanvasRenderingContext2D, mimeType: string, fileSize: number) {
  // Draw file icon background with gradient
  const gradient = ctx.createLinearGradient(75, 75, 225, 225)
  const color = getColorForFileType(mimeType)
  gradient.addColorStop(0, color)
  gradient.addColorStop(1, adjustBrightness(color, -20))

  ctx.fillStyle = gradient
  ctx.shadowColor = "rgba(0, 0, 0, 0.2)"
  ctx.shadowBlur = 15
  ctx.shadowOffsetY = 8

  roundRect(ctx, 75, 75, 150, 180, 12)
  ctx.fill()

  // Reset shadow
  ctx.shadowColor = "transparent"
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0

  // Draw file icon corner fold
  ctx.fillStyle = "#ffffff"
  ctx.globalAlpha = 0.3
  ctx.beginPath()
  ctx.moveTo(195, 75)
  ctx.lineTo(225, 105)
  ctx.lineTo(195, 105)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1

  // Draw file type text
  ctx.fillStyle = "#ffffff"
  ctx.font = "bold 24px sans-serif"
  ctx.textAlign = "center"
  const extension = getFileExtension(mimeType)
  ctx.fillText(extension.toUpperCase(), 150, 140)

  // Draw file size
  ctx.fillStyle = "#ffffff"
  ctx.globalAlpha = 0.8
  ctx.font = "14px sans-serif"
  ctx.fillText(formatFileSize(fileSize), 150, 165)
  ctx.globalAlpha = 1

  // Draw file type description
  ctx.fillStyle = "#ffffff"
  ctx.globalAlpha = 0.6
  ctx.font = "12px sans-serif"
  ctx.fillText(getFileTypeDescription(mimeType), 150, 200)
  ctx.globalAlpha = 1
}

function adjustBrightness(hex: string, percent: number): string {
  const num = Number.parseInt(hex.replace("#", ""), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = ((num >> 8) & 0x00ff) + amt
  const B = (num & 0x0000ff) + amt
  return (
    "#" +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  )
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
}

function getFileTypeDescription(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "Image File"
  if (mimeType.startsWith("video/")) return "Video File"
  if (mimeType.startsWith("audio/")) return "Audio File"
  if (mimeType.includes("pdf")) return "PDF Document"
  if (mimeType.includes("text/")) return "Text File"
  if (mimeType.includes("json")) return "JSON Data"
  if (mimeType.includes("zip") || mimeType.includes("rar")) return "Archive"
  return "File"
}

function getColorForFileType(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "#10b981"
  if (mimeType.startsWith("video/")) return "#3b82f6"
  if (mimeType.startsWith("audio/")) return "#8b5cf6"
  if (mimeType.includes("pdf")) return "#ef4444"
  if (mimeType.includes("text/") || mimeType.includes("json")) return "#f59e0b"
  if (mimeType.includes("zip") || mimeType.includes("rar")) return "#6366f1"
  return "#64748b"
}

function getFileExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "audio/mp3": "mp3",
    "audio/wav": "wav",
    "application/pdf": "pdf",
    "text/plain": "txt",
    "application/json": "json",
    "application/zip": "zip",
  }
  return extensions[mimeType] || "file"
}
