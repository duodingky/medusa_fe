type FetchOptions = Parameters<typeof $fetch>[1]

type MedusaResponse<T> = Promise<T>

export const useMedusa = () => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.medusaBaseUrl.replace(/\/$/, '')
  const publishableKey = config.public.medusaPublishableKey || ''

  const request = <T>(path: string, options: FetchOptions = {}): MedusaResponse<T> => {
    const headers = {
      'x-publishable-api-key': publishableKey,
      ...(options.headers || {})
    }

    return $fetch<T>(`${baseUrl}${path}`, {
      ...options,
      headers
    })
  }

  return { request }
}
