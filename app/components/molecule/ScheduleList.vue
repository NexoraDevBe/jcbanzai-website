<script setup lang="ts">
type BeltColors = 'white' | 'yellow' | 'orange' | 'green' | 'blue' | 'brown' | 'black';
type BeltStatus = Record<BeltColors, boolean>;
type ScheduleRow = [string, number[], string[], string, string, BeltStatus];

interface Props {
  scheduleData: ScheduleRow[];
  scheduleInfo: string[];
}

defineProps<Props>();

const scheduleTitles = ['Groep', 'Geboren in', 'Weekdag', 'Uren', 'Locatie', 'Gordels'];
const allBeltColors: BeltColors[] = [
  'white',
  'yellow',
  'orange',
  'green',
  'blue',
  'brown',
  'black',
];
const activeId = ref<number>(0);

const listFieldConfig = [
  {
    title: 'Groep & Leeftijd',
    fields: [0, 1],
    primary: true,
  },
  {
    title: 'Weekdag',
    fields: [2],
    primary: false,
  },
  {
    title: 'Uren',
    fields: [3],
    primary: false,
  },
  {
    title: 'Locatie',
    fields: [4],
    primary: false,
  },
  {
    title: 'Gordels',
    fields: [5],
    primary: false,
  },
];

const formatCellContent = (value: string | string[] | number[] | BeltStatus): string => {
  if (Array.isArray(value)) {
    return typeof value[0] === 'number'
      ? formatAgesToBirthYears(value as number[])
      : (value as string[])
          .map((newValue) => {
            return newValue.substring(0, 2);
          })
          .join(', ');
  }
  return String(value);
};

const getBeltClasses = (beltColor: BeltColors, isEarned: boolean): string =>
  isEarned ? `stroke-secondary-70 fill-${beltColor}` : 'stroke-secondary-10 fill-secondary-10';

const getFieldContent = (
  item: ScheduleRow,
  fieldIndex: number,
): string | string[] | number[] | BeltStatus => {
  return item[fieldIndex] as string | string[] | number[] | BeltStatus;
};

const renderFieldGroup = (item: ScheduleRow, fieldIndexes: number[]) => {
  return fieldIndexes
    .map((index) => {
      if (index === 5) return null;
      const content = getFieldContent(item, index);
      return formatCellContent(content);
    })
    .filter(Boolean);
};

const handleClick = (idx: number) => {
  activeId.value = idx;
};
</script>

<template>
  <div>
    <div class="schedule-table">
      <div class="table">
        <div class="tr">
          <div v-for="(th, idx) in scheduleTitles" :key="idx" class="th">
            <h4 class="rokkitt">{{ th }}</h4>
          </div>
        </div>
        <div v-for="(tr, rowIdx) in scheduleData" :key="rowIdx" class="tr">
          <div v-for="(td, colIdx) in tr" :key="colIdx" class="td">
            <p v-if="colIdx < 5">{{ formatCellContent(td) }}</p>
            <div v-else class="belts-container">
              <IconJudoBelt
                v-for="beltColor in allBeltColors"
                :key="beltColor"
                class="belt"
                :class-name="getBeltClasses(beltColor, (td as BeltStatus)[beltColor])"
                :aria-label="`gordel kleur: ${beltColor}${(td as BeltStatus)[beltColor] ? ' (behaald)' : ' (niet behaald)'}`"
              />
            </div>
          </div>
        </div>
      </div>
      <p class="schedule-info" v-for="(text, idx) in scheduleInfo" :key="idx">
        {{ text }}
      </p>
    </div>
    <div class="schedule-list">
      <div
        v-for="(item, idx) in scheduleData"
        :key="idx"
        @click="handleClick(idx)"
        class="schedule-list-item"
      >
        <div
          v-for="(section, sectionIdx) in listFieldConfig"
          :key="sectionIdx"
          class="field-section"
          :class="[
            { 'primary-section': section.primary },
            { active: !section.primary && activeId === idx },
            { 'belts-section': section.fields.includes(5) },
          ]"
        >
          <h4 v-if="!section.primary">{{ section.title }}</h4>
          <div v-if="section.fields.includes(5)" class="belts-container">
            <IconJudoBelt
              v-for="beltColor in allBeltColors"
              :key="beltColor"
              class="belt"
              :class-name="getBeltClasses(beltColor, (item[5] as BeltStatus)[beltColor])"
              :aria-label="`gordel kleur: ${beltColor}${(item[5] as BeltStatus)[beltColor] ? ' (kan deelnemen)' : ' (kan niet deelnemen)'}`"
            />
          </div>
          <div class="field-content">
            <p
              v-for="(fieldContent, contentIdx) in renderFieldGroup(item, section.fields)"
              :key="contentIdx"
            >
              {{ fieldContent }}
            </p>
          </div>
        </div>
      </div>
      <p class="schedule-info" v-for="(text, idx) in scheduleInfo" :key="idx">
        {{ text }}
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.schedule-table {
  display: none;
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .schedule-info {
    margin-bottom: 0;
  }

  .schedule-list-item {
    display: grid;
    grid-row-gap: 1rem;
    grid-template-columns: 1fr 1fr;
    padding: 0.8rem 1rem;
    border-radius: 1rem;
    background-color: var(--secondary-10);
    backdrop-filter: blur(5px);
    cursor: pointer;

    &:nth-of-type(even) {
      background-color: var(--secondary-20);
    }

    .field-section {
      display: none;

      &:first-of-type {
        grid-column: 1/-1;
      }

      p {
        margin: 0;
      }

      &.active,
      &.primary-section {
        display: block;
      }

      &.active:nth-of-type(odd) {
        text-align: right;
      }

      &.primary-section {
        width: 100%;

        .field-content {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
        }
      }

      h4 {
        margin: 0 0 0.3rem;
        color: var(--secondary-40);
        text-transform: uppercase;
        font-weight: 700;
        font-size: 1rem;
      }

      &.belts-section {
        .belts-container {
          display: flex;
          gap: 0.25rem;
          justify-content: flex-end;

          .belt {
            display: inline-block;
          }
        }
      }
    }
  }
}

@media screen and (width >= 40rem) {
  .schedule-list {
    .schedule-list-item {
      grid-template-columns: 0.8fr 1.2fr 1fr 1fr;

      .field-section {
        &.active,
        &.primary-section {
          display: block;
        }

        &.active:nth-of-type(odd) {
          text-align: left;
        }

        &.active:last-of-type {
          text-align: right;
        }
      }
    }
  }
}

@media screen and (width >= 64rem) {
  .schedule-table {
    display: block;
    width: min-content;
    margin: 0 auto;

    .schedule-info {
      padding: 0 1rem;
    }

    .table {
      display: table;
      min-width: max-content;
      margin-bottom: 2rem;

      .tr {
        display: table-row;
        gap: 1rem;

        .th,
        .td {
          display: table-cell;
          padding: 0.5rem 1rem;
          vertical-align: middle;

          p {
            margin: 0;
          }
        }

        .th {
          h4 {
            margin: 0;
            color: var(--secondary);
            text-transform: uppercase;
            font-weight: 700;
            font-size: 1.5rem;
          }
        }

        .belts-container {
          display: flex;
          gap: 0.25rem;
          align-items: flex-end;

          .belt {
            display: inline-block;
          }
        }
      }
    }
  }

  .schedule-list {
    display: none;
  }
}
</style>
