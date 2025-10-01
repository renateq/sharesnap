export async function logRelayInfo(pc: RTCPeerConnection) {
  pc.addEventListener('iceconnectionstatechange', async () => {
    if (pc.iceConnectionState === 'connected') {
      const stats = await pc.getStats(null)

      stats.forEach((report) => {
        if (
          report.type === 'candidate-pair' &&
          report.state === 'succeeded' &&
          report.nominated
        ) {
          const local = stats.get(report.localCandidateId)
          const remote = stats.get(report.remoteCandidateId)

          if (
            local.candidateType === 'relay' ||
            remote.candidateType === 'relay'
          ) {
            console.log(
              `🚦 Connection is using TURN relay (protocol: ${local.protocol || remote.protocol})`,
            )
          } else {
            console.log('✅ Connection is direct P2P')
          }
        }
      })
    }
  })
}
