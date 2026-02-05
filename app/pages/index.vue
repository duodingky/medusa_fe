<template>
  <div>
    <section class="section">
      <div class="section-header">
        <div>
          <h1>Storefront overview</h1>
          <p class="muted">
            Connected to Medusa at {{ config.public.medusaBaseUrl }}
          </p>
        </div>
      </div>
      <CartSummary />
    </section>

    <section class="section">
      <div class="section-header">
        <h2>Categories</h2>
        <span class="muted">{{ categories.length }} available</span>
      </div>
      <p v-if="categoriesError" class="status status-error">
        {{ categoriesError.message }}
      </p>
      <div v-else class="tag-list">
        <span v-for="category in categories" :key="category.id" class="tag">
          {{ category.name }}
        </span>
      </div>
      <p v-if="categoriesPending" class="status">Loading categories...</p>
    </section>

    <section class="section">
      <div class="section-header">
        <h2>Collections</h2>
        <span class="muted">{{ collections.length }} available</span>
      </div>
      <p v-if="collectionsError" class="status status-error">
        {{ collectionsError.message }}
      </p>
      <div v-else class="tag-list">
        <span v-for="collection in collections" :key="collection.id" class="tag">
          {{ collection.title }}
        </span>
      </div>
      <p v-if="collectionsPending" class="status">Loading collections...</p>
    </section>

    <section class="section">
      <div class="section-header">
        <h2>Products</h2>
        <span class="muted">{{ products.length }} available</span>
      </div>
    
      <p v-if="productsError" class="status status-error">
        {{ productsError.message }}
      </p>
     
      <div v-else class="card-grid">
        <ProductCard v-for="product in products" :key="product.id" :product="product" />
      </div>
      <p v-if="productsPending" class="status">Loading products...</p>
    </section>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const { request } = useMedusa()

const {
  data: categoriesData,
  pending: categoriesPending,
  error: categoriesError
} = await useAsyncData('medusa-categories', () =>
  request<{ product_categories?: any[]; categories?: any[] }>('/store/categories')
)

const {
  data: collectionsData,
  pending: collectionsPending,
  error: collectionsError
} = await useAsyncData('medusa-collections', () =>
  request<{ collections?: any[] }>('/store/collections')
)

const {
  data: productsData,
  pending: productsPending,
  error: productsError
} = await useAsyncData('medusa-products', () =>
  request<{ products?: any[] }>('/store/products?region_id=reg_01KGJ9DRARQ5H6EDQDQETN8SN5', { query: { limit: 12 } })
)

const categories = computed(() => {
  return categoriesData.value?.product_categories || categoriesData.value?.categories || []
})

const collections = computed(() => {
  return collectionsData.value?.collections || []
})

const products = computed(() => {
  return productsData.value?.products || []
})
</script>
