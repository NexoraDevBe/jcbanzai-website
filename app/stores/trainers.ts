// stores/trainers.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
    getTrainerNames,
    getTrainers
} from '~/utils/supabase'
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

    // Getters
    const filteredTrainers = computed(() => {
        let data = editableTrainers.value

        // Apply filters
        const filterKeys = Object.keys(activeFilters.value)
        if (filterKeys.length > 0) {
            data = data.filter(trainer => {
                return filterKeys.every(key => {
                    const filterValues = activeFilters.value[key]

                    // Skip if no filter values for this key
                    if (!filterValues || filterValues.length === 0) {
                        return true
                    }

                    const trainerValue = trainer[key as keyof Trainer]

                    // Handle array fields (like availability days)
                    if (Array.isArray(trainerValue)) {
                        return filterValues.some(filterVal =>
                            trainerValue.includes(filterVal)
                        )
                    }

                    // Handle regular fields
                    return filterValues.includes(trainerValue)
                })
            })
        }

        return data
    })

    const filterItems = computed(() => {
        const filters: Record<string, Set<any>> = {}

        originalTrainers.value.forEach((item) => {
            Object.entries(item).forEach(([key, value]) => {
                if (key === 'id' || key === 'updated_at') return

                if (!filters[key]) {
                    filters[key] = new Set()
                }

                if (Array.isArray(value)) {
                    value.forEach(v => filters[key]?.add(v))
                } else {
                    filters[key].add(value)
                }
            })
        })

        // Convert Sets back to arrays
        return Object.fromEntries(
            Object.entries(filters).map(([key, set]) => [key, Array.from(set)])
        )
    })

    const sortedTrainers = computed(() => {
        if (!sortKey.value || sortKey.value === '') {
            return filteredTrainers.value
        }

        const data = [...filteredTrainers.value]
        return data.sort((a, b) => {
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

    const changedTrainers = computed(() => {
        return editableTrainers.value.filter(edited => {
            const original = originalTrainers.value.find(r => r.id === edited.id)
            return JSON.stringify(edited) !== JSON.stringify(original)
        })
    })

    const hasUnsavedChanges = computed(() => changedCoords.value.length > 0)

    const changedCount = computed(() => new Set(changedCoords.value.map(c => c.rowId)).size)

    const hasActiveFilters = computed(() => {
        return Object.values(activeFilters.value).some(arr => arr.length > 0)
    })

    // Actions
    async function fetchTrainers() {
        isLoading.value = true
        try {
            const trainers = await getTrainers()
            originalTrainers.value = markRaw(structuredClone(trainers))
            editableTrainers.value = structuredClone(trainers)
            changedCoords.value = []

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

    function toggleFilterValue(field: string, value: any) {
        if (!activeFilters.value[field]) {
            activeFilters.value[field] = []
        }

        const index = activeFilters.value[field].indexOf(value)
        if (index === -1) {
            activeFilters.value[field].push(value)
        } else {
            activeFilters.value[field].splice(index, 1)

            // Clean up empty filters
            if (activeFilters.value[field].length === 0) {
                delete activeFilters.value[field]
            }
        }
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
        setFilter,
        clearFilter,
        clearAllFilters,
        toggleFilterValue,
    }
})