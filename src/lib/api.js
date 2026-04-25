const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '')

export function apiUrl(pathname) {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`
  return `${apiBaseUrl}${normalizedPath}`
}

export function apiFetch(pathname, options) {
  return fetch(apiUrl(pathname), options)
}
