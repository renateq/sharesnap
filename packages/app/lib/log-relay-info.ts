export async function logRelayInfo(pc: RTCPeerConnection) {
  const stats = await pc.getStats(null)

  stats.forEach((report) => {
    if (
      report.type === 'candidate-pair' &&
      report.state === 'succeeded' &&
      report.nominated
    ) {
      const local = stats.get(report.localCandidateId)
      const remote = stats.get(report.remoteCandidateId)

      if (local.candidateType === 'relay' || remote.candidateType === 'relay') {
        console.log('🚦 Using TURN relay')
        console.log(
          `Local candidate type: ${local.candidateType} (${local.protocol})`,
          local.address,
        )
        console.log(
          `Remote candidate type: ${remote.candidateType} (${remote.protocol})`,
          remote.address,
        )
      } else {
        console.log('✅ Direct P2P connection')
      }
    }
  })
}
