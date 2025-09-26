import Image from 'next/image'
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Copy, Download, Video } from 'lucide-react'

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
        className="w-fit overflow-hidden rounded-xl border border-gray-200 bg-white p-3"
        style={{ rotate: initialRotation }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1, rotate: 0, zIndex: 100 }}
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
        <div className="absolute top-0 left-0 h-full w-full bg-black/10 opacity-0 hover:opacity-100">
          <div className="absolute right-5 bottom-5 flex items-center gap-2">
            <DownloadBtn file={file} />
            {type !== 'video' && <CopyBtn file={file} />}
          </div>
        </div>
      </motion.div>
    )
  }

  return null
}

type BtnProps = {
  file: File
}

function CopyBtn({ file }: BtnProps) {
  async function svgToPngBlob(file: File): Promise<Blob> {
    const text = await file.text()
    const svgUrl =
      'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(text)

    const img = document.createElement('img')
    img.src = svgUrl
    await img.decode()

    const canvas = document.createElement('canvas')
    canvas.width = img.width || 512
    canvas.height = img.height || 512
    const ctx = canvas.getContext('2d')
    ctx?.drawImage(img, 0, 0)

    return new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b as Blob), 'image/png'),
    )
  }

  async function handleCopy() {
    try {
      let blob: Blob

      if (file.type === 'image/svg+xml') {
        blob = await svgToPngBlob(file)
      } else {
        const bitmap = await createImageBitmap(file)
        const canvas = document.createElement('canvas')
        canvas.width = bitmap.width
        canvas.height = bitmap.height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(bitmap, 0, 0)

        blob = await new Promise<Blob>((resolve) =>
          canvas.toBlob((b) => resolve(b as Blob), 'image/png'),
        )
      }

      const item = new ClipboardItem({ 'image/png': blob })
      await navigator.clipboard.write([item])
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={handleCopy}
      className="rounded-lg border border-gray-400 bg-white p-1"
    >
      <Copy size={25} />
    </motion.button>
  )
}

function DownloadBtn({ file }: BtnProps) {
  const [id, setId] = useState<number | null>(null)

  function handleDownload() {
    let currentId = id

    if (!currentId) {
      const newId = Number(sessionStorage.getItem('noOfDownloads')) || 1
      sessionStorage.setItem('noOfDownloads', (newId + 1).toString())
      setId(newId)
      currentId = newId
    }

    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = `sharesnap_${currentId}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={handleDownload}
      className="rounded-lg border border-gray-400 bg-white p-1"
    >
      <Download size={25} />
    </motion.button>
  )
}
