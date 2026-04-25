const backendBaseUrl = 'https://construction-backend-plcp.vercel.app'

async function readRequestBody(request) {
  const chunks = []

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  return chunks.length > 0 ? Buffer.concat(chunks) : undefined
}

export default async function handler(request, response) {
  const upstreamPath = request.url?.replace(/^\/api/, '') || ''
  const targetUrl = `${backendBaseUrl}/api${upstreamPath}`
  const headers = new Headers()

  for (const [key, value] of Object.entries(request.headers)) {
    if (value && key.toLowerCase() !== 'host') {
      headers.set(key, Array.isArray(value) ? value.join(', ') : value)
    }
  }

  const method = request.method || 'GET'
  const body = method === 'GET' || method === 'HEAD' ? undefined : await readRequestBody(request)
  const upstreamResponse = await fetch(targetUrl, {
    method,
    headers,
    body,
    redirect: 'manual',
  })

  response.status(upstreamResponse.status)

  upstreamResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'content-encoding' && key.toLowerCase() !== 'transfer-encoding') {
      response.setHeader(key, value)
    }
  })

  const buffer = Buffer.from(await upstreamResponse.arrayBuffer())
  response.send(buffer)
}
