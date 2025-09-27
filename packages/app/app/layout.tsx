import type { Metadata } from 'next'
import './globals.css'
import { ClientContextProvider } from '@/context/client-context'

export const metadata: Metadata = {
  title: 'Sharesnap',
  description: 'Quickly share pictures from phone to desktop',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="bg-white">
        <ClientContextProvider>{children}</ClientContextProvider>
      </body>
    </html>
  )
}
