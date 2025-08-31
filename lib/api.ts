export function getAuthToken() {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return
  if (token) {
    localStorage.setItem("token", token)
  } else {
    localStorage.removeItem("token")
  }
}

export function clearAuthToken() {
  if (typeof window === "undefined") return
  localStorage.removeItem("token")
}

export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken()
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  if (!res.ok) {
    const errorText = await res.text().catch(() => "")
    throw new Error(errorText || `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export async function apiGet<T = any>(url: string): Promise<T> {
  return apiFetch<T>(url, { method: "GET" })
}

export async function apiPost<T = any>(url: string, body?: unknown): Promise<T> {
  return apiFetch<T>(url, { method: "POST", body: body ? JSON.stringify(body) : undefined })
}
