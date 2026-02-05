<template>
  <div>
    <section class="section">
      <div class="section-header">
        <h1>Your cart</h1>
        <NuxtLink to="/">Continue shopping</NuxtLink>
      </div>

      <p v-if="isLoading" class="status">Updating cart...</p>
      <p v-if="error" class="status status-error">{{ error }}</p>

      <p v-if="!items.length" class="muted">
        Your cart is empty. Browse the home page to add products.
      </p>

      <ul v-else class="cart-list">
        <li v-for="item in items" :key="item.id" class="cart-item">
          <div>
            <strong>{{ item.title || 'Item' }}</strong>
            <p class="muted" v-if="item.variant?.title">
              Variant: {{ item.variant.title }}
            </p>
          </div>
          <div class="cart-item-actions">
            <label class="muted" :for="`qty-${item.id}`">Qty</label>
            <input
              :id="`qty-${item.id}`"
              class="input"
              type="number"
              min="1"
              step="1"
              :value="item.quantity"
              @change="event => handleQuantityChange(item, event)"
            />
            <button class="button button-secondary" @click="removeItem(item.id)">
              Remove
            </button>
          </div>
          <div>
            <div class="muted">Unit</div>
            <div>{{ formatLineItem(item) }}</div>
            <div class="muted">Line total</div>
            <div>
              {{ lineTotal(item) }}
            </div>
          </div>
        </li>
      </ul>

      <div v-if="items.length" class="cart-summary">
        <div class="cart-summary-meta">
          <span>Total items: {{ totalQuantity }}</span>
          <span><strong>{{ totalPrice }}</strong></span>
        </div>
        <div class="cart-summary-actions">
          <NuxtLink to="/checkout" class="button">Proceed to checkout</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { formatPrice, resolveLineItemPrice } from '~/utils/pricing'

const { cart, ensureCart, updateItem, removeItem, isLoading, error } = useCart()

const items = computed(() => cart.value?.items || [])
const currency = computed(() => cart.value?.currency_code || 'usd')
const totalQuantity = computed(() => {
  return items.value.reduce((sum, item) => sum + item.quantity, 0)
})
const totalPrice = computed(() => {
  const amount = cart.value?.total ?? cart.value?.subtotal ?? 0
  return formatPrice(amount, currency.value)
})

const formatLineItem = (item: any) => {
  const price = resolveLineItemPrice(item)
  if (!price) {
    return 'Price unavailable'
  }
  return formatPrice(price.amount, price.currencyCode)
}

const lineTotal = (item: any) => {
  const unitPrice = item.unit_price ?? 0
  return formatPrice(unitPrice * item.quantity, item.currency_code || currency.value)
}

const handleQuantityChange = async (item: any, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = Number(target.value)
  if (!Number.isFinite(value) || value < 1) {
    target.value = String(item.quantity)
    return
  }
  await updateItem(item.id, value)
}

onMounted(() => {
  ensureCart()
})
</script>
