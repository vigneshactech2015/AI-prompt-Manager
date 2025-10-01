<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { userStore } from '$lib/stores';
	import axios from 'axios';
	import './analytics.css';
	import { ANALYTICS_REPORT } from '$lib/utils/endpoint';

	// State variables
	let analyticsData = null;
	let loading = true;
	let error = null;

	// User store and token
	let user = null;
	let token = null;

	// Subscribe to user store
	userStore.subscribe((value) => {
		user = value;
		token = user?.token;
	});

	// Initialize and fetch analytics (authentication is handled in layout)
	onMount(() => {
		userStore.init();
		
		// Small delay to ensure user store is initialized
		setTimeout(() => {
			if (token) {
				fetchAnalytics();
			}
		}, 50);
	});

	// API Headers
	const getHeaders = () => ({
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${token}`
	});

	// Fetch analytics data
	async function fetchAnalytics() {
		try {
			loading = true;
			error = null;
			const response = await axios.get(ANALYTICS_REPORT, {
				headers: getHeaders()
			});
			
			if (response.data && response.data.data) {
				analyticsData = response.data.data;
			}
		} catch (err) {
			console.error('Error fetching analytics:', err);
			if (err.response?.status === 401) {
				userStore.logout();
				goto('/login');
			} else {
				error = 'Failed to load analytics data';
			}
		} finally {
			loading = false;
		}
	}

	// Navigation functions (now handled in layout)
	function goToPrompts() {
		goto('/prompts');
	}

	// Helper function to format date
	function formatDate(dateString) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// Helper function to get color class for tool
	function getToolColor(tool) {
		const colors = {
			'ChatGPT': 'chatgpt',
			'Claude': 'claude',
			'DALL-E': 'dalle',
			'Bard': 'bard',
			'GPT-4': 'gpt4',
			'Midjourney': 'midjourney',
			'Stable Diffusion': 'stable',
			'Other': 'other'
		};
		return colors[tool] || 'other';
	}
</script>

<svelte:head>
	<title>Analytics Dashboard - Prompt Manager</title>
</svelte:head>

<div class="analytics-container">
	<!-- Page Title -->
	<div class="page-header">
		<h1>Analytics Dashboard</h1>
		<p>Insights and performance metrics for your prompts</p>
	</div>

	<div class="main-content">
		{#if loading}
			<!-- Loading State -->
			<div class="loading-container">
				<div class="spinner"></div>
				<p>Loading analytics data...</p>
			</div>
		{:else if error}
			<!-- Error State -->
			<div class="error-state">
				<div class="error-icon">⚠️</div>
				<h3>Error Loading Analytics</h3>
				<p>{error}</p>
				<button 
					on:click={fetchAnalytics}
					class="retry-btn"
				>
					Retry
				</button>
			</div>
		{:else if analyticsData}
			<!-- Analytics Content -->
			
			<!-- Overall Stats -->
			<div class="stats-section">
				<h2 class="section-title">Overview</h2>
				<div class="stats-grid">
					<div class="stat-card primary">
						<div class="stat-icon">📊</div>
						<div class="stat-content">
							<div class="stat-number">{analyticsData.overallStats.totalPrompts}</div>
							<div class="stat-label">Total Prompts</div>
						</div>
					</div>
					<div class="stat-card success">
						<div class="stat-icon">👁️</div>
						<div class="stat-content">
							<div class="stat-number">{analyticsData.overallStats.totalViews}</div>
							<div class="stat-label">Total Views</div>
						</div>
					</div>
					<div class="stat-card info">
						<div class="stat-icon">📋</div>
						<div class="stat-content">
							<div class="stat-number">{analyticsData.overallStats.totalCopies}</div>
							<div class="stat-label">Total Copies</div>
						</div>
					</div>
					<div class="stat-card warning">
						<div class="stat-icon">⭐</div>
						<div class="stat-content">
							<div class="stat-number">{analyticsData.overallStats.totalFavorites}</div>
							<div class="stat-label">Total Favorites</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Summary Section -->
			{#if analyticsData.summary}
				<div class="summary-section">
					<div class="summary-card">
						<h3>Key Insights</h3>
						<div class="insights-grid">
							<div class="insight-item">
								<span class="insight-label">Top Performing Tool</span>
								<span class="insight-value tool-badge {getToolColor(analyticsData.summary.topPerformingTool)}">{analyticsData.summary.topPerformingTool}</span>
							</div>
							<div class="insight-item">
								<span class="insight-label">Most Popular Prompt</span>
								<span class="insight-value">{analyticsData.summary.mostPopularPrompt}</span>
							</div>
							<div class="insight-item">
								<span class="insight-label">Total AI Tools</span>
								<span class="insight-value">{analyticsData.summary.totalTools}</span>
							</div>
						</div>
					</div>
				</div>
			{/if}

			<!-- Most Viewed by Tool -->
			<div class="report-section">
				<h2 class="section-title">Most Viewed Prompts by Tool</h2>
				<div class="tool-reports">
					{#each analyticsData.mostViewedByTool as toolData}
						<div class="tool-card">
							<div class="tool-header">
								<span class="tool-badge {getToolColor(toolData.aiTool)}">{toolData.aiTool}</span>
								<span class="tool-stats">{toolData.totalViews} total views</span>
							</div>
							{#if toolData.topPrompts && toolData.topPrompts.length > 0}
								{#each toolData.topPrompts as prompt}
									<div class="prompt-item">
										<h4 class="prompt-title">{prompt.title}</h4>
										<p class="prompt-description">{prompt.description.substring(0, 150)}...</p>
										<div class="prompt-stats">
											<span class="stat-badge views">👁️ {prompt.viewCount} views</span>
										</div>
									</div>
								{/each}
							{:else}
								<div class="no-data">No prompts yet</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<!-- Most Favorited Prompts -->
			<div class="report-section">
				<h2 class="section-title">Most Favorited Prompts</h2>
				<div class="prompts-list">
					{#each analyticsData.mostFavoritedPrompts as prompt}
						<div class="report-prompt-card">
							<div class="prompt-header">
								<h3 class="prompt-title">{prompt.title}</h3>
								<div class="prompt-badges">
									<span class="tool-badge {getToolColor(prompt.aiTool)}">{prompt.aiTool}</span>
									<span class="stat-badge favorites">⭐ {prompt.favoriteCount || 0}</span>
								</div>
							</div>
							<p class="prompt-description">{prompt.description.substring(0, 200)}...</p>
						</div>
					{/each}
				</div>
			</div>

			<!-- Most Copied Prompts -->
			<div class="report-section">
				<h2 class="section-title">Most Copied Prompts</h2>
				<div class="prompts-list">
					{#each analyticsData.mostCopiedPrompts as prompt}
						<div class="report-prompt-card">
							<div class="prompt-header">
								<h3 class="prompt-title">{prompt.title}</h3>
								<div class="prompt-badges">
									<span class="tool-badge {getToolColor(prompt.aiTool)}">{prompt.aiTool}</span>
									<span class="stat-badge copies">📋 {prompt.copyCount || 0}</span>
								</div>
							</div>
							<p class="prompt-description">{prompt.description.substring(0, 200)}...</p>
						</div>
					{/each}
				</div>
			</div>

			<!-- Tool Statistics -->
			{#if analyticsData.toolStats && analyticsData.toolStats.length > 0}
				<div class="report-section">
					<h2 class="section-title">Performance by AI Tool</h2>
					<div class="tool-stats-grid">
						{#each analyticsData.toolStats as toolStat}
							<div class="tool-stat-card">
								<div class="tool-stat-header">
									<span class="tool-badge {getToolColor(toolStat._id)}">{toolStat._id}</span>
									<span class="prompt-count">{toolStat.promptCount} prompts</span>
								</div>
								<div class="tool-stat-metrics">
									<div class="metric">
										<span class="metric-value">{toolStat.totalViews}</span>
										<span class="metric-label">Views</span>
									</div>
									<div class="metric">
										<span class="metric-value">{toolStat.totalCopies}</span>
										<span class="metric-label">Copies</span>
									</div>
									<div class="metric">
										<span class="metric-value">{toolStat.totalFavorites}</span>
										<span class="metric-label">Favorites</span>
									</div>
								</div>
								<div class="tool-stat-averages">
									<div class="avg-metric">Avg Views: {toolStat.avgViews.toFixed(1)}</div>
									<div class="avg-metric">Avg Copies: {toolStat.avgCopies.toFixed(1)}</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Footer -->
			{#if analyticsData.generatedAt}
				<div class="report-footer">
					<p class="generated-time">Report generated on {formatDate(analyticsData.generatedAt)}</p>
				</div>
			{/if}
		{/if}
	</div>
</div>