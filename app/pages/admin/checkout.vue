<template>
  <div>
    <section class="section">
      <div class="section-header">
        <div>
          <h1>Admin checkout</h1>
          <p class="muted">Create and capture manual orders with fulfillment details.</p>
        </div>
        <NuxtLink to="/">Return to storefront</NuxtLink>
      </div>

      <div class="admin-checkout-layout">
        <div class="admin-checkout-main">
          <div class="card">
            <div class="admin-card-header">
              <div>
                <h2 class="card-title">FF</h2>
                <p class="muted">Fulfillment flow and routing details.</p>
              </div>
              <span class="tag">Manual</span>
            </div>
            <div class="form-grid">
              <div class="form-grid-2">
                <label class="field">
                  <span>Fulfillment center</span>
                  <select v-model="fulfillmentCenter" class="input-text">
                    <option value="east">East coast hub</option>
                    <option value="west">West coast hub</option>
                    <option value="eu">EU distribution</option>
                  </select>
                </label>
                <label class="field">
                  <span>Priority</span>
                  <select v-model="fulfillmentPriority" class="input-text">
                    <option value="standard">Standard</option>
                    <option value="rush">Rush</option>
                    <option value="vip">VIP</option>
                  </select>
                </label>
              </div>
              <div class="form-grid-2">
                <label class="field">
                  <span>Assigned to</span>
                  <input
                    v-model="assignedTo"
                    class="input-text"
                    type="text"
                    placeholder="Warehouse ops"
                  />
                </label>
                <label class="field">
                  <span>Packing note</span>
                  <input
                    v-model="packingNote"
                    class="input-text"
                    type="text"
                    placeholder="Gift wrap instructions"
                  />
                </label>
              </div>
              <div class="checkbox-grid">
                <label class="checkbox-field">
                  <input v-model="notifyCustomer" type="checkbox" />
                  <span>Notify customer when shipped</span>
                </label>
                <label class="checkbox-field">
                  <input v-model="allowSplit" type="checkbox" />
                  <span>Allow split shipments</span>
                </label>
                <label class="checkbox-field">
                  <input v-model="requiresSignature" type="checkbox" />
                  <span>Require signature on delivery</span>
                </label>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="admin-card-header">
              <div>
                <h2 class="card-title">Shipping address</h2>
                <p class="muted">Where the order should be delivered.</p>
              </div>
            </div>
            <div class="form-grid">
              <div class="form-grid-2">
                <label class="field">
                  <span>First name</span>
                  <input
                    v-model="shippingAddress.firstName"
                    class="input-text"
                    type="text"
                    autocomplete="given-name"
                  />
                </label>
                <label class="field">
                  <span>Last name</span>
                  <input
                    v-model="shippingAddress.lastName"
                    class="input-text"
                    type="text"
                    autocomplete="family-name"
                  />
                </label>
                <label class="field">
                  <span>Email</span>
                  <input
                    v-model="shippingAddress.email"
                    class="input-text"
                    type="email"
                    autocomplete="email"
                  />
                </label>
                <label class="field">
                  <span>Phone</span>
                  <input
                    v-model="shippingAddress.phone"
                    class="input-text"
                    type="tel"
                    autocomplete="tel"
                  />
                </label>
                <label class="field span-2">
                  <span>Company</span>
                  <input
                    v-model="shippingAddress.company"
                    class="input-text"
                    type="text"
                    autocomplete="organization"
                  />
                </label>
                <label class="field span-2">
                  <span>Address line 1</span>
                  <input
                    v-model="shippingAddress.address1"
                    class="input-text"
                    type="text"
                    autocomplete="address-line1"
                  />
                </label>
                <label class="field span-2">
                  <span>Address line 2</span>
                  <input
                    v-model="shippingAddress.address2"
                    class="input-text"
                    type="text"
                    autocomplete="address-line2"
                  />
                </label>
              </div>
              <div class="form-grid-3">
                <label class="field">
                  <span>City</span>
                  <input
                    v-model="shippingAddress.city"
                    class="input-text"
                    type="text"
                    autocomplete="address-level2"
                  />
                </label>
                <label class="field">
                  <span>State / Province</span>
                  <input
                    v-model="shippingAddress.province"
                    class="input-text"
                    type="text"
                    autocomplete="address-level1"
                  />
                </label>
                <label class="field">
                  <span>Postal code</span>
                  <input
                    v-model="shippingAddress.postalCode"
                    class="input-text"
                    type="text"
                    autocomplete="postal-code"
                  />
                </label>
              </div>
              <div class="form-grid-2">
                <label class="field">
                  <span>Country</span>
                  <select v-model="shippingAddress.country" class="input-text" autocomplete="country">
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="DE">Germany</option>
                  </select>
                </label>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="admin-card-header">
              <div>
                <h2 class="card-title">Billing address</h2>
                <p class="muted">Invoice destination and payment address.</p>
              </div>
            </div>
            <div class="form-grid">
              <div class="toggle-row">
                <label class="checkbox-field">
                  <input v-model="billingMatchesShipping" type="checkbox" />
                  <span>Billing matches shipping</span>
                </label>
                <span v-if="billingMatchesShipping" class="muted">
                  Billing fields mirror shipping details.
                </span>
              </div>
              <div class="form-grid-2">
                <label class="field">
                  <span>First name</span>
                  <input
                    v-model="billingAddress.firstName"
                    class="input-text"
                    type="text"
                    autocomplete="given-name"
                    :disabled="billingMatchesShipping"
                  />
                </label>
                <label class="field">
                  <span>Last name</span>
                  <input
                    v-model="billingAddress.lastName"
                    class="input-text"
                    type="text"
                    autocomplete="family-name"
                    :disabled="billingMatchesShipping"
                  />
                </label>
                <label class="field">
                  <span>Email</span>
                  <input
                    v-model="billingAddress.email"
                    class="input-text"
                    type="email"
                    autocomplete="email"
                    :disabled="billingMatchesShipping"
                  />
                </label>
                <label class="field">
                  <span>Phone</span>
                  <input
                    v-model="billingAddress.phone"
                    class="input-text"
                    type="tel"
                    autocomplete="tel"
                    :disabled="billingMatchesShipping"
                  />
                </label>
                <label class="field span-2">
                  <span>Company</span>
                  <input
                    v-model="billingAddress.company"
                    class="input-text"
                    type="text"
                    autocomplete="organization"
                    :disabled="billingMatchesShipping"
                  />
                </label>
                <label class="field span-2">
                  <span>Address line 1</span>
                  <input
                    v-model="billingAddress.address1"
                    class="input-text"
                    type="text"
                    autocomplete="address-line1"
                    :disabled="billingMatchesShipping"
                  />
                </label>
                <label class="field span-2">
                  <span>Address line 2</span>
                  <input
                    v-model="billingAddress.address2"
                    class="input-text"
                    type="text"
                    autocomplete="address-line2"
                    :disabled="billingMatchesShipping"
                  />
                </label>
              </div>
              <div class="form-grid-3">
                <label class="field">
                  <span>City</span>
                  <input
                    v-model="billingAddress.city"
                    class="input-text"
                    type="text"
                    autocomplete="address-level2"
                    :disabled="billingMatchesShipping"
                  />
                </label>
                <label class="field">
                  <span>State / Province</span>
                  <input
                    v-model="billingAddress.province"
                    class="input-text"
                    type="text"
                    autocomplete="address-level1"
                    :disabled="billingMatchesShipping"
                  />
                </label>
                <label class="field">
                  <span>Postal code</span>
                  <input
                    v-model="billingAddress.postalCode"
                    class="input-text"
                    type="text"
                    autocomplete="postal-code"
                    :disabled="billingMatchesShipping"
                  />
                </label>
              </div>
              <div class="form-grid-2">
                <label class="field">
                  <span>Country</span>
                  <select
                    v-model="billingAddress.country"
                    class="input-text"
                    autocomplete="country"
                    :disabled="billingMatchesShipping"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="DE">Germany</option>
                  </select>
                </label>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="admin-card-header">
              <div>
                <h2 class="card-title">Shipping method</h2>
                <p class="muted">Select a rate for this shipment.</p>
              </div>
            </div>
            <div class="option-grid">
              <label
                v-for="method in shippingMethods"
                :key="method.id"
                class="option-card"
                :class="{ active: selectedShippingMethod === method.id }"
              >
                <input
                  v-model="selectedShippingMethod"
                  type="radio"
                  name="shipping-method"
                  :value="method.id"
                />
                <div class="option-meta">
                  <span><strong>{{ method.label }}</strong></span>
                  <span class="muted">{{ method.detail }}</span>
                </div>
                <span class="option-price">{{ formatPrice(method.price, currencyCode) }}</span>
              </label>
            </div>
          </div>

          <div class="card">
            <div class="admin-card-header">
              <div>
                <h2 class="card-title">Manual Payment</h2>
                <p class="muted">Record payment details taken outside of checkout.</p>
              </div>
            </div>
            <div class="form-grid">
              <div class="option-grid">
                <label
                  v-for="method in paymentMethods"
                  :key="method.id"
                  class="option-card"
                  :class="{ active: selectedPaymentMethod === method.id }"
                >
                  <input
                    v-model="selectedPaymentMethod"
                    type="radio"
                    name="payment-method"
                    :value="method.id"
                  />
                  <div class="option-meta">
                    <span><strong>{{ method.label }}</strong></span>
                    <span class="muted">{{ method.detail }}</span>
                  </div>
                </label>
              </div>
              <div class="form-grid-2">
                <label class="field">
                  <span>Reference</span>
                  <input
                    v-model="paymentReference"
                    class="input-text"
                    type="text"
                    placeholder="Receipt or transaction ID"
                  />
                </label>
                <label class="field">
                  <span>Amount</span>
                  <input
                    v-model.number="paymentAmount"
                    class="input-text"
                    type="number"
                    min="0"
                    step="1"
                  />
                </label>
              </div>
              <div class="checkbox-grid">
                <label class="checkbox-field">
                  <input v-model="capturePayment" type="checkbox" />
                  <span>Mark as captured</span>
                </label>
                <label class="checkbox-field">
                  <input v-model="sendReceipt" type="checkbox" />
                  <span>Send receipt to customer</span>
                </label>
              </div>
              <button class="button button-secondary" type="button">Record manual payment</button>
            </div>
          </div>
        </div>

        <aside class="admin-checkout-summary">
          <div class="card">
            <h2 class="card-title">Order summary</h2>
            <ul class="summary-list">
              <li class="summary-row">
                <span>Items</span>
                <span>{{ itemCount }}</span>
              </li>
              <li class="summary-row">
                <span>Subtotal</span>
                <span>{{ formatPrice(subtotal, currencyCode) }}</span>
              </li>
              <li class="summary-row">
                <span>Shipping</span>
                <span>{{ formatPrice(shippingCost, currencyCode) }}</span>
              </li>
              <li class="summary-row">
                <span>Estimated tax</span>
                <span>{{ formatPrice(estimatedTax, currencyCode) }}</span>
              </li>
            </ul>
            <div class="summary-total">
              <span>Total</span>
              <span>{{ formatPrice(total, currencyCode) }}</span>
            </div>
          </div>
          <div class="card">
            <h2 class="card-title">Actions</h2>
            <div class="action-stack">
              <button class="button" type="button">Create order</button>
              <button class="button button-secondary" type="button">Save draft</button>
              <button class="button button-secondary" type="button">Send checkout link</button>
              <button class="button button-secondary" type="button">Discard changes</button>
            </div>
            <p class="muted">Actions are placeholders for admin workflows.</p>
          </div>
        </aside>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { formatPrice } from '~/utils/pricing'

const fulfillmentCenter = ref('east')
const fulfillmentPriority = ref('standard')
const assignedTo = ref('')
const packingNote = ref('')
const notifyCustomer = ref(true)
const allowSplit = ref(false)
const requiresSignature = ref(false)

const createAddress = () => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  address1: '',
  address2: '',
  city: '',
  province: '',
  postalCode: '',
  country: 'US'
})

const shippingAddress = reactive(createAddress())
const billingAddress = reactive(createAddress())
const billingMatchesShipping = ref(true)

const shippingMethods = [
  { id: 'standard', label: 'Standard', detail: '3-5 business days', price: 0 },
  { id: 'express', label: 'Express', detail: '1-2 business days', price: 18 },
  { id: 'priority', label: 'Priority overnight', detail: 'Next business day', price: 32 }
]

const selectedShippingMethod = ref('standard')

const paymentMethods = [
  {
    id: 'manual',
    label: 'Manual card capture',
    detail: 'Record a payment collected offline.'
  },
  {
    id: 'bank',
    label: 'Bank transfer',
    detail: 'Mark as paid via bank transfer.'
  },
  {
    id: 'cash',
    label: 'Cash',
    detail: 'Collect on delivery or pickup.'
  }
]

const selectedPaymentMethod = ref('manual')
const paymentReference = ref('')
const paymentAmount = ref(0)
const capturePayment = ref(false)
const sendReceipt = ref(true)

const currencyCode = 'usd'
const itemCount = ref(3)
const subtotal = ref(240)
const estimatedTax = ref(19)

const shippingCost = computed(() => {
  return shippingMethods.find((method) => method.id === selectedShippingMethod.value)?.price ?? 0
})

const total = computed(() => {
  return subtotal.value + estimatedTax.value + shippingCost.value
})

watch(
  shippingAddress,
  () => {
    if (billingMatchesShipping.value) {
      Object.assign(billingAddress, shippingAddress)
    }
  },
  { deep: true, immediate: true }
)

watch(billingMatchesShipping, (value) => {
  if (value) {
    Object.assign(billingAddress, shippingAddress)
  }
})

watch(
  total,
  (value) => {
    if (paymentAmount.value === 0) {
      paymentAmount.value = value
    }
  },
  { immediate: true }
)
</script>
