<template>
  <article class="card">
    <div>
      <h3 class="card-title">{{ product.title }}</h3>
      <p v-if="product.subtitle" class="muted">{{ product.subtitle }}</p>
    </div>
    <p v-if="product.description" class="muted">{{ product.description }}</p>
    <div>
      <span class="product-price">
        {{ displayPrice }}
      </span>
    </div>
    <button class="button" :disabled="!variantId || isLoading" @click="handleAdd">
      Add to cart
    </button>
  </article>
</template>

<script setup lang="ts">
import { formatPrice, resolveVariantPrice } from '~/utils/pricing'

const props = defineProps<{
  product: any
}>()

const { addItem, isLoading } = useCart()

const variant = computed(() => props.product?.variants?.[0])
const variantId = computed(() => variant.value?.id)

const displayPrice = computed(() => {
  const price = resolveVariantPrice(variant.value)
  if (!price) {
    return 'Price unavailable'
  }

  return formatPrice(price.amount, price.currencyCode)
})

const handleAdd = async () => {
  if (!variantId.value) {
    return
  }

  await addItem(variantId.value, 1)
}
</script>
