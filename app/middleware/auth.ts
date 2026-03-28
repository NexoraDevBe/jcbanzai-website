import { useUserStore } from "~/stores/user";

const roles = {
    user: 0,
    admin: 1,
    superadmin: 2,
} as const;

export default defineNuxtRouteMiddleware(async (to) => {
    const userstore = useUserStore();
    await userstore.getUser();

    const isDashboard = to.path.includes("dashboard");

    // Not logged in + trying to access dashboard → redirect to login
    if (!userstore.userData && isDashboard) {
        return navigateTo('/dashboard/auth');
    }

    // Not logged in + public route → allow
    if (!userstore.userData) return;

    // Role validation
    const userRole = userstore.userRole as keyof typeof roles | undefined;
    if (!userRole || !(userRole in roles)) {
        return navigateTo('/unauthorized', { redirectCode: 403 });
    }

    // Route-level role requirement
    const requiredRole = to.meta.requiredRole as keyof typeof roles | undefined;

    console.log('%cmiddleware%c required role:', 'color: orange; font-weight: bold', '', requiredRole);
    console.log('%cmiddleware%c user role:', 'color: orange; font-weight: bold', '', userRole);

    if (requiredRole && !userstore.allowAccess(requiredRole)) {
        return navigateTo('/dashboard');
    }
});