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

        <label class="option-card" :class="{ active: selectedPaymentProvider === 'manual' }">
          <input v-model="selectedPaymentProvider" type="radio" value="manual" />
          <div>
            <div class="option-title">Manual payment</div>
            <div class="muted">No gateway required. Payment will be recorded manually.</div>
          </div>
        </label>

        <button
          class="button"
          :disabled="paymentLoading || selectedPaymentProvider !== 'manual' || cartEmpty"
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

const { cart, ensureCart, refreshCart } = useCart()
const { request } = useMedusa()

const email = ref('')
const shippingAddress = reactive<AddressForm>(createEmptyAddress())
const billingAddress = reactive<AddressForm>(createEmptyAddress())
const billingSameAsShipping = ref(true)

const shippingOptions = ref<ShippingOption[]>([])
const selectedShippingOptionId = ref<string | null>(null)
const selectedPaymentProvider = ref<string | null>(null)

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

  paymentLoading.value = true
  try {
    await request(`/store/carts/${cart.value.id}/payment-sessions`, {
      method: 'POST'
    })
    await request(`/store/carts/${cart.value.id}/payment-session`, {
      method: 'POST',
      body: {
        provider_id: 'manual'
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
<template>
  <div>
    <section class="section">
      <div class="section-header">
        <div>
          <h1>Checkout</h1>
          <p class="muted">
            Follow the standard Medusa checkout flow to complete your order.
          </p>
        </div>
        <NuxtLink to="/cart">Back to cart</NuxtLink>
      </div>

      <p v-if="statusMessage" class="status status-success">{{ statusMessage }}</p>
      <p v-if="errorMessage" class="status status-error">{{ errorMessage }}</p>
      <p v-if="isLoading" class="status">Updating checkout...</p>

      <div v-if="!cart?.items?.length" class="card">
        <p class="muted">Your cart is empty. Add items before checking out.</p>
      </div>

      <div v-else class="checkout-layout">
        <div class="checkout-steps">
          <section class="card form-card">
            <h2 class="card-title">1. Shipping and billing address</h2>
            <p class="muted">
              Enter the address details that Medusa uses to calculate shipping and taxes.
            </p>

            <div class="form-grid">
              <div class="field">
                <label for="checkout-email">Email</label>
                <input
                  id="checkout-email"
                  v-model="email"
                  class="input-text"
                  type="email"
                  autocomplete="email"
                  placeholder="you@example.com"
                />
              </div>

              <div class="form-row">
                <div class="field">
                  <label for="shipping-first-name">First name</label>
                  <input
                    id="shipping-first-name"
                    v-model="shippingAddress.first_name"
                    class="input-text"
                    type="text"
                    autocomplete="given-name"
                  />
                </div>
                <div class="field">
                  <label for="shipping-last-name">Last name</label>
                  <input
                    id="shipping-last-name"
                    v-model="shippingAddress.last_name"
                    class="input-text"
                    type="text"
                    autocomplete="family-name"
                  />
                </div>
              </div>

              <div class="field">
                <label for="shipping-address-1">Address line 1</label>
                <input
                  id="shipping-address-1"
                  v-model="shippingAddress.address_1"
                  class="input-text"
                  type="text"
                  autocomplete="address-line1"
                />
              </div>

              <div class="field">
                <label for="shipping-address-2">Address line 2 (optional)</label>
                <input
                  id="shipping-address-2"
                  v-model="shippingAddress.address_2"
                  class="input-text"
                  type="text"
                  autocomplete="address-line2"
                />
              </div>

              <div class="form-row">
                <div class="field">
                  <label for="shipping-city">City</label>
                  <input
                    id="shipping-city"
                    v-model="shippingAddress.city"
                    class="input-text"
                    type="text"
                    autocomplete="address-level2"
                  />
                </div>
                <div class="field">
                  <label for="shipping-province">State / Province</label>
                  <input
                    id="shipping-province"
                    v-model="shippingAddress.province"
                    class="input-text"
                    type="text"
                    autocomplete="address-level1"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="field">
                  <label for="shipping-postal">Postal code</label>
                  <input
                    id="shipping-postal"
                    v-model="shippingAddress.postal_code"
                    class="input-text"
                    type="text"
                    autocomplete="postal-code"
                  />
                </div>
                <div class="field">
                  <label for="shipping-country">Country</label>
                  <select
                    id="shipping-country"
                    v-model="shippingAddress.country_code"
                    class="input-text"
                    autocomplete="country"
                  >
                    <option v-for="country in availableCountries" :key="country.code" :value="country.code">
                      {{ country.name }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="field">
                <label for="shipping-phone">Phone (optional)</label>
                <input
                  id="shipping-phone"
                  v-model="shippingAddress.phone"
                  class="input-text"
                  type="tel"
                  autocomplete="tel"
                />
              </div>
            </div>

            <div class="checkbox-row">
              <input id="billing-same" v-model="useShippingAsBilling" type="checkbox" />
              <label for="billing-same">Billing address is the same as shipping</label>
            </div>

            <div v-if="!useShippingAsBilling" class="form-grid billing-section">
              <div class="form-row">
                <div class="field">
                  <label for="billing-first-name">Billing first name</label>
                  <input
                    id="billing-first-name"
                    v-model="billingAddress.first_name"
                    class="input-text"
                    type="text"
                    autocomplete="given-name"
                  />
                </div>
                <div class="field">
                  <label for="billing-last-name">Billing last name</label>
                  <input
                    id="billing-last-name"
                    v-model="billingAddress.last_name"
                    class="input-text"
                    type="text"
                    autocomplete="family-name"
                  />
                </div>
              </div>

              <div class="field">
                <label for="billing-address-1">Billing address line 1</label>
                <input
                  id="billing-address-1"
                  v-model="billingAddress.address_1"
                  class="input-text"
                  type="text"
                  autocomplete="address-line1"
                />
              </div>

              <div class="field">
                <label for="billing-address-2">Billing address line 2 (optional)</label>
                <input
                  id="billing-address-2"
                  v-model="billingAddress.address_2"
                  class="input-text"
                  type="text"
                  autocomplete="address-line2"
                />
              </div>

              <div class="form-row">
                <div class="field">
                  <label for="billing-city">City</label>
                  <input
                    id="billing-city"
                    v-model="billingAddress.city"
                    class="input-text"
                    type="text"
                    autocomplete="address-level2"
                  />
                </div>
                <div class="field">
                  <label for="billing-province">State / Province</label>
                  <input
                    id="billing-province"
                    v-model="billingAddress.province"
                    class="input-text"
                    type="text"
                    autocomplete="address-level1"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="field">
                  <label for="billing-postal">Postal code</label>
                  <input
                    id="billing-postal"
                    v-model="billingAddress.postal_code"
                    class="input-text"
                    type="text"
                    autocomplete="postal-code"
                  />
                </div>
                <div class="field">
                  <label for="billing-country">Country</label>
                  <select
                    id="billing-country"
                    v-model="billingAddress.country_code"
                    class="input-text"
                    autocomplete="country"
                  >
                    <option v-for="country in availableCountries" :key="country.code" :value="country.code">
                      {{ country.name }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="field">
                <label for="billing-phone">Phone (optional)</label>
                <input
                  id="billing-phone"
                  v-model="billingAddress.phone"
                  class="input-text"
                  type="tel"
                  autocomplete="tel"
                />
              </div>
            </div>

            <div class="form-actions">
              <button
                class="button"
                type="button"
                :disabled="isLoading || !cart"
                @click="saveAddresses"
              >
                Save address information
              </button>
            </div>
          </section>

          <section class="card">
            <div class="section-header">
              <h2 class="card-title">2. Shipping method</h2>
              <button
                class="button button-secondary"
                type="button"
                :disabled="isLoading || !cart"
                @click="loadShippingOptions"
              >
                Refresh options
              </button>
            </div>
            <p class="muted">
              Select a shipping option available for the current address and region.
            </p>

            <p v-if="!shippingOptions.length" class="muted">
              Save your address to load shipping options.
            </p>

            <div v-else class="option-list">
              <label v-for="option in shippingOptions" :key="option.id" class="option-card">
                <input
                  class="option-radio"
                  type="radio"
                  name="shipping-option"
                  :value="option.id"
                  v-model="selectedShippingOption"
                />
                <div class="option-content">
                  <span class="option-title">{{ option.name }}</span>
                  <span v-if="option.description" class="muted">{{ option.description }}</span>
                </div>
                <strong>{{ formatPrice(option.amount ?? 0, currencyCode) }}</strong>
              </label>
            </div>

            <div class="form-actions">
              <button
                class="button"
                type="button"
                :disabled="isLoading || !selectedShippingOption"
                @click="saveShippingMethod"
              >
                Save shipping method
              </button>
            </div>
          </section>

          <section class="card">
            <h2 class="card-title">3. Manual payment</h2>
            <p class="muted">
              Use Medusa's manual payment provider to capture payment details offline.
            </p>

            <div class="option-list">
              <label class="option-card">
                <input
                  class="option-radio"
                  type="radio"
                  name="payment-method"
                  value="manual"
                  :checked="manualPaymentSelected"
                  @change="enableManualPayment"
                />
                <div class="option-content">
                  <span class="option-title">Manual payment</span>
                  <span class="muted">Collect payment details outside of the checkout.</span>
                </div>
              </label>
            </div>

            <div class="form-actions">
              <button
                class="button"
                type="button"
                :disabled="isLoading || !canSelectManualPayment"
                @click="enableManualPayment"
              >
                Select manual payment
              </button>
              <button
                class="button"
                type="button"
                :disabled="isLoading || !canCompleteOrder"
                @click="completeOrder"
              >
                Place order
              </button>
            </div>

            <p v-if="orderComplete" class="status status-success">
              Order {{ orderId }} completed. Check the Medusa admin to review the order.
            </p>
          </section>
        </div>

        <aside class="checkout-summary">
          <section class="card">
            <h2 class="card-title">Order summary</h2>
            <ul class="summary-list">
              <li v-for="item in items" :key="item.id" class="summary-item">
                <div>
                  <strong>{{ item.title || 'Item' }}</strong>
                  <div class="muted">Qty {{ item.quantity }}</div>
                </div>
                <div>{{ lineTotal(item) }}</div>
              </li>
            </ul>
            <div class="summary-divider"></div>
            <div class="summary-row">
              <span>Subtotal</span>
              <strong>{{ subtotal }}</strong>
            </div>
            <div class="summary-row">
              <span>Shipping</span>
              <strong>{{ shippingTotal }}</strong>
            </div>
            <div class="summary-row">
              <span>Tax</span>
              <strong>{{ taxTotal }}</strong>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-row">
              <span>Total</span>
              <strong>{{ total }}</strong>
            </div>
            <p class="inline-note">
              Shipping and taxes update after saving the address and shipping method.
            </p>
          </section>
        </aside>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '~/utils/pricing'

type AddressInput = {
  first_name: string
  last_name: string
  address_1: string
  address_2: string
  city: string
  province: string
  postal_code: string
  country_code: string
  phone: string
}

type CountryOption = {
  code: string
  name: string
}

const { cart, ensureCart, refreshCart } = useCart()
const { request } = useMedusa()

const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const statusMessage = ref<string | null>(null)

const email = ref('')
const shippingAddress = reactive<AddressInput>({
  first_name: '',
  last_name: '',
  address_1: '',
  address_2: '',
  city: '',
  province: '',
  postal_code: '',
  country_code: '',
  phone: ''
})
const billingAddress = reactive<AddressInput>({
  first_name: '',
  last_name: '',
  address_1: '',
  address_2: '',
  city: '',
  province: '',
  postal_code: '',
  country_code: '',
  phone: ''
})
const useShippingAsBilling = ref(true)

const availableCountries = ref<CountryOption[]>([])
const shippingOptions = ref<any[]>([])
const selectedShippingOption = ref<string | null>(null)

const orderComplete = ref(false)
const orderId = ref<string | null>(null)

const items = computed(() => cart.value?.items || [])
const currencyCode = computed(() => cart.value?.currency_code || 'usd')

const subtotal = computed(() => formatPrice(cart.value?.subtotal ?? 0, currencyCode.value))
const shippingTotal = computed(() =>
  formatPrice((cart.value as any)?.shipping_total ?? 0, currencyCode.value)
)
const taxTotal = computed(() => formatPrice((cart.value as any)?.tax_total ?? 0, currencyCode.value))
const total = computed(() => formatPrice(cart.value?.total ?? 0, currencyCode.value))

const manualPaymentSelected = computed(
  () => (cart.value as any)?.payment_session?.provider_id === 'manual'
)

const canSelectManualPayment = computed(
  () => Boolean(cart.value?.id && (cart.value as any)?.shipping_methods?.length)
)

const canCompleteOrder = computed(() => {
  const hasEmail = Boolean(cart.value?.email)
  const hasShippingAddress = Boolean((cart.value as any)?.shipping_address?.address_1)
  const hasShippingMethod = Boolean((cart.value as any)?.shipping_methods?.length)
  return hasEmail && hasShippingAddress && hasShippingMethod && manualPaymentSelected.value
})

const addressFields: (keyof AddressInput)[] = [
  'first_name',
  'last_name',
  'address_1',
  'address_2',
  'city',
  'province',
  'postal_code',
  'country_code',
  'phone'
]

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
  return 'Checkout request failed.'
}

const runAction = async (action: () => Promise<void>, successMessage?: string) => {
  isLoading.value = true
  errorMessage.value = null
  statusMessage.value = null
  try {
    await action()
    if (successMessage) {
      statusMessage.value = successMessage
    }
  } catch (error) {
    errorMessage.value = resolveErrorMessage(error)
  } finally {
    isLoading.value = false
  }
}

const assignAddress = (target: AddressInput, source: any) => {
  if (!source) {
    return
  }
  addressFields.forEach((field) => {
    const value = source[field]
    if (typeof value === 'string') {
      target[field] = field === 'country_code' ? value.toLowerCase() : value
    }
  })
}

const ensureCountryDefaults = () => {
  if (!availableCountries.value.length) {
    const fallback = (shippingAddress.country_code || billingAddress.country_code || 'us').toLowerCase()
    availableCountries.value = [{ code: fallback, name: fallback.toUpperCase() }]
  }
  const defaultCountry = availableCountries.value[0]?.code
  if (defaultCountry) {
    if (!shippingAddress.country_code) {
      shippingAddress.country_code = defaultCountry
    }
    if (!billingAddress.country_code) {
      billingAddress.country_code = defaultCountry
    }
  }
}

const buildAddressPayload = (address: AddressInput) => {
  const country =
    address.country_code || availableCountries.value[0]?.code || shippingAddress.country_code || 'us'
  return {
    first_name: address.first_name,
    last_name: address.last_name,
    address_1: address.address_1,
    address_2: address.address_2 || undefined,
    city: address.city,
    province: address.province || undefined,
    postal_code: address.postal_code,
    country_code: country.toLowerCase(),
    phone: address.phone || undefined
  }
}

const fetchShippingOptions = async () => {
  if (!cart.value?.id) {
    return []
  }
  const data = await request<{ shipping_options?: any[] }>('/store/shipping-options', {
    query: { cart_id: cart.value.id }
  })
  return data.shipping_options || []
}

const loadShippingOptions = async () => {
  await runAction(async () => {
    shippingOptions.value = await fetchShippingOptions()
    const currentOptionId = (cart.value as any)?.shipping_methods?.[0]?.shipping_option_id
    if (currentOptionId) {
      selectedShippingOption.value = currentOptionId
    }
  })
}

const saveAddresses = async () => {
  if (!cart.value?.id) {
    return
  }
  await runAction(async () => {
    await request(`/store/carts/${cart.value?.id}`, {
      method: 'POST',
      body: {
        email: email.value || undefined,
        shipping_address: buildAddressPayload(shippingAddress),
        billing_address: buildAddressPayload(useShippingAsBilling.value ? shippingAddress : billingAddress)
      }
    })
    await refreshCart()
    shippingOptions.value = await fetchShippingOptions()
  }, 'Address information saved.')
}

const saveShippingMethod = async () => {
  if (!cart.value?.id || !selectedShippingOption.value) {
    return
  }
  await runAction(async () => {
    await request(`/store/carts/${cart.value.id}/shipping-methods`, {
      method: 'POST',
      body: {
        option_id: selectedShippingOption.value
      }
    })
    await refreshCart()
  }, 'Shipping method saved.')
}

const enableManualPayment = async () => {
  if (!cart.value?.id) {
    return
  }
  await runAction(async () => {
    await request(`/store/carts/${cart.value.id}/payment-sessions`, {
      method: 'POST'
    })
    await request(`/store/carts/${cart.value.id}/payment-session`, {
      method: 'POST',
      body: {
        provider_id: 'manual'
      }
    })
    await refreshCart()
  }, 'Manual payment selected.')
}

const completeOrder = async () => {
  if (!cart.value?.id) {
    return
  }
  await runAction(async () => {
    const data = await request<{ type?: string; data?: { id?: string } }>(
      `/store/carts/${cart.value.id}/complete`,
      {
        method: 'POST'
      }
    )
    if (data.type === 'order') {
      orderComplete.value = true
      orderId.value = data.data?.id || null
    }
  }, 'Order completed.')
}

const lineTotal = (item: any) => {
  const unitPrice = item.unit_price ?? 0
  return formatPrice(unitPrice * item.quantity, item.currency_code || currencyCode.value)
}

const hydrateFromCart = () => {
  if (!cart.value) {
    return
  }
  const cartValue = cart.value as any
  if (cartValue.email && !email.value) {
    email.value = cartValue.email
  }
  if (cartValue.shipping_address) {
    assignAddress(shippingAddress, cartValue.shipping_address)
  }
  if (cartValue.billing_address) {
    assignAddress(billingAddress, cartValue.billing_address)
    const shippingString = addressFields.map((field) => cartValue.shipping_address?.[field] || '')
    const billingString = addressFields.map((field) => cartValue.billing_address?.[field] || '')
    useShippingAsBilling.value = shippingString.join('|') === billingString.join('|')
  }
  ensureCountryDefaults()
}

watch(
  () => cart.value,
  () => {
    hydrateFromCart()
    const currentOptionId = (cart.value as any)?.shipping_methods?.[0]?.shipping_option_id
    if (currentOptionId) {
      selectedShippingOption.value = currentOptionId
    }
  }
)

const loadRegions = async () => {
  const data = await request<{ regions?: any[] }>('/store/regions')
  const countries = data.regions?.[0]?.countries || []
  availableCountries.value = countries.map((country: any) => ({
    code: String(country.iso_2 || '').toLowerCase(),
    name: country.display_name || country.iso_2?.toUpperCase() || 'Unknown'
  }))
  ensureCountryDefaults()
}

onMounted(async () => {
  await ensureCart()
  await loadRegions()
  hydrateFromCart()
  if ((cart.value as any)?.shipping_address) {
    await loadShippingOptions()
  }
})
</script>
