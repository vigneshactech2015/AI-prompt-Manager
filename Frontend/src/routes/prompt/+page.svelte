<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { userStore } from '$lib/stores';
	import { get } from 'svelte/store';
	import axios from 'axios';
	import './dashboard.css';
    import { ADD_PROMPT, COPY_PROMPT, DELETE_PROMPT, EDIT_PROMPT, FAVORITE_PROMPT, GET_PROMPT, PROMPTSERVICEURL } from '$lib/utils/endpoint';

	// State variables
	let prompts = [];
	let filteredPrompts = [];
	let showModal = false;
	let showEditModal = false;
	let loading = true;
	let searchQuery = '';
	let selectedTool = '';
	let showFavoritesOnly = false;
	let editingPrompt = null;

	// Form data
	let formData = {
		title: '',
		description: '',
		aiTool: '',
		isFavorite: false
	};

	// AI Tools dropdown options
	const aiTools = [
		'ChatGPT',
		'Claude',
		'Bard',
		'GPT-4',
		'Midjourney',
		'DALL-E',
		'Stable Diffusion',
		'Other'
	];

	// User store and token
	let user = null;
	let token = null;


	// Subscribe to user store to get token for API calls
	userStore.subscribe((value) => {
		user = value;
		token = user?.token;
	});	

	// Initialize and fetch prompts (authentication is handled in layout)
	onMount(() => {
		userStore.init();
		
		// Small delay to ensure user store is initialized
		setTimeout(() => {
			if (token) {
				fetchPrompts();
			}
		}, 50);
	});

	// API Headers
	const getHeaders = () => ({
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${token}`
	});

	// Fetch all prompts
	async function fetchPrompts() {
		try {
			loading = true;
			const response = await axios.get(GET_PROMPT, {
				headers: getHeaders()
			});
			
			if (response.data && response.data.data) {
				prompts = response.data.data;
				filterPrompts();
			}
		} catch (error) {
			console.error('Error fetching prompts:', error);
			if (error.response?.status === 401) {
				userStore.logout();
				goto('/login');
			}
		} finally {
			loading = false;
		}
	}

	// Filter prompts based on search, tool, and favorites
	function filterPrompts() {
		filteredPrompts = prompts.filter(prompt => {
			const matchesSearch = !searchQuery || 
				prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
				prompt.aiTool.toLowerCase().includes(searchQuery.toLowerCase());
			
			const matchesTool = !selectedTool || prompt.aiTool === selectedTool;
			const matchesFavorites = !showFavoritesOnly || prompt.isFavourite;
			
			return matchesSearch && matchesTool && matchesFavorites;
		});
	}

	// Add new prompt
	async function addPrompt() {
		try {
			const response = await axios.post(ADD_PROMPT, formData, {
				headers: getHeaders()
			});
			
			if (response.status === 201) {
				showModal = false;
				resetForm();
				await fetchPrompts();
			}
		} catch (error) {
			console.error('Error adding prompt:', error);
			if (error.response?.status === 401) {
				userStore.logout();
				goto('/login');
			}
		}
	}

	// Edit prompt
	async function editPrompt() {
		try {
			const response = await axios.patch(EDIT_PROMPT, {
				...formData,
				id: editingPrompt._id
			}, {
				headers: getHeaders()
			});
			
			if (response.status === 200) {
				showEditModal = false;
				resetForm();
				editingPrompt = null;
				await fetchPrompts();
			}
		} catch (error) {
			console.error('Error editing prompt:', error);
			if (error.response?.status === 401) {
				userStore.logout();
				goto('/login');
			}
		}
	}

	// Delete prompt
	async function deletePrompt(promptId) {
		if (!confirm('Are you sure you want to delete this prompt?')) return;
		
		try {
			const response = await axios.delete(DELETE_PROMPT, {
				headers: getHeaders(),
				data: { id: promptId }
			});
			
			if (response.status === 200) {
				await fetchPrompts();
			}
		} catch (error) {
			console.error('Error deleting prompt:', error);
			if (error.response?.status === 401) {
				userStore.logout();
				goto('/login');
			}
		}
	}

	// Toggle favorite
	async function toggleFavorite(prompt) {
		try {
			const response = await axios.patch(FAVORITE_PROMPT, {
				id: prompt._id,
				isFavourite: !prompt.isFavourite
			}, {
				headers: getHeaders()
			});
			
			if (response.status === 200) {
				await fetchPrompts();
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
	async function copyPrompt(prompt) {
		try {
			// Copy to clipboard
			await navigator.clipboard.writeText(prompt.description);
			
			// Track copy for analytics
			await axios.post(`${PROMPTSERVICEURL}/trackCopy/${prompt._id}`, {}, {
				headers: getHeaders()
			});
			
			// Show success notification
			showCopyNotification();
		} catch (error) {
			console.error('Error copying prompt:', error);
			if (error.response?.status === 401) {
				userStore.logout();
				goto('/login');
			}
		}
	}

	// Show copy success notification
	let copyNotificationVisible = false;
	function showCopyNotification() {
		copyNotificationVisible = true;
		setTimeout(() => {
			copyNotificationVisible = false;
		}, 2000);
	}

	// Navigate to prompt detail page
	function viewPrompt(promptId) {
		goto(`/prompt/${promptId}`);
	}

	// Open edit modal
	function openEditModal(prompt) {
		editingPrompt = prompt;
		formData = {
			title: prompt.title,
			description: prompt.description,
			aiTool: prompt.aiTool,
			isFavorite: prompt.isFavourite
		};
		showEditModal = true;
	}

	// Reset form
	function resetForm() {
		formData = {
			title: '',
			description: '',
			aiTool: '',
			isFavorite: false
		};
	}

	// Reactive statements for filtering
	$: if (searchQuery !== undefined || selectedTool !== undefined || showFavoritesOnly !== undefined) {
		filterPrompts();
	}
</script>

<svelte:head>
	<title>Prompt Dashboard</title>
</svelte:head>

<div class="dashboard-container">
	<!-- Page Header -->
	<div class="page-header">
		<div class="page-title">
			<h1>Prompt Dashboard</h1>
			<p>Manage and organize your AI prompts</p>
		</div>
		<button 
			on:click={() => showModal = true}
			class="add-prompt-btn"
		>
			<span class="add-icon">+</span>
			Add Prompt
		</button>
	</div>

	<!-- Filters and Search -->
	<div class="main-content">
		<div class="filter-section">
			<div class="filter-grid">
				<!-- Search -->
				<div class="form-group">
					<label>Search Prompts</label>
					<input 
						type="text" 
						bind:value={searchQuery}
						placeholder="Search by title, description, or AI tool..."
						class="search-input"
					/>
				</div>

				<!-- AI Tool Filter -->
				<div class="form-group">
					<label>AI Tool</label>
					<select 
						bind:value={selectedTool}
						class="filter-select"
					>
						<option value="">All Tools</option>
						{#each aiTools as tool}
							<option value={tool}>{tool}</option>
						{/each}
					</select>
				</div>

				<!-- Favorites Filter -->
				<div class="form-group">
					<label class="checkbox-group">
						<input 
							type="checkbox" 
							bind:checked={showFavoritesOnly}
							class="checkbox"
						/>
						<span>Favorites Only</span>
					</label>
				</div>
			</div>
		</div>

		<!-- Results Count -->
		<div class="results-info">
			<p>Showing {filteredPrompts.length} of {prompts.length} prompts</p>
		</div>

		<!-- Loading State -->
		{#if loading}
			<div class="loading-container">
				<div class="spinner"></div>
			</div>
		{:else if filteredPrompts.length === 0}
			<!-- Empty State -->
			<div class="empty-state">
				<div class="empty-icon">📝</div>
				<h3>No prompts found</h3>
				<p>
					{#if searchQuery || selectedTool || showFavoritesOnly}
						Try adjusting your filters or search terms.
					{:else}
						Get started by creating your first prompt.
					{/if}
				</p>
			</div>
		{:else}
			<!-- Prompts Grid -->
			<div class="prompts-grid">
				{#each filteredPrompts as prompt (prompt._id)}
					<div class="prompt-card">
						<!-- Card Header -->
						<div class="card-header">
							<div class="card-title-row">
								<h3 class="card-title">{prompt.title}</h3>
								<button 
									on:click={() => toggleFavorite(prompt)}
									class="favorite-btn"
								>
									<span class="favorite-icon {prompt.isFavourite ? 'favorited' : ''}">★</span>
								</button>
							</div>
							
							<p class="card-description">{prompt.description}</p>
							
							<div>
								<span class="tool-badge">
									{prompt.aiTool}
								</span>
							</div>
						</div>

						<!-- Card Actions -->
						<div class="card-actions">
							<div class="primary-actions">
								<!-- View Button -->
								<button 
									on:click={() => viewPrompt(prompt._id)}
									class="action-btn"
								>
									<span class="btn-icon">👁</span>
									View
								</button>

								<!-- Copy Button -->
								<button 
									on:click={() => copyPrompt(prompt)}
									class="action-btn"
									title="Copy prompt to clipboard"
								>
									<span class="btn-icon">📋</span>
									Copy
								</button>
							</div>

							<div class="secondary-actions">
								<!-- Edit Button -->
								<button 
									on:click={() => openEditModal(prompt)}
									class="icon-btn"
									title="Edit prompt"
								>
									<span class="btn-icon">✏️</span>
								</button>

								<!-- Delete Button -->
								<button 
									on:click={() => deletePrompt(prompt._id)}
									class="icon-btn delete"
									title="Delete prompt"
								>
									<span class="btn-icon">🗑️</span>
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<!-- Add Prompt Modal -->
{#if showModal}
	<div class="modal-overlay" on:click={() => showModal = false}>
		<div class="modal-content" on:click|stopPropagation>
			<div class="modal-header">
				<h3 class="modal-title">Add New Prompt</h3>
				<button on:click={() => showModal = false} class="close-btn">×</button>
			</div>
			
			<div class="modal-body">
				<form on:submit|preventDefault={addPrompt} class="modal-form">
					<div class="form-group">
						<label>Title</label>
						<input 
							type="text" 
							bind:value={formData.title}
							required
							placeholder="Enter prompt title"
						/>
					</div>
					
					<div class="form-group">
						<label>Description</label>
						<textarea 
							bind:value={formData.description}
							required
							rows="4"
							placeholder="Enter prompt description"
						></textarea>
					</div>
					
					<div class="form-group">
						<label>AI Tool</label>
						<select 
							bind:value={formData.aiTool}
							required
						>
							<option value="">Select AI Tool</option>
							{#each aiTools as tool}
								<option value={tool}>{tool}</option>
							{/each}
						</select>
					</div>
					
					
					<div class="modal-actions">
						<button 
							type="button"
							on:click={() => showModal = false}
							class="btn-secondary"
						>
							Cancel
						</button>
						<button 
							type="submit"
							class="btn-primary"
						>
							Add Prompt
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}

<!-- Edit Prompt Modal -->
{#if showEditModal}
	<div class="modal-overlay" on:click={() => showEditModal = false}>
		<div class="modal-content" on:click|stopPropagation>
			<div class="modal-header">
				<h3 class="modal-title">Edit Prompt</h3>
				<button on:click={() => showEditModal = false} class="close-btn">×</button>
			</div>
			
			<div class="modal-body">
				<form on:submit|preventDefault={editPrompt} class="modal-form">
					<div class="form-group">
						<label>Title</label>
						<input 
							type="text" 
							bind:value={formData.title}
							required
							placeholder="Enter prompt title"
						/>
					</div>
					
					<div class="form-group">
						<label>Description</label>
						<textarea 
							bind:value={formData.description}
							required
							rows="4"
							placeholder="Enter prompt description"
						></textarea>
					</div>
					
					<div class="form-group">
						<label>AI Tool</label>
						<select 
							bind:value={formData.aiTool}
							required
						>
							<option value="">Select AI Tool</option>
							{#each aiTools as tool}
								<option value={tool}>{tool}</option>
							{/each}
						</select>
					</div>
					
					<div class="form-group">
						<label class="checkbox-group">
							<input 
								type="checkbox" 
								bind:checked={formData.isFavorite}
								class="checkbox"
							/>
							<span>Mark as favorite</span>
						</label>
					</div>
					
					<div class="modal-actions">
						<button 
							type="button"
							on:click={() => showEditModal = false}
							class="btn-secondary"
						>
							Cancel
						</button>
						<button 
							type="submit"
							class="btn-primary"
						>
							Update Prompt
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}

<!-- Copy Success Notification -->
{#if copyNotificationVisible}
	<div class="notification">
		<span class="notification-icon">✅</span>
		Prompt copied to clipboard!
	</div>
{/if}
