// src/routes/+layout.js
import { userStore } from '$lib/stores/index.js';
import { get } from 'svelte/store';
import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';

export async function load({ url }) {
    if (browser) {
        // Initialize user store first
        userStore.init();
        
        // Small delay to allow store initialization
        await new Promise(resolve => setTimeout(resolve, 10));
        
        const user = get(userStore);
        const currentPath = url.pathname;
        
        // Define public routes that don't require authentication
        const publicPaths = ['/login', '/register'];
        const isPublicRoute = publicPaths.includes(currentPath);
        const isHomePage = currentPath === '/';
        const hasValidToken = user?.token;
        
        // Handle home page routing
        if (isHomePage) {
            if (hasValidToken) {
                throw redirect(302, '/prompt');
            } else {
                throw redirect(302, '/login');
            }
        }
        
        // Handle public routes
        if (isPublicRoute) {
            // Allow access to public routes regardless of auth status
            // (The component itself can handle redirecting if needed)
            return {
                user: hasValidToken ? user : null,
                isPublicRoute: true
            };
        }
        
        // Handle private routes
        if (!hasValidToken) {
            throw redirect(302, '/login');
        }
        
        return {
            user,
            isPublicRoute: false
        };
    }

    return {
        user: null,
        isPublicRoute: true
    };
}