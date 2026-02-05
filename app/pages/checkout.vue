<template>
  <div class="checkout-layout">
    <div class="checkout-main">
      <section class="card checkout-section">
        <div class="section-header">
          <div>
            <h1>Checkout</h1>
            <p class="muted">
              Follow the standard Medusa checkout flow: addresses, shipping, and manual payment.
            </p>
          </div>
          <NuxtLink to="/cart">Back to cart</NuxtLink>
        </div>
        <p v-if="cartEmpty" class="status">
          Your cart is empty. Add products before starting checkout.
        </p>
      </section>

      <section class="card checkout-section">
        <div class="section-header">
          <h2 class="card-title">Shipping & billing address</h2>
          <span class="muted">Step 1</span>
        </div>

        <div class="form-grid">
          <label class="field">
            Email
            <input v-model="email" class="input-text" type="email" placeholder="you@example.com" />
          </label>
        </div>

        <div class="address-grid">
          <label class="field">
            First name
            <input v-model="shippingAddress.first_name" class="input-text" type="text" />
          </label>
          <label class="field">
            Last name
            <input v-model="shippingAddress.last_name" class="input-text" type="text" />
          </label>
          <label class="field">
            Address line 1
            <input v-model="shippingAddress.address_1" class="input-text" type="text" />
          </label>
          <label class="field">
            Address line 2
            <input v-model="shippingAddress.address_2" class="input-text" type="text" />
          </label>
          <label class="field">
            City
            <input v-model="shippingAddress.city" class="input-text" type="text" />
          </label>
          <label class="field">
            Postal code
            <input v-model="shippingAddress.postal_code" class="input-text" type="text" />
          </label>
          <label class="field">
            Country code
            <input
              v-model="shippingAddress.country_code"
              class="input-text"
              type="text"
              placeholder="us"
            />
          </label>
          <label class="field">
            Phone
            <input v-model="shippingAddress.phone" class="input-text" type="tel" />
          </label>
          <label class="field">
            Company
            <input v-model="shippingAddress.company" class="input-text" type="text" />
          </label>
        </div>

        <label class="checkbox">
          <input v-model="billingSameAsShipping" type="checkbox" />
          Billing address is the same as shipping
        </label>

        <div v-if="!billingSameAsShipping" class="address-grid">
          <label class="field">
            Billing first name
            <input v-model="billingAddress.first_name" class="input-text" type="text" />
          </label>
          <label class="field">
            Billing last name
            <input v-model="billingAddress.last_name" class="input-text" type="text" />
          </label>
          <label class="field">
            Billing address line 1
            <input v-model="billingAddress.address_1" class="input-text" type="text" />
          </label>
          <label class="field">
            Billing address line 2
            <input v-model="billingAddress.address_2" class="input-text" type="text" />
          </label>
          <label class="field">
            Billing city
            <input v-model="billingAddress.city" class="input-text" type="text" />
          </label>
          <label class="field">
            Billing postal code
            <input v-model="billingAddress.postal_code" class="input-text" type="text" />
          </label>
          <label class="field">
            Billing country code
            <input v-model="billingAddress.country_code" class="input-text" type="text" />
          </label>
          <label class="field">
            Billing phone
            <input v-model="billingAddress.phone" class="input-text" type="tel" />
          </label>
          <label class="field">
            Billing company
            <input v-model="billingAddress.company" class="input-text" type="text" />
          </label>
        </div>

        <button class="button" :disabled="addressLoading || cartEmpty" @click="saveAddresses">
          Save addresses
        </button>
        <p v-if="addressError" class="status status-error">{{ addressError }}</p>
        <p v-if="addressSuccess" class="status status-success">{{ addressSuccess }}</p>
      </section>

      <section class="card checkout-section">
        <div class="section-header">
          <h2 class="card-title">Shipping method</h2>
          <span class="muted">Step 2</span>
        </div>

        <p v-if="shippingOptionsLoading" class="status">Loading shipping options...</p>
        <p v-else-if="!shippingOptions.length" class="muted">
          No shipping options available yet. Save an address to fetch options.
        </p>

        <div v-else class="option-list">
          <label
            v-for="option in shippingOptions"
            :key="option.id"
            class="option-card"
            :class="{ active: selectedShippingOptionId === option.id }"
          >
            <input v-model="selectedShippingOptionId" type="radio" :value="option.id" />
            <div>
              <div class="option-title">{{ option.name }}</div>
              <div class="muted">{{ option.description || 'Standard shipping option.' }}</div>
            </div>
            <div class="option-price">{{ formatPrice(option.amount || 0, currency) }}</div>
          </label>
        </div>

        <button
          class="button"
          :disabled="shippingMethodLoading || !selectedShippingOptionId || cartEmpty"
          @click="applyShippingMethod"
        >
          Apply shipping method
        </button>
        <p v-if="shippingError" class="status status-error">{{ shippingError }}</p>
        <p v-if="shippingSuccess" class="status status-success">{{ shippingSuccess }}</p>
      </section>

      <section class="card checkout-section">
        <div class="section-header">
          <h2 class="card-title">Manual payment</h2>
          <span class="muted">Step 3</span>
        </div>
        <p class="muted">
          Manual payment lets you capture payment offline (e.g. cash on delivery).
        </p>

        <label class="option-card" :class="{ active: selectedPaymentProvider === manualProviderId }">
          <input
            v-model="selectedPaymentProvider"
            type="radio"
            :value="manualProviderId"
            :disabled="!hasPaymentProviders"
          />
          <div>
            <div class="option-title">Manual payment</div>
            <div class="muted">No gateway required. Payment will be recorded manually.</div>
          </div>
        </label>

        <button
          class="button"
          :disabled="
            paymentLoading || selectedPaymentProvider !== manualProviderId || cartEmpty || !hasPaymentProviders
          "
          @click="setManualPayment"
        >
          Select manual payment
        </button>
        <p v-if="paymentError" class="status status-error">{{ paymentError }}</p>
        <p v-if="paymentSuccess" class="status status-success">{{ paymentSuccess }}</p>
      </section>
    </div>

    <aside class="checkout-summary">
      <section class="card">
        <h3 class="card-title">Order summary</h3>
        <p v-if="cartEmpty" class="muted">Your cart is empty.</p>
        <ul v-else class="summary-list">
          <li v-for="item in items" :key="item.id" class="summary-item">
            <div>
              <div>{{ item.title || 'Item' }}</div>
              <div class="muted">Qty {{ item.quantity }} · {{ lineItemPrice(item) }}</div>
            </div>
            <div>{{ lineItemTotal(item) }}</div>
          </li>
        </ul>

        <div class="summary-row">
          <span>Subtotal</span>
          <span>{{ subtotal }}</span>
        </div>
        <div class="summary-row">
          <span>Shipping</span>
          <span>{{ shippingTotal }}</span>
        </div>
        <div class="summary-row">
          <span>Taxes</span>
          <span>{{ taxTotal }}</span>
        </div>
        <div v-if="hasDiscount" class="summary-row">
          <span>Discounts</span>
          <span>-{{ discountTotal }}</span>
        </div>
        <div class="summary-row total">
          <span>Total</span>
          <span>{{ total }}</span>
        </div>
      </section>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { formatPrice, resolveLineItemPrice } from '~/utils/pricing'

type AddressForm = {
  first_name: string
  last_name: string
  address_1: string
  address_2: string
  city: string
  country_code: string
  postal_code: string
  phone: string
  company: string
}

type ShippingOption = {
  id: string
  name: string
  amount?: number
  description?: string | null
}

type RegionSummary = {
  id: string
  name?: string
  payment_providers?: string[]
}

const { cart, ensureCart, refreshCart } = useCart()
const { request } = useMedusa()

const email = ref('')
const shippingAddress = reactive<AddressForm>(createEmptyAddress())
const billingAddress = reactive<AddressForm>(createEmptyAddress())
const billingSameAsShipping = ref(true)

const shippingOptions = ref<ShippingOption[]>([])
const selectedShippingOptionId = ref<string | null>(null)
const selectedPaymentProvider = ref<string | null>(null)
const paymentProviders = ref<string[]>([])

const addressLoading = ref(false)
const shippingOptionsLoading = ref(false)
const shippingMethodLoading = ref(false)
const paymentLoading = ref(false)

const addressError = ref<string | null>(null)
const shippingError = ref<string | null>(null)
const paymentError = ref<string | null>(null)

const addressSuccess = ref<string | null>(null)
const shippingSuccess = ref<string | null>(null)
const paymentSuccess = ref<string | null>(null)

const items = computed(() => cart.value?.items || [])
const currency = computed(() => cart.value?.currency_code || 'usd')
const cartEmpty = computed(() => items.value.length === 0)

const subtotal = computed(() => formatPrice(cart.value?.subtotal ?? 0, currency.value))
const shippingTotal = computed(() => formatPrice(cart.value?.shipping_total ?? 0, currency.value))
const taxTotal = computed(() => formatPrice(cart.value?.tax_total ?? 0, currency.value))
const discountTotal = computed(() => formatPrice(cart.value?.discount_total ?? 0, currency.value))
const total = computed(() => formatPrice(cart.value?.total ?? 0, currency.value))
const hasDiscount = computed(() => (cart.value?.discount_total ?? 0) > 0)
const hasPaymentProviders = computed(() => paymentProviders.value.length > 0)
const manualProviderId = computed(() => {
  const manualMatch = paymentProviders.value.find(provider =>
    provider.toLowerCase().includes('manual')
  )
  return manualMatch || paymentProviders.value[0] || 'manual'
})

const hasPrefilled = ref(false)

const hydrateFromCart = (current: any) => {
  if (!current || hasPrefilled.value) {
    return
  }
  email.value = current.email ?? email.value
  if (current.shipping_address) {
    fillAddress(shippingAddress, current.shipping_address)
  }
  if (current.billing_address) {
    fillAddress(billingAddress, current.billing_address)
    billingSameAsShipping.value = false
  }
  hasPrefilled.value = true
}

watch(
  () => cart.value,
  value => {
    if (!value) {
      return
    }
    hydrateFromCart(value)
    const existingShipping = value.shipping_methods?.[0]
    if (!selectedShippingOptionId.value && existingShipping) {
      selectedShippingOptionId.value =
        existingShipping.shipping_option_id || existingShipping.shipping_option?.id
    }
    if (value.payment_session?.provider_id) {
      selectedPaymentProvider.value = value.payment_session.provider_id
    }
  },
  { immediate: true }
)

const lineItemPrice = (item: any) => {
  const price = resolveLineItemPrice(item)
  if (!price) {
    return 'Price unavailable'
  }
  return formatPrice(price.amount, price.currencyCode)
}

const lineItemTotal = (item: any) => {
  const unitPrice = item.unit_price ?? 0
  return formatPrice(unitPrice * item.quantity, item.currency_code || currency.value)
}

const fetchShippingOptions = async () => {
  if (!cart.value?.id) {
    shippingOptions.value = []
    return
  }
  shippingOptionsLoading.value = true
  shippingError.value = null
  try {
    const data = await request<{ shipping_options?: ShippingOption[] }>('/store/shipping-options', {
      query: { cart_id: cart.value.id }
    })
    shippingOptions.value = data.shipping_options ?? []
    if (!selectedShippingOptionId.value && shippingOptions.value.length) {
      selectedShippingOptionId.value = shippingOptions.value[0].id
    }
  } catch (error) {
    shippingError.value = resolveErrorMessage(error)
  } finally {
    shippingOptionsLoading.value = false
  }
}

const loadPaymentProviders = async () => {
  try {
    const data = await request<{ regions?: RegionSummary[] }>('/store/regions', {
      query: { fields: 'id,name,payment_providers' }
    })
    paymentProviders.value = data.regions?.[0]?.payment_providers || []
    if (!selectedPaymentProvider.value && paymentProviders.value.length) {
      selectedPaymentProvider.value = manualProviderId.value
    }
  } catch (error) {
    paymentProviders.value = []
  }
}

const resolveManualProviderId = () => {
  if (!hasPaymentProviders.value) {
    return null
  }
  if (selectedPaymentProvider.value) {
    return selectedPaymentProvider.value
  }
  return manualProviderId.value
}

const saveAddresses = async () => {
  addressError.value = null
  addressSuccess.value = null

  if (!cart.value?.id) {
    addressError.value = 'Cart is not ready yet.'
    return
  }

  if (!email.value || !email.value.includes('@')) {
    addressError.value = 'Enter a valid email address.'
    return
  }

  const shippingMissing = validateAddress(shippingAddress)
  if (shippingMissing) {
    addressError.value = `${shippingMissing} is required for shipping.`
    return
  }

  if (!billingSameAsShipping.value) {
    const billingMissing = validateAddress(billingAddress)
    if (billingMissing) {
      addressError.value = `${billingMissing} is required for billing.`
      return
    }
  }

  addressLoading.value = true
  try {
    await request(`/store/carts/${cart.value.id}`, {
      method: 'POST',
      body: {
        email: email.value.trim(),
        shipping_address: normalizeAddress(shippingAddress),
        billing_address: billingSameAsShipping.value
          ? normalizeAddress(shippingAddress)
          : normalizeAddress(billingAddress)
      }
    })
    await refreshCart()
    await fetchShippingOptions()
    addressSuccess.value = 'Addresses saved to cart.'
  } catch (error) {
    addressError.value = resolveErrorMessage(error)
  } finally {
    addressLoading.value = false
  }
}

const applyShippingMethod = async () => {
  shippingError.value = null
  shippingSuccess.value = null

  if (!cart.value?.id) {
    shippingError.value = 'Cart is not ready yet.'
    return
  }
  if (!selectedShippingOptionId.value) {
    shippingError.value = 'Select a shipping option first.'
    return
  }

  shippingMethodLoading.value = true
  try {
    await request(`/store/carts/${cart.value.id}/shipping-methods`, {
      method: 'POST',
      body: {
        option_id: selectedShippingOptionId.value
      }
    })
    await refreshCart()
    shippingSuccess.value = 'Shipping method applied.'
  } catch (error) {
    shippingError.value = resolveErrorMessage(error)
  } finally {
    shippingMethodLoading.value = false
  }
}

const setManualPayment = async () => {
  paymentError.value = null
  paymentSuccess.value = null

  if (!cart.value?.id) {
    paymentError.value = 'Cart is not ready yet.'
    return
  }

  if (!hasPaymentProviders.value) {
    await loadPaymentProviders()
  }
  const providerId = resolveManualProviderId()
  if (!providerId) {
    paymentError.value = 'No payment providers available for this region.'
    return
  }

  paymentLoading.value = true
  try {
    await request(`/store/carts/${cart.value.id}/payment-sessions`, {
      method: 'POST',
      body: {
        provider_id: providerId
      }
    })
    await request(`/store/carts/${cart.value.id}/payment-session`, {
      method: 'POST',
      body: {
        provider_id: providerId
      }
    })
    await refreshCart()
    paymentSuccess.value = 'Manual payment selected.'
  } catch (error) {
    paymentError.value = resolveErrorMessage(error)
  } finally {
    paymentLoading.value = false
  }
}

onMounted(async () => {
  await ensureCart()
  await loadPaymentProviders()
  await fetchShippingOptions()
})

function createEmptyAddress(): AddressForm {
  return {
    first_name: '',
    last_name: '',
    address_1: '',
    address_2: '',
    city: '',
    country_code: '',
    postal_code: '',
    phone: '',
    company: ''
  }
}

function fillAddress(target: AddressForm, source: Record<string, any>) {
  Object.keys(target).forEach(key => {
    target[key as keyof AddressForm] = source?.[key] ?? ''
  })
}

function normalizeAddress(address: AddressForm) {
  const payload: Record<string, string> = {
    first_name: address.first_name.trim(),
    last_name: address.last_name.trim(),
    address_1: address.address_1.trim(),
    address_2: address.address_2.trim(),
    city: address.city.trim(),
    country_code: address.country_code.trim().toLowerCase(),
    postal_code: address.postal_code.trim(),
    phone: address.phone.trim(),
    company: address.company.trim()
  }

  Object.keys(payload).forEach(key => {
    if (!payload[key]) {
      delete payload[key]
    }
  })

  return payload
}

function validateAddress(address: AddressForm) {
  const requiredFields: Array<[keyof AddressForm, string]> = [
    ['first_name', 'First name'],
    ['last_name', 'Last name'],
    ['address_1', 'Address line 1'],
    ['city', 'City'],
    ['postal_code', 'Postal code'],
    ['country_code', 'Country code']
  ]

  for (const [key, label] of requiredFields) {
    if (!address[key]?.trim()) {
      return label
    }
  }

  return null
}

function resolveErrorMessage(error: unknown) {
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
  return 'Checkout request failed.'
}
</script>
