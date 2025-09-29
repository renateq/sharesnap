import { AnimatePresence, motion } from 'motion/react'

type ShareStatusModalProps = {
  totalFiles: number
  noOfSharedFiles: number
  isVisible: boolean
}

export function ShareStatusModal({
  totalFiles,
  noOfSharedFiles,
  isVisible,
}: ShareStatusModalProps) {
  return (
    <div className="fixed top-4 left-0 w-full px-[3%]">
      <AnimatePresence initial={false}>
        {isVisible ? (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto flex max-w-lg items-center gap-4 rounded-lg border border-gray-100 bg-white p-1.5 shadow"
          >
            <div className="h-17 w-17">
              <CircularProgress
                progress={Math.floor((noOfSharedFiles / totalFiles) * 100)}
              />
            </div>
            <div>
              <p className="font-medium">Sharing files</p>
              <p className="mt-0.5 opacity-70">
                {noOfSharedFiles} out of {totalFiles}{' '}
                {totalFiles > 1 ? 'files' : 'file'} shared
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

type CircularProgressProps = {
  size?: number
  progress: number
  strokeWidth?: number
}

function CircularProgress({
  size = 80,
  progress,
  strokeWidth = 13,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90 transform">
        {/* Background circle */}
        <circle
          className="text-gray-300"
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx="50"
          cy="50"
        />

        {/* Progress circle */}
        <circle
          className="text-blue-500 transition-all duration-500"
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          r={radius}
          cx="50"
          cy="50"
        />
      </svg>

      {/* Centered text */}
      {
        <span className="absolute text-xs font-semibold text-gray-700">
          {progress}%
        </span>
      }
    </div>
  )
}
