import { useUserStore } from "~/stores/user";

export default defineNuxtRouteMiddleware(async (to) => {
    const userstore = useUserStore();
    const requiredRole = to.meta.requiredRole as keyof typeof roles | undefined
    await userstore.getUser()
    const roles = {
        user: 0,
        admin: 1,
        superadmin: 2,
    }

    if (!userstore.userData) {
        return navigateTo('/dashboard/auth')
    }

    const userRole = userstore.userData.role as keyof typeof roles | undefined
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