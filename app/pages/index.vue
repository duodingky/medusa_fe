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
        <div>
          <h2>Products</h2>
          <p class="muted">Filter by category and collection.</p>
        </div>
        <div class="filter-meta">
          <span class="muted">{{ products.length }} available</span>
          <span v-if="isFiltered" class="filter-badge">Filtered</span>
        </div>
      </div>
      <div class="catalog-layout">
        <aside class="catalog-sidebar">
          <div class="sidebar-card">
            <div class="filter-meta">
              <h3 class="card-title">Categories</h3>
              <span class="muted">{{ categories.length }}</span>
            </div>
            <p v-if="categoriesError" class="status status-error">
              {{ categoriesError.message }}
            </p>
            <p v-else-if="categoriesPending" class="status">Loading categories...</p>
            <div v-else class="filter-list">
              <button
                class="filter-button"
                :class="{ active: !selectedCategoryId }"
                @click="selectCategory(null)"
              >
                All categories
              </button>
              <button
                v-for="category in categories"
                :key="category.id"
                class="filter-button"
                :class="{ active: selectedCategoryId === category.id }"
                @click="selectCategory(category.id)"
              >
                {{ category.name }}
              </button>
            </div>
          </div>

          <div class="sidebar-card">
            <div class="filter-meta">
              <h3 class="card-title">Collections</h3>
              <span class="muted">{{ collections.length }}</span>
            </div>
            <p v-if="collectionsError" class="status status-error">
              {{ collectionsError.message }}
            </p>
            <p v-else-if="collectionsPending" class="status">Loading collections...</p>
            <div v-else class="filter-list">
              <button
                class="filter-button"
                :class="{ active: !selectedCollectionId }"
                @click="selectCollection(null)"
              >
                All collections
              </button>
              <button
                v-for="collection in collections"
                :key="collection.id"
                class="filter-button"
                :class="{ active: selectedCollectionId === collection.id }"
                @click="selectCollection(collection.id)"
              >
                {{ collection.title }}
              </button>
            </div>
          </div>

          <div v-if="isFiltered" class="sidebar-card">
            <div class="filter-meta">
              <h3 class="card-title">Active filters</h3>
            </div>
            <div class="filter-list">
              <span v-if="activeCategoryName" class="filter-badge">
                Category: {{ activeCategoryName }}
              </span>
              <span v-if="activeCollectionTitle" class="filter-badge">
                Collection: {{ activeCollectionTitle }}
              </span>
            </div>
            <div class="filter-actions">
              <button class="button button-secondary" @click="clearFilters">
                Clear filters
              </button>
            </div>
          </div>
        </aside>

        <div>
          <p v-if="productsError" class="status status-error">
            {{ productsError.message }}
          </p>
          <p v-else-if="productsPending" class="status">Loading products...</p>
          <p v-else-if="!products.length" class="muted">
            No products match your filters.
          </p>
          <div v-else class="card-grid">
            <ProductCard v-for="product in products" :key="product.id" :product="product" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const { request } = useMedusa()

const selectedCategoryId = ref<string | null>(null)
const selectedCollectionId = ref<string | null>(null)

const { data: regionsData } = await useAsyncData('medusa-regions', () =>
  request<{ regions?: any[] }>('/store/regions')
)

const regionId = computed(() => {
  return regionsData.value?.regions?.[0]?.id || null
})

const productQuery = computed(() => {
  const query: Record<string, any> = { limit: 12 }
  if (regionId.value) {
    query.region_id = regionId.value
  }
  if (selectedCategoryId.value) {
    query.category_id = [selectedCategoryId.value]
  }
  if (selectedCollectionId.value) {
    query.collection_id = [selectedCollectionId.value]
  }
  return query
})

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
  request<{ products?: any[] }>('/store/products', { query: productQuery.value }),
  {
    watch: [selectedCategoryId, selectedCollectionId, regionId]
  }
)

const categories = computed(() => {
  return categoriesData.value?.product_categories || categoriesData.value?.categories || []
})

const collections = computed(() => {
  return collectionsData.value?.collections || []
})

const selectCategory = (id: string | null) => {
  selectedCategoryId.value = id
}

const selectCollection = (id: string | null) => {
  selectedCollectionId.value = id
}

const clearFilters = () => {
  selectedCategoryId.value = null
  selectedCollectionId.value = null
}

const activeCategoryName = computed(() => {
  return categories.value.find((category: any) => category.id === selectedCategoryId.value)?.name
})

const activeCollectionTitle = computed(() => {
  return collections.value.find((collection: any) => collection.id === selectedCollectionId.value)?.title
})

const isFiltered = computed(() => {
  return Boolean(selectedCategoryId.value || selectedCollectionId.value)
})

const products = computed(() => {
  return productsData.value?.products || []
})
</script>
