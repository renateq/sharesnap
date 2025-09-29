'use client'

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

type Status = 'idle' | 'connected' | 'disconnected'

type Message =
  | {
      type: 'connected' | 'disconnected'
    }
  | { type: 'registered'; id: string }
  | { type: 'connect'; id: string }
  | { type: 'error'; error: string }
  | { type: 'offer' | 'answer'; payload: RTCSessionDescriptionInit }
  | { type: 'candidate'; payload: RTCIceCandidateInit }

type ClientContext = {
  status: Status
  socketId: string | null
  sharedFiles: File[]
  isSending: boolean
  connect: (peerId: string) => void
  sendFiles: (files: File[]) => void
}

const ClientContext = createContext<ClientContext>({
  status: 'idle',
  socketId: null,
  sharedFiles: [],
  isSending: false,
  connect: () => {},
  sendFiles: () => {},
})

export const useClientContext = () => useContext(ClientContext)

export function ClientContextProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('idle')
  const [socketId, setSocketId] = useState<string | null>(null)
  const [sharedFiles, setSharedFiles] = useState<File[]>([])
  const [isSending, setIsSending] = useState(false)

  const socketRef = useRef<WebSocket | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const peerIdRef = useRef<string | null>(null)
  const isInitiatorRef = useRef(false)
  const noOfFilesToBeSentRef = useRef(0)

  useEffect(() => {
    const socket = new WebSocket(
      process.env.NEXT_PUBLIC_WEB_SOCKET_SERVER || 'ws://localhost:3001/ws',
    )
    socketRef.current = socket

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'register' }))
    }

    const handleMessage = async (event: MessageEvent) => {
      if (typeof event.data !== 'string') return
      const msg: Message = JSON.parse(event.data)

      switch (msg.type) {
        case 'registered':
          setSocketId(msg.id)
          break
        case 'connected':
          await startConnection()
          break
        case 'disconnected':
          setStatus('disconnected')
          peerConnectionRef.current?.close()
          peerConnectionRef.current = null
          dataChannelRef.current = null
          break
        case 'offer':
          if (!peerConnectionRef.current) await startConnection()
          await peerConnectionRef.current?.setRemoteDescription(
            new RTCSessionDescription(msg.payload),
          )
          const answer = await peerConnectionRef.current?.createAnswer()
          await peerConnectionRef.current?.setLocalDescription(answer)
          socketRef.current?.send(
            JSON.stringify({ type: 'answer', payload: answer }),
          )
          break
        case 'answer':
          await peerConnectionRef.current?.setRemoteDescription(
            new RTCSessionDescription(msg.payload),
          )
          break
        case 'candidate':
          try {
            await peerConnectionRef.current?.addIceCandidate(msg.payload)
          } catch (err) {
            console.error(err)
          }
          break
      }
    }

    socket.addEventListener('message', handleMessage)
    return () => {
      socket.removeEventListener('message', handleMessage)
      socket.close()
    }
  }, [])

  function connect(peerId: string) {
    peerIdRef.current = peerId
    isInitiatorRef.current = true
    socketRef.current?.send(
      JSON.stringify({ type: 'connect', id: peerIdRef.current }),
    )
  }

  async function startConnection() {
    peerConnectionRef.current = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        {
          urls: 'stun:stun.relay.metered.ca:80',
        },
        {
          urls: 'turn:global.relay.metered.ca:80',
          username: '24392bad403b2067348389d4',
          credential: 'wpCEJTJxzGwgj2MH',
        },
        {
          urls: 'turn:global.relay.metered.ca:80?transport=tcp',
          username: '24392bad403b2067348389d4',
          credential: 'wpCEJTJxzGwgj2MH',
        },
      ],
    })

    // Only the initiator creates the channel
    if (isInitiatorRef.current && !dataChannelRef.current) {
      dataChannelRef.current = peerConnectionRef.current.createDataChannel(
        'file',
        { ordered: true },
      )
      setupDataChannel(dataChannelRef.current)
    }

    // Both sides need this (the responder will get the channel here)
    peerConnectionRef.current.ondatachannel = (event) => {
      dataChannelRef.current = event.channel
      setupDataChannel(dataChannelRef.current)
    }

    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.send(
          JSON.stringify({ type: 'candidate', payload: event.candidate }),
        )
      }
    }

    // Only the initiator makes an offer
    if (isInitiatorRef.current) {
      const offer = await peerConnectionRef.current.createOffer()
      await peerConnectionRef.current.setLocalDescription(offer)
      socketRef.current?.send(JSON.stringify({ type: 'offer', payload: offer }))
    }
  }

  async function* sliceFile(file: File, chunkSize = 16 * 1024) {
    let offset = 0
    while (offset < file.size) {
      const slice = file.slice(offset, offset + chunkSize)
      yield await slice.arrayBuffer()
      offset += chunkSize
    }
  }

  type FileMeta = {
    type: 'file-meta' | 'file-end'
    name: string
    size: string
    mime: string
    id: string
  }

  const incomingFiles: Record<string, { meta: FileMeta; buffers: BlobPart[] }> =
    {}

  function setupDataChannel(channel: RTCDataChannel) {
    channel.onopen = () => {
      setStatus('connected')
    }

    channel.onclose = () => {
      setStatus('disconnected')
    }

    channel.onmessage = (event) => {
      if (typeof event.data === 'string') {
        const msg = JSON.parse(event.data)
        if (msg.type === 'file-meta') {
          incomingFiles[msg.id] = { meta: msg, buffers: [] }
        } else if (msg.type === 'file-end') {
          const { meta, buffers } = incomingFiles[msg.id]
          const blob = new Blob(buffers, { type: meta.mime })
          const file = new File([blob], meta.name, {
            type: meta.mime,
            lastModified: new Date().valueOf(),
          })
          setSharedFiles((currentFiles) => [...currentFiles, file])
          delete incomingFiles[msg.id]
          dataChannelRef.current?.send(
            JSON.stringify({ type: 'file-received' }),
          )
        } else if (msg.type === 'file-received') {
          console.log('file received')
          noOfFilesToBeSentRef.current--
          if (noOfFilesToBeSentRef.current === 0) {
            console.log('all files received')
            setIsSending(false)
          }
        }
      } else {
        const arrayBuffer = event.data as ArrayBuffer
        const activeId = Object.keys(incomingFiles)[0]
        if (activeId) {
          incomingFiles[activeId].buffers.push(arrayBuffer)
        }
      }
    }
  }

  async function sendChunk(dc: RTCDataChannel, chunk: ArrayBuffer) {
    return new Promise<void>((resolve) => {
      if (dc.bufferedAmount < 16 * 1024 * 10) {
        dc.send(chunk)
        resolve()
      } else {
        const handler = () => {
          dc.send(chunk)
          dc.removeEventListener('bufferedamountlow', handler)
          resolve()
        }
        dc.addEventListener('bufferedamountlow', handler)
      }
    })
  }

  async function sendFiles(files: File[]) {
    if (isSending) return

    setIsSending(true)
    noOfFilesToBeSentRef.current = files.length
    if (!dataChannelRef.current) return

    for (const file of files) {
      console.log('sending file')
      const fileId = crypto.randomUUID()

      dataChannelRef.current.send(
        JSON.stringify({
          type: 'file-meta',
          name: file.name,
          size: file.size,
          mime: file.type,
          id: fileId,
        }),
      )

      for await (const chunk of sliceFile(file)) {
        if (chunk.byteLength > 0) await sendChunk(dataChannelRef.current, chunk)
      }
      dataChannelRef.current.send(
        JSON.stringify({ type: 'file-end', id: fileId }),
      )
    }
  }

  return (
    <ClientContext.Provider
      value={{ status, socketId, sharedFiles, isSending, connect, sendFiles }}
    >
      {children}
    </ClientContext.Provider>
  )
}
