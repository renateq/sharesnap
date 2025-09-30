'use client'

import { useClientContext } from '@/context/client-context'

export function Navbar() {
  const { status } = useClientContext()

  return (
    <nav className="flex h-20 items-center px-[10%]">
      <button
        disabled={status === 'idle'}
        onClick={() => window.location.reload()}
      >
        <p className="flex items-baseline gap-1 text-xl font-medium">
          Snapshift
          <span className="bg-primary inline-block h-2.5 w-2.5 rounded-full"></span>
        </p>
      </button>
    </nav>
  )
}
