import type { Property } from '../types/property'

// Production implementation – calls RunPod sync endpoint with status polling
export const searchProperties = async (query: string): Promise<Property[]> => {
  const endpointId = 'wyfroxpgofijqw'
  const apiKey = import.meta.env.VITE_RUNPOD_API_KEY

  if (!endpointId || !apiKey) {
    throw new Error('RunPod env variables missing')
  }

  try {
    // Step 1: Submit job to async endpoint
    const response = await fetch(`https://api.runpod.ai/v2/${endpointId}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ input: { query } }),
    })

    if (!response.ok) {
      throw new Error(`RunPod request failed: ${response.status} ${response.statusText}`)
    }

    const jobData = await response.json()
    const jobId = jobData.id

    if (!jobId) {
      throw new Error('No job ID returned from RunPod')
    }

    // Step 2: Poll status endpoint until completion
    const result = await pollJobStatus(endpointId, jobId, apiKey)

    // Parse the response string as JSON to get the properties array
    if (result?.output?.response) {
      try {
        const properties = JSON.parse(result.output.response)
        if (Array.isArray(properties)) {
          return properties as Property[]
        }
      } catch (parseError) {
        console.error('Failed to parse RunPod response JSON:', parseError)
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
        throw new Error(`Status request failed: ${statusResponse.status} ${statusResponse.statusText}`)
      }

      const statusData = await statusResponse.json()

      if (statusData.status === 'COMPLETED') {
        return statusData
      }

      if (statusData.status === 'FAILED') {
        throw new Error(`Job failed: ${statusData.error || 'Unknown error'}`)
      }

      // Wait 1 second before next poll
      await new Promise(resolve => setTimeout(resolve, 1000))
      attempts++
    } catch (err) {
      console.error('Error polling job status:', err)
      throw err
    }
  }

  throw new Error('Job polling timeout - exceeded maximum attempts')
}

export const getPropertyById = async (id: string): Promise<Property | null> => {
  // This function would need to be implemented based on your backend API
  // For now, returning null as no backend implementation is provided
  return null
}
