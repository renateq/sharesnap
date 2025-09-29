import { useClientContext } from '@/context/client-context'
import { LoaderCircle } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { motion } from 'motion/react'

export function QRCode() {
  const { socketId } = useClientContext()

  function handleClick() {
    if (process.env.NODE_ENV === 'development') {
      window.open(
        `${window.location.origin}/phone?id=${socketId}`,
        '_blank',
        'noopener,noreferrer',
      )
    }
  }

  if (socketId) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="flex h-[180px] w-[180px] items-center justify-center rounded-2xl bg-white shadow-2xl"
      >
        <QRCodeSVG
          id="qr-code"
          value={`${window.location.origin}/phone?id=${socketId}`}
          onClick={handleClick}
          size={150}
        />
      </motion.div>
    )
  }

  return (
    <div className="flex h-[180px] w-[180px] items-center justify-center">
      <LoaderCircle size={50} className="animate-spin text-gray-300" />
    </div>
  )
}
