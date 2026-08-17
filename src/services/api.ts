const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`)
  if (!response.ok) {
    let detail = response.statusText
    try {
      const payload = (await response.json()) as { error?: string }
      if (payload.error) detail = payload.error
    } catch {
      // keep status text when the body is not JSON
    }
    throw new Error(detail)
  }

  return (await response.json()) as T
}
