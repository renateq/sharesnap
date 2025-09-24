import Image from 'next/image'
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'

type FilePreviewProps = {
  file: File
}

const MAX_RATIO = 16 / 9

export function FilePreview({ file }: FilePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string>()
  const [dimensions, setDimensions] = useState<{
    width: number
    height: number
  }>()

  useEffect(() => {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)

      // load image to get natural dimensions
      const img = new window.Image()
      img.onload = () => {
        setDimensions({ width: img.width, height: img.height })
      }
      img.src = url

      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [file])

  if (previewUrl && dimensions) {
    const aspectRatio = dimensions.width / dimensions.height
    const isTooWide = aspectRatio > MAX_RATIO

    return (
      <motion.div
        className="w-fit rounded-xl bg-white p-3"
        style={{
          rotate: Math.random() * 20 - 10,
        }}
        whileHover={{
          scale: 1.1,
          rotate: 0,
          zIndex: 100,
        }}
        whileTap={{
          scale: 1.1,
          rotate: 0,
          zIndex: 100,
        }}
      >
        <div
          className="relative h-96 overflow-hidden rounded-lg bg-blue-200"
          style={{ aspectRatio: isTooWide ? MAX_RATIO : aspectRatio }}
        >
          <Image
            src={previewUrl}
            alt={file.name}
            fill={true}
            className="object-cover"
            unoptimized
          />
        </div>
      </motion.div>
    )
  }

  return (
    <div className="rounded border bg-gray-100 p-4">
      <span>{file.name}</span>
    </div>
  )
}
