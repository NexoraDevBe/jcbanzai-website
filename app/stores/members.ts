import { defineStore } from 'pinia'
import { ref, computed, shallowRef } from 'vue'
import {
    getMembers, getMemberFilterOptions, updateMember,
    type MemberQueryParams
} from '~/utils/supabase'
import type { Member } from '~/types'

export const useMembersStore = defineStore('members', () => {
    // — Server state —
    const members = ref<Member[]>([])           // current page, as fetched
    const originalMembers = shallowRef<Member[]>([]) // snapshot for conflict detection
    const totalCount = ref(0)
    const filterItems = ref<Record<string, any[]>>({}) // populated once

    // — Query params (these drive every fetch) —
    const sortKey = ref('id')
    const sortOrder = ref<'asc' | 'desc'>('desc')
    const activeFilters = ref<Record<string, any[]>>({})
    const currentPage = ref(1)
    const pageSize = ref(500)
    const searchQuery = ref('')

    // — Edit tracking —
    const changedCoords = ref<{ rowId: number; field: string }[]>([])
    const isLoading = ref(false)
    const isSaving = ref(false)

    // — Derived —
    const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))
    const hasUnsavedChanges = computed(() => changedCoords.value.length > 0)
    const changedCount = computed(() => new Set(changedCoords.value.map(c => c.rowId)).size)
    const hasActiveFilters = computed(() =>
        Object.values(activeFilters.value).some(arr => arr.length > 0)
    )

    const membersMap = computed(() => new Map(members.value.map(m => [m.id, m])))
    const originalMembersMap = computed(() => new Map(originalMembers.value.map(m => [m.id, m])))

    const changedMembers = computed(() => {
        const ids = new Set(changedCoords.value.map(c => c.rowId))
        return members.value.filter(m => ids.has(m.id))
    })

    // — Core fetch —
    async function fetchMembers() {
        isLoading.value = true
        try {
            const params: MemberQueryParams = {
                sort: { key: sortKey.value, order: sortOrder.value },
                filters: activeFilters.value,
                page: currentPage.value,
                pageSize: pageSize.value,
                search: searchQuery.value || undefined,   // ← ADD
            }

            const { data, count } = await getMembers(params)

            members.value = data.map(member => ({
                ...member,
                created_at: formatDate(member.created_at!),
            }))
            originalMembers.value = markRaw(structuredClone(data))
            totalCount.value = count
            changedCoords.value = []
        } catch (e) {
            console.error('Failed to fetch members:', e)
            throw e
        } finally {
            isLoading.value = false
        }
    }

    // Runs once on first load
    async function fetchFilterOptions() {
        if (Object.keys(filterItems.value).length > 0) return // already loaded
        filterItems.value = await getMemberFilterOptions()
    }

    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleString('nl-BE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        })
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
        fetchMembers()
    }

    // — Search (resets to page 1) —
    function setSearch(query: string) {
        searchQuery.value = query
        currentPage.value = 1
        fetchMembers()
    }

    function clearSearch() {
        searchQuery.value = ''
        currentPage.value = 1
        fetchMembers()
    }

    // — Filters (resets to page 1) —
    function setFilter(field: string, values: any[]) {
        const allOptions = filterItems.value[field]
        // If all options selected (or none), treat as "no filter"
        if (
            values.length === 0 ||
            (allOptions && values.length === allOptions.length)
        ) {
            delete activeFilters.value[field]
        } else {
            activeFilters.value[field] = values
        }
        currentPage.value = 1
        fetchMembers()
    }

    function clearFilter(field: string) {
        delete activeFilters.value[field]
        currentPage.value = 1
        fetchMembers()
    }

    function clearAllFilters() {
        activeFilters.value = {}
        currentPage.value = 1
        fetchMembers()
    }

    // — Pagination —
    function setPage(page: number) {
        if (page < 1 || page > totalPages.value) return
        currentPage.value = page
        fetchMembers()
    }

    function setPageSize(size: number) {
        pageSize.value = size
        currentPage.value = 1
        fetchMembers()
    }

    // — Edit tracking (unchanged) —
    function _updateChangedCoords(rowId: number, field: string, isBackToOriginal: boolean) {
        const idx = changedCoords.value.findIndex(c => c.rowId === rowId && c.field === field)
        if (isBackToOriginal) {
            if (idx !== -1) changedCoords.value.splice(idx, 1)
        } else {
            if (idx === -1) changedCoords.value.push({ rowId, field })
        }
    }

    function updateMemberField(rowId: number, field: string, value: any, arrayIndex?: number) {
        const member = membersMap.value.get(rowId)
        const original = originalMembersMap.value.get(rowId)
        if (!member || !original) return

        const f = field as keyof Member
        if (arrayIndex !== undefined && Array.isArray(member[f])) {
            ;(member[f] as any[])[arrayIndex] = value
        } else {
            // @ts-expect-error
            member[f] = value
        }

        const isBackToOriginal = JSON.stringify(member[f]) === JSON.stringify(original[f])
        _updateChangedCoords(rowId, field, isBackToOriginal)
    }

    function addArrayItem(rowId: number, field: string) {
        const member = membersMap.value.get(rowId)
        const original = originalMembersMap.value.get(rowId)
        const f = field as keyof Member
        if (member && Array.isArray(member[f])) {
            ;(member[f] as any[]).push('')
            const isBackToOriginal = !!original && JSON.stringify(member[f]) === JSON.stringify(original[f])
            _updateChangedCoords(rowId, field, isBackToOriginal)
        }
    }

    function removeArrayItem(rowId: number, field: string, index: number) {
        const member = membersMap.value.get(rowId)
        const original = originalMembersMap.value.get(rowId)
        const f = field as keyof Member
        if (member && Array.isArray(member[f])) {
            ;(member[f] as any[]).splice(index, 1)
            const isBackToOriginal = !!original && JSON.stringify(member[f]) === JSON.stringify(original[f])
            _updateChangedCoords(rowId, field, isBackToOriginal)
        }
    }

    // — Save / discard —
    async function saveChanges() {
        if (!hasUnsavedChanges.value) return
        isSaving.value = true
        try {
            for (const member of changedMembers.value) {
                await updateMember(member, originalMembersMap.value.get(member.id)!)
            }
            await fetchMembers()
        } catch (e) {
            console.error('Failed to save:', e)
            throw e
        } finally {
            isSaving.value = false
        }
    }

    function discardChanges() {
        members.value = structuredClone(toRaw(originalMembers.value))
        changedCoords.value = []
    }

    function addMember(member: Member) {
        members.value.push(member)
        totalCount.value++
    }

    function removeMember(id: number) {
        const idx = members.value.findIndex(m => m.id === id)
        if (idx !== -1) {
            members.value.splice(idx, 1)
            totalCount.value--
        }
    }

    return {
        // State
        members,
        totalCount,
        totalPages,
        currentPage,
        pageSize,
        sortKey,
        sortOrder,
        searchQuery,
        activeFilters,
        filterItems,
        isLoading,
        isSaving,
        changedCoords,

        // Getters
        hasUnsavedChanges,
        hasActiveFilters,
        changedCount,
        changedMembers,

        // Actions
        fetchMembers,
        fetchFilterOptions,
        setSort,
        setSearch,
        clearSearch,
        setFilter,
        clearFilter,
        clearAllFilters,
        setPage,
        setPageSize,
        updateMemberField,
        addArrayItem,
        removeArrayItem,
        saveChanges,
        discardChanges,
        addMember,
        removeMember,
    }
})