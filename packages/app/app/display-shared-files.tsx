import { useClientContext } from '@/context/client-context'
import { Gallery } from './gallery'
import { Download } from 'lucide-react'
import { motion } from 'motion/react'
import JSZip from 'jszip'

export function DisplaySharedFiles() {
  const { sharedFiles } = useClientContext()

  return (
    <div className="mt-5 mb-20 xl:px-[10%]">
      <motion.button
        onClick={() => downloadFilesAsZip(sharedFiles)}
        whileTap={{ scale: 1.1, rotate: 0, zIndex: 100 }}
        className="mb-5 ml-auto flex items-center gap-3 rounded border border-gray-300 bg-white px-3 py-1.5 text-sm"
      >
        <Download size={18} />
        <span>Download all (.zip)</span>
      </motion.button>
      <Gallery files={sharedFiles} />
    </div>
  )
}

function getFileExtension(filename: string): string {
  const dotIndex = filename.lastIndexOf('.')
  if (dotIndex === -1 || dotIndex === filename.length - 1) {
    return ''
  }
  return filename.substring(dotIndex)
}

async function downloadFilesAsZip(files: File[], zipName = 'sharesnap.zip') {
  if (!files || files.length === 0) {
    console.warn('No files provided')
    return
  }

  const zip = new JSZip()

  // Add files to the zip
  files.forEach((file, i) => {
    const fileName = `sharesnap_${i + 1}${getFileExtension(file.name)}`
    zip.file(fileName, file)
  })

  // Generate the zip
  const content = await zip.generateAsync({ type: 'blob' })

  // Create a temporary URL and trigger download
  const url = URL.createObjectURL(content)
  const a = document.createElement('a')
  a.href = url
  a.download = zipName
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
