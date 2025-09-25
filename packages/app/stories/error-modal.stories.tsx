import { ErrorModal } from '@/app/phone/error-modal'
import type { Meta } from '@storybook/nextjs'
import { useState } from 'react'

const meta: Meta<typeof ErrorModal> = {
  title: 'Components/Phone Error Modal',
  component: ErrorModal,
}

export default meta

export const WithContainer = () => {
  const [isShown, setIsShown] = useState(false)

  return (
    <div>
      <ErrorModal
        msg="The following file types are not supported: .png., .jpg."
        isVisible={isShown}
        close={() => setIsShown(false)}
      />
      {!isShown && (
        <button
          className="p-2 hover:bg-gray-100"
          onClick={() => setIsShown(true)}
        >
          Open Modal
        </button>
      )}
    </div>
  )
}
