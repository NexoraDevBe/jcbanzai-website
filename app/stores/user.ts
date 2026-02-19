import { defineStore } from 'pinia'
import {getUserData} from "~/utils/supabase";
import type { UserData } from "~/types";

const consoleLog = (message: string, value?: any): void => {
    console.log('%cpinia%c ' + message, 'color: yellow; font-weight: bold', '', value);
}

export const useUserStore = defineStore('user', () => {
    const userData = ref<UserData | null>(null)
    const userRole = ref<string>('')
    const roles = {
        user: 0,
        admin: 1,
        superadmin: 2,
    }

    const getUser = async () => {
        consoleLog('userStore, userData: ', userData.value);
        if (userData.value) {
            return userData.value
        }

        userData.value = await getUserData()
        consoleLog('userStore, fetched to supabase user data')

        if (userData.value && userData.value.role) {
            userRole.value = userData.value.role
            return userData.value
        }
    }

    const clearData = () => {
        userData.value = null
        userRole.value = ''
    }

    function allowAccess(role: string) {
        const requiredLevel = roles[role as unknown as keyof typeof roles]
        const userLevel = roles[userRole.value as unknown as keyof typeof roles]

        console.log('requiredLevel', requiredLevel)
        console.log('userLevel', userLevel)
        console.log('allowAccess', userLevel >= requiredLevel)

        return userLevel >= requiredLevel;
    }

    return { userData, userRole, getUser, clearData, allowAccess }
})