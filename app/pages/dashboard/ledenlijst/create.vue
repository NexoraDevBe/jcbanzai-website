<script setup lang="ts">
import { countries } from 'countries-list';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '~/utils/zodValidator';
import { useMembers } from '~/composables/members/useMembers';
import { useMemberMutation } from '~/composables/members/useMemberMutation';
import { Graad, GraadLabel } from '~/utils/enums/members';
import { upsertMemberSchema, type UpsertMember } from '~/utils/query/members/upsert';

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard',
});

const showDuplicateModal = ref(false);
const stayOnPage = ref(false);
const success = ref('');

const pendingValues = ref<UpsertMember | null>(null);

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: toTypedSchema(upsertMemberSchema),
  initialValues: {
    nationaliteit: 'BE',
    emails: [],
    dojos: [],
  },
});

const [voornaam, voornaamAttrs] = defineField('voornaam');
const [naam, naamAttrs] = defineField('naam');
const [geslacht, geslachtAttrs] = defineField('geslacht');
const [geboorteDatum, geboorteDatumAttrs] = defineField('geboorte_datum');
const [nationaliteit, nationaliteitAttrs] = defineField('nationaliteit');
const [straat, straatAttrs] = defineField('straat');
const [postcode, postcodeAttrs] = defineField('postcode');
const [gemeente, gemeenteAttrs] = defineField('gemeente');
const [emails, emailsAttrs] = defineField('emails');
const [gsm, gsmAttrs] = defineField('gsm');
const [uitpas, uitpasAttrs] = defineField('lidgeld_opmerkingen');
const [vergunning, vergunningAttrs] = defineField('vergunning');
const [vergunningGeldigTot, vergunningGeldigTotAttrs] = defineField('vergunning_geldig_tot');
const [graad, graadAttrs] = defineField('graad');
const [gordelBehaaldOp, gordelBehaaldOpAttrs] = defineField('gordel_behaald_op');
const [opvolging, opvolgingAttrs] = defineField('opvolging');

const { exists } = useMembers();
const { upsertMember } = useMemberMutation();

const onSubmit = handleSubmit(
  (data) => {
    success.value = '';

    const existingMember = exists(data.voornaam, data.naam, data.geboorte_datum);

    if (existingMember) {
      pendingValues.value = data;
      showDuplicateModal.value = true;
      return;
    }

    upsertMember(data);
  },
  (data) => {
    console.log('invalid', data);
  },
);

const confirmDuplicate = () => {
  if (pendingValues.value) {
    upsertMember(pendingValues.value);
  }
  showDuplicateModal.value = false;
};

const cancelDuplicate = () => {
  showDuplicateModal.value = false;
  pendingValues.value = null;
};
</script>

<template>
  <MoleculeConformationModal
    v-if="showDuplicateModal"
    title="Bestaand lid gevonden"
    :message="
      'Er bestaat al een lid met dezelfde naam en geboortedatum. Ben je zeker dat je ' +
      pendingValues?.voornaam +
      ' wilt inschrijven?'
    "
    @cancel="cancelDuplicate"
    @confirm="confirmDuplicate"
  />
  <main id="inschrijven-page">
    <h1>Nieuw lid inschrijven</h1>

    <p v-if="success" class="success-message">{{ success }}</p>

    <section>
      <form @submit.prevent="onSubmit">
        <div class="form-group">
          <label for="voornaam">Voornaam</label>
          <input
            id="voornaam"
            v-model="voornaam"
            v-bind="voornaamAttrs"
            type="text"
            :class="{ error: errors.voornaam }"
          />
          <span v-if="errors.voornaam" class="error-text">{{ errors.voornaam }}</span>
        </div>

        <div class="form-group">
          <label for="naam">Achternaam</label>
          <input
            id="naam"
            v-model="naam"
            v-bind="naamAttrs"
            type="text"
            :class="{ error: errors.naam }"
          />
          <span v-if="errors.naam" class="error-text">{{ errors.naam }}</span>
        </div>

        <div class="form-group">
          <label for="geslacht">Geslacht</label>
          <select
            id="geslacht"
            v-model="geslacht"
            v-bind="geslachtAttrs"
            :class="{ error: errors.geslacht }"
          >
            <option value="M">Man</option>
            <option value="V">Vrouw</option>
          </select>
          <span v-if="errors.geslacht" class="error-text">{{ errors.geslacht }}</span>
        </div>

        <div class="form-group">
          <label for="geboorte_datum">Geboortedatum</label>
          <input
            id="geboorte_datum"
            v-model="geboorteDatum"
            v-bind="geboorteDatumAttrs"
            type="date"
            :class="{ error: errors.geboorte_datum }"
          />
          <span v-if="errors.geboorte_datum" class="error-text">{{ errors.geboorte_datum }}</span>
        </div>

        <div class="form-group">
          <label for="nationaliteit">Nationaliteit</label>
          <select
            id="nationaliteit"
            v-model="nationaliteit"
            v-bind="nationaliteitAttrs"
            :class="{ error: errors.nationaliteit }"
          >
            <option v-for="(c, key) in countries" :value="key" :key="key">
              {{ c.native }}
            </option>
          </select>
          <span v-if="errors.nationaliteit" class="error-text">{{ errors.nationaliteit }}</span>
        </div>

        <div class="form-group">
          <label for="straat">Straat + Nummer</label>
          <input
            id="straat"
            v-model="straat"
            v-bind="straatAttrs"
            type="text"
            :class="{ error: errors.straat }"
          />
          <span v-if="errors.straat" class="error-text">{{ errors.straat }}</span>
        </div>

        <div class="form-group">
          <label for="postcode">Postcode</label>
          <input
            id="postcode"
            v-model="postcode"
            v-bind="postcodeAttrs"
            type="text"
            :class="{ error: errors.postcode }"
          />
          <span v-if="errors.postcode" class="error-text">{{ errors.postcode }}</span>
        </div>

        <div class="form-group">
          <label for="gemeente">Gemeente</label>
          <input
            id="gemeente"
            v-model="gemeente"
            v-bind="gemeenteAttrs"
            type="text"
            :class="{ error: errors.gemeente }"
          />
          <span v-if="errors.gemeente" class="error-text">{{ errors.gemeente }}</span>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="emails[0]"
            v-bind="emailsAttrs"
            type="email"
            :class="{ error: errors.emails }"
          />
          <span v-if="errors.emails" class="error-text">{{ errors.emails }}</span>
        </div>

        <div class="form-group">
          <label for="email2">Tweede Email</label>
          <input
            id="email2"
            v-model="emails[1]"
            v-bind="emailsAttrs"
            type="email"
            :class="{ error: errors.emails }"
          />
          <span v-if="errors.emails" class="error-text">{{ errors.emails }}</span>
        </div>

        <div class="form-group">
          <label for="gsm">GSM</label>
          <input
            id="gsm"
            v-model="gsm"
            v-bind="gsmAttrs"
            type="tel"
            :class="{ error: errors.gsm }"
          />
          <span v-if="errors.gsm" class="error-text">{{ errors.gsm }}</span>
        </div>

        <div class="form-group">
          <label for="uitpas">UiTPAS</label>
          <input
            id="uitpas"
            v-model="uitpas"
            v-bind="uitpasAttrs"
            type="text"
            :class="{ error: errors.uitpas }"
          />
          <span v-if="errors.uitpas" class="error-text">{{ errors.uitpas }}</span>
        </div>

        <div class="form-group">
          <label for="vergunning">Vergunning nr.</label>
          <input
            id="vergunning"
            v-model="vergunning"
            v-bind="vergunningAttrs"
            type="number"
            :class="{ error: errors.vergunning }"
          />
          <span v-if="errors.vergunning" class="error-text">{{ errors.vergunning }}</span>
        </div>

        <div class="form-group">
          <label for="vergunning_geldig_tot">Vergunning datum</label>
          <input
            id="vergunning_geldig_tot"
            v-model="vergunningGeldigTot"
            v-bind="vergunningGeldigTotAttrs"
            type="date"
            :class="{ error: errors.vergunning_geldig_tot }"
          />
          <span v-if="errors.vergunning_geldig_tot" class="error-text">{{
            errors.vergunning_geldig_tot
          }}</span>
        </div>

        <div class="form-group">
          <label for="graad">Graad</label>
          <select id="graad" v-model="graad" v-bind="graadAttrs" :class="{ error: errors.graad }">
            <option v-for="key in Graad" :value="key" :key="key">
              {{ GraadLabel[key] }}
            </option>
          </select>
          <span v-if="errors.graad" class="error-text">{{ errors.graad }}</span>
        </div>

        <div class="form-group">
          <label for="gordel_behaald_op">Behaalde gordel datum</label>
          <input
            id="gordel_behaald_op"
            v-model="gordelBehaaldOp"
            v-bind="gordelBehaaldOpAttrs"
            type="date"
            :class="{ error: errors.gordel_behaald_op }"
          />
          <span v-if="errors.gordel_behaald_op" class="error-text">{{
            errors.gordel_behaald_op
          }}</span>
        </div>

        <div class="form-group full">
          <label for="opvolging">Opvolging</label>
          <textarea
            id="opvolging"
            v-model="opvolging"
            v-bind="opvolgingAttrs"
            rows="10"
            :class="{ error: errors.opvolging }"
          />
          <span v-if="errors.opvolging" class="error-text">{{ errors.opvolging }}</span>
        </div>

        <div class="form-item">
          <button type="submit" class="btn warning" @click="stayOnPage = true">
            Opslaan en blijven
          </button>
          <button type="submit" class="btn success" @click="stayOnPage = false">Opslaan</button>
        </div>
      </form>
    </section>
  </main>
</template>

<style scoped lang="scss">
#inschrijven-page {
  section {
    padding: var(--page-margin);
    max-width: 80rem;
    margin: 0 auto;

    form {
      display: grid;
      grid-template-columns: 100%;
      gap: 1rem;

      .form-group {
        position: relative;

        .error-text {
          position: absolute;
          bottom: -1.2rem;
          left: 0;
          font-size: 0.75rem;
        }
      }

      label {
        font-size: 0.9rem;
        letter-spacing: 3%;
        color: var(--gray-800);
      }

      input,
      select {
        font-family: 'DM Sans';
        font-size: 1rem;
        letter-spacing: 3%;
        color-scheme: light;

        @media (prefers-color-scheme: dark) {
          color-scheme: dark;
        }
      }

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
