<script>
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';
    import { userStore } from '$lib/stores/index.js';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';

	let { children, data } = $props();

    // Header visibility is now handled directly in the template

    function logout() {
        userStore.logout();
        goto('/login');
    }

    function navigateToPrompts() {
        goto('/prompt');
    }

    function navigateToAnalytics() {
        goto('/analytics');
    }

    // Ensure userStore is initialized
    onMount(() => {
        userStore.init();
    });
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if $page.url.pathname !== '/login' && $page.url.pathname !== '/register' && $page.url.pathname !== '/' && $userStore?.token}
    <header class="app-header">
        <div class="header-content">
            <div class="header-info">
                <h1>PromptManager</h1>
                <p>Welcome back, {data?.user?.username || 'User'}</p>
            </div>
            <nav class="header-nav">
                <button 
                    class="nav-btn {$page.url.pathname === '/prompt' ? 'active' : 'secondary'}"
                    onclick={navigateToPrompts}
                >
                    <span class="btn-icon">📝</span>
                    Prompts
                </button>
                <button 
                    class="nav-btn {$page.url.pathname === '/analytics' ? 'active' : 'secondary'}"
                    onclick={navigateToAnalytics}
                >
                    <span class="btn-icon">📊</span>
                    Analytics
                </button>
                <button class="nav-btn danger" onclick={logout}>
                    <span class="btn-icon">🚪</span>
                    Logout
                </button>
            </nav>
        </div>
    </header>
{/if}

<main class="app-main">
    {@render children?.()}
</main>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    }

    .app-header {
        background: white;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        border-bottom: 1px solid #e1e5e9;
        position: sticky;
        top: 0;
        z-index: 100;
    }

    .header-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .header-info h1 {
        font-size: 1.5rem;
        font-weight: 700;
        color: #333;
        margin: 0 0 0.25rem 0;
    }

    .header-info p {
        color: #666;
        margin: 0;
        font-size: 0.9rem;
    }

    .header-nav {
        display: flex;
        gap: 0.75rem;
        align-items: center;
    }

    .nav-btn {
        display: inline-flex;
        align-items: center;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 0.5rem;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        text-decoration: none;
        gap: 0.5rem;
        background: white;
        color: #666;
        border: 2px solid #e1e5e9;
    }

    .nav-btn:hover {
        background-color: #f5f5f5;
        border-color: #667eea;
        color: #667eea;
        transform: translateY(-1px);
    }

    .nav-btn.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-color: #667eea;
    }

    .nav-btn.active:hover {
        background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
        border-color: #5a6fd8;
        transform: translateY(-1px);
    }

    .nav-btn.danger {
        background: white;
        color: #dc3545;
        border-color: #dc3545;
    }

    .nav-btn.danger:hover {
        background: #dc3545;
        color: white;
        transform: translateY(-1px);
    }

    .btn-icon {
        font-size: 1rem;
    }

    .app-main {
        min-height: calc(100vh - 80px);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
        .header-content {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
        }

        .header-nav {
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
        }

        .nav-btn {
            font-size: 0.8rem;
            padding: 0.4rem 0.8rem;
        }

        .header-info h1 {
            font-size: 1.25rem;
        }

        .header-info p {
            font-size: 0.8rem;
        }
    }

    @media (max-width: 480px) {
        .header-nav {
            gap: 0.5rem;
        }

        .nav-btn {
            padding: 0.3rem 0.6rem;
            font-size: 0.75rem;
        }

        .btn-icon {
            font-size: 0.9rem;
        }
    }
</style>
