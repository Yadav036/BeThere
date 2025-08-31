export type Json = Record<string, any>

const base = (path: string) => (path.startsWith("http") ? path : `${path}`)

function authHeaders() {
  if (typeof window === "undefined") return {}
  const token = localStorage.getItem("token")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function apiGet<T = any>(path: string): Promise<T> {
  const res = await fetch(base(path), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    cache: "no-store",
  })
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || `GET ${path} failed`)
  }
  return res.json()
}

export async function apiPost<T = any>(path: string, body: Json): Promise<T> {
  const res = await fetch(base(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || `POST ${path} failed`)
  }
  return res.json()
}

export async function apiPut<T = any>(path: string, body: Json): Promise<T> {
  const res = await fetch(base(path), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || `PUT ${path} failed`)
  }
  return res.json()
}

export const swrFetcher = (url: string) => apiGet(url)
