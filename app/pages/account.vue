<template>
  <div>
    <section class="section">
      <div class="section-header">
        <div>
          <h1>Account</h1>
          <p class="muted">Sign in or create a customer account.</p>
        </div>
        <NuxtLink to="/">Return to shopping</NuxtLink>
      </div>

      <div v-if="customer" class="card account-summary">
        <div>
          <p class="muted">Signed in as</p>
          <p>
            <strong>{{ customerName }}</strong>
          </p>
          <p class="muted" v-if="customer.email">{{ customer.email }}</p>
        </div>
        <button class="button button-secondary" :disabled="isLoading" @click="handleLogout">
          Log out
        </button>
      </div>

      <div v-else class="auth-layout">
        <form class="card form-card" @submit.prevent="handleLogin">
          <div>
            <h2 class="card-title">Login</h2>
            <p class="muted">Use your email and password to continue.</p>
          </div>
          <div class="form-grid">
            <label class="field">
              <span>Email</span>
              <input
                v-model="loginEmail"
                class="input-text"
                type="email"
                autocomplete="email"
                required
              />
            </label>
            <label class="field">
              <span>Password</span>
              <input
                v-model="loginPassword"
                class="input-text"
                type="password"
                autocomplete="current-password"
                required
              />
            </label>
          </div>
          <p v-if="loginError" class="status status-error">{{ loginError }}</p>
          <button class="button" type="submit" :disabled="!canLogin || isLoading">
            Sign in
          </button>
        </form>

        <form class="card form-card" @submit.prevent="handleRegister">
          <div>
            <h2 class="card-title">Create account</h2>
            <p class="muted">Tell us a little about you to get started.</p>
          </div>
          <div class="form-grid">
            <label class="field">
              <span>First name</span>
              <input
                v-model="registerFirstName"
                class="input-text"
                type="text"
                autocomplete="given-name"
                required
              />
            </label>
            <label class="field">
              <span>Last name</span>
              <input
                v-model="registerLastName"
                class="input-text"
                type="text"
                autocomplete="family-name"
                required
              />
            </label>
            <label class="field">
              <span>Email</span>
              <input
                v-model="registerEmail"
                class="input-text"
                type="email"
                autocomplete="email"
                required
              />
            </label>
            <label class="field">
              <span>Password</span>
              <input
                v-model="registerPassword"
                class="input-text"
                type="password"
                autocomplete="new-password"
                minlength="6"
                required
              />
            </label>
          </div>
          <p v-if="registerError" class="status status-error">{{ registerError }}</p>
          <p v-if="registerSuccess" class="status status-success">{{ registerSuccess }}</p>
          <button class="button" type="submit" :disabled="!canRegister || isLoading">
            Create account
          </button>
        </form>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { customer, isLoading, error, login, register, logout, fetchCustomer } = useCustomer()

const loginEmail = ref('')
const loginPassword = ref('')
const registerFirstName = ref('')
const registerLastName = ref('')
const registerEmail = ref('')
const registerPassword = ref('')

const loginError = ref<string | null>(null)
const registerError = ref<string | null>(null)
const registerSuccess = ref<string | null>(null)

const customerName = computed(() => {
  if (!customer.value) {
    return ''
  }
  return (
    [customer.value.first_name, customer.value.last_name].filter(Boolean).join(' ') ||
    customer.value.email ||
    'Customer'
  )
})

const canLogin = computed(() => {
  return Boolean(loginEmail.value.trim() && loginPassword.value.length > 0)
})
const canRegister = computed(() => {
  return (
    registerFirstName.value.trim().length > 0 &&
    registerLastName.value.trim().length > 0 &&
    registerEmail.value.trim().length > 0 &&
    registerPassword.value.length >= 6
  )
})

const handleLogin = async () => {
  loginError.value = null
  registerError.value = null
  registerSuccess.value = null
  const result = await login(loginEmail.value.trim(), loginPassword.value)
  if (!result) {
    loginError.value = error.value || 'Unable to sign in.'
    return
  }
  loginPassword.value = ''
}

const handleRegister = async () => {
  loginError.value = null
  registerError.value = null
  registerSuccess.value = null

  const result = await register({
    first_name: registerFirstName.value.trim(),
    last_name: registerLastName.value.trim(),
    email: registerEmail.value.trim(),
    password: registerPassword.value
  })

  if (!result) {
    registerError.value = error.value || 'Unable to create account.'
    return
  }

  registerSuccess.value = 'Account created! Sign in with your new credentials.'
  loginEmail.value = registerEmail.value.trim()
  registerPassword.value = ''
}

const handleLogout = async () => {
  loginError.value = null
  registerError.value = null
  registerSuccess.value = null
  await logout()
}

onMounted(() => {
  fetchCustomer()
})
</script>
