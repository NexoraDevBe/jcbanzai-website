import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
    getTechniques,
    getTechniqueFilterOptions,
    updateTechnique,
    type TechniqueQueryParams
} from '~/utils/supabase'
import type { Technique } from '~/types'

export const useTechniquesStore = defineStore('techniques', () => {
    // — Server state —
    const techniques = ref<Technique[]>([])
    const originalTechniques = shallowRef<Technique[]>([])
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
    const techniquesMap = computed(() => new Map(techniques.value.map(t => [t.id, t])))
    const originalTechniquesMap = computed(() => new Map(originalTechniques.value.map(t => [t.id, t])))

    // — Derived —
    const hasUnsavedChanges = computed(() => changedCoords.value.length > 0)
    const changedCount = computed(() => new Set(changedCoords.value.map(c => c.rowId)).size)
    const hasActiveFilters = computed(() =>
        Object.values(activeFilters.value).some(arr => arr.length > 0)
    )

    const changedTechniques = computed(() => {
        const ids = new Set(changedCoords.value.map(c => c.rowId))
        return techniques.value.filter(t => ids.has(t.id))
    })

    // These run off the already-sorted server response — no JS sort needed
    const techniquesByBelt = computed(() => {
        const grouped: Record<string, Technique[]> = {}
        for (const t of techniques.value) {
            const belt = t.belt || 'unassigned'
            if (!grouped[belt]) grouped[belt] = []
            grouped[belt].push(t)
        }
        return grouped
    })

    const techniquesByCategory = computed(() => {
        const grouped: Record<string, Technique[]> = {}
        for (const t of techniques.value) {
            const category = t.category || 'uncategorized'
            if (!grouped[category]) grouped[category] = []
            grouped[category].push(t)
        }
        return grouped
    })

    // — Core fetch —
    async function _fetch() {
        isLoading.value = true
        try {
            const params: TechniqueQueryParams = {
                sort: { key: sortKey.value, order: sortOrder.value },
                filters: activeFilters.value,
            }

            const data = await getTechniques(params)
            techniques.value = data
            originalTechniques.value = markRaw(structuredClone(data))
            changedCoords.value = []
        } catch (e) {
            console.error('Failed to fetch techniques:', e)
            throw e
        } finally {
            isLoading.value = false
        }
    }

    // Public alias — matches the name used in the page component
    const fetchTechniques = _fetch

    // Runs once to populate filter checkboxes
    async function fetchFilterOptions() {
        if (Object.keys(filterItems.value).length > 0) return
        filterItems.value = await getTechniqueFilterOptions()
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

    function updateTechniqueField(rowId: number, field: string, value: any) {
        const technique = techniquesMap.value.get(rowId)
        const original = originalTechniquesMap.value.get(rowId)
        if (!technique || !original) return

        // @ts-expect-error
        technique[field] = value

        const isBackToOriginal =
            JSON.stringify(technique[field as keyof Technique]) ===
            JSON.stringify(original[field as keyof Technique])
        _updateChangedCoords(rowId, field, isBackToOriginal)
    }

    // — Save / discard —
    async function saveChanges() {
        if (!hasUnsavedChanges.value) return
        isSaving.value = true
        try {
            for (const technique of changedTechniques.value) {
                await updateTechnique(technique)
            }
            await _fetch()
        } catch (e) {
            console.error('Failed to save techniques:', e)
            throw e
        } finally {
            isSaving.value = false
        }
    }

    function discardChanges() {
        techniques.value = structuredClone(toRaw(originalTechniques.value))
        changedCoords.value = []
    }

    function addTechnique(technique: Technique) {
        techniques.value.push(technique)
    }

    function removeTechnique(id: number) {
        const idx = techniques.value.findIndex(t => t.id === id)
        if (idx !== -1) techniques.value.splice(idx, 1)
    }

    function getTechniqueById(id: number) {
        return techniquesMap.value.get(id)
    }

    // These still work since techniques is already sorted by the server
    function getTechniquesByBelt(belt: string) {
        return techniques.value.filter(t => t.belt === belt)
    }

    function getTechniquesByCategory(category: string) {
        return techniques.value.filter(t => t.category === category)
    }

    return {
        // State
        techniques,
        originalTechniques,
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
        changedTechniques,
        techniquesByBelt,
        techniquesByCategory,

        // Actions
        fetchTechniques,
        fetchFilterOptions,
        setSort,
        setFilter,
        clearFilter,
        clearAllFilters,
        updateTechniqueField,
        saveChanges,
        discardChanges,
        addTechnique,
        removeTechnique,
        getTechniqueById,
        getTechniquesByBelt,
        getTechniquesByCategory,
    }
})