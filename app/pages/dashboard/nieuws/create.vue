<script setup lang="ts">
import {insertNewspost, uploadNewsImageToBucket} from "~/utils/supabase";
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

const title = ref<string>('')
const description = ref<string>('')
const date = ref<string>('')
const pinned = ref<boolean>(false)
const post = ref<boolean>(false)
const alert = ref<boolean>(false)
const alertStartDate = ref<string>('')
const alertEndDate = ref<string>('')
const imgUrl = ref<string>('')
const image = ref<File | null>(null)
const errors = ref<Record<string, string>>({})
const error = ref<string>('')
const success = ref<string>('')

const handleSubmit = async () => {
  // Reset errors
  errors.value = {}
  error.value = ''
  success.value = ''

  // Validate all fields
  const validations: Record<string, any> = {
    title: validateText(title.value, 'Titel', {required: true, maxLength: 80}),
    description: validateText(description.value, 'Beschrijving', {required: true, maxLength: 1500}),
    pinned: validateCheckbox(pinned.value, 'Vastzetten', { required: false }),
    post: validateCheckbox(post.value, 'Post op nieuwspagina', { required: false }),
    date: validateDate(date.value, 'Zichtbare datum', { required: post.value }),
    alert: validateCheckbox(alert.value, 'Alert op homepagina', { required: false }),
    alertEndDate: validateDate(alertEndDate.value, 'Alert zichtbaar tot', { required: alert.value, min: "today" }),
    alertStartDate: validateDate(alertEndDate.value, 'Alert zichtbaar van', { required: alert.value, min: "today" }),
  }

  if (image.value) {
    const webpFile = await convertToWebP(image.value)

    console.log(webpFile)

    const uploadResult = await uploadNewsImageToBucket(webpFile as File)

    if (!uploadResult.success) {
      errors.value.image = 'Upload is mislukt'
      return
    }

    imgUrl.value = uploadResult.url ?? ''
  }

  if (post.value && !image.value) {
    errors.value.image = "Afbeelding is verplicht"
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
  insertNewspost(
      title.value,
      description.value,
      alertStartDate.value || null,
      alertEndDate.value || null,
      date.value || null,
      imgUrl.value,
      alert.value,
      post.value,
      pinned.value,
  )

  success.value = 'Nieuwspost succesvol opgeslaan!'
  title.value = '';
  description.value = '';
  alertStartDate.value = '';
  alertEndDate.value = '';
  date.value = '';
  imgUrl.value = '';
  alert.value = false;
  post.value = false;
  pinned.value = false;

  scrollTo(0,0)
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  image.value = target.files?.[0] ?? null
}
</script>

<template>
  <main id="newsposts-create-page">
    <h1>Inschrijven</h1>

    <p v-if="error" class="error-message">{{ error }}</p>
    <p v-if="success" class="success-message">{{ success }}</p>

    <section>
      <form @submit.prevent="handleSubmit">
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
          <label for="description">Beschrijving</label>
          <textarea
              id="description"
              v-model="description"
              required
              :class="{ 'error': errors.description }"
              rows="10"
          />
          <span v-if="errors.description" class="error-text">{{ errors.description }}</span>
        </div>

        <div class="form-item">
          <label for="pinned">Vastmaken</label>
          <input
              id="pinned"
              v-model="pinned"
              type="checkbox"
              :class="{ 'error': errors.pinned }"
          />
          <span v-if="errors.pinned" class="error-text">{{ errors.pinned }}</span>
        </div>

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
              :class="{ 'error': errors.date }"
          />
          <span v-if="errors.date" class="error-text">{{ errors.date }}</span>
        </div>

        <div class="form-group">
          <label for="image">Foto</label>
          <input
              id="image"
              @change="handleFileChange"
              type="file"
              accept="image/*"
              :disabled="!post"
              :class="{ 'error': errors.image }"
          />
          <span v-if="errors.image" class="error-text">{{ errors.image }}</span>
        </div>

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
              :class="{ 'error': errors.alertEndDate }"
          />
          <span v-if="errors.alertEndDate" class="error-text">{{ errors.alertEndDate }}</span>
        </div>

        <div class="form-item">
          <button type="submit" class="submit-btn">
            Opslaan
          </button>
        </div>
      </form>
    </section>
  </main>
</template>

<style scoped lang="scss">

</style>