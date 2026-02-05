import type { Ref } from 'vue'

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

  const config = useRuntimeConfig()
  const publishableKey = config.public.medusaPublishableKey || ''
  const buildHeaders = (withJson = false) => {
    const headers: Record<string, string> = {}
    if (publishableKey) {
      headers['x-publishable-api-key'] = publishableKey
    }
    if (withJson) {
      headers['Content-Type'] = 'application/json'
    }
    return Object.keys(headers).length ? headers : undefined
  }

  const { request } = useMedusa()

  const loadCustomer = async () => {
    const data = await request<{ customer?: Customer }>('/store/customers/me', {
      credentials: 'include',
      headers: buildHeaders()
    })
    customer.value = data.customer ?? null
    return customer.value
  }

  const fetchCustomer = async () => {
    return runAction(isLoading, error, loadCustomer)
  }

  const login = async (email: string, password: string) => {
    return runAction(isLoading, error, async () => {
      await request('/store/auth', {
        method: 'POST',
        body: { email, password },
        credentials: 'include',
        headers: buildHeaders(true)
      })
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
      await request('/store/auth', {
        method: 'DELETE',
        credentials: 'include',
        headers: buildHeaders(true)
      })
      customer.value = null
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
