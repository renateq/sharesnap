'use client'

import { useClientContext } from '@/context/client-context'
import { useEffect } from 'react'
import { Navbar } from './navbar'
import { UploadBtn } from './upload-btn'
import Image from 'next/image'
import { LoaderCircle } from 'lucide-react'

export default function Home() {
  const { socketId, connect, status } = useClientContext()
  useEffect(() => {
    if (socketId) {
      const params = new URLSearchParams(window.location.search)
      const id = params.get('id')
      if (id) {
        connect(id)
      }
    }
  }, [socketId])

  return (
    <>
      <Navbar />
      <main className="flex min-h-[calc(100dvh-5rem)] flex-col justify-evenly px-[10%]">
        {status === 'idle' ? (
          <div>
            <LoaderCircle
              size={50}
              className="mx-auto animate-spin opacity-20"
            />
          </div>
        ) : (
          <>
            <Image
              src="/person.svg"
              width={400}
              height={400}
              alt="Person"
              className="mx-auto w-10/12 max-w-lg"
            />
            <UploadBtn />
          </>
        )}
      </main>
    </>
  )
}
