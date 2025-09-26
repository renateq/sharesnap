import { useEffect, useState } from 'react'
import type { Meta } from '@storybook/nextjs'
import { Gallery } from '@/app/gallery'

const meta: Meta<typeof Gallery> = {
  title: 'Components/Gallery',
  component: Gallery,
}

export default meta

export const WithLocalImages = () => {
  const [file, setFile] = useState<File>()

  useEffect(() => {
    async function loadFile() {
      const response = await fetch('/test-image.png')
      const blob = await response.blob()
      const imageFile = new File([blob], 'test-image.png', { type: blob.type })
      setFile(imageFile)
    }
    loadFile()
  }, [])

  return (
    file && <Gallery files={Array.from({ length: 5 }).fill(file) as File[]} />
  )
}
