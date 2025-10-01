export function monitorConnection(pc: RTCPeerConnection) {
  let lastBytesSent = 0
  let lastBytesReceived = 0
  let lastTimestamp = 0
  let intervalId: NodeJS.Timeout | null = null

  pc.addEventListener('iceconnectionstatechange', () => {
    if (pc.iceConnectionState === 'connected') {
      console.log('📡 WebRTC connected. Monitoring stats...')

      // Start polling every second
      intervalId = setInterval(async () => {
        const stats = await pc.getStats(null)

        stats.forEach((report) => {
          if (
            report.type === 'candidate-pair' &&
            report.state === 'succeeded' &&
            report.nominated
          ) {
            const local = stats.get(report.localCandidateId)
            const remote = stats.get(report.remoteCandidateId)

            console.log(
              `Local candidate: ${local.candidateType} (${local.protocol})`,
              local.address,
            )
            console.log(
              `Remote candidate: ${remote.candidateType} (${remote.protocol})`,
              remote.address,
            )

            if (
              local.candidateType === 'relay' ||
              remote.candidateType === 'relay'
            ) {
              console.log('🚦 Connection is using TURN server')
            } else {
              console.log('✅ Connection is direct P2P')
            }

            // --- Throughput calculation ---
            const now = report.timestamp
            const timeDiff = (now - lastTimestamp) / 1000 // seconds

            if (lastTimestamp > 0 && timeDiff > 0) {
              const sentDiff = report.bytesSent - lastBytesSent
              const recvDiff = report.bytesReceived - lastBytesReceived

              const sendRate = sentDiff / timeDiff / 1024 // KB/s
              const recvRate = recvDiff / timeDiff / 1024 // KB/s

              console.log(
                `📊 Send rate: ${sendRate.toFixed(2)} KB/s, Receive rate: ${recvRate.toFixed(2)} KB/s`,
              )
            }

            // Update for next tick
            lastBytesSent = report.bytesSent
            lastBytesReceived = report.bytesReceived
            lastTimestamp = now
          }
        })
      }, 1000)
    }

    if (
      pc.iceConnectionState === 'disconnected' ||
      pc.iceConnectionState === 'failed' ||
      pc.iceConnectionState === 'closed'
    ) {
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
        console.log('🛑 Stopped monitoring (connection closed).')
      }
    }
  })
}
