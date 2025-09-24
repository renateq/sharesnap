'use client'

import { useClientContext } from '@/context/client-context'
import { useRef } from 'react'

export function UploadBtn() {
  const { sendFiles } = useClientContext()

  const imageInputRef = useRef<HTMLInputElement | null>(null)

  return (
    <>
      <button
        onClick={() => {
          imageInputRef.current?.click()
        }}
        className="w-full rounded bg-black py-1.5 text-lg font-medium text-white"
      >
        Choose photos
      </button>
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = e.target.files
          if (!files) return

          sendFiles(Array.from(files))

          e.target.value = ''
        }}
      />
    </>
  )
}
