import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
    getPlanningByMonth,
    getPlanningFilterOptions,
    getDistinctPlanningMonths,
    updatePlanning,
    insertPlanning,
    type PlanningQueryParams
} from '~/utils/supabase'
import type { Planning } from '~/types'

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
    // — Server state —
    const planning = ref<Planning[]>([])
    const originalPlanning = shallowRef<Planning[]>([])
    const distinctMonths = ref<{ year: number; month: number }[]>([])
    const filterItems = ref<Record<string, any[]>>({})  // populated once

    // — Active month (drives every fetch) —
    const activeYear = ref<number>(0)
    const activeMonth = ref<number>(0)

    // — Query params —
    const sortKey = ref<string>('day')
    const sortOrder = ref<'asc' | 'desc'>('asc')
    const activeFilters = ref<Record<string, any[]>>({})

    // — Edit tracking —
    const changedCoords = ref<{ rowId: number; field: string }[]>([])
    const isLoading = ref(false)
    const isSaving = ref(false)

    // — O(1) maps —
    const planningMap = computed(() => new Map(planning.value.map(p => [p.id, p])))
    const originalPlanningMap = computed(() => new Map(originalPlanning.value.map(p => [p.id, p])))

    // — Derived —
    const hasUnsavedChanges = computed(() => changedCoords.value.length > 0)
    const changedCount = computed(() => new Set(changedCoords.value.map(c => c.rowId)).size)
    const hasActiveFilters = computed(() =>
        Object.values(activeFilters.value).some(arr => arr.length > 0)
    )

    const changedPlanning = computed(() => {
        const ids = new Set(changedCoords.value.map(c => c.rowId))
        return planning.value.filter(p => ids.has(p.id))
    })

    // — Core fetch —
    async function _fetch() {
        if (!activeYear.value || !activeMonth.value) return

        isLoading.value = true
        try {
            const params: PlanningQueryParams = {
                year: activeYear.value,
                month: activeMonth.value,
                sort: { key: sortKey.value, order: sortOrder.value },
                filters: activeFilters.value,
            }

            const data = await getPlanningByMonth(params)
            planning.value = data
            originalPlanning.value = markRaw(structuredClone(data))
            changedCoords.value = []
        } catch (e) {
            console.error('Failed to fetch planning:', e)
            throw e
        } finally {
            isLoading.value = false
        }
    }

    async function fetchPlanningByMonth(year: number, month: number) {
        if (hasUnsavedChanges.value) discardChanges()

        // If this month has no data yet, generate it first
        const isKnownMonth = distinctMonths.value.some(m => m.year === year && m.month === month)

        activeYear.value = year
        activeMonth.value = month

        if (!isKnownMonth) {
            await insertMonthPlanning(year, month)
            // insertMonthPlanning calls _fetch internally, so we're done
            return
        }

        await _fetch()
    }

    async function fetchDistinctMonths() {
        try {
            distinctMonths.value = await getDistinctPlanningMonths()
        } catch (e) {
            console.error('Failed to fetch distinct months:', e)
            throw e
        }
    }

    // Runs once to populate filter checkboxes
    async function fetchFilterOptions() {
        if (Object.keys(filterItems.value).length > 0) return
        filterItems.value = await getPlanningFilterOptions()
    }

    // — Sort (re-fetches from server) —
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
        _fetch()
    }

    // — Filters (re-fetches from server) —
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

    // — Edit tracking (unchanged logic) —
    function _updateChangedCoords(rowId: number, field: string, isBackToOriginal: boolean) {
        const idx = changedCoords.value.findIndex(c => c.rowId === rowId && c.field === field)
        if (isBackToOriginal) {
            if (idx !== -1) changedCoords.value.splice(idx, 1)
        } else {
            if (idx === -1) changedCoords.value.push({ rowId, field })
        }
    }

    function updatePlanningField(rowId: number, field: string, value: any, arrayIndex?: number) {
        const item = planningMap.value.get(rowId)
        const original = originalPlanningMap.value.get(rowId)
        if (!item || !original) return

        const f = field as keyof Planning
        if (arrayIndex !== undefined && Array.isArray(item[f])) {
            ;(item[f] as any[])[arrayIndex] = value
        } else {
            // @ts-expect-error
            item[f] = value
        }

        const isBackToOriginal = JSON.stringify(item[f]) === JSON.stringify(original[f])
        _updateChangedCoords(rowId, field, isBackToOriginal)
    }

    function addArrayItem(rowId: number, field: string) {
        const item = planningMap.value.get(rowId)
        const original = originalPlanningMap.value.get(rowId)
        const f = field as keyof Planning
        if (item && Array.isArray(item[f])) {
            ;(item[f] as any[]).push('')
            const isBackToOriginal = !!original && JSON.stringify(item[f]) === JSON.stringify(original[f])
            _updateChangedCoords(rowId, field, isBackToOriginal)
        }
    }

    function removeArrayItem(rowId: number, field: string, index: number) {
        const item = planningMap.value.get(rowId)
        const original = originalPlanningMap.value.get(rowId)
        const f = field as keyof Planning
        if (item && Array.isArray(item[f])) {
            ;(item[f] as any[]).splice(index, 1)
            const isBackToOriginal = !!original && JSON.stringify(item[f]) === JSON.stringify(original[f])
            _updateChangedCoords(rowId, field, isBackToOriginal)
        }
    }

    // — Save / discard —
    async function saveChanges() {
        if (!hasUnsavedChanges.value) return
        isSaving.value = true
        try {
            for (const item of changedPlanning.value) {
                await updatePlanning(item, originalPlanningMap.value.get(item.id)!)
            }
            // Refresh from server so originalPlanning is in sync
            await _fetch()
        } catch (e) {
            console.error('Failed to save planning:', e)
            throw e
        } finally {
            isSaving.value = false
        }
    }

    function discardChanges() {
        planning.value = structuredClone(toRaw(originalPlanning.value))
        changedCoords.value = []
    }

    // — Month generation (logic unchanged) —
    function generateMonthPlanning(year: number, month: number): Partial<Planning>[] {
        const items: Partial<Planning>[] = []
        const firstDay = new Date(year, month - 1, 1)
        const lastDay = new Date(year, month, 0)
        const cur = new Date(firstDay)

        while (cur <= lastDay) {
            const dayOfWeek = cur.getDay()
            for (const s of WEEKLY_SCHEDULE.filter(s => s.day === dayOfWeek)) {
                const y = cur.getFullYear()
                const m = String(cur.getMonth() + 1).padStart(2, '0')
                const d = String(cur.getDate()).padStart(2, '0')
                items.push({ day: `${y}-${m}-${d}`, type: s.type, beschikbaar: [''], planning: [''] })
            }
            cur.setDate(cur.getDate() + 1)
        }

        return items
    }

    async function insertMonthPlanning(year: number, month: number) {
        isSaving.value = true
        try {
            const items = generateMonthPlanning(year, month)
            for (const item of items) {
                await insertPlanning(item as Planning)
            }
            // Add to known months and reload
            if (!distinctMonths.value.some(m => m.year === year && m.month === month)) {
                distinctMonths.value.push({ year, month })
                distinctMonths.value.sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)
            }
            await _fetch()
            return items.length
        } catch (e) {
            console.error('Failed to insert month planning:', e)
            throw e
        } finally {
            isSaving.value = false
        }
    }

    function getPlanningById(id: number) {
        return planningMap.value.get(id)
    }

    function addPlanning(item: Planning) {
        planning.value.push(item)
    }

    function removePlanning(id: number) {
        const idx = planning.value.findIndex(p => p.id === id)
        if (idx !== -1) planning.value.splice(idx, 1)
    }

    return {
        // State
        planning,
        originalPlanning,
        distinctMonths,
        activeYear,
        activeMonth,
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
        changedPlanning,

        // Actions
        fetchPlanningByMonth,
        fetchDistinctMonths,
        fetchFilterOptions,
        setSort,
        setFilter,
        clearFilter,
        clearAllFilters,
        updatePlanningField,
        addArrayItem,
        removeArrayItem,
        saveChanges,
        discardChanges,
        generateMonthPlanning,
        insertMonthPlanning,
        getPlanningById,
        addPlanning,
        removePlanning,
    }
})