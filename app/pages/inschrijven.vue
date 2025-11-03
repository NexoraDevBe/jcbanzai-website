<script setup lang="ts">
import { countries } from "countries-list";
import { insertMember } from "~/utils/supabase";
import {
  validateName,
  validateSelect,
  validateDate,
  validateText,
  validateZipcode,
  validateEmail,
  validatePhone,
  validateCheckbox
} from "~/utils/validation";

const name = ref<string>('')
const lastname = ref<string>('')
const gender = ref<string>('')
const birthdate = ref<string>('')
const nation = ref<string>('BE')
const street = ref<string>('')
const city = ref<string>('')
const zipcode = ref<string>('');
const phone = ref<string>('')
const email2 = ref<string>('')
const email = ref<string>('')
const uitpas = ref<string>('')
const terms = ref<boolean>(false)
const errors = ref<Record<string, string>>({})
const error = ref<string>('')
const success = ref<string>('')

const handleSubmit = () => {
  // Reset errors
  errors.value = {}
  error.value = ''
  success.value = ''

  // Validate all fields
  const validations: Record<string, any> = {
    name: validateName(name.value, 'Voornaam'),
    lastname: validateName(lastname.value, 'Achternaam'),
    gender: validateSelect(gender.value, 'Geslacht', { allowedValues: ['M', 'V'] }),
    birthdate: validateDate(birthdate.value, 'Geboortedatum', { max: 'today' }),
    nation: validateSelect(nation.value, 'Nationaliteit'),
    street: validateText(street.value, 'Straat + Nummer', { minLength: 3, maxLength: 100 }),
    zipcode: validateZipcode(zipcode.value, 'Postcode', { country: nation.value as 'BE' | 'NL' }),
    city: validateText(city.value, 'Gemeente', { minLength: 2, maxLength: 50 }),
    email: validateEmail(email.value, 'Email'),
    phone: validatePhone(phone.value, 'GSM', { country: 'BE' }),
    terms: validateCheckbox(terms.value, 'Algemene voorwaarden')
  }

  // Validate optional email2 if provided
  if (email2.value) {
    const email2Validation = validateEmail(email2.value, 'Tweede Email', { required: false })
    if (!email2Validation.isValid) {
      validations.email2 = email2Validation
    } else if (email2.value.toLowerCase() === email.value.toLowerCase()) {
      validations.email2 = {
        isValid: false,
        error: 'Tweede email mag niet hetzelfde zijn als het eerste emailadres'
      }
    }
  }

  // Validate optional uitpas if provided
  if (uitpas.value) {
    const uitpasValidation = validateText(uitpas.value, 'UiTPAS', {
      required: false,
      pattern: /^\d{13}$/,
      customMessage: 'UiTPAS moet 13 cijfers bevatten'
    })
    if (!uitpasValidation.isValid) {
      validations.uitpas = uitpasValidation
    }
  }

  // Collect errors
  for (const [field, result] of Object.entries(validations)) {
    if (!result.isValid) {
      errors.value[field] = result.error!
    }
  }

  // Check if form is valid
  if (Object.keys(errors.value).length > 0) {
    error.value = 'Gelieve alle velden correct in te vullen'
    return
  }

  // Submit form
  insertMember(
      name.value,
      lastname.value,
      gender.value,
      birthdate.value,
      nation.value,
      street.value,
      city.value,
      zipcode.value,
      phone.value,
      (email2.value ? [email.value, email2.value] : [email.value]),
      uitpas.value,
  )

  success.value = 'Inschrijving succesvol verzonden!'
}
</script>

<template>
  <main id="inschrijven-page">
    <h1>Inschrijven</h1>

    <p v-if="error" class="error-message">{{ error }}</p>
    <p v-if="success" class="success-message">{{ success }}</p>

    <section>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="name">Voornaam</label>
          <input
              id="name"
              v-model="name"
              type="text"
              required
              :class="{ 'error': errors.name }"
          />
          <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
        </div>

        <div class="form-group">
          <label for="lastname">Achternaam</label>
          <input
              id="lastname"
              v-model="lastname"
              type="text"
              required
              :class="{ 'error': errors.lastname }"
          />
          <span v-if="errors.lastname" class="error-text">{{ errors.lastname }}</span>
        </div>

        <div class="form-group">
          <label for="gender">Geslacht</label>
          <select
              id="gender"
              v-model="gender"
              required
              :class="{ 'error': errors.gender }"
          >
            <option value="M">Man</option>
            <option value="V">Vrouw</option>
          </select>
          <span v-if="errors.gender" class="error-text">{{ errors.gender }}</span>
        </div>

        <div class="form-group">
          <label for="birthdate">Geboortedatum</label>
          <input
              id="birthdate"
              v-model="birthdate"
              type="date"
              required
              :class="{ 'error': errors.birthdate }"
          />
          <span v-if="errors.birthdate" class="error-text">{{ errors.birthdate }}</span>
        </div>

        <div class="form-group">
          <label for="nation">Nationaliteit</label>
          <select
              id="nation"
              v-model="nation"
              required
              :class="{ 'error': errors.nation }"
          >
            <option v-for="(c, key) in countries" :value="key" :key="key">{{ c.native }}</option>
          </select>
          <span v-if="errors.nation" class="error-text">{{ errors.nation }}</span>
        </div>

        <div class="form-group">
          <label for="street">Straat + Nummer</label>
          <input
              id="street"
              v-model="street"
              type="text"
              required
              :class="{ 'error': errors.street }"
          />
          <span v-if="errors.street" class="error-text">{{ errors.street }}</span>
        </div>

        <div class="form-group">
          <label for="zipcode">Postcode</label>
          <input
              id="zipcode"
              v-model="zipcode"
              type="text"
              required
              :class="{ 'error': errors.zipcode }"
          />
          <span v-if="errors.zipcode" class="error-text">{{ errors.zipcode }}</span>
        </div>

        <div class="form-group">
          <label for="city">Gemeente</label>
          <input
              id="city"
              v-model="city"
              type="text"
              required
              :class="{ 'error': errors.city }"
          />
          <span v-if="errors.city" class="error-text">{{ errors.city }}</span>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
              id="email"
              v-model="email"
              type="email"
              required
              :class="{ 'error': errors.email }"
          />
          <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="email2">Tweede Email</label>
          <input
              id="email2"
              v-model="email2"
              type="email"
              :class="{ 'error': errors.email2 }"
          />
          <span v-if="errors.email2" class="error-text">{{ errors.email2}}</span>
        </div>

        <div class="form-group">
          <label for="phone">GSM</label>
          <input
              id="phone"
              v-model="phone"
              type="tel"
              required
              :class="{ 'error': errors.phone }"
          />
          <span v-if="errors.phone" class="error-text">{{ errors.phone }}</span>
        </div>

        <div class="form-group">
          <label for="uitpas">UiTPAS</label>
          <input
              id="uitpas"
              v-model="uitpas"
              type="text"
              :class="{ 'error': errors.uitpas }"
          />
          <span v-if="errors.uitpas" class="error-text">{{ errors.uitpas }}</span>
        </div>

        <div class="form-item">
          <label for="terms">Ik ga akkoord met de algemene voorwaarden</label>
          <input
              id="terms"
              v-model="terms"
              type="checkbox"
              required
              :class="{ 'error': errors.terms }"
          />
          <span v-if="errors.terms" class="error-text">{{ errors.terms }}</span>
        </div>

        <div class="form-item">
          <button type="submit" class="submit-btn">
            Inschrijven
          </button>
        </div>
      </form>
    </section>
  </main>
</template>

<style scoped lang="scss">
#inschrijven-page {
  section {
    padding: var(--page-margin);

    form {
      display: grid;
      grid-template-columns: 100%;
      gap: 1rem;

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        .error-text {
          color: var(--danger);
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        input.error,
        select.error {
          border-color: var(--danger);
        }
      }

      button[type="submit"] {
        display: inline-flex;
        align-items: center;
        gap: 1rem;
        width: fit-content;
        height: fit-content;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 5rem;
        background-color: var(--accent);
        color: var(--light);
        font-size: 1.3rem;
        font-weight: 500;
        font-family: 'Rokkitt', Arial, serif;
        text-transform: uppercase;
        cursor: pointer;
      }
    }
  }

  .error-message {
    text-align: center;
    color: var(--danger);
    font-weight: 500;
    margin: 0 auto 2rem;
    padding: 1rem 1.5rem;
    background-color: #fee2e2;
    border-radius: 0.5rem;
    width: fit-content;
  }

  .success-message {
    text-align: center;
    color: var(--success);
    font-weight: 500;
    margin: 0 auto 2rem;
    padding: 1rem 1.5rem;
    background-color: #dcfce7;
    border-radius: 0.5rem;
    width: fit-content;
  }
}

@media screen and (width >= 48rem) {
  #inschrijven-page {
    position: relative;
    z-index: 1;

    section {
      background-color: var(--secondary-10);
      border-radius: 1rem;
      backdrop-filter: blur(5px);

      form {
        display: grid;
        grid-template-columns: repeat(2, minmax(40%, 1fr));
        gap: 1rem;

        .form-item {
          min-height: 2rem;
          grid-column: 1 / -1;
        }
      }
    }
  }
}

@media screen and (width >= 80rem) {
  #inschrijven-page {
    section {
      background-color: var(--secondary-10);
      border-radius: 1rem;
      backdrop-filter: blur(5px);

      form {
        display: grid;
        grid-template-columns: repeat(2, minmax(40%, 1fr));
        gap: 2rem;
      }
    }
  }
}
</style>