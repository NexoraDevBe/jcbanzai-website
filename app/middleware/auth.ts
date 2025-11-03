import { getUserData } from "~/utils/supabase";

export default defineNuxtRouteMiddleware(async (to, from) => {
    const requiredRole = to.meta.requiredRole as keyof typeof roles | undefined
    const userData = await getUserData()
    const roles = {
        user: 0,
        admin: 1,
        superadmin: 2,
    }

    if (!userData) {
        return navigateTo('/dashboard/login')
    }

    const userRole = userData.role as keyof typeof roles | undefined
    if (!userRole || !(userRole in roles)) {
        return navigateTo('/unauthorized', {
            redirectCode: 403,
        })
    }

    console.log('%cmiddleware%c required role:', 'color: orange; font-weight: bold', '', requiredRole)
    console.log('%cmiddleware%c user role:', 'color: orange; font-weight: bold', '', userRole);

    if (requiredRole) {
        const userLevel = roles[userRole]
        const requiredLevel = roles[requiredRole]

        if (userLevel < requiredLevel)
            return navigateTo('/dashboard')
    }
})