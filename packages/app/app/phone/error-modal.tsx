import { TriangleAlert, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

type ErrorModalProps = {
  msg: string
  isVisible: boolean
  close: () => void
}

export function ErrorModal({ msg, isVisible, close }: ErrorModalProps) {
  return (
    <div className="fixed top-4 left-0 w-full px-[3%]">
      <AnimatePresence initial={false}>
        {isVisible ? (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto max-w-lg rounded-lg border border-gray-100 bg-white p-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12">
                  <div className="flex h-7 w-7 items-center justify-center rounded bg-red-100">
                    <TriangleAlert className="text-red-700" size={20} />
                  </div>
                </div>
                <span className="text-sm font-semibold">Ooops</span>
              </div>
              <button onClick={close} className="p-0.5 opacity-70">
                <X size={18} />
              </button>
            </div>
            <p className="mt-2 pl-12 text-sm">{msg}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
