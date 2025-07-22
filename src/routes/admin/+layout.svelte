<script lang="ts">
	import AdminSideNavigation from '$components/layout/AdminSideNavigation.svelte';
	import { getUserState } from '$lib/state/user-state.svelte';

	let { children } = $props();
	let userContext = getUserState();
	let { userName, isAdmin, isModerator } = $derived(userContext);
</script>

<div class="admin-layout">
	<AdminSideNavigation />
	<div class="main-area">
		<div class="admin-header">
			<h1>Admin Dashboard</h1>
			<div class="user-info">
				<span class="user-name">{userName}</span>
				<span class="user-role">
					{#if isAdmin}
						Admin
					{:else if isModerator}
						Moderator
					{/if}
				</span>
			</div>
		</div>
		<div class="content">
			{@render children()}
		</div>
	</div>
</div>

<style>
	.admin-layout {
		display: flex;
		height: 100vh;
		overflow: hidden;
		background-color: #ffffff;
	}

	.main-area {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.admin-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem 2rem;
		border-bottom: 1px solid #e2e8f0;
		background-color: #ffffff;
		flex-shrink: 0;
	}

	.admin-header h1 {
		font-size: 1.875rem;
		font-weight: 700;
		color: #1e293b;
		margin: 0;
	}

	.user-info {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.25rem;
	}

	.user-name {
		font-weight: 600;
		color: #1e293b;
	}

	.user-role {
		font-size: 0.875rem;
		color: #64748b;
		padding: 0.25rem 0.5rem;
		background-color: #f1f5f9;
		border-radius: 0.375rem;
	}

	.content {
		flex: 1;
		padding: 2rem;
		overflow-y: auto;
		background-color: #f8fafc;
	}

	@media (max-width: 768px) {
		.admin-header {
			padding: 1rem;
			flex-direction: column;
			gap: 1rem;
			align-items: flex-start;
		}

		.admin-header h1 {
			font-size: 1.5rem;
		}

		.user-info {
			align-items: flex-start;
		}

		.content {
			padding: 1rem;
		}
	}
</style>
