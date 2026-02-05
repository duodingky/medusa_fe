import type { Ref } from 'vue'

type FetchOptions = Parameters<typeof $fetch>[1]

type Customer = {
  id: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string | null
}

type RegisterPayload = {
  first_name: string
  last_name: string
  email: string
  password: string
  phone?: string | null
}

type LoginResponse = {
  customer?: Customer
  token?: string
}

const resolveErrorMessage = (error: unknown) => {
  if (typeof error === 'string') {
    return error
  }
  if (error && typeof error === 'object') {
    const maybeError = error as { message?: string; data?: { message?: string } }
    if (maybeError.data?.message) {
      return maybeError.data.message
    }
    if (maybeError.message) {
      return maybeError.message
    }
  }
  return 'Customer request failed.'
}

const resolveStatusCode = (error: unknown) => {
  if (!error || typeof error !== 'object') {
    return null
  }
  const maybeError = error as {
    status?: number
    statusCode?: number
    response?: { status?: number }
  }
  return maybeError.status ?? maybeError.statusCode ?? maybeError.response?.status ?? null
}

const runAction = async <T>(
  isLoading: Ref<boolean>,
  errorState: Ref<string | null>,
  action: () => Promise<T>
) => {
  isLoading.value = true
  errorState.value = null

  try {
    return await action()
  } catch (error) {
    errorState.value = resolveErrorMessage(error)
    return null
  } finally {
    isLoading.value = false
  }
}

export const useCustomer = () => {
  const customer = useState<Customer | null>('medusa_customer', () => null)
  const isLoading = useState<boolean>('medusa_customer_loading', () => false)
  const error = useState<string | null>('medusa_customer_error', () => null)
  const authToken = useCookie<string | null>('medusa_customer_token', { sameSite: 'lax' })

  const config = useRuntimeConfig()
  const publishableKey = config.public.medusaPublishableKey || ''
  const buildHeaders = (withJson = false) => {
    const headers: Record<string, string> = {}
    if (publishableKey) {
      headers['x-publishable-api-key'] = publishableKey
    }
    if (authToken.value) {
      headers.Authorization = `Bearer ${authToken.value}`
    }
    if (withJson) {
      headers['Content-Type'] = 'application/json'
    }
    return Object.keys(headers).length ? headers : undefined
  }

  const { request } = useMedusa()
  const authLoginPaths = [ '/auth/customer/emailpass']
  const authLogoutPaths = [ '/auth/customer/session']

  const requestWithFallback = async <T>(paths: string[], options: FetchOptions) => {
    const uniquePaths = paths.filter((path, index, arr) => arr.indexOf(path) === index)
    let lastError: unknown = null

    for (const path of uniquePaths) {
      try {
        return await request<T>(path, options)
      } catch (error) {
        lastError = error
        if (resolveStatusCode(error) === 404) {
          continue
        }
        throw error
      }
    }

    throw lastError || new Error('Customer request failed.')
  }

  const loadCustomer = async () => {
    try {
      const data = await request<{ customer?: Customer }>('/store/customers/me', {
        credentials: 'include',
        headers: buildHeaders()
      })
      customer.value = data.customer ?? null
      return customer.value
    } catch (error) {
      const statusCode = resolveStatusCode(error)
      if (statusCode === 401 || statusCode === 403) {
        customer.value = null
        authToken.value = null
        return null
      }
      throw error
    }
  }

  const fetchCustomer = async () => {
    return runAction(isLoading, error, loadCustomer)
  }

  const login = async (email: string, password: string) => {
    return runAction(isLoading, error, async () => {
      const data = await requestWithFallback<LoginResponse>(authLoginPaths, {
        method: 'POST',
        body: { email, password },
        credentials: 'include',
        headers: buildHeaders(true)
      })
      if (data?.token) {
        authToken.value = data.token
      }
      if (data?.customer) {
        customer.value = data.customer
        return customer.value
      }
      return loadCustomer()
    })
  }

  const register = async (payload: RegisterPayload) => {
    return runAction(isLoading, error, async () => {
      const data = await request<{ customer?: Customer }>('/store/customers', {
        method: 'POST',
        body: payload,
        credentials: 'include',
        headers: buildHeaders(true)
      })
      return data.customer ?? null
    })
  }

  const logout = async () => {
    return runAction(isLoading, error, async () => {
      try {
        await requestWithFallback(authLogoutPaths, {
          method: 'DELETE',
          credentials: 'include',
          headers: buildHeaders(true)
        })
      } finally {
        customer.value = null
        authToken.value = null
      }
      return true
    })
  }

  return {
    customer,
    isLoading,
    error,
    fetchCustomer,
    login,
    register,
    logout
  }
}
