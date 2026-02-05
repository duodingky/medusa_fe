<template>
  <div class="app-shell">
    <header class="app-header">
      <NuxtLink to="/">
        <strong>Nuxt + Medusa Storefront</strong>
      </NuxtLink>
      <nav class="header-links">
        <NuxtLink to="/">Home</NuxtLink>
        <NuxtLink to="/account">{{ accountLabel }}</NuxtLink>
        <NuxtLink to="/cart">Cart ({{ cartCount }})</NuxtLink>
      </nav>
    </header>
    <main class="content">
      <NuxtRouteAnnouncer />
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
const { cart, refreshCart } = useCart()
const { customer, fetchCustomer } = useCustomer()

const cartCount = computed(() => {
  return cart.value?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0
})

const accountLabel = computed(() => {
  if (!customer.value) {
    return 'Account'
  }
  return customer.value.first_name || customer.value.email || 'Account'
})

onMounted(() => {
  refreshCart()
  fetchCustomer()
})
</script>
