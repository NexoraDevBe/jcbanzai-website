// stores/members.ts
import { defineStore } from 'pinia'
import { ref, computed, shallowRef } from 'vue'
import { getMembers, updateMember } from '~/utils/supabase'
import type { Member } from '~/types'

export const useMembersStore = defineStore('members', () => {
    // State
    const originalMembers = shallowRef<Member[]>([])
    const editableMembers = ref<Member[]>([])
    const sortKey = ref<string>('')
    const sortOrder = ref<'asc' | 'desc'>('asc')
    const isLoading = ref(false)
    const isSaving = ref(false)
    const changedCoords = ref<{ rowId: number; field: string }[]>([])
    const activeFilters = ref<Record<string, any[]>>({})

    // Cached filter items — built once after fetch, not a computed
    const filterItems = ref<Record<string, any[]>>({})

    // O(1) lookups via Maps instead of find() on every update
    const editableMembersMap = computed(() =>
        new Map(editableMembers.value.map(m => [m.id, m]))
    )
    const originalMembersMap = computed(() =>
        new Map(originalMembers.value.map(m => [m.id, m]))
    )

    // Getters
    const filteredMembers = computed(() => {
        const filterKeys = Object.keys(activeFilters.value)

        if (filterKeys.length === 0) {
            return editableMembers.value
        }

        return editableMembers.value.filter(member => {
            return filterKeys.every(key => {
                const filterValues = activeFilters.value[key]

                if (!filterValues || filterValues.length === 0) return true

                const memberValue = member[key as keyof Member]

                if (Array.isArray(memberValue)) {
                    return filterValues.some(filterVal => memberValue.includes(filterVal))
                }

                return filterValues.includes(memberValue)
            })
        })
    })

    const sortedMembers = computed(() => {
        const data = filteredMembers.value

        if (!sortKey.value) return data

        return [...data].sort((a, b) => {
            const aVal = a[sortKey.value as keyof Member]
            const bVal = b[sortKey.value as keyof Member]

            if (aVal == null && bVal == null) return 0
            if (aVal == null) return sortOrder.value === 'asc' ? 1 : -1
            if (bVal == null) return sortOrder.value === 'asc' ? -1 : 1

            if (Array.isArray(aVal) && Array.isArray(bVal)) {
                const compare = aVal.length - bVal.length
                return sortOrder.value === 'asc' ? compare : -compare
            }

            if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
                const compare = aVal === bVal ? 0 : aVal ? 1 : -1
                return sortOrder.value === 'asc' ? compare : -compare
            }

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

    // Avoids JSON.stringify on every member — uses changedCoords Set instead
    const changedMembers = computed(() => {
        const changedIds = new Set(changedCoords.value.map(c => c.rowId))
        return editableMembers.value.filter(m => changedIds.has(m.id))
    })

    const hasUnsavedChanges = computed(() => changedCoords.value.length > 0)

    const changedCount = computed(() => new Set(changedCoords.value.map(c => c.rowId)).size)

    const hasActiveFilters = computed(() =>
        Object.values(activeFilters.value).some(arr => arr.length > 0)
    )

    // Actions
    function buildFilterItems() {
        const filters: Record<string, Set<any>> = {}

        for (const item of originalMembers.value) {
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
            Object.entries(filters).map(([k, s]) => [
                k,
                Array.from(s).sort((a, b) =>
                    String(a).localeCompare(String(b))
                )
            ])
        )
    }

    async function fetchMembers() {
        isLoading.value = true
        try {
            const members = await getMembers()
            originalMembers.value = markRaw(structuredClone(members))
            editableMembers.value = structuredClone(members)
            changedCoords.value = []
            buildFilterItems()
        } catch (error) {
            console.error('Failed to fetch members:', error)
            throw error
        } finally {
            isLoading.value = false
        }
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

    function updateMemberField(rowId: number, field: string, value: any, arrayIndex?: number) {
        const member = editableMembersMap.value.get(rowId)
        const original = originalMembersMap.value.get(rowId)
        if (!member || !original) return

        const f = field as keyof Member

        if (arrayIndex !== undefined && Array.isArray(member[f])) {
            ;(member[f] as any[])[arrayIndex] = value
        } else {
            // @ts-expect-error typescript says never
            member[f] = value
        }

        const isBackToOriginal = JSON.stringify(member[f]) === JSON.stringify(original[f])
        _updateChangedCoords(rowId, field, isBackToOriginal)
    }

    function addArrayItem(rowId: number, field: string) {
        const member = editableMembersMap.value.get(rowId)
        const original = originalMembersMap.value.get(rowId)
        const f = field as keyof Member

        if (member && Array.isArray(member[f])) {
            ;(member[f] as any[]).push('')
            const isBackToOriginal = !!original && JSON.stringify(member[f]) === JSON.stringify(original[f])
            _updateChangedCoords(rowId, field, isBackToOriginal)
        }
    }

    function removeArrayItem(rowId: number, field: string, index: number) {
        const member = editableMembersMap.value.get(rowId)
        const original = originalMembersMap.value.get(rowId)
        const f = field as keyof Member

        if (member && Array.isArray(member[f])) {
            ;(member[f] as any[]).splice(index, 1)
            const isBackToOriginal = !!original && JSON.stringify(member[f]) === JSON.stringify(original[f])
            _updateChangedCoords(rowId, field, isBackToOriginal)
        }
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
            const membersToUpdate = changedMembers.value
            console.log(`Saving ${membersToUpdate.length} changed members`)

            for (const member of membersToUpdate) {
                await updateMember(member, originalMembersMap.value.get(member.id)!)
            }

            const rawMembers = toRaw(editableMembers.value)
            originalMembers.value = markRaw(structuredClone(rawMembers))
            changedCoords.value = []

            console.log('All changes saved successfully')
            await fetchMembers()
        } catch (error) {
            console.error('Failed to save changes:', error)
            throw error
        } finally {
            isSaving.value = false
        }
    }

    function discardChanges() {
        editableMembers.value = structuredClone(toRaw(originalMembers.value))
        changedCoords.value = []
    }

    function addMember(member: Member) {
        editableMembers.value.push(member)
    }

    function removeMember(id: number) {
        const index = editableMembers.value.findIndex(m => m.id === id)
        if (index !== -1) editableMembers.value.splice(index, 1)
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
        originalMembers,
        editableMembers,
        sortKey,
        sortOrder,
        isLoading,
        isSaving,
        activeFilters,

        // Getters
        filteredMembers,
        filterItems,
        sortedMembers,
        changedMembers,
        hasUnsavedChanges,
        changedCount,
        changedCoords,
        hasActiveFilters,

        // Actions
        fetchMembers,
        updateMemberField,
        addArrayItem,
        removeArrayItem,
        setSort,
        saveChanges,
        discardChanges,
        addMember,
        removeMember,
        setFilter,
        clearFilter,
        clearAllFilters
    }
})