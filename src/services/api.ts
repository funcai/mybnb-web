import type { Property } from '../types/property'

// Helper to call RunPod /run endpoint
type RunpodJobResponse = {
  id?: string
  status?: string
  [key: string]: unknown
}

const runRunpodCommand = async (input: Record<string, unknown>): Promise<RunpodJobResponse> => {
  const endpointId = 'wyfroxpgofijqw'
  const apiKey = import.meta.env.VITE_RUNPOD_API_KEY

  if (!endpointId || !apiKey) {
    throw new Error('RunPod env variables missing')
  }

  const response = await fetch(`https://api.runpod.ai/v2/${endpointId}/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ input }),
  })

  if (!response.ok) {
    throw new Error(`RunPod request failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export const bootBackend = async (): Promise<void> => {
  try {
    await runRunpodCommand({ command: 'boot' })
  } catch (err) {
    console.error('Failed to boot backend on RunPod:', err)
  }
}

export const searchProperties = async (query: string): Promise<Property[]> => {
  const endpointId = 'wyfroxpgofijqw'
  const apiKey = import.meta.env.VITE_RUNPOD_API_KEY

  if (!endpointId || !apiKey) {
    throw new Error('RunPod env variables missing')
  }

  try {
    // Submit search job
    const jobData = await runRunpodCommand({ query })
    const jobId = jobData.id

    if (!jobId) {
      throw new Error('No job ID returned from RunPod')
    }

    // Step 2: Poll status endpoint until completion
    const result = await pollJobStatus(endpointId, jobId, apiKey)

    // Extract apartments array from RunPod output
    const apartments = result?.output?.apartments

    if (Array.isArray(apartments)) {
      return apartments as Property[]
    }

    // If apartments is a string, attempt to parse JSON
    if (typeof apartments === 'string') {
      try {
        const parsed = JSON.parse(apartments)
        if (Array.isArray(parsed)) {
          return parsed as Property[]
        }
      } catch (parseError) {
        console.error('Failed to parse RunPod apartments JSON:', parseError)
      }
    }

    throw new Error('Unexpected RunPod response format')
  } catch (err) {
    console.error('RunPod search error', err)
    throw err
  }
}

// Helper function to poll job status
const pollJobStatus = async (endpointId: string, jobId: string, apiKey: string): Promise<any> => {
  const maxAttempts = 300 // 5 minutes max (300 seconds)
  let attempts = 0

  while (attempts < maxAttempts) {
    try {
      const statusResponse = await fetch(`https://api.runpod.ai/v2/${endpointId}/status/${jobId}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      })

      if (!statusResponse.ok) {
        throw new Error(
          `Status request failed: ${statusResponse.status} ${statusResponse.statusText}`,
        )
      }

      const statusData = await statusResponse.json()

      if (statusData.status === 'COMPLETED') {
        return statusData
      }

      if (statusData.status === 'FAILED') {
        throw new Error(`Job failed: ${statusData.error || 'Unknown error'}`)
      }

      // Wait 1 second before next poll
      await new Promise((resolve) => setTimeout(resolve, 1000))
      attempts++
    } catch (err) {
      console.error('Error polling job status:', err)
      throw err
    }
  }

  throw new Error('Job polling timeout - exceeded maximum attempts')
}
