import { FilePreview } from './file-preview'

type GalleryProps = {
  files: File[]
}

export function Gallery({ files }: GalleryProps) {
  return (
    <div className="flex w-full flex-wrap items-start justify-center gap-y-12 bg-blue-200 py-8">
      {files.map((file, i) => (
        <FilePreview file={file} key={i} />
      ))}
    </div>
  )
}
