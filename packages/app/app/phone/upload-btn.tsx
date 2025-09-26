'use client'

import { useClientContext } from '@/context/client-context'
import { ChangeEvent, useRef, useState } from 'react'
import { ErrorModal } from './error-modal'

export function UploadBtn() {
  const { sendFiles, status } = useClientContext()
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const [rejectedFiles, setRejectedFiles] = useState<string[]>([])

  const allowedTypesExtensions = [
    '.png',
    '.jpeg',
    '.jpg',
    '.gif',
    '.mp4',
    '.mov',
    '.heic',
    '.webp',
    '.webp',
    '.heif',
    '.avi',
    '.webm',
    '.svg',
  ]
  const allowedTypes = [
    'image/png',
    'image/svg+xml',
    'image/jpeg', // covers .jpeg and .jpg
    'image/gif',
    'image/webp',
    'image/heic',
    'image/heif',
    'video/mp4',
    'video/quicktime', // .mov
    'video/x-msvideo', // .avi
    'video/webm',
  ]

  function handleInput(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return

    const fileArray = Array.from(files)

    const validFiles = fileArray.filter((file) =>
      allowedTypes.includes(file.type),
    )
    const invalidFiles = fileArray.filter(
      (file) => !allowedTypes.includes(file.type),
    )

    if (validFiles.length > 0) {
      sendFiles(validFiles)
    }

    if (invalidFiles.length > 0) {
      setRejectedFiles(
        invalidFiles.map(
          (f) => f.name.split('.')[f.name.split('.').length - 1],
        ),
      )
    } else {
      setRejectedFiles([])
    }

    e.target.value = ''
  }

  return (
    <>
      <button
        onClick={() => {
          imageInputRef.current?.click()
        }}
        disabled={status !== 'connected'}
        className="w-full rounded bg-black py-1.5 text-lg font-medium text-white disabled:opacity-50"
      >
        Choose photos
      </button>
      <input
        type="file"
        ref={imageInputRef}
        accept={allowedTypesExtensions.join(',')}
        multiple
        className="hidden"
        onChange={handleInput}
      />
      <ErrorModal
        isVisible={rejectedFiles.length > 0}
        msg={`The following file types are not supported: ${rejectedFiles.join(', ')}.`}
        close={() => setRejectedFiles([])}
      />
    </>
  )
}
