<template>
  <article class="card">
    <img
      v-if="imageUrl"
      class="product-image"
      :src="imageUrl"
      :alt="imageAlt"
      loading="lazy"
    />
    <div v-else class="product-image product-image-placeholder">No image available</div>
    <div>
      <h3 class="card-title">{{ product.title }}</h3>
      <p v-if="product.subtitle" class="muted">{{ product.subtitle }}</p>
    </div>
    <p v-if="product.description" class="muted">{{ product.description }}</p>
    <div class="field">
      <label class="muted" :for="selectId">Variant</label>
      <select
        :id="selectId"
        v-model="selectedVariantId"
        class="input-text"
        :disabled="!variantOptions.length"
      >
        <option v-if="!variantOptions.length" value="">No variants available</option>
        <option v-for="option in variantOptions" :key="option.id" :value="option.id">
          {{ option.label }}
        </option>
      </select>
    </div>
    <div>
      <span class="product-price">
        {{ displayPrice }}
      </span>
    </div>
    <button class="button" :disabled="!selectedVariantId || isLoading" @click="handleAdd">
      Add to cart
    </button>
  </article>
</template>

<script setup lang="ts">
import { formatPrice, resolveVariantPrice, getFinalPrice } from '~/utils/pricing'

const props = defineProps<{
  product: any
}>()

const { addItem, isLoading } = useCart()

const variants = computed(() => props.product?.variants || [])
const selectedVariantId = ref('')
const selectId = computed(() => `variant-${props.product?.id || 'product'}`)

const buildVariantLabel = (variant: any, index: number) => {
  if (variant?.title) {
    return variant.title
  }

  const optionValues = variant?.options
    ?.map((option: any) => option?.value)
    .filter(Boolean)

  if (optionValues?.length) {
    return optionValues.join(' / ')
  }

  return `Variant ${index + 1}`
}

const variantOptions = computed(() => {
  return variants.value
    .map((variant: any, index: number) => ({
      id: variant.id,
      label: buildVariantLabel(variant, index)
    }))
    .filter((option: any) => Boolean(option.id))
})

watchEffect(() => {
  if (!variantOptions.value.length) {
    selectedVariantId.value = ''
    return
  }

  const isValid = variantOptions.value.some((option: any) => option.id === selectedVariantId.value)
  if (!isValid) {
    selectedVariantId.value = variantOptions.value[0].id
  }
})

const selectedVariant = computed(() => {
  return variants.value.find((variant: any) => variant.id === selectedVariantId.value) || null
})

const imageUrl = computed(() => {
  return props.product?.thumbnail || props.product?.images?.[0]?.url || ''
})

const imageAlt = computed(() => props.product?.title || 'Product image')

const displayPrice = computed(() => {
  const price = getFinalPrice(selectedVariant.value) || resolveVariantPrice(selectedVariant.value)
  if (!price) {
    return 'Price unavailable'
  }

  return formatPrice(price.amount, price.currencyCode)
})

const handleAdd = async () => {
  if (!selectedVariantId.value) {
    return
  }

  await addItem(selectedVariantId.value, 1)
}
</script>
