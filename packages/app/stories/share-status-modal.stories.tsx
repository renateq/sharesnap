import { ShareStatusModal } from '@/app/phone/share-status-modal'
import type { Meta } from '@storybook/nextjs'
import { useState } from 'react'

const meta: Meta<typeof ShareStatusModal> = {
  title: 'Components/Share Status Modal',
  component: ShareStatusModal,
}

export default meta

export const WithContainer = () => {
  const [isShown, setIsShown] = useState(false)

  return (
    <>
      <ShareStatusModal
        totalFiles={5}
        noOfSharedFiles={3}
        isVisible={isShown}
      />
      <button
        className="mt-40 p-2 hover:bg-gray-100"
        onClick={() => setIsShown((current) => !current)}
      >
        Toggle Modal
      </button>
    </>
  )
}
