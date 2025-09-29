'use client'

import { useClientContext } from '@/context/client-context'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { ErrorModal } from './error-modal'
import { motion } from 'motion/react'
import { Check, Images } from 'lucide-react'

enum State {
  idle,
  sending,
  done,
}

export function UploadBtn() {
  const { sendFiles, status, isSending } = useClientContext()
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const [rejectedFiles, setRejectedFiles] = useState<string[]>([])
  const [state, setState] = useState<State>(State.idle)

  useEffect(() => {
    if (isSending) {
      setState(State.sending)
    } else if (state === State.sending) {
      setState(State.done)
      setTimeout(() => {
        setState(State.idle)
      }, 2000)
    }
  }, [isSending])

  const allowedTypesExtensions = [
    '.png',
    '.jpeg',
    '.jpg',
    '.gif',
    '.heic',
    '.webp',
    '.webp',
    '.heif',
    '.svg',
    /* '.mp4',
    '.mov',
    '.avi',
    '.webm', */
  ]
  const allowedTypes = [
    'image/png',
    'image/svg+xml',
    'image/jpeg', // covers .jpeg and .jpg
    'image/gif',
    'image/webp',
    'image/heic',
    'image/heif',
    /* 'video/mp4',
    'video/quicktime', // .mov
    'video/x-msvideo', // .avi
    'video/webm', */
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
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          imageInputRef.current?.click()
        }}
        disabled={status !== 'connected' || state !== State.idle}
        className="flex h-13 w-full items-center justify-center gap-4 rounded-lg bg-black text-xl font-medium text-white"
      >
        {state === State.idle && (
          <>
            <Images size={30} />
            <span>Choose photos</span>
          </>
        )}
        {state === State.sending && <Loader />}
        {state === State.done && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <Check size={40} />
          </motion.div>
        )}
      </motion.button>
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

export default function Loader() {
  const dots = [0, 1, 2]
  const duration = 0.4

  return (
    <div className="flex gap-4">
      {dots.map((dot, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{
            duration: duration,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: (i * duration) / dots.length,
          }}
          className="h-6 w-6 rounded-full bg-white"
        />
      ))}
    </div>
  )
}
