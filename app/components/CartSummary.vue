<template>
  <section class="card">
    <div class="section-header">
      <h2 class="card-title">Cart snapshot</h2>
      <NuxtLink to="/cart">View cart</NuxtLink>
    </div>

    <p v-if="!cart?.items?.length" class="muted">
      Your cart is empty. Add items from the product list to begin checkout.
    </p>

    <ul v-else class="cart-list">
      <li v-for="item in cart.items" :key="item.id">
        <strong>{{ item.title || 'Item' }}</strong>
        <div class="muted">
          Qty {{ item.quantity }} · {{ formatItemPrice(item) }}
        </div>
      </li>
    </ul>

    <div v-if="cart?.items?.length" class="cart-summary">
      <span>Total items: {{ totalQuantity }}</span>
      <span><strong>{{ totalPrice }}</strong></span>
    </div>

    <p v-if="error" class="status status-error">{{ error }}</p>
  </section>
</template>

<script setup lang="ts">
import { formatPrice, resolveLineItemPrice } from '~/utils/pricing'

const { cart, error, refreshCart } = useCart()

const totalQuantity = computed(() => {
  return cart.value?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0
})

const totalPrice = computed(() => {
  const currency = cart.value?.currency_code || 'usd'
  const amount = cart.value?.total ?? cart.value?.subtotal ?? 0
  return formatPrice(amount, currency)
})

const formatItemPrice = (item: any) => {
  const price = resolveLineItemPrice(item)
  if (!price) {
    return 'Price unavailable'
  }
  return formatPrice(price.amount, price.currencyCode)
}

onMounted(() => {
  refreshCart()
})
</script>
