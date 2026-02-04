<template>
  <div class="app-shell">
    <header class="app-header">
      <NuxtLink to="/">
        <strong>Nuxt + Medusa Storefront</strong>
      </NuxtLink>
      <nav class="header-links">
        <NuxtLink to="/">Home</NuxtLink>
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

const cartCount = computed(() => {
  return cart.value?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0
})

onMounted(() => {
  refreshCart()
})
</script>
