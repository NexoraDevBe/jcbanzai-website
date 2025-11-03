<script setup lang="ts">
import { login, register, logout } from "~/utils/supabase";

const email = ref<string>('')
const password = ref<string>('')
const confirmPassword = ref<string>('')
const error = ref<string>('')
const success = ref<string>('')
const isRegistering = ref<boolean>(false)

const signin = async () => {
  const { data, error: authError } = await login(email.value, password.value)

  if (authError) {
    error.value = authError.message
  } else {
    navigateTo('/dashboard')
  }
}

const signup = async () => {
  error.value = ''
  success.value = ''

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  const { data, error: authError } = await register(email.value, password.value)

  if (authError) {
    error.value = authError.message
  } else {
    if (data.user && !data.session) {
      success.value = 'Registration successful! Please check your email to confirm your account.'
    } else {
      success.value = 'Registration successful!'
      setTimeout(() => {
        navigateTo('/dashboard')
      }, 1500)
    }
  }
}

const handleSubmit = () => {
  if (isRegistering.value) {
    signup()
  } else {
    signin()
  }
}

const toggleMode = () => {
  isRegistering.value = !isRegistering.value
  error.value = ''
  success.value = ''
  password.value = ''
  confirmPassword.value = ''
}
</script>

<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1>{{ isRegistering ? 'Register' : 'Login' }}</h1>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email">Email</label>
          <input
              id="email"
              v-model="email"
              type="email"
              placeholder="Enter your email"
              required
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Enter your password"
              required
              :minlength="isRegistering ? 6 : undefined"
          />
        </div>

        <div v-if="isRegistering" class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              required
          />
        </div>

        <button type="submit" class="submit-btn">
          {{ isRegistering ? 'Register' : 'Login' }}
        </button>
      </form>

      <p v-if="error" class="error-message">{{ error }}</p>
      <p v-if="success" class="success-message">{{ success }}</p>

      <div class="toggle-mode">
        <p>
          {{ isRegistering ? 'Already have an account?' : "Don't have an account?" }}
          <button @click="toggleMode" class="link-btn">
            {{ isRegistering ? 'Login' : 'Register' }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>