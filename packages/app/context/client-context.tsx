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
  connect: (peerId: string) => void
  sendFile: () => void
}

const ClientContext = createContext<ClientContext>({
  status: 'idle',
  socketId: null,
  connect: () => {},
  sendFile: () => {},
})

export const useClientContext = () => useContext(ClientContext)

export function ClientContextProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('idle')
  const [socketId, setSocketId] = useState<string | null>(null)

  const socketRef = useRef<WebSocket | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const peerIdRef = useRef<string | null>(null)
  const isInitiatorRef = useRef(false)

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
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    })

    // Only the initiator creates the channel
    if (isInitiatorRef.current && !dataChannelRef.current) {
      dataChannelRef.current =
        peerConnectionRef.current.createDataChannel('file')
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

  function setupDataChannel(channel: RTCDataChannel) {
    const receivedBuffers: Blob[] = []

    channel.onopen = () => {
      setStatus('connected')
    }
    channel.onclose = () => console.log('Data channel closed')

    channel.onmessage = (event) => {
      if (typeof event.data === 'string' && event.data === 'EOF') {
        // All chunks received, assemble the file
        console.log('File received!')
      } else {
        receivedBuffers.push(event.data)
      }
    }
  }

  function sendFile() {
    dataChannelRef.current?.send('EOF')
  }

  return (
    <ClientContext.Provider value={{ status, socketId, connect, sendFile }}>
      {children}
    </ClientContext.Provider>
  )
}
