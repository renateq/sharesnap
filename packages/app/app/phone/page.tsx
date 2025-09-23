'use client'

import { useClientContext } from '@/context/client-context'
import { useEffect } from 'react'

export default function Home() {
  const { socketId, connect, status, sendFile } = useClientContext()
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
    <div>
      <p>Phone - {socketId}</p>
      <p>Status: {status}</p>
      <button className="bg-blue-200 hover:cursor-pointer" onClick={sendFile}>
        Send File
      </button>
    </div>
  )
}
