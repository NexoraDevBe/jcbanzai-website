import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
    getTrainers,
    getTrainerFilterOptions,
    getTrainerNames,
    type TrainerQueryParams
} from '~/utils/supabase'
import type { Trainer } from '~/types'

export const useTrainersStore = defineStore('trainers', () => {
    // — Server state —
    const trainers = ref<Trainer[]>([])
    const originalTrainers = shallowRef<Trainer[]>([])
    const trainerNames = ref<Partial<Trainer>[]>([])
    const filterItems = ref<Record<string, any[]>>({})

    // — Query params —
    const sortKey = ref<string>('id')
    const sortOrder = ref<'asc' | 'desc'>('asc')
    const activeFilters = ref<Record<string, any[]>>({})

    // — Edit tracking —
    const changedCoords = ref<{ rowId: number; field: string }[]>([])
    const isLoading = ref(false)
    const isSaving = ref(false)

    // — O(1) maps —
    const trainersMap = computed(() => new Map(trainers.value.map(t => [t.id, t])))
    const originalTrainersMap = computed(() => new Map(originalTrainers.value.map(t => [t.id, t])))

    // — Derived —
    const hasUnsavedChanges = computed(() => changedCoords.value.length > 0)
    const changedCount = computed(() => new Set(changedCoords.value.map(c => c.rowId)).size)
    const hasActiveFilters = computed(() =>
        Object.values(activeFilters.value).some(arr => arr.length > 0)
    )

    const changedTrainers = computed(() => {
        const ids = new Set(changedCoords.value.map(c => c.rowId))
        return trainers.value.filter(t => ids.has(t.id))
    })

    // — Core fetch —
    async function _fetch() {
        isLoading.value = true
        try {
            const data = await getTrainers({
                sort: { key: sortKey.value, order: sortOrder.value },
                filters: activeFilters.value,
            })
            trainers.value = data
            originalTrainers.value = markRaw(structuredClone(data))
            changedCoords.value = []
        } catch (e) {
            console.error('Failed to fetch trainers:', e)
            throw e
        } finally {
            isLoading.value = false
        }
    }

    const fetchTrainers = _fetch

    // trainerNames is a separate lightweight fetch — no sort/filter needed,
    // it's only used to populate dropdown options in the planning pages
    async function fetchTrainerNames() {
        try {
            trainerNames.value = await getTrainerNames()
        } catch (e) {
            console.error('Failed to fetch trainer names:', e)
            throw e
        }
    }

    async function fetchFilterOptions() {
        if (Object.keys(filterItems.value).length > 0) return
        filterItems.value = await getTrainerFilterOptions()
    }

    // — Sort (re-fetches) —
    function setSort(key: string) {
        if (sortKey.value === key) {
            sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
        } else {
            sortKey.value = key
            sortOrder.value = 'asc'
        }
        _fetch()
    }

    // — Filters (re-fetches) —
    function setFilter(field: string, values: any[]) {
        if (values.length === 0) {
            delete activeFilters.value[field]
        } else {
            activeFilters.value[field] = values
        }
        _fetch()
    }

    function clearFilter(field: string) {
        delete activeFilters.value[field]
        _fetch()
    }

    function clearAllFilters() {
        activeFilters.value = {}
        _fetch()
    }

    // — Edit tracking —
    function _updateChangedCoords(rowId: number, field: string, isBackToOriginal: boolean) {
        const idx = changedCoords.value.findIndex(c => c.rowId === rowId && c.field === field)
        if (isBackToOriginal) {
            if (idx !== -1) changedCoords.value.splice(idx, 1)
        } else {
            if (idx === -1) changedCoords.value.push({ rowId, field })
        }
    }

    function updateTrainerField(rowId: number, field: string, value: any) {
        const trainer = trainersMap.value.get(rowId)
        const original = originalTrainersMap.value.get(rowId)
        if (!trainer || !original) return

        // @ts-expect-error
        trainer[field] = value

        const isBackToOriginal =
            JSON.stringify(trainer[field as keyof Trainer]) ===
            JSON.stringify(original[field as keyof Trainer])
        _updateChangedCoords(rowId, field, isBackToOriginal)
    }

    // — Save / discard —
    async function saveChanges() {
        if (!hasUnsavedChanges.value) return
        isSaving.value = true
        try {
            // Import updateTrainer from supabase when you create the page
            // for (const trainer of changedTrainers.value) {
            //   await updateTrainer(trainer)
            // }
            await _fetch()
        } catch (e) {
            console.error('Failed to save trainers:', e)
            throw e
        } finally {
            isSaving.value = false
        }
    }

    function discardChanges() {
        trainers.value = structuredClone(toRaw(originalTrainers.value))
        changedCoords.value = []
    }

    function addTrainer(trainer: Trainer) {
        trainers.value.push(trainer)
    }

    function removeTrainer(id: number) {
        const idx = trainers.value.findIndex(t => t.id === id)
        if (idx !== -1) trainers.value.splice(idx, 1)
    }

    function getTrainerById(id: number) {
        return trainersMap.value.get(id)
    }

    return {
        // State
        trainers,
        originalTrainers,
        trainerNames,
        sortKey,
        sortOrder,
        activeFilters,
        filterItems,
        isLoading,
        isSaving,
        changedCoords,

        // Getters
        hasUnsavedChanges,
        hasActiveFilters,
        changedCount,
        changedTrainers,

        // Actions
        fetchTrainers,
        fetchTrainerNames,
        fetchFilterOptions,
        setSort,
        setFilter,
        clearFilter,
        clearAllFilters,
        updateTrainerField,
        saveChanges,
        discardChanges,
        addTrainer,
        removeTrainer,
        getTrainerById,
    }
})