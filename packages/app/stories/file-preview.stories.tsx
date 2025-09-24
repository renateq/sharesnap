import { useEffect, useState } from 'react'
import { FilePreview } from '@/app/file-preview'
import type { Meta, StoryObj } from '@storybook/nextjs'

const meta: Meta<typeof FilePreview> = {
  title: 'Components/File Preview',
  component: FilePreview,
  argTypes: {
    file: {
      control: {
        type: 'file',
      },
    },
  },
}

export default meta

/* type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {},
} */

export const WithLocalImage = () => {
  const [file, setFile] = useState<File>()

  useEffect(() => {
    async function loadFile() {
      const response = await fetch('/test-image.png')
      console.log(response)
      const blob = await response.blob()
      const imageFile = new File([blob], 'test-image.png', { type: blob.type })
      setFile(imageFile)
    }
    loadFile()
  }, [])

  return file && <FilePreview file={file} />
}
