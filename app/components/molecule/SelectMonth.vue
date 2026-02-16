<script setup lang="ts">
interface Props {
  distinctMonths: {year:number, month:number}[]
  limitMonths?: boolean
  limitYears?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  limitMonths: false,
  limitYears: false
})

const emit = defineEmits<{
  selectedMonth: [{year:number, month:number}]
}>()

const now = new Date()
const year = now.getFullYear()
const month = now.getMonth() + 1

const selectedMonth = ref<string>(year + '-' + month)
const selectedMonthValue = computed(() => {
  const [yearValue, monthValue] = selectedMonth.value.split('-')

  return {
    year: Number(yearValue),
    month: Number(monthValue)
  }
})

const filteredMonths = computed(() => {
  let filtered = props.distinctMonths

  if (props.limitYears) {
    filtered = filtered.filter(dm => {
      return dm.year >= year - 1 && dm.year <= year + 1
    })
  }

  if (props.limitMonths) {
    const currentDate = new Date(year, month - 1)

    filtered = filtered.filter(dm => {
      const dmDate = new Date(dm.year, dm.month - 1)

      const monthsDiff = (currentDate.getFullYear() - dmDate.getFullYear()) * 12
          + (currentDate.getMonth() - dmDate.getMonth())

      return monthsDiff <= 2 && monthsDiff >= 0 || monthsDiff < 0
    })
  }

  return filtered
})

const months = [
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maart' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Augustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
]

const handleChange = () => {
  emit('selectedMonth', selectedMonthValue.value)
}
</script>

<template>
  <select id="month" name="month" v-model="selectedMonth" @change="handleChange">
    <option v-for="dm in filteredMonths" :key="dm.year + dm.month" :value="dm.year + '-' + dm.month">
      {{ dm.year + ' ' + months[dm.month - 1]!.label }}
    </option>
  </select>
</template>

<style scoped lang="scss">
select {
  padding: .3rem .6rem;
  font-size: 1.1rem;
}
</style>