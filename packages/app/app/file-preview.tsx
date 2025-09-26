import Image from 'next/image'
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Video } from 'lucide-react'

type FilePreviewProps = {
  file: File
}

const MAX_RATIO = 4 / 3

export function FilePreview({ file }: FilePreviewProps) {
  const [initialRotation] = useState(() => Math.random() * 14 - 7)
  const [previewUrl, setPreviewUrl] = useState<string>()
  const [type, setType] = useState<'image' | 'video'>('image')
  const [dimensions, setDimensions] = useState<{
    width: number
    height: number
  }>()

  useEffect(() => {
    const url = URL.createObjectURL(file)

    if (file.type.startsWith('image/')) {
      setPreviewUrl(url)
      const img = new window.Image()
      img.onload = () => setDimensions({ width: img.width, height: img.height })
      img.src = url
    } else if (file.type.startsWith('video/')) {
      setType('video')
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.src = url
      video.onloadedmetadata = () => {
        setDimensions({ width: video.videoWidth, height: video.videoHeight })
        video.currentTime = 1 // capture around 1s in
      }
      video.onseeked = () => {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          setPreviewUrl(canvas.toDataURL('image/png'))
        }
      }
    }

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [file])

  if (previewUrl && dimensions) {
    const aspectRatio = dimensions.width / dimensions.height
    const isTooWide = aspectRatio > MAX_RATIO

    return (
      <motion.div
        className="w-fit rounded-xl border border-gray-200 bg-white p-3"
        style={{ rotate: initialRotation }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1, rotate: 0, zIndex: 100 }}
        whileTap={{ scale: 1.1, rotate: 0, zIndex: 100 }}
      >
        <div
          className="relative h-64 overflow-hidden rounded-lg"
          style={{ aspectRatio: isTooWide ? MAX_RATIO : aspectRatio }}
        >
          <Image
            src={previewUrl}
            alt={file.name}
            fill
            className="object-cover"
          />
          {type === 'video' && (
            <div className="bg-primary absolute top-2 left-2 rounded-full p-2">
              <Video size={25} className="text-white" />
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  return null
}
