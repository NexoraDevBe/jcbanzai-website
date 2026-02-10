// stores/techniques.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getTechniques, updateTechnique } from '~/utils/supabase'
import type {Technique} from '~/types'

export const useTechniquesStore = defineStore('techniques', () => {
    // State
    const originalTechniques = ref<Technique[]>([])
    const editableTechniques = ref<Technique[]>([])
    const sortKey = ref<string>('')
    const sortOrder = ref<'asc' | 'desc'>('asc')
    const isLoading = ref(false)
    const isSaving = ref(false)
    const changedCoords = ref<{rowId: number, field:string }[]>([])

    // Getters
    const sortedTechniques = computed(() => {
        if (!sortKey.value || sortKey.value === '') {
            return editableTechniques.value  // ← Return directly, no copy needed
        }

        const data = [...editableTechniques.value]
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
            originalTechniques.value = editableTechniques.value.map(t => ({ ...t }))

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

    return {
        // State
        originalTechniques,
        editableTechniques,
        sortKey,
        sortOrder,
        isLoading,
        isSaving,

        // Getters
        sortedTechniques,
        changedTechniques,
        hasUnsavedChanges,
        changedCount,
        techniquesByBelt,
        techniquesByCategory,
        changedCoords,

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
    }
})