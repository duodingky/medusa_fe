import type { Ref } from 'vue'

type CartItem = {
  id: string
  quantity: number
  unit_price?: number
  currency_code?: string
  title?: string
  variant?: {
    title?: string
  }
}

type Cart = {
  id: string
  items: CartItem[]
  subtotal?: number
  total?: number
  currency_code?: string
}

type Region = {
  id: string
  currency_code?: string
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
    errorState.value = error instanceof Error ? error.message : 'Cart request failed.'
    return null
  } finally {
    isLoading.value = false
  }
}

export const useCart = () => {
  const cart = useState<Cart | null>('medusa_cart', () => null)
  const regionId = useState<string | null>('medusa_region', () => null)
  const isLoading = useState<boolean>('medusa_cart_loading', () => false)
  const error = useState<string | null>('medusa_cart_error', () => null)
  const cartId = useCookie<string | null>('medusa_cart_id', { sameSite: 'lax' })

  const { request } = useMedusa()

  const fetchRegionId = async () => {
    if (regionId.value) {
      return regionId.value
    }

    const data = await request<{ regions?: Region[] }>('/store/regions')
    const firstRegion = data.regions?.[0]
    regionId.value = firstRegion?.id ?? null
    return regionId.value
  }

  const refreshCart = async () => {
    if (!cartId.value) {
      cart.value = null
      return null
    }

    const data = await request<{ cart: Cart }>(`/store/carts/${cartId.value}`)
    cart.value = data.cart
    return cart.value
  }

  const ensureCart = async () => {
    if (cart.value) {
      return cart.value
    }

    if (cartId.value) {
      return refreshCart()
    }

    const region = await fetchRegionId()
    if (!region) {
      throw new Error('No region configured in Medusa.')
    }

    const data = await request<{ cart: Cart }>('/store/carts', {
      method: 'POST',
      body: {
        region_id: region
      }
    })

    cartId.value = data.cart.id
    cart.value = data.cart
    return cart.value
  }

  const addItem = async (variantId: string, quantity = 1) => {
    return runAction(isLoading, error, async () => {
      const currentCart = await ensureCart()
      if (!currentCart) {
        return null
      }

      await request(`/store/carts/${currentCart.id}/line-items`, {
        method: 'POST',
        body: {
          variant_id: variantId,
          quantity
        }
      })

      return refreshCart()
    })
  }

  const updateItem = async (lineItemId: string, quantity: number) => {
    return runAction(isLoading, error, async () => {
      if (!cartId.value) {
        return null
      }

      await request(`/store/carts/${cartId.value}/line-items/${lineItemId}`, {
        method: 'POST',
        body: {
          quantity
        }
      })

      return refreshCart()
    })
  }

  const removeItem = async (lineItemId: string) => {
    return runAction(isLoading, error, async () => {
      if (!cartId.value) {
        return null
      }

      await request(`/store/carts/${cartId.value}/line-items/${lineItemId}`, {
        method: 'DELETE'
      })

      return refreshCart()
    })
  }

  return {
    cart,
    error,
    isLoading,
    addItem,
    updateItem,
    removeItem,
    ensureCart,
    refreshCart
  }
}
