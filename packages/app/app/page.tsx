'use client'

import { useClientContext } from '@/context/client-context'

export default function Home() {
  const { socketId, status } = useClientContext()

  return (
    <div>
      <p>Laptop</p>
      <p>Status: {status}</p>
      {socketId && (
        <a href={`/phone?id=${socketId}`} target="_blank">
          Open Phone
        </a>
      )}
    </div>
  )
}
