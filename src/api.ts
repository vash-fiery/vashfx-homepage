export async function fetchApiName(): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => {
    controller.abort(new DOMException('API request timed out', 'TimeoutError'))
  }, 10_000)

  try {
    const response = await fetch('/api/', { signal: controller.signal })
    if (!response.ok) throw new Error(`API request failed: ${response.status}`)

    const data: unknown = await response.json()
    if (
      typeof data !== 'object' || data === null ||
      !('name' in data) || typeof data.name !== 'string'
    ) {
      throw new Error('Invalid API response')
    }

    return data.name
  } finally {
    clearTimeout(timeout)
  }
}
