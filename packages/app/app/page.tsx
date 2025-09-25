'use client'

import { useClientContext } from '@/context/client-context'
import { Navbar } from './navbar'
import { Hero } from './hero'
import { DisplaySharedFiles } from '@/app/display-shared-files'

export default function Home() {
  const { status } = useClientContext()

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100dvh-5rem)] px-[10%]">
        {status === 'idle' ? <Hero /> : <DisplaySharedFiles />}
      </main>
    </>
  )
}
