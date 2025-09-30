<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { userStore } from '$lib/stores';
	import axios from 'axios';
	import './detail.css';
    import { PROMPTSERVICEURL } from '$lib/utils/endpoint';

	// State variables
	let prompt = null;
	let loading = true;
	let error = null;
	let copySuccess = false;

	// User store and token
	let user = null;
	let token = null;

	// API Base URL
	const PROMPT_API = PROMPTSERVICEURL;

	// Subscribe to user store
	userStore.subscribe((value) => {
		user = value;
		token = user?.token;
	});

	// Initialize user store and check authentication
	onMount(() => {
		userStore.init();
		
		// Check if user is authenticated
		setTimeout(() => {
			if (!user || !token) {
				goto('/login');
				return;
			}
			fetchPrompt();
		}, 100);
	});

	// API Headers
	const getHeaders = () => ({
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${token}`
	});

	// Get prompt ID from URL
	$: promptId = $page.params.id;

	// Fetch specific prompt and track view
	async function fetchPrompt() {
		try {
			loading = true;
			error = null;

			// First, track the view
			await axios.post(`${PROMPT_API}/trackView/${promptId}`, {}, {
				headers: getHeaders()
			});

			// Then fetch the prompt details
			const response = await axios.get(`${PROMPT_API}/getPrompt/${promptId}`, {
				headers: getHeaders()
			});
			
			if (response.data && response.data.data) {
				prompt = response.data.data;
			} else {
				error = 'Prompt not found';
			}
		} catch (err) {
			console.error('Error fetching prompt:', err);
			if (err.response?.status === 401) {
				userStore.logout();
				goto('/login');
			} else if (err.response?.status === 404) {
				error = 'Prompt not found';
			} else {
				error = 'Failed to load prompt';
			}
		} finally {
			loading = false;
		}
	}

	// Toggle favorite
	async function toggleFavorite() {
		try {
			const response = await axios.patch(`${PROMPT_API}/favoritePrompt`, {
				id: prompt._id,
				isFavourite: !prompt.isFavourite
			}, {
				headers: getHeaders()
			});
			
			if (response.status === 200) {
				prompt.isFavourite = !prompt.isFavourite;
			}
		} catch (error) {
			console.error('Error toggling favorite:', error);
			if (error.response?.status === 401) {
				userStore.logout();
				goto('/login');
			}
		}
	}

	// Copy prompt (with analytics tracking)
	async function copyPrompt() {
		try {
			// Copy to clipboard
			await navigator.clipboard.writeText(prompt.description);
			
			// Track copy for analytics
			await axios.post(`${PROMPT_API}/trackCopy/${prompt._id}`, {}, {
				headers: getHeaders()
			});
			
			// Show success message
			copySuccess = true;
			setTimeout(() => {
				copySuccess = false;
			}, 2000);
		} catch (error) {
			console.error('Error copying prompt:', error);
			if (error.response?.status === 401) {
				userStore.logout();
				goto('/login');
			}
		}
	}

	// Navigate back to dashboard
	function goBack() {
		goto('/prompt');
	}

	// Format date
	function formatDate(dateString) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>{prompt ? prompt.title : 'Loading...'} - Prompt Manager</title>
</svelte:head>

<div class="detail-container">
	<!-- Header -->
	<div class="detail-header">
		<div class="detail-header-content">
			<button 
				on:click={goBack}
				class="back-button"
			>
				<span class="back-icon">←</span>
			</button>
			<div class="detail-header-info">
				<h1>Prompt Details</h1>
				<p>View and manage prompt</p>
			</div>
		</div>
	</div>

	<div class="detail-main">
		{#if loading}
			<!-- Loading State -->
			<div class="detail-loading">
				<div class="detail-spinner"></div>
			</div>
		{:else if error}
			<!-- Error State -->
			<div class="detail-error">
				<div class="detail-error-icon">⚠️</div>
				<h3>Error Loading Prompt</h3>
				<p>{error}</p>
				<button 
					on:click={goBack}
					class="detail-error-btn"
				>
					Back to Dashboard
				</button>
			</div>
		{:else if prompt}
			<!-- Prompt Content -->
			<div class="prompt-detail-card">
				<!-- Header Section -->
				<div class="prompt-detail-header">
					<div class="prompt-title-row">
						<h1 class="prompt-detail-title">{prompt.title}</h1>
						<button 
							on:click={toggleFavorite}
							class="detail-favorite-btn"
							aria-label="Toggle favorite"
						>
							<span class="detail-favorite-icon {prompt.isFavourite ? 'favorited' : ''}">★</span>
						</button>
					</div>
					
					<div class="prompt-meta">
						<span class="detail-tool-badge">
							{prompt.aiTool}
						</span>
						{#if prompt.createdAt}
							<span>Created: {formatDate(prompt.createdAt)}</span>
						{/if}
						{#if prompt.updatedAt && prompt.updatedAt !== prompt.createdAt}
							<span>Updated: {formatDate(prompt.updatedAt)}</span>
						{/if}
					</div>
				</div>

				<!-- Content Section -->
				<div class="prompt-content-section">
					<h2 class="content-title">Prompt Content</h2>
					<div class="content-box">
						<pre class="content-text">{prompt.description}</pre>
					</div>
				</div>

				<!-- Statistics Section -->
				{#if prompt.analytics}
					<div class="analytics-section">
						<h2 class="content-title">Analytics</h2>
						<div class="analytics-grid">
							<div class="analytics-card views">
								<div class="analytics-header">
									<span class="analytics-icon">👁️</span>
									<span class="analytics-label">Views</span>
								</div>
								<p class="analytics-value">{prompt.analytics.viewCount || 0}</p>
							</div>
							
							<div class="analytics-card copies">
								<div class="analytics-header">
									<span class="analytics-icon">📋</span>
									<span class="analytics-label">Copies</span>
								</div>
								<p class="analytics-value">{prompt.analytics.copyCount || 0}</p>
							</div>
							
							<div class="analytics-card favorite">
								<div class="analytics-header">
									<span class="analytics-icon">💜</span>
									<span class="analytics-label">Favorited</span>
								</div>
								<p class="analytics-value">{prompt.isFavourite ? 'Yes' : 'No'}</p>
							</div>
						</div>
					</div>
				{/if}

				<!-- Action Buttons -->
				<div class="action-section">
					<div class="primary-action-group">
						<!-- Copy Button -->
						<button 
							on:click={copyPrompt}
							class="detail-action-btn primary"
						>
							<span class="detail-btn-icon">📋</span>
							Copy Prompt
						</button>

						<!-- Edit Button -->
						<button 
							on:click={() => goto(`/prompt/edit/${prompt._id}`)}
							class="detail-action-btn secondary"
						>
							<span class="detail-btn-icon">✏️</span>
							Edit
						</button>
					</div>

					<!-- Back Button -->
					<button 
						on:click={goBack}
						class="detail-action-btn secondary"
					>
						<span class="detail-btn-icon">←</span>
						Back to Dashboard
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>

<!-- Copy Success Notification -->
{#if copySuccess}
	<div class="detail-notification">
		<span class="detail-notification-icon">✅</span>
		Prompt copied to clipboard!
	</div>
{/if}