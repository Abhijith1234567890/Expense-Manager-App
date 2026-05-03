export async function fetcher(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json"
    }
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => null))
    throw new Error(payload?.error ?? "Request failed.")
  }

  return response.json()
}