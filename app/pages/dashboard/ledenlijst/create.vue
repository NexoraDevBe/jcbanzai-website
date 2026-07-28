<script setup lang="ts">
import { countries } from "countries-list";
import { insertMember } from "~/utils/supabase";
import {
  validateName,
  validateNumber,
  validateGraad,
  validateSelect,
  validateDate,
  validateText,
  validateZipcode,
  validateEmail,
  validatePhone,
  validateCheckbox,
} from "~/utils/validation";

const name = ref<string>("");
const lastname = ref<string>("");
const gender = ref<string>("");
const birthdate = ref<string>("");
const nation = ref<string>("BE");
const street = ref<string>("");
const city = ref<string>("");
const zipcode = ref<string>("");
const phone = ref<string>("");
const email2 = ref<string>("");
const email = ref<string>("");
const uitpas = ref<string>("");
const vergunningnr = ref<string>("");
const vergunningDatum = ref<string>("");
const graad = ref<string>("");
const gordelDatum = ref<string>("");
const opvolging = ref<string>("");
const errors = ref<Record<string, string>>({});
const error = ref<string>("");
const success = ref<string>("");

const ranks = [
  { key: "01-Beginner", label: "Beginner" },
  { key: "02-Kyu 6", label: "6e Kyu" },
  { key: "03-Kyu 5", label: "5e Kyu" },
  { key: "04-Kyu 4", label: "4e Kyu" },
  { key: "05-Kyu 3", label: "3e Kyu" },
  { key: "06-Kyu 2", label: "2e Kyu" },
  { key: "07-Kyu 1", label: "1e Kyu" },
  { key: "08-Dan 1", label: "1e Dan" },
  { key: "09-Dan 2", label: "2e Dan" },
  { key: "10-Dan 3", label: "3e Dan" },
  { key: "11-Dan 4", label: "4e Dan" },
  { key: "12-Dan 5", label: "5e Dan" },
  { key: "13-Dan 6", label: "6e Dan" },
  { key: "14-Dan 7", label: "7e Dan" },
  { key: "15-Dan 8", label: "8e Dan" },
  { key: "16-Dan 9", label: "9e Dan" },
  { key: "17-Dan 10", label: "10e Dan" },
];

const showDuplicateModal = ref(false);
const stayOnPage = ref(false);

const pendingSubmission = ref(false);

const handleSubmit = async (event: SubmitEvent) => {
  const submitter = event.submitter as HTMLButtonElement;
  stayOnPage.value = submitter?.value === "stay";

  // Reset errors
  errors.value = {};
  error.value = "";
  success.value = "";

  // Validate all fields
  const validations: Record<string, any> = {
    name: validateName(name.value, "Voornaam"),
    lastname: validateName(lastname.value, "Achternaam"),
    gender: validateSelect(gender.value, "Geslacht", {
      allowedValues: ["M", "V"],
    }),
    birthdate: validateDate(birthdate.value, "Geboortedatum", { max: "today" }),
    nation: validateSelect(nation.value, "Nationaliteit"),
    street: validateText(street.value, "Straat + Nummer", {
      minLength: 3,
      maxLength: 100,
    }),
    zipcode: validateZipcode(zipcode.value, "Postcode", {
      country: nation.value as "BE" | "NL",
    }),
    city: validateText(city.value, "Gemeente", { minLength: 2, maxLength: 50 }),
    email: validateEmail(email.value, "Email"),
    phone: validatePhone(phone.value, "GSM", { country: "BE" }),
    uitpas:
      validateText(uitpas.value, "UiTPAS", {
        required: false,
        pattern: /^\d{13}$/,
        customMessage: "UiTPAS moet 13 cijfers bevatten",
      }) ?? null,
    vergunningnr:
      validateNumber(vergunningnr.value, "Vergunning nummer", {
        required: false,
      }) ?? null,
    vergunningDatum:
      validateDate(vergunningDatum.value, "Vergunning datum", {
        required: false,
        max: "today",
      }) ?? null,
    graad: validateGraad(graad.value, "Graad") ?? null,
    gordelDatum:
      validateDate(gordelDatum.value, "Behaalde gordel datum", {
        required: false,
        max: "today",
      }) ?? null,
    opvolging:
      validateText(opvolging.value, "Opvolging", {
        required: false,
      }) ?? null,
    email2:
      validateEmail(email2.value, "Tweede Email", {
        required: false,
      }) ?? null,
  };

  // Collect errors
  for (const [field, result] of Object.entries(validations)) {
    if (!result.isValid) {
      errors.value[field] = result.error!;
    }
  }

  // Check if form is valid
  if (Object.keys(errors.value).length > 0) {
    error.value = "Gelieve alle velden correct in te vullen";
    return;
  }

  // Check if member already exists
  const existingMember = await getMemberByNameAndBirthdate(
    name.value,
    lastname.value,
    birthdate.value,
  );

  if (existingMember) {
    showDuplicateModal.value = true;
    return;
  }

  await submitMember();
};

const submitMember = async () => {
  await insertMember(
    name.value,
    lastname.value,
    gender.value,
    birthdate.value,
    nation.value,
    street.value,
    city.value,
    zipcode.value,
    phone.value,
    email2.value ? [email.value, email2.value] : [email.value],
    uitpas.value,
    vergunningnr.value,
    vergunningDatum.value,
    graad.value,
    gordelDatum.value,
    opvolging.value,
  );

  success.value = name.value + " succesvol ingeschreven!";

  name.value = "";
  lastname.value = "";
  email2.value = "";
  email.value = "";
  gender.value = "";
  phone.value = "";
  birthdate.value = "";
  nation.value = "BE";
  street.value = "";
  city.value = "";
  zipcode.value = "";
  uitpas.value = "";
  vergunningnr.value = "";
  vergunningDatum.value = "";
  graad.value = "";
  gordelDatum.value = "";
  opvolging.value = "";

  showDuplicateModal.value = false;

  if (stayOnPage.value) {
    scrollTo(0, 0);
  } else {
    navigateTo("/dashboard/ledenlijst");
  }
};
</script>

<template>
  <MoleculeConformationModal
    v-if="showDuplicateModal"
    title="Bestaand lid gevonden"
    :message="
      'Er bestaat al een lid met dezelfde naam en geboortedatum. Ben je zeker dat je ' +
      name +
      ' wilt inschrijven?'
    "
    @cancel="showDuplicateModal = false"
    @confirm="submitMember"
  />
  <main id="inschrijven-page">
    <h1>Nieuw lid inschrijven</h1>

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
            :class="{ error: errors.name }"
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
            :class="{ error: errors.lastname }"
          />
          <span v-if="errors.lastname" class="error-text">{{
            errors.lastname
          }}</span>
        </div>

        <div class="form-group">
          <label for="gender">Geslacht</label>
          <select
            id="gender"
            v-model="gender"
            required
            :class="{ error: errors.gender }"
          >
            <option value="M">Man</option>
            <option value="V">Vrouw</option>
          </select>
          <span v-if="errors.gender" class="error-text">{{
            errors.gender
          }}</span>
        </div>

        <div class="form-group">
          <label for="birthdate">Geboortedatum</label>
          <input
            id="birthdate"
            v-model="birthdate"
            type="date"
            required
            :class="{ error: errors.birthdate }"
          />
          <span v-if="errors.birthdate" class="error-text">{{
            errors.birthdate
          }}</span>
        </div>

        <div class="form-group">
          <label for="nation">Nationaliteit</label>
          <select
            id="nation"
            v-model="nation"
            required
            :class="{ error: errors.nation }"
          >
            <option v-for="(c, key) in countries" :value="key" :key="key">
              {{ c.native }}
            </option>
          </select>
          <span v-if="errors.nation" class="error-text">{{
            errors.nation
          }}</span>
        </div>

        <div class="form-group">
          <label for="street">Straat + Nummer</label>
          <input
            id="street"
            v-model="street"
            type="text"
            required
            :class="{ error: errors.street }"
          />
          <span v-if="errors.street" class="error-text">{{
            errors.street
          }}</span>
        </div>

        <div class="form-group">
          <label for="zipcode">Postcode</label>
          <input
            id="zipcode"
            v-model="zipcode"
            type="text"
            required
            :class="{ error: errors.zipcode }"
          />
          <span v-if="errors.zipcode" class="error-text">{{
            errors.zipcode
          }}</span>
        </div>

        <div class="form-group">
          <label for="city">Gemeente</label>
          <input
            id="city"
            v-model="city"
            type="text"
            required
            :class="{ error: errors.city }"
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
            :class="{ error: errors.email }"
          />
          <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="email2">Tweede Email</label>
          <input
            id="email2"
            v-model="email2"
            type="email"
            :class="{ error: errors.email2 }"
          />
          <span v-if="errors.email2" class="error-text">{{
            errors.email2
          }}</span>
        </div>

        <div class="form-group">
          <label for="phone">GSM</label>
          <input
            id="phone"
            v-model="phone"
            type="tel"
            required
            :class="{ error: errors.phone }"
          />
          <span v-if="errors.phone" class="error-text">{{ errors.phone }}</span>
        </div>

        <div class="form-group">
          <label for="uitpas">UiTPAS</label>
          <input
            id="uitpas"
            v-model="uitpas"
            type="text"
            :class="{ error: errors.uitpas }"
          />
          <span v-if="errors.uitpas" class="error-text">{{
            errors.uitpas
          }}</span>
        </div>

        <div class="form-group">
          <label for="vergunningnr">Vergunning nr.</label>
          <input
            id="vergunningnr"
            v-model="vergunningnr"
            type="text"
            :class="{ error: errors.vergunningnr }"
          />
          <span v-if="errors.vergunningnr" class="error-text">{{
            errors.vergunningnr
          }}</span>
        </div>

        <div class="form-group">
          <label for="vergunningDatum">Vergunning datum</label>
          <input
            id="vergunningDatum"
            v-model="vergunningDatum"
            type="date"
            :class="{ error: errors.vergunningDatum }"
          />
          <span v-if="errors.vergunningDatum" class="error-text">{{
            errors.vergunningDatum
          }}</span>
        </div>

        <div class="form-group">
          <label for="graad">Graad</label>
          <select id="graad" v-model="graad" :class="{ error: errors.graad }">
            <option v-for="{ key, label } in ranks" :value="key" :key="key">
              {{ label }}
            </option>
          </select>
          <span v-if="errors.graad" class="error-text">{{ errors.graad }}</span>
        </div>

        <div class="form-group">
          <label for="gordelDatum">Behaalde gordel datum</label>
          <input
            id="gordelDatum"
            v-model="gordelDatum"
            type="date"
            :class="{ error: errors.gordelDatum }"
          />
          <span v-if="errors.gordelDatum" class="error-text">{{
            errors.gordelDatum
          }}</span>
        </div>

        <div class="form-group full">
          <label for="opvoling">Opvolging</label>
          <textarea
            id="opvoling"
            v-model="opvolging"
            rows="10"
            :class="{ error: errors.opvolging }"
          />
          <span v-if="errors.opvolging" class="error-text">{{
            errors.opvolging
          }}</span>
        </div>

        <div class="form-item">
          <!-- <button type="submit" class="submit-btn" @click="stay = true">
            Opslaan en nog één toevoegen
          </button>
          <button type="submit" class="submit-btn" @click="stay = false">
            Opslaan
          </button> -->
          <button type="submit" class="btn warning" name="action" value="stay">
            Opslaan en blijven
          </button>

          <button type="submit" class="btn success" name="action" value="back">
            Opslaan
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

      /* button[type="submit"] {
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
        font-family: "Rokkitt", Arial, serif;
        text-transform: uppercase;
        cursor: pointer;
      } */
    }
  }
}

@media screen and (width >= 48rem) {
  #inschrijven-page {
    position: relative;
    z-index: 1;

    h1 {
      font-size: 3rem;
      text-align: center;
      margin-bottom: 2rem;
    }

    section {
      background-color: var(--secondary-10);
      border-radius: 1rem;
      backdrop-filter: blur(5px);

      form {
        display: grid;
        grid-template-columns: repeat(2, minmax(40%, 1fr));
        gap: 1rem;

        .form-item {
          display: flex;
          justify-content: end;
          gap: 1rem;
          min-height: 2rem;
          grid-column: 1 / 3;
        }

        .full {
          grid-column: 1/3;
        }

        textarea {
          resize: vertical;
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
