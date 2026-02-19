// stores/planning.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {getPlanning, updatePlanning, insertPlanning, getPlanningByMonth, getDistinctPlanningMonths} from '~/utils/supabase'
import type {Planning, Technique} from '~/types'

interface WeeklySchedule {
    day: number
    type: 'jeugd' | 'volwassenen' | 'gezamenlijk' | 'wedstrijd' | 'kleuters' | 'geen-les'
}

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
    const distinctMonths = ref<{year:number, month:number}[]>([])
    const sortKey = ref<string>('')
    const sortOrder = ref<'asc' | 'desc'>('asc')
    const isLoading = ref(false)
    const isSaving = ref(false)
    const changedCoords = ref<{rowId: number, field:string }[]>([])
    const activeFilters = ref<Record<string, any[]>>({})

    // Cached filter items — built once after fetch
    const filterItems = ref<Record<string, any[]>>({})

    // O(1) lookups
    const editablePlanningMap = computed(() =>
        new Map(editablePlanning.value.map(p => [p.id, p]))
    )
    const originalPlanningMap = computed(() =>
        new Map(originalPlanning.value.map(p => [p.id, p]))
    )

    // Getters
    const filteredPlanning = computed(() => {
        const filterKeys = Object.keys(activeFilters.value)

        if (filterKeys.length === 0) return editablePlanning.value

        return editablePlanning.value.filter(planning => {
            return filterKeys.every(key => {
                const filterValues = activeFilters.value[key]
                if (!filterValues || filterValues.length === 0) return true

                const planningValue = planning[key as keyof Planning]

                if (Array.isArray(planningValue)) {
                    return filterValues.some(filterVal => planningValue.includes(filterVal))
                }

                return filterValues.includes(planningValue)
            })
        })
    })

    const sortedPlanning = computed(() => {
        const data = filteredPlanning.value

        if (!sortKey.value) return data

        return [...data].sort((a, b) => {
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

    // Uses changedCoords Set instead of JSON.stringify on every item
    const changedPlanning = computed(() => {
        const changedIds = new Set(changedCoords.value.map(c => c.rowId))
        return editablePlanning.value.filter(p => changedIds.has(p.id))
    })

    const hasUnsavedChanges = computed(() => changedCoords.value.length > 0)

    const changedCount = computed(() => new Set(changedCoords.value.map(c => c.rowId)).size)

    const hasActiveFilters = computed(() =>
        Object.values(activeFilters.value).some(arr => arr.length > 0)
    )

    // Actions
    function buildFilterItems() {
        const filters: Record<string, Set<any>> = {}

        for (const item of originalPlanning.value) {
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

    async function fetchPlanning() {
        isLoading.value = true
        try {
            const planning = await getPlanning()
            originalPlanning.value = markRaw(structuredClone(planning))
            editablePlanning.value = structuredClone(planning)
            changedCoords.value = []
            buildFilterItems()
            setSort('id', 'asc')
        } catch (error) {
            console.error('Failed to fetch Planning:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function fetchPlanningByMonth(year: number, month: number) {
        if (hasUnsavedChanges.value) discardChanges()

        isLoading.value = true
        try {
            const planning = await getPlanningByMonth(year, month)

            if (planning.length === 0) {
                await insertMonthPlanning(year, month)
            } else {
                originalPlanning.value = markRaw(structuredClone(planning))
                editablePlanning.value = structuredClone(planning)
                changedCoords.value = []
                buildFilterItems()
                setSort('id', 'asc')
            }
        } catch (error) {
            console.error('Failed to fetch Planning:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    async function fetchDistinctMonths() {
        isLoading.value = true
        try {
            const distinctMonthsRes = await getDistinctPlanningMonths()
            distinctMonths.value = structuredClone(distinctMonthsRes)
        } catch (error) {
            console.error('Failed to fetch Distinct Months:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    function updatePlanningField(rowId: number, field: string, value: any, arrayIndex?: number) {
        const planning = editablePlanningMap.value.get(rowId)
        const original = originalPlanningMap.value.get(rowId)
        if (!planning || !original) return

        const f = field as keyof Planning

        if (arrayIndex !== undefined && Array.isArray(planning[f])) {
            ;(planning[f] as any[])[arrayIndex] = value
        } else {
            // @ts-expect-error typescript says never
            planning[f] = value
        }

        const isBackToOriginal = JSON.stringify(planning[f]) === JSON.stringify(original[f])
        _updateChangedCoords(rowId, field, isBackToOriginal)
    }

    function addArrayItem(rowId: number, field: string) {
        const planning = editablePlanningMap.value.get(rowId)
        const original = originalPlanningMap.value.get(rowId)
        const f = field as keyof Planning

        if (planning && Array.isArray(planning[f])) {
            ;(planning[f] as any[]).push('')
            const isBackToOriginal = !!original && JSON.stringify(planning[f]) === JSON.stringify(original[f])
            _updateChangedCoords(rowId, field, isBackToOriginal)
        }
    }

    function removeArrayItem(rowId: number, field: string, index: number) {
        const planning = editablePlanningMap.value.get(rowId)
        const original = originalPlanningMap.value.get(rowId)
        const f = field as keyof Planning

        if (planning && Array.isArray(planning[f])) {
            ;(planning[f] as any[]).splice(index, 1)
            const isBackToOriginal = !!original && JSON.stringify(planning[f]) === JSON.stringify(original[f])
            _updateChangedCoords(rowId, field, isBackToOriginal)
        }
    }

    function setSort(key: string, direction?: 'asc' | 'desc') {
        if (direction) {
            sortKey.value = key
            sortOrder.value = direction
        } else if (sortKey.value === key) {
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
            const planningToUpdate = changedPlanning.value
            console.log(`Saving ${planningToUpdate.length} changed planning items`)

            for (const planning of planningToUpdate) {
                await updatePlanning(planning, originalPlanningMap.value.get(planning.id)!)
            }

            const rawPlanning = toRaw(editablePlanning.value)
            originalPlanning.value = markRaw(structuredClone(rawPlanning))
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
        editablePlanning.value = structuredClone(toRaw(originalPlanning.value))
        changedCoords.value = []
    }

    function addPlanning(planning: Planning) {
        editablePlanning.value.push(planning)
    }

    function removePlanning(id: number) {
        const index = editablePlanning.value.findIndex(t => t.id === id)
        if (index !== -1) editablePlanning.value.splice(index, 1)
    }

    function getPlanningById(id: number) {
        return editablePlanningMap.value.get(id)
    }

    function generateMonthPlanning(year: number, month: number): Partial<Planning>[] {
        const planningItems: Partial<Planning>[] = []

        const firstDay = new Date(year, month - 1, 1)
        const lastDay = new Date(year, month, 0)
        const currentDate = new Date(firstDay)

        while (currentDate <= lastDay) {
            const dayOfWeek = currentDate.getDay()
            const scheduleItems = WEEKLY_SCHEDULE.filter(s => s.day === dayOfWeek)

            for (const scheduleItem of scheduleItems) {
                const y = currentDate.getFullYear()
                const m = String(currentDate.getMonth() + 1).padStart(2, '0')
                const d = String(currentDate.getDate()).padStart(2, '0')

                planningItems.push({
                    day: `${y}-${m}-${d}`,
                    type: scheduleItem.type,
                    beschikbaar: [''],
                    planning: ['']
                })
            }

            currentDate.setDate(currentDate.getDate() + 1)
        }

        return planningItems
    }

    async function insertMonthPlanning(year: number, month: number) {
        isSaving.value = true
        try {
            const planningItems = generateMonthPlanning(year, month)
            console.log(`Inserting ${planningItems.length} planning items for ${year}-${month}`)

            for (const item of planningItems) {
                await insertPlanning(item as Planning)
            }

            await fetchPlanningByMonth(year, month)
            console.log('Month planning inserted successfully')
            return planningItems.length
        } catch (error) {
            console.error('Failed to insert month planning:', error)
            throw error
        } finally {
            isSaving.value = false
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
        originalPlanning,
        editablePlanning,
        distinctMonths,
        sortKey,
        sortOrder,
        isLoading,
        isSaving,
        activeFilters,

        // Getters
        filteredPlanning,
        filterItems,
        sortedPlanning,
        changedPlanning,
        hasUnsavedChanges,
        changedCount,
        changedCoords,
        hasActiveFilters,

        // Actions
        fetchPlanning,
        fetchPlanningByMonth,
        fetchDistinctMonths,
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
        setFilter,
        clearFilter,
        clearAllFilters
    }
})