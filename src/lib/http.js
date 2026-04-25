export async function parseJson(response) {
  const contentType = response.headers.get('content-type') || ''
  const rawText = await response.text()

  let data = null

  if (rawText) {
    if (contentType.includes('application/json')) {
      try {
        data = JSON.parse(rawText)
      } catch {
        throw new Error('The server returned invalid JSON.')
      }
    } else {
      data = { message: rawText }
    }
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        (response.status >= 500
          ? 'The server returned an unexpected error.'
          : 'The request could not be completed.')
    )
  }

  if (data === null) {
    return {}
  }

  return data
}
