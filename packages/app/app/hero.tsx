import { Rabbit, ShieldCheck, Sparkles } from 'lucide-react'
import { QRCode } from './qr-code'

const iconSize = 25

function Features() {
  const data = [
    {
      icon: <Rabbit size={iconSize} />,
      label: 'Fast',
    },
    {
      icon: <ShieldCheck size={iconSize} />,
      label: 'Secure',
    },
    {
      icon: <Sparkles size={iconSize} />,
      label: 'Zero Setup',
    },
  ]

  return (
    <div className="flex justify-center gap-6 opacity-60">
      {data.map(({ icon, label }) => (
        <div className="flex items-center gap-2" key={label}>
          {icon}
          <span className="text-xl font-medium">{label}</span>
        </div>
      ))}
    </div>
  )
}

function Title() {
  return (
    <h2 className="text-center text-4xl leading-12 font-semibold">
      Send photos to your
      <br />
      laptop in seconds.
    </h2>
  )
}

export function Hero() {
  return (
    <div className="min-h-[calc(100dvh-5rem)]">
      <div className="flex flex-col gap-4 pt-12">
        <Features />
        <Title />
      </div>
      <div className="mt-20 mb-32 flex justify-center">
        <QRCode />
      </div>
      <p className="mx-auto max-w-sm pb-20 text-center text-lg opacity-70">
        No emails. No cables. Just scan and send.
      </p>
    </div>
  )
}
