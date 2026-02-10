// stores/planning.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {getPlanning, updatePlanning, insertPlanning, getPlanningByMonth} from '~/utils/supabase'
import type {Planning} from '~/types'

interface WeeklySchedule {
    day: number
    type: 'jeugd' | 'volwassenen' | 'gezamenlijk' | 'wedstrijd' | 'kleuters'
}

// Define your weekly recurring schedule
const WEEKLY_SCHEDULE: WeeklySchedule[] = [
    { day: 1, type: 'jeugd' },
    { day: 1, type: 'volwassenen' },
    { day: 3, type: 'wedstrijd' },
    { day: 4, type: 'jeugd' },
    { day: 4, type: 'volwassenen' },
    { day: 0, type: 'kleuters' },
    { day: 0, type: 'gezamenlijk' },
]

export const usePlanningStore = defineStore('planning', () => {
    // State
    const originalPlanning = shallowRef<Planning[]>([])
    const editablePlanning = ref<Planning[]>([])
    const sortKey = ref<string>('')
    const sortOrder = ref<'asc' | 'desc'>('asc')
    const isLoading = ref(false)
    const isSaving = ref(false)
    const changedCoords = ref<{rowId: number, field:string }[]>([])

    // Getters
    const sortedPlanning = computed(() => {
        if (!sortKey.value || sortKey.value === '') {
            return editablePlanning.value  // ← Return directly, no copy needed
        }

        const data = [...editablePlanning.value]
        return data.sort((a, b) => {
            const aVal = a[sortKey.value as keyof Planning]
            const bVal = b[sortKey.value as keyof Planning]

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

    const changedPlanning = computed(() => {
        return editablePlanning.value.filter(edited => {
            const original = originalPlanning.value.find(r => r.id === edited.id)
            return JSON.stringify(edited) !== JSON.stringify(original)
        })
    })

    const hasUnsavedChanges = computed(() => changedCoords.value.length > 0)

    const changedCount = computed(() => new Set(changedCoords.value.map(c => c.rowId)).size)

    // Actions
    async function fetchPlanning() {
        isLoading.value = true
        try {
            const planning = await getPlanning()
            originalPlanning.value = markRaw(structuredClone(planning))
            editablePlanning.value = structuredClone(planning)
            changedCoords.value = [] // Reset changed coords
            setSort('id')
        } catch (error) {
            console.error('Failed to fetch Planning:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function fetchPlanningByMonth(year: number, month: number) {
        isLoading.value = true
        try {
            const planning = await getPlanningByMonth(year, month)
            originalPlanning.value = markRaw(structuredClone(planning))
            editablePlanning.value = structuredClone(planning)
            changedCoords.value = [] // Reset changed coords
            setSort('id')
        } catch (error) {
            console.error('Failed to fetch Planning:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    function updatePlanningField(rowId: number, field: string, value: Planning, arrayIndex?: number) {
        const planning = editablePlanning.value.find(t => t.id === rowId) as Planning
        const original = originalPlanning.value.find(t => t.id === rowId) as Planning
        if (!planning || !original) return

        const f = field as keyof Planning

        if (arrayIndex !== undefined && Array.isArray(planning[f])) {
            planning[f][arrayIndex] = value
        } else {
            // @ts-expect-error typescript says never
            planning[f] = value
        }

        // Check if the new value matches the original
        const isBackToOriginal = JSON.stringify(planning[f]) === JSON.stringify(original[f])

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

    function setSort(key: string) {
        if (sortKey.value === key) {
            sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
        } else {
            sortKey.value = key as keyof Planning
            sortOrder.value = 'asc'
        }
    }

    async function saveChanges() {
        if (!hasUnsavedChanges.value) return

        isSaving.value = true
        try {
            const PlanningToUpdate = changedPlanning.value

            console.log(`Saving ${PlanningToUpdate.length} changed Planning`)

            for (const planning of PlanningToUpdate) {
                await updatePlanning(planning, originalPlanning.value.find((og) => og.id === planning.id)!)
            }

            // Update original to match current state
            originalPlanning.value = editablePlanning.value.map(t => ({ ...t }))

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
        editablePlanning.value = originalPlanning.value.map(t => ({ ...t }))
        changedCoords.value = [] // Clear changed coords when discarding
    }

    function addPlanning(planning: Planning) {
        editablePlanning.value.push(planning)
    }

    function removePlanning(id: number) {
        const index = editablePlanning.value.findIndex(t => t.id === id)
        if (index !== -1) {
            editablePlanning.value.splice(index, 1)
        }
    }

    function getPlanningById(id: number) {
        return editablePlanning.value.find(t => t.id === id)
    }

    function generateMonthPlanning(year: number, month: number): Partial<Planning>[] {
        const planningItems: Partial<Planning>[] = []

        // Get first and last day of the month
        const firstDay = new Date(year, month - 1, 1)
        const lastDay = new Date(year, month, 0)

        // Iterate through each day of the month
        const currentDate = new Date(firstDay)

        while (currentDate <= lastDay) {
            const dayOfWeek = currentDate.getDay()

            // Find all schedule items for this day of week
            const scheduleItems = WEEKLY_SCHEDULE.filter(s => s.day === dayOfWeek)

            // Create planning items for each schedule entry
            for (const scheduleItem of scheduleItems) {
                // Format date as YYYY-MM-DD
                const year = currentDate.getFullYear()
                const month = String(currentDate.getMonth() + 1).padStart(2, '0')
                const day = String(currentDate.getDate()).padStart(2, '0')
                const formattedDate = `${year}-${month}-${day}`

                planningItems.push({
                    day: formattedDate,
                    type: scheduleItem.type,
                    beschikbaar: [''],
                    planning: ['']
                })
            }

            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1)
        }

        return planningItems
    }

    async function insertMonthPlanning(year: number, month: number) {
        isSaving.value = true
        try {
            const planningItems = generateMonthPlanning(year, month)

            console.log(`Inserting ${planningItems.length} planning items for ${year}-${month}`)

            // Insert all items into database
            for (const item of planningItems) {
                await insertPlanning(item as Planning)
            }

            // Refresh the planning data
            await fetchPlanning()

            console.log('Month planning inserted successfully')
            return planningItems.length
        } catch (error) {
            console.error('Failed to insert month planning:', error)
            throw error
        } finally {
            isSaving.value = false
        }
    }

    function addArrayItem(rowId: number, field: string) {
        const planning = editablePlanning.value.find(m => m.id === rowId)
        const original = originalPlanning.value.find(m => m.id === rowId)
        const f = field as keyof Planning

        if (planning && Array.isArray(planning[f])) {
            planning[f].push('')

            // Check if array still matches original
            const isBackToOriginal = original && JSON.stringify(planning[f]) === JSON.stringify(original[f])

            const coordIndex = changedCoords.value.findIndex(
                coord => coord.rowId === rowId && coord.field === field
            )

            if (isBackToOriginal) {
                if (coordIndex !== -1) {
                    changedCoords.value.splice(coordIndex, 1)
                    console.log('removed:', changedCoords)
                }
            } else {
                if (coordIndex === -1) {
                    changedCoords.value.push({rowId, field})
                    console.log('added:', changedCoords)
                }
            }
        }
    }

    function removeArrayItem(rowId: number, field: string, index: number) {
        const planning = editablePlanning.value.find(m => m.id === rowId)
        const original = originalPlanning.value.find(m => m.id === rowId)
        const f = field as keyof Planning

        if (planning && Array.isArray(planning[f])) {
            planning[f].splice(index, 1)

            // Check if array still matches original
            const isBackToOriginal = original && JSON.stringify(planning[f]) === JSON.stringify(original[f])

            const coordIndex = changedCoords.value.findIndex(
                coord => coord.rowId === rowId && coord.field === field
            )

            if (isBackToOriginal) {
                if (coordIndex !== -1) {
                    changedCoords.value.splice(coordIndex, 1)
                }
            } else {
                if (coordIndex === -1) {
                    changedCoords.value.push({rowId, field})
                }
            }
        }
    }

    return {
        // State
        originalPlanning,
        editablePlanning,
        sortKey,
        sortOrder,
        isLoading,
        isSaving,

        // Getters
        sortedPlanning,
        changedPlanning,
        hasUnsavedChanges,
        changedCount,
        changedCoords,

        // Actions
        fetchPlanning,
        fetchPlanningByMonth,
        updatePlanningField,
        setSort,
        saveChanges,
        discardChanges,
        addPlanning,
        removePlanning,
        getPlanningById,
        generateMonthPlanning,
        insertMonthPlanning,
        addArrayItem,
        removeArrayItem,
    }
})