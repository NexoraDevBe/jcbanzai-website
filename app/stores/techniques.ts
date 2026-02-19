// stores/techniques.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getTechniques, updateTechnique } from '~/utils/supabase'
import type {Technique} from '~/types'

export const useTechniquesStore = defineStore('techniques', () => {
    // State
    const originalTechniques = shallowRef<Technique[]>([])
    const editableTechniques = ref<Technique[]>([])
    const sortKey = ref<string>('')
    const sortOrder = ref<'asc' | 'desc'>('asc')
    const isLoading = ref(false)
    const isSaving = ref(false)
    const changedCoords = ref<{rowId: number, field:string }[]>([])
    const activeFilters = ref<Record<string, any[]>>({})

    // Cached filter items — built once after fetch
    const filterItems = ref<Record<string, any[]>>({})

    // O(1) lookups
    const editableTechniquesMap = computed(() =>
        new Map(editableTechniques.value.map(t => [t.id, t]))
    )
    const originalTechniquesMap = computed(() =>
        new Map(originalTechniques.value.map(t => [t.id, t]))
    )

    // Getters
    const filteredTechniques = computed(() => {
        const filterKeys = Object.keys(activeFilters.value)

        if (filterKeys.length === 0) return editableTechniques.value

        return editableTechniques.value.filter(technique => {
            return filterKeys.every(key => {
                const filterValues = activeFilters.value[key]
                if (!filterValues || filterValues.length === 0) return true

                const techniqueValue = technique[key as keyof Technique]

                if (Array.isArray(techniqueValue)) {
                    return filterValues.some(filterVal => techniqueValue.includes(filterVal))
                }

                return filterValues.includes(techniqueValue)
            })
        })
    })

    const sortedTechniques = computed(() => {
        const data = filteredTechniques.value

        if (!sortKey.value) return data

        return [...data].sort((a, b) => {
            const aVal = a[sortKey.value as keyof Technique]
            const bVal = b[sortKey.value as keyof Technique]

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
    const changedTechniques = computed(() => {
        const changedIds = new Set(changedCoords.value.map(c => c.rowId))
        return editableTechniques.value.filter(t => changedIds.has(t.id))
    })

    const hasUnsavedChanges = computed(() => changedCoords.value.length > 0)

    const changedCount = computed(() => new Set(changedCoords.value.map(c => c.rowId)).size)

    const techniquesByBelt = computed(() => {
        const grouped: Record<string, Technique[]> = {}
        for (const technique of sortedTechniques.value) {
            const belt = technique.belt || 'unassigned'
            if (!grouped[belt]) grouped[belt] = []
            grouped[belt].push(technique)
        }
        return grouped
    })

    const techniquesByCategory = computed(() => {
        const grouped: Record<string, Technique[]> = {}
        for (const technique of sortedTechniques.value) {
            const category = technique.category || 'uncategorized'
            if (!grouped[category]) grouped[category] = []
            grouped[category].push(technique)
        }
        return grouped
    })

    const hasActiveFilters = computed(() =>
        Object.values(activeFilters.value).some(arr => arr.length > 0)
    )

    // Actions
    function buildFilterItems() {
        const filters: Record<string, Set<any>> = {}

        for (const item of originalTechniques.value) {
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

    async function fetchTechniques() {
        isLoading.value = true
        try {
            const techniques = await getTechniques()
            originalTechniques.value = markRaw(structuredClone(techniques))
            editableTechniques.value = structuredClone(techniques)
            changedCoords.value = []
            buildFilterItems()
        } catch (error) {
            console.error('Failed to fetch techniques:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    function updateTechniqueField(rowId: number, field: string, value: any) {
        const technique = editableTechniquesMap.value.get(rowId)
        const original = originalTechniquesMap.value.get(rowId)
        if (!technique || !original) return

        // @ts-expect-error typescript says never
        technique[field] = value

        const isBackToOriginal = JSON.stringify(technique[field as keyof Technique]) === JSON.stringify(original[field as keyof Technique])
        _updateChangedCoords(rowId, field, isBackToOriginal)
    }

    function setSort(key: string) {
        if (sortKey.value === key) {
            sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
        } else {
            sortKey.value = key
            sortOrder.value = 'asc'
        }
    }

    async function saveChanges() {
        if (!hasUnsavedChanges.value) return

        isSaving.value = true
        try {
            const techniquesToUpdate = changedTechniques.value
            console.log(`Saving ${techniquesToUpdate.length} changed techniques`)

            for (const technique of techniquesToUpdate) {
                await updateTechnique(technique)
            }

            const rawTechniques = toRaw(editableTechniques.value)
            originalTechniques.value = markRaw(structuredClone(rawTechniques))
            changedCoords.value = []

            console.log('All changes saved successfully')
        } catch (error) {
            console.error('Failed to save changes:', error)
            throw error
        } finally {
            isSaving.value = false
        }
    }

    function discardChanges() {
        editableTechniques.value = structuredClone(toRaw(originalTechniques.value))
        changedCoords.value = []
    }

    function addTechnique(technique: Technique) {
        editableTechniques.value.push(technique)
    }

    function removeTechnique(id: number) {
        const index = editableTechniques.value.findIndex(t => t.id === id)
        if (index !== -1) editableTechniques.value.splice(index, 1)
    }

    function getTechniqueById(id: number) {
        return editableTechniquesMap.value.get(id)
    }

    function getTechniquesByBelt(belt: string) {
        return sortedTechniques.value.filter(t => t.belt === belt)
    }

    function getTechniquesByCategory(category: string) {
        return sortedTechniques.value.filter(t => t.category === category)
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
        originalTechniques,
        editableTechniques,
        sortKey,
        sortOrder,
        isLoading,
        isSaving,
        activeFilters,

        // Getters
        filteredTechniques,
        filterItems,
        sortedTechniques,
        changedTechniques,
        hasUnsavedChanges,
        changedCount,
        techniquesByBelt,
        techniquesByCategory,
        changedCoords,
        hasActiveFilters,

        // Actions
        fetchTechniques,
        updateTechniqueField,
        setSort,
        saveChanges,
        discardChanges,
        addTechnique,
        removeTechnique,
        getTechniqueById,
        getTechniquesByBelt,
        getTechniquesByCategory,
        setFilter,
        clearFilter,
        clearAllFilters
    }
})