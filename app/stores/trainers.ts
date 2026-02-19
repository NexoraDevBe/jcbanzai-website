// stores/trainers.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getTrainerNames, getTrainers } from '~/utils/supabase'
import type {Trainer} from '~/types'

export const useTrainersStore = defineStore('trainers', () => {
    // State
    const originalTrainers = shallowRef<Trainer[]>([])
    const editableTrainers = ref<Trainer[]>([])
    const trainerNames = ref<Partial<Trainer>[]>([])
    const sortKey = ref<string>('')
    const sortOrder = ref<'asc' | 'desc'>('asc')
    const isLoading = ref(false)
    const isSaving = ref(false)
    const changedCoords = ref<{rowId: number, field:string }[]>([])
    const activeFilters = ref<Record<string, any[]>>({})

    // Cached filter items — built once after fetch
    const filterItems = ref<Record<string, any[]>>({})

    // O(1) lookups
    const editableTrainersMap = computed(() =>
        new Map(editableTrainers.value.map(t => [t.id, t]))
    )
    const originalTrainersMap = computed(() =>
        new Map(originalTrainers.value.map(t => [t.id, t]))
    )

    // Getters
    const filteredTrainers = computed(() => {
        const filterKeys = Object.keys(activeFilters.value)

        if (filterKeys.length === 0) return editableTrainers.value

        return editableTrainers.value.filter(trainer => {
            return filterKeys.every(key => {
                const filterValues = activeFilters.value[key]
                if (!filterValues || filterValues.length === 0) return true

                const trainerValue = trainer[key as keyof Trainer]

                if (Array.isArray(trainerValue)) {
                    return filterValues.some(filterVal => trainerValue.includes(filterVal))
                }

                return filterValues.includes(trainerValue)
            })
        })
    })

    const sortedTrainers = computed(() => {
        const data = filteredTrainers.value

        if (!sortKey.value) return data

        return [...data].sort((a, b) => {
            const aVal = a[sortKey.value as keyof Trainer]
            const bVal = b[sortKey.value as keyof Trainer]

            if (aVal == null && bVal == null) return 0
            if (aVal == null) return sortOrder.value === 'asc' ? 1 : -1
            if (bVal == null) return sortOrder.value === 'asc' ? -1 : 1

            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortOrder.value === 'asc' ? aVal - bVal : bVal - aVal
            }

            const aStr = String(aVal).toLowerCase()
            const bStr = String(bVal).toLowerCase()

            if (aStr < bStr) return sortOrder.value === 'asc' ? -1 : 1
            if (aStr > bStr) return sortOrder.value === 'asc' ? 1 : -1
            return 0
        })
    })

    // Uses changedCoords Set instead of JSON.stringify on every item
    const changedTrainers = computed(() => {
        const changedIds = new Set(changedCoords.value.map(c => c.rowId))
        return editableTrainers.value.filter(t => changedIds.has(t.id))
    })

    const hasUnsavedChanges = computed(() => changedCoords.value.length > 0)

    const changedCount = computed(() => new Set(changedCoords.value.map(c => c.rowId)).size)

    const hasActiveFilters = computed(() =>
        Object.values(activeFilters.value).some(arr => arr.length > 0)
    )

    // Actions
    function buildFilterItems() {
        const filters: Record<string, Set<any>> = {}

        for (const item of originalTrainers.value) {
            for (const [key, value] of Object.entries(item)) {
                if (key === 'id' || key === 'updated_at') continue
                if (!filters[key]) filters[key] = new Set()

                if (Array.isArray(value)) {
                    value.forEach(v => filters[key]?.add(v))
                } else {
                    filters[key].add(value)
                }
            }
        }

        filterItems.value = Object.fromEntries(
            Object.entries(filters).map(([k, s]) => [k, Array.from(s)])
        )
    }

    function _updateChangedCoords(rowId: number, field: string, isBackToOriginal: boolean) {
        const coordIndex = changedCoords.value.findIndex(
            coord => coord.rowId === rowId && coord.field === field
        )

        if (isBackToOriginal) {
            if (coordIndex !== -1) changedCoords.value.splice(coordIndex, 1)
        } else {
            if (coordIndex === -1) changedCoords.value.push({ rowId, field })
        }
    }

    async function fetchTrainers() {
        isLoading.value = true
        try {
            const trainers = await getTrainers()
            originalTrainers.value = markRaw(structuredClone(trainers))
            editableTrainers.value = structuredClone(trainers)
            changedCoords.value = []
            buildFilterItems()
        } catch (error) {
            console.error('Failed to fetch Trainers:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function fetchTrainerNames() {
        isLoading.value = true
        try {
            const trainers = await getTrainerNames()
            trainerNames.value = structuredClone(trainers)
        } catch (error) {
            console.error('Failed to fetch Trainers:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    function setSort(key: string) {
        if (sortKey.value === key) {
            sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
        } else {
            sortKey.value = key
            sortOrder.value = 'asc'
        }
    }

    function setFilter(field: string, values: any[]) {
        if (values.length === 0) {
            delete activeFilters.value[field]
        } else {
            activeFilters.value[field] = values
        }
    }

    function clearFilter(field: string) {
        delete activeFilters.value[field]
    }

    function clearAllFilters() {
        activeFilters.value = {}
    }

    return {
        // State
        originalTrainers,
        editableTrainers,
        trainerNames,
        sortKey,
        sortOrder,
        isLoading,
        isSaving,
        activeFilters,

        // Getters
        filteredTrainers,
        filterItems,
        sortedTrainers,
        changedTrainers,
        hasUnsavedChanges,
        changedCount,
        hasActiveFilters,
        changedCoords,

        // Actions
        fetchTrainers,
        fetchTrainerNames,
        setSort,
        setFilter,
        clearFilter,
        clearAllFilters
    }
})