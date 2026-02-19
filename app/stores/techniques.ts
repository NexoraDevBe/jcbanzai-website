// stores/techniques.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getTechniques, updateTechnique } from '~/utils/supabase'
import type {Technique, Trainer} from '~/types'

export const useTechniquesStore = defineStore('techniques', () => {
    // State
    const originalTechniques = ref<Technique[]>([])
    const editableTechniques = ref<Technique[]>([])
    const sortKey = ref<string>('')
    const sortOrder = ref<'asc' | 'desc'>('asc')
    const isLoading = ref(false)
    const isSaving = ref(false)
    const changedCoords = ref<{rowId: number, field:string }[]>([])
    const activeFilters = ref<Record<string, any[]>>({})

    // Getters
    const filteredTechniques = computed(() => {
        let data = editableTechniques.value

        // Apply filters
        const filterKeys = Object.keys(activeFilters.value)
        if (filterKeys.length > 0) {
            data = data.filter(technique => {
                return filterKeys.every(key => {
                    const filterValues = activeFilters.value[key]

                    // Skip if no filter values for this key
                    if (!filterValues || filterValues.length === 0) {
                        return true
                    }

                    const techniqueValue = technique[key as keyof Technique]

                    // Handle array fields (like availability days)
                    if (Array.isArray(techniqueValue)) {
                        return filterValues.some(filterVal =>
                            techniqueValue.includes(filterVal)
                        )
                    }

                    // Handle regular fields
                    return filterValues.includes(techniqueValue)
                })
            })
        }

        return data
    })

    const filterItems = computed(() => {
        const filters: Record<string, Set<any>> = {}

        originalTechniques.value.forEach((item) => {
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

    const sortedTechniques = computed(() => {
        if (!sortKey.value || sortKey.value === '') {
            return filteredTechniques.value  // ← Return directly, no copy needed
        }

        const data = [...filteredTechniques.value]
        return data.sort((a, b) => {
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

    const changedTechniques = computed(() => {
        return editableTechniques.value.filter(edited => {
            const original = originalTechniques.value.find(r => r.id === edited.id)
            return JSON.stringify(edited) !== JSON.stringify(original)
        })
    })

    const hasUnsavedChanges = computed(() => changedCoords.value.length > 0)

    const changedCount = computed(() => new Set(changedCoords.value.map(c => c.rowId)).size)

    // Group techniques by belt
    const techniquesByBelt = computed(() => {
        const grouped: Record<string, Technique[]> = {}

        sortedTechniques.value.forEach(technique => {
            const belt = technique.belt || 'unassigned'
            if (!grouped[belt]) {
                grouped[belt] = []
            }
            grouped[belt].push(technique)
        })

        return grouped
    })

    // Group techniques by category
    const techniquesByCategory = computed(() => {
        const grouped: Record<string, Technique[]> = {}

        sortedTechniques.value.forEach(technique => {
            const category = technique.category || 'uncategorized'
            if (!grouped[category]) {
                grouped[category] = []
            }
            grouped[category].push(technique)
        })

        return grouped
    })

    const hasActiveFilters = computed(() => {
        return Object.values(activeFilters.value).some(arr => arr.length > 0)
    })

    // Actions
    async function fetchTechniques() {
        isLoading.value = true
        try {
            const techniques = await getTechniques()
            originalTechniques.value = markRaw(structuredClone(techniques))
            editableTechniques.value = structuredClone(techniques)
            changedCoords.value = [] // Reset changed coords
        } catch (error) {
            console.error('Failed to fetch techniques:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    function updateTechniqueField(rowId: number, field: string, value: Technique) {
        const technique = editableTechniques.value.find(t => t.id === rowId)
        const original = originalTechniques.value.find(t => t.id === rowId)

        if (technique && original) {
            // @ts-expect-error typescript says never
            technique[field] = value

            // Check if the new value matches the original
            const isBackToOriginal = JSON.stringify(technique[field as keyof Technique]) === JSON.stringify(original[field as keyof Technique])

            const coordIndex = changedCoords.value.findIndex(
                coord => coord.rowId === rowId && coord.field === field
            )

            if (isBackToOriginal) {
                // Remove from changedCoords if it exists and value is back to original
                if (coordIndex !== -1) {
                    changedCoords.value.splice(coordIndex, 1)
                }
            } else {
                // Add to changedCoords if not already there
                if (coordIndex === -1) {
                    changedCoords.value.push({rowId, field})
                }
            }
        }
    }

    function setSort(key: string) {
        if (sortKey.value === key) {
            sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
        } else {
            sortKey.value = key as keyof Technique
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

            // Update original to match current state
            const rawPlanning = toRaw(editableTechniques.value)
            originalTechniques.value = markRaw(structuredClone(rawPlanning))

            // Clear changed coords after successful save
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
        editableTechniques.value = originalTechniques.value.map(t => ({ ...t }))
        changedCoords.value = [] // Clear changed coords when discarding
    }

    function addTechnique(technique: Technique) {
        editableTechniques.value.push(technique)
    }

    function removeTechnique(id: number) {
        const index = editableTechniques.value.findIndex(t => t.id === id)
        if (index !== -1) {
            editableTechniques.value.splice(index, 1)
        }
    }

    function getTechniqueById(id: number) {
        return editableTechniques.value.find(t => t.id === id)
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
        clearAllFilters,
        toggleFilterValue,
    }
})