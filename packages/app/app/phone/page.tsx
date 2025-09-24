'use client'

import { useClientContext } from '@/context/client-context'
import { useEffect } from 'react'
import { Navbar } from './navbar'
import { UploadBtn } from './upload-btn'
import Image from 'next/image'

export default function Home() {
  const { socketId, connect, status } = useClientContext()
  useEffect(() => {
    if (socketId) {
      const params = new URLSearchParams(window.location.search)
      const id = params.get('id')
      console.log(id)
      if (id) {
        console.log('connect:', id)
        connect(id)
      }
    }
  }, [socketId])

  return (
    <>
      <Navbar />
      <main className="flex min-h-[calc(100dvh-5rem)] flex-col justify-evenly px-[10%]">
        <Image
          src="/person.svg"
          width={400}
          height={400}
          alt="Person"
          className="mx-auto w-11/12"
        />
        <UploadBtn />
      </main>
    </>
  )
}
{
  /* <div>
  <p>Phone - {socketId}</p>
  <p>Status: {status}</p>
  <button className="bg-blue-200 hover:cursor-pointer" onClick={sendFile}>
    Send File
  </button>
</div> */
}
