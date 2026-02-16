<script setup lang="ts">
import { login, register } from "~/utils/supabase";

definePageMeta({
  layout: 'dashboard',
})



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
  <main id="auth-page" class="auth-container">
    <div class="auth-card">
      <h1>{{ isRegistering ? 'Registreren' : 'Inloggen' }}</h1>

      <p v-if="error" class="error-message">{{ error }}</p>
      <p v-if="success" class="success-message">{{ success }}</p>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email">E-mail</label>
          <input
              id="email"
              v-model="email"
              type="email"
              required
          />
        </div>

        <div class="form-group">
          <label for="password">Wachtwoord</label>
          <input
              id="password"
              v-model="password"
              type="password"
              required
              :minlength="isRegistering ? 8 : undefined"
          />
        </div>

        <div v-if="isRegistering" class="form-group">
          <label for="confirmPassword">Bevestig Wachtwoord</label>
          <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              required
              :minlength="isRegistering ? 8 : undefined"
          />
        </div>

        <button type="submit" class="submit-btn">
          {{ isRegistering ? 'Registreren' : 'Inloggen' }}
        </button>
      </form>

      <div class="toggle-mode">
        <p>
          {{ isRegistering ? 'Heb je al een account?' : "Nog geen account?" }}
          <button @click="toggleMode" class="link-btn">
            {{ isRegistering ? 'Inloggen' : 'Registreren' }}
          </button>
        </p>
      </div>
    </div>
  </main>
</template>

<style scoped lang="scss">
#auth-page {
  min-height: 100vh;
  margin: 0 var(--page-margin);
  padding: 0;
  display: grid;

  .auth-card {
    width: 100%;
    max-width: 40rem;
    margin: auto;
    padding: var(--page-margin);
    background-color: var(--secondary-10);
    border-radius: 1rem;
    backdrop-filter: blur(5px);

    h1 {
      text-align: center;
      font-size: 3rem;
      margin: 0;
    }

    form {
      display: grid;
      gap: 1rem;

      .form-group {
        label {
          margin: .4rem 0;
        }
      }

      .submit-btn {
        display: inline-flex;
        align-items: center;
        gap: 1rem;
        width: fit-content;
        height: fit-content;
        margin: .5rem auto;
        padding: 0.5rem 2rem;
        border-radius: 5rem;
        background-color: var(--accent);
        color: var(--light);
        font:inherit;
        font-weight: 500;
        text-transform: uppercase;
        border: 2px solid var(--accent);

        &:hover {
          background-color: var(--accent-50);
        }
      }
    }

    .error-message, .success-message {
      text-align: center;
      width: 100%;
      padding: .5rem 1rem;
      border-radius: 0.5rem;
    }

    .error-message {
      color: var(--danger);
      background-color: #fee2e2;
    }

    .success-message {
      color: var(--success);
      background-color: #dcfce7;
    }

    .toggle-mode {
      text-align: center;
      font-size: 1rem;

      p {
        margin: 0;
      }

      .link-btn {
        background: none;
        border: none;
        font: inherit;
        position: relative;
        color: var(--secondary);
        text-decoration: none;
        cursor: pointer;
        text-transform: capitalize;
        padding: .3rem;
        margin: 0 .3rem;

        &::after {
          position: absolute;
          content: "";
          bottom: 1px;
          left: 0;
          display: block;
          height: 2px;
          width: 100%;
          background-color: var(--accent);
        }
      }
    }
  }
}
</style>