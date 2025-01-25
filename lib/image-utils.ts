export interface ProcessedImage {
  id: string
  file: File
  thumbnailUrl: string
  originalUrl: string
}

export async function processImage(file: File): Promise<ProcessedImage> {
  // Create object URLs for both original and thumbnail
  const originalUrl = URL.createObjectURL(file)
  
  // Create a unique ID for the image
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  return {
    id,
    file,
    thumbnailUrl: originalUrl, // For now, using same URL for both
    originalUrl
  }
}

export function revokeImageUrls(image: ProcessedImage) {
  URL.revokeObjectURL(image.thumbnailUrl)
  URL.revokeObjectURL(image.originalUrl)
} 