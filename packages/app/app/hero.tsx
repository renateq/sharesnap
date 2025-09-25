import { Rabbit, ShieldCheck, Sparkles } from 'lucide-react'
import { QRCode } from './qr-code'

const iconSize = 20

function Features() {
  const data = [
    {
      icon: <Sparkles size={iconSize} />,
      label: 'Simple',
    },
    {
      icon: <Rabbit size={iconSize} />,
      label: 'Performant',
    },
    {
      icon: <ShieldCheck size={iconSize} />,
      label: 'Secure',
    },
  ]

  return (
    <div className="flex justify-center gap-5 opacity-60">
      {data.map(({ icon, label }) => (
        <div className="flex items-center gap-1" key={label}>
          {icon}
          <span className="text-lg font-medium">{label}</span>
        </div>
      ))}
    </div>
  )
}

function Title() {
  return (
    <h2 className="text-center text-4xl font-semibold">Simply scan and snap</h2>
  )
}

export function Hero() {
  return (
    <div className="flex min-h-[calc(100dvh-5rem)] flex-col justify-center gap-16">
      <div className="flex flex-col gap-4">
        <Features />

        <Title />
      </div>
      <div className="my-16 flex justify-center">
        <QRCode />
      </div>

      <p className="mx-auto max-w-xs pb-52 text-center opacity-70">
        The simplest way to transfer images from your phone to your desktop.
      </p>
    </div>
  )
}
