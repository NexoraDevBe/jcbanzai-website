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

    // Getters
    const sortedTrainers = computed(() => {
        if (!sortKey.value || sortKey.value === '') {
            return editableTrainers.value  // ← Return directly, no copy needed
        }

        const data = [...editableTrainers.value]
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

    return {
        // State
        originalTrainers,
        editableTrainers,
        trainerNames,
        sortKey,
        sortOrder,
        isLoading,
        isSaving,

        // Getters
        sortedTrainers,
        changedTrainers,
        hasUnsavedChanges,
        changedCount,
        changedCoords,

        // Actions
        fetchTrainers,
        fetchTrainerNames,
    }
})