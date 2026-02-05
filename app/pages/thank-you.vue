<template>
  <div>
    <section class="section">
      <div class="section-header">
        <div>
          <h1>Thank you for your order</h1>
          <p class="muted">We have received your order and sent a confirmation email.</p>
        </div>
        <NuxtLink to="/">Continue shopping</NuxtLink>
      </div>
      <p v-if="loading" class="status">Loading order details...</p>
      <p v-else-if="error" class="status status-error">{{ error }}</p>
    </section>

    <div v-if="order" class="checkout-layout">
      <div class="checkout-main">
        <section class="card">
          <h2 class="card-title">Order details</h2>
          <div class="summary-row">
            <span>Order ID</span>
            <span>{{ displayOrderId }}</span>
          </div>
          <div class="summary-row">
            <span>Email</span>
            <span>{{ order.email || 'N/A' }}</span>
          </div>
          <div class="summary-row">
            <span>Payment status</span>
            <span>{{ order.payment_status || 'Pending' }}</span>
          </div>
          <div class="summary-row">
            <span>Fulfillment status</span>
            <span>{{ order.fulfillment_status || 'Pending' }}</span>
          </div>
        </section>

        <section class="card">
          <h2 class="card-title">Shipping address</h2>
          <p class="muted">{{ formatAddress(order.shipping_address) }}</p>
        </section>

        <section v-if="order.billing_address" class="card">
          <h2 class="card-title">Billing address</h2>
          <p class="muted">{{ formatAddress(order.billing_address) }}</p>
        </section>
      </div>

      <aside class="checkout-summary">
        <section class="card">
          <h3 class="card-title">Items</h3>
          <ul class="summary-list">
            <li v-for="item in order.items || []" :key="item.id" class="summary-item">
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
  </div>
</template>

<script setup lang="ts">
import { formatPrice, resolveLineItemPrice } from '~/utils/pricing'

const route = useRoute()
const { request } = useMedusa()

const order = ref<any>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const orderId = computed(() => {
  const value = route.query.order_id
  return typeof value === 'string' ? value : ''
})

const displayOrderId = computed(() => {
  if (!order.value) {
    return orderId.value || 'N/A'
  }
  if (order.value.display_id) {
    return `#${order.value.display_id}`
  }
  return order.value.id || orderId.value || 'N/A'
})

const currency = computed(() => order.value?.currency_code || 'usd')
const subtotal = computed(() => formatPrice(order.value?.subtotal ?? 0, currency.value))
const shippingTotal = computed(() => formatPrice(order.value?.shipping_total ?? 0, currency.value))
const taxTotal = computed(() => formatPrice(order.value?.tax_total ?? 0, currency.value))
const discountTotal = computed(() => formatPrice(order.value?.discount_total ?? 0, currency.value))
const total = computed(() => formatPrice(order.value?.total ?? 0, currency.value))
const hasDiscount = computed(() => (order.value?.discount_total ?? 0) > 0)

const loadOrder = async () => {
  if (!orderId.value) {
    error.value = 'Missing order ID. Please check your confirmation email.'
    return
  }
  loading.value = true
  error.value = null
  try {
    const data = await request<{ order?: any }>(`/store/orders/${orderId.value}`)
    order.value = data.order || data
  } catch (err) {
    error.value = resolveErrorMessage(err)
  } finally {
    loading.value = false
  }
}

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

const formatAddress = (address: any) => {
  if (!address) {
    return 'No address provided.'
  }
  const parts = [
    `${address.first_name || ''} ${address.last_name || ''}`.trim(),
    address.address_1,
    address.address_2,
    [address.city, address.province].filter(Boolean).join(', '),
    address.postal_code,
    address.country_code ? String(address.country_code).toUpperCase() : null
  ].filter(Boolean)
  return parts.join(', ')
}

onMounted(() => {
  loadOrder()
})

watch(orderId, () => {
  order.value = null
  if (orderId.value) {
    loadOrder()
  }
})

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
  return 'Unable to load order details.'
}
</script>
