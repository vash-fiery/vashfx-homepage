export async function fetchApiName(): Promise<string> {
  const response = await fetch('/api/', { signal: AbortSignal.timeout(10_000) })
  if (!response.ok) throw new Error(`API request failed: ${response.status}`)

  const data: unknown = await response.json()
  if (
    typeof data !== 'object' || data === null ||
    !('name' in data) || typeof data.name !== 'string'
  ) {
    throw new Error('Invalid API response')
  }

  return data.name
}
