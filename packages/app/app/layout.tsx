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
      <body>
        <ClientContextProvider>{children}</ClientContextProvider>
      </body>
    </html>
  )
}
