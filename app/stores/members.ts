// stores/members.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
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
    const changedCoords = ref<{rowId: number, field:string}[]>([])

    // Getters
    const sortedMembers = computed(() => {
        if (!sortKey.value || sortKey.value === '') {
            return editableMembers.value  // ← Return directly, no copy needed
        }

        const data = [...editableMembers.value]
        return data.sort((a, b) => {
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

    const changedMembers = computed(() => {
        return editableMembers.value.filter(edited => {
            const original = originalMembers.value.find(r => r.id === edited.id)
            return JSON.stringify(edited) !== JSON.stringify(original)
        })
    })

    const hasUnsavedChanges = computed(() => changedCoords.value.length > 0)

    const changedCount = computed(() => new Set(changedCoords.value.map(c => c.rowId)).size)

    // Actions
    async function fetchMembers() {
        isLoading.value = true
        try {
            const members = await getMembers()
            originalMembers.value = markRaw(structuredClone(members))
            editableMembers.value = structuredClone(members)
            changedCoords.value = [] // Reset changed coords
        } catch (error) {
            console.error('Failed to fetch members:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    function updateMemberField(rowId: number, field: string, value: Member, arrayIndex?: number) {
        const member = editableMembers.value.find(m => m.id === rowId) as Member
        const original = originalMembers.value.find(m => m.id === rowId) as Member
        if (!member || !original) return

        const f = field as keyof Member

        if (arrayIndex !== undefined && Array.isArray(member[f])) {
            member[f][arrayIndex] = value
        } else {
            // @ts-expect-error typescript says never
            member[f] = value
        }

        // Check if the entire field matches the original
        const isBackToOriginal = JSON.stringify(member[f]) === JSON.stringify(original[f])

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

    function addArrayItem(rowId: number, field: string) {
        const member = editableMembers.value.find(m => m.id === rowId)
        const original = originalMembers.value.find(m => m.id === rowId)
        const f = field as keyof Member

        if (member && Array.isArray(member[f])) {
            member[f].push('')

            // Check if array still matches original
            const isBackToOriginal = original && JSON.stringify(member[f]) === JSON.stringify(original[f])

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

    function removeArrayItem(rowId: number, field: string, index: number) {
        const member = editableMembers.value.find(m => m.id === rowId)
        const original = originalMembers.value.find(m => m.id === rowId)
        const f = field as keyof Member

        if (member && Array.isArray(member[f])) {
            member[f].splice(index, 1)

            // Check if array still matches original
            const isBackToOriginal = original && JSON.stringify(member[f]) === JSON.stringify(original[f])

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

    function setSort(key: string) {
        if (sortKey.value === key) {
            sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
        } else {
            sortKey.value = key as keyof Member
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
                await updateMember(member, originalMembers.value.find((og) => og.id === member.id)!)
            }

            // Update original to match current state
            const rawPlanning = toRaw(editableMembers.value)
            originalMembers.value = markRaw(structuredClone(rawPlanning))

            changedCoords.value = [] // Clear changed coords after successful save

            console.log('All changes saved successfully')
            console.log('Repopulating members')
            await fetchMembers()
        } catch (error) {
            console.error('Failed to save changes:', error)
            throw error
        } finally {
            isSaving.value = false
        }
    }

    function discardChanges() {
        editableMembers.value = JSON.parse(JSON.stringify(originalMembers.value))
        changedCoords.value = [] // Clear changed coords when discarding
    }

    function addMember(member: Member) {
        editableMembers.value.push(member)
    }

    function removeMember(id: number) {
        const index = editableMembers.value.findIndex(m => m.id === id)
        if (index !== -1) {
            editableMembers.value.splice(index, 1)
        }
    }

    return {
        // State
        originalMembers,
        editableMembers,
        sortKey,
        sortOrder,
        isLoading,
        isSaving,

        // Getters
        sortedMembers,
        changedMembers,
        hasUnsavedChanges,
        changedCount,
        changedCoords,

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
    }
})