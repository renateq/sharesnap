import type { Metadata } from 'next'
import './globals.css'
import { ClientContextProvider } from '@/context/client-context'

export const metadata: Metadata = {
  title: 'Snapshift',
  description:
    'Snapshift lets you send photos from phone to laptop in seconds. Just scan a QR code, select pictures, and they appear instantly - no cables, no email.',
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
