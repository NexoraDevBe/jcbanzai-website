import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
    getNewsposts,
    getNewspostFilterOptions,
    insertNewspost,
    updateNewspost,
    deleteNewspost
} from '~/utils/supabase'
import type { News } from '~/types'

export const useNewsStore = defineStore('news', () => {
    // — Server state —
    const newsposts = ref<News[]>([])
    const originalNewsposts = shallowRef<News[]>([])
    const filterItems = ref<Record<string, any[]>>({})
    const totalCount = ref(0)

    // — Query params —
    const sortKey = ref<string>('id')
    const sortOrder = ref<'asc' | 'desc'>('desc')
    const activeFilters = ref<Record<string, any[]>>({})
    const currentPage = ref(1)
    const pageSize = ref(25)

    // — Edit tracking —
    const changedCoords = ref<{ rowId: number; field: string }[]>([])
    const isLoading = ref(false)
    const isSaving = ref(false)

    // — O(1) maps —
    const newspostsMap = computed(() => new Map(newsposts.value.map(n => [n.id, n])))
    const originalNewspostsMap = computed(() => new Map(originalNewsposts.value.map(n => [n.id, n])))

    // — Derived —
    const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))
    const hasUnsavedChanges = computed(() => changedCoords.value.length > 0)
    const changedCount = computed(() => new Set(changedCoords.value.map(c => c.rowId)).size)
    const hasActiveFilters = computed(() =>
        Object.values(activeFilters.value).some(arr => arr.length > 0)
    )
    const changedNewsposts = computed(() => {
        const ids = new Set(changedCoords.value.map(c => c.rowId))
        return newsposts.value.filter(n => ids.has(n.id))
    })

    // — Core fetch —
    async function _fetch() {
        isLoading.value = true
        try {
            const { data, count } = await getNewsposts({
                sort: { key: sortKey.value, order: sortOrder.value },
                filters: activeFilters.value,
                page: currentPage.value,
                pageSize: pageSize.value,
            })
            newsposts.value = data
            originalNewsposts.value = markRaw(structuredClone(data))
            totalCount.value = count
            changedCoords.value = []
        } catch (e) {
            console.error('Failed to fetch newsposts:', e)
            throw e
        } finally {
            isLoading.value = false
        }
    }

    const fetchNewsposts = _fetch

    async function fetchFilterOptions() {
        if (Object.keys(filterItems.value).length > 0) return
        filterItems.value = await getNewspostFilterOptions()
    }

    // — Sort (resets to page 1) —
    function setSort(key: string) {
        if (sortKey.value === key) {
            sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
        } else {
            sortKey.value = key
            sortOrder.value = 'asc'
        }
        currentPage.value = 1
        _fetch()
    }

    // — Filters (resets to page 1) —
    function setFilter(field: string, values: any[]) {
        if (values.length === 0) {
            delete activeFilters.value[field]
        } else {
            activeFilters.value[field] = values
        }
        currentPage.value = 1
        _fetch()
    }

    function clearFilter(field: string) {
        delete activeFilters.value[field]
        currentPage.value = 1
        _fetch()
    }

    function clearAllFilters() {
        activeFilters.value = {}
        currentPage.value = 1
        _fetch()
    }

    // — Pagination —
    function setPage(page: number) {
        if (page < 1 || page > totalPages.value) return
        currentPage.value = page
        _fetch()
    }

    function setPageSize(size: number) {
        pageSize.value = size
        currentPage.value = 1
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

    function updateNewspostField(rowId: number, field: string, value: any) {
        const newspost = newspostsMap.value.get(rowId)
        const original = originalNewspostsMap.value.get(rowId)
        if (!newspost || !original) return

        // @ts-expect-error
        newspost[field] = value

        const isBackToOriginal =
            JSON.stringify(newspost[field as keyof News]) ===
            JSON.stringify(original[field as keyof News])
        _updateChangedCoords(rowId, field, isBackToOriginal)
    }

    // — Save / discard —
    async function saveChanges() {
        if (!hasUnsavedChanges.value) return
        isSaving.value = true
        try {
            for (const newspost of changedNewsposts.value) {
                await updateNewspost(newspost)
            }
            await _fetch()
        } catch (e) {
            console.error('Failed to save newsposts:', e)
            throw e
        } finally {
            isSaving.value = false
        }
    }

    function discardChanges() {
        newsposts.value = structuredClone(toRaw(originalNewsposts.value))
        changedCoords.value = []
    }

    // — Insert / delete —
    async function addNewspost(
        title: string,
        description: string,
        alertEndDate: string,
        alertStartDate: string,
        date: string,
        imgUrl: string,
        alert: boolean,
        post: boolean,
        pinned: boolean
    ) {
        isSaving.value = true
        try {
            const result = await insertNewspost(title, description, alertStartDate, alertEndDate, date, imgUrl, alert, post, pinned)
            if (result.success) {
                // Go to page 1 after insert so the new post is visible
                currentPage.value = 1
                await _fetch()
            }
            return result
        } catch (e) {
            console.error('Failed to insert newspost:', e)
            throw e
        } finally {
            isSaving.value = false
        }
    }

    async function removeNewspost(id: number) {
        isSaving.value = true
        try {
            const result = await deleteNewspost(id)
            if (result.success) {
                // If we just deleted the last item on this page, go back one
                if (newsposts.value.length === 1 && currentPage.value > 1) {
                    currentPage.value--
                }
                await _fetch()
            }
            return result
        } catch (e) {
            console.error('Failed to delete newspost:', e)
            throw e
        } finally {
            isSaving.value = false
        }
    }

    function getNewspostById(id: number) {
        return newspostsMap.value.get(id)
    }

    return {
        // State
        newsposts,
        originalNewsposts,
        sortKey,
        sortOrder,
        activeFilters,
        filterItems,
        isLoading,
        isSaving,
        changedCoords,
        currentPage,
        pageSize,

        // Getters
        totalCount,
        totalPages,
        hasUnsavedChanges,
        hasActiveFilters,
        changedCount,
        changedNewsposts,

        // Actions
        fetchNewsposts,
        fetchFilterOptions,
        setSort,
        setFilter,
        clearFilter,
        clearAllFilters,
        setPage,
        setPageSize,
        updateNewspostField,
        saveChanges,
        discardChanges,
        addNewspost,
        removeNewspost,
        getNewspostById,
    }
})