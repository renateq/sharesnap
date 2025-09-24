'use client'

import { useClientContext } from '@/context/client-context'
import { Gallery } from './gallery'

export default function Home() {
  const { socketId, status, sharedFiles } = useClientContext()

  return (
    <div>
      <p>Laptop</p>
      <p>Status: {status}</p>
      {socketId && (
        <a href={`/phone?id=${socketId}`} target="_blank">
          Open Phone
        </a>
      )}
      <p>Shared files: {sharedFiles.length}</p>
      <Gallery files={sharedFiles} />
    </div>
  )
}
