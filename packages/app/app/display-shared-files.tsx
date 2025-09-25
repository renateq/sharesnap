import { useClientContext } from '@/context/client-context'
import { Gallery } from './gallery'

export function DisplaySharedFiles() {
  const { sharedFiles } = useClientContext()

  return (
    <div className="mt-10 mb-20 xl:px-[10%]">
      <Gallery files={sharedFiles} />
    </div>
  )
}
