<script setup lang="ts">
import {uploadNewsImageToBucket} from "~/utils/supabase";
import {
  validateDate,
  validateText,
  validateCheckbox
} from "~/utils/validation";
import {convertToWebP} from "~/utils/files";

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard',
})

const newsStore = useNewsStore();

const title = ref<string>('')
const description = ref<string>('')
const date = ref<string>('')
const post = ref<boolean>(false)
const alert = ref<boolean>(false)
const alertStartDate = ref<string>('')
const alertEndDate = ref<string>('')
const imgUrl = ref<string>('')
const image = ref<File | null>(null)
const errors = ref<Record<string, string>>({})
const error = ref<string>('')
const success = ref<string>('')

const MAX_SIZE_MB = 2
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

// Clear post-related fields when post is unchecked
watch(post, (val) => {
  if (!val) {
    date.value = ''
    image.value = null
    imgUrl.value = ''
  }
})

// Clear alert-related fields when alert is unchecked
watch(alert, (val) => {
  if (!val) {
    alertStartDate.value = ''
    alertEndDate.value = ''
  }
})

const handleSubmit = async () => {
  errors.value = {}
  error.value = ''
  success.value = ''

  // At least one of post or alert must be checked
  if (!post.value && !alert.value) {
    error.value = 'Selecteer minstens één optie: post op nieuwspagina of alert op homepagina'
    return
  }

  const validations: Record<string, any> = {
    title: validateText(title.value, 'Titel', { required: true, maxLength: 80 }),
    description: validateText(description.value, 'Beschrijving', { required: post.value, maxLength: 1500 }),
    post: validateCheckbox(post.value, 'Post op nieuwspagina', { required: false }),
    date: validateDate(date.value, 'Zichtbare datum', { required: post.value }),
    alert: validateCheckbox(alert.value, 'Alert op homepagina', { required: false }),
    alertStartDate: validateDate(alertStartDate.value, 'Start datum', { required: alert.value, min: 'today' }),
    alertEndDate: validateDate(alertEndDate.value, 'Eind datum', { required: alert.value, min: 'today' }),
  }

  if (post.value && !image.value) {
    errors.value.image = 'Afbeelding is verplicht'
  }

  if (post.value && image.value) {
    const webpFile = await convertToWebP(image.value)

    // (optional) check again after conversion
    if (webpFile.size > MAX_SIZE_BYTES) {
      errors.value.image = `Afbeelding is te groot na compressie (max 2MB) (opgegeven bestand ${MAX_SIZE_MB}MB)`
      return
    }

    const uploadResult = await uploadNewsImageToBucket(webpFile as File)

    if (!uploadResult.success) {
      errors.value.image = 'Upload is mislukt'
      return
    }

    imgUrl.value = uploadResult.url ?? ''
  }

  for (const [field, result] of Object.entries(validations)) {
    if (!result.isValid) {
      errors.value[field] = result.error!
    }
  }

  if (Object.keys(errors.value).length > 0) {
    error.value = 'Gelieve alle velden correct in te vullen'
    return
  }

  await newsStore.addNewspost(
      title.value,
      description.value,
      alertStartDate.value || null,
      alertEndDate.value || null,
      date.value || null,
      imgUrl.value,
      alert.value,
      post.value
  )

  success.value = 'Nieuwspost succesvol opgeslaan!'
  title.value = ''
  description.value = ''
  alertStartDate.value = ''
  alertEndDate.value = ''
  date.value = ''
  imgUrl.value = ''
  alert.value = false
  post.value = false

  scrollTo(0, 0)
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  image.value = target.files?.[0] ?? null
}
</script>

<template>
  <main id="newsposts-create-page">
    <h1>Nieuwspost toevoegen</h1>

    <p v-if="error" class="error-message">{{ error }}</p>
    <p v-if="success" class="success-message">{{ success }}</p>

    <section>
      <form @submit.prevent="handleSubmit">
        <div class="form-container">
          <div class="form-group">
            <label for="title">Titel</label>
            <input
                id="title"
                v-model="title"
                type="text"
                required
                :class="{ 'error': errors.title }"
            />
            <span v-if="errors.title" class="error-text">{{ errors.title }}</span>
          </div>

          <div class="form-group">
            <label for="description">
              Beschrijving
            </label>
            <textarea
                id="description"
                v-model="description"
                :class="{ 'error': errors.description }"
                :required="post"
                rows="15"
            />
            <span v-if="errors.description" class="error-text">{{ errors.description }}</span>
          </div>
        </div>

        <div class="form-container">
          <div class="form-item">
            <label for="post">Post op nieuwspagina</label>
            <input
                id="post"
                v-model="post"
                type="checkbox"
                :class="{ 'error': errors.post }"
            />
            <span v-if="errors.post" class="error-text">{{ errors.post }}</span>
          </div>

          <div class="form-group">
            <label for="date">Zichtbare datum</label>
            <input
                id="date"
                v-model="date"
                type="date"
                :disabled="!post"
                :required="post"
                :class="{ 'error': errors.date }"
            />
            <span v-if="errors.date" class="error-text">{{ errors.date }}</span>
          </div>

          <div class="form-group">
            <label for="image">Door afbeeldingen bladeren</label>
            <input
                id="image"
                @change="handleFileChange"
                type="file"
                accept="image/*"
                :disabled="!post"
                :required="post"
                :class="{ 'error': errors.image }"
            />
            <span v-if="errors.image" class="error-text">{{ errors.image }}</span>
          </div>
        </div>

        <div class="form-container">
          <div class="form-item">
            <label for="alert">Alert op homepagina</label>
            <input
                id="alert"
                v-model="alert"
                type="checkbox"
                :class="{ 'error': errors.alert }"
            />
            <span v-if="errors.alert" class="error-text">{{ errors.alert }}</span>
          </div>

          <div class="form-group">
            <label for="alertStartDate">Alert zichtbaar van</label>
            <input
                id="alertStartDate"
                v-model="alertStartDate"
                type="date"
                :disabled="!alert"
                :required="alert"
                :class="{ 'error': errors.alertStartDate }"
            />
            <span v-if="errors.alertStartDate" class="error-text">{{ errors.alertStartDate }}</span>
          </div>

          <div class="form-group">
            <label for="alertEndDate">Alert zichtbaar tot</label>
            <input
                id="alertEndDate"
                v-model="alertEndDate"
                type="date"
                :disabled="!alert"
                :required="alert"
                :class="{ 'error': errors.alertEndDate }"
            />
            <span v-if="errors.alertEndDate" class="error-text">{{ errors.alertEndDate }}</span>
          </div>
        </div>

        <div class="form-item">
          <button type="submit" class="submit-btn success">
            Toevoegen
          </button>
        </div>
      </form>
    </section>
  </main>
</template>

<style scoped lang="scss">
#newsposts-create-page {
  form {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;

    @media screen and (width >= 64rem) {
      grid-template-columns: 1fr 1fr;
    }

    .form-container {
      @media screen and (width >= 64rem) {
        &:nth-child(1) {
          grid-column: 1;
          grid-row: 1 / 3;
        }
      }

      .form-group:has(input:disabled),
      .form-group:has(textarea:disabled) {
        label {
          opacity: 0.6;
        }

        input,
        textarea {
          opacity: 0.6;
        }
      }

      .form-group {
        input[type="file"] {
          display: flex;
          gap: 1rem;

          &::file-selector-button {
            display: inline-flex;
            align-items: center;
            gap: 1rem;
            width: fit-content;
            height: fit-content;
            padding: .3rem 1rem;
            border-radius: 5rem;
            font: inherit;
            font-size: 1.1rem;
            font-weight: 500;
            text-transform: uppercase;
            cursor: pointer;
            background-color: var(--secondary);
            color: var(--primary);
            border: 2px solid var(--secondary);

            &:hover {
              background-color: var(--secondary-50);
            }
          }

          &:disabled {
            &::file-selector-button {
              cursor: auto;

              &:hover {
                background-color: var(--secondary);
              }
            }
          }
        }
      }
    }

    > .form-item {
      grid-column: 1;
      display: flex;
      justify-content: center;

      @media screen and (width >= 64rem) {
        grid-column: 1 / 3;
      }
    }
  }
}
</style>