<!-- src/routes/+page.svelte -->
<script>
    // This page should never be rendered as routing is handled in +layout.js
    // If somehow reached, show a loading state
</script>

<!-- Fallback loading state (should not be visible due to layout redirects) -->
<div class="home-loading">
    <div class="loading-spinner"></div>
    <p>Redirecting...</p>
</div>

<style>
    .home-loading {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    }

    .loading-spinner {
        width: 2rem;
        height: 2rem;
        border: 3px solid #e1e5e9;
        border-top: 3px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .home-loading p {
        color: #666;
        font-size: 1rem;
        margin: 0;
    }
</style>
