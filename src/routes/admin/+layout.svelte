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

	.content {
		flex: 1;
		padding: 2rem;
		overflow-y: auto;
		background-color: #f8fafc;
	}

	@media (max-width: 768px) {
		.content {
			padding: 1rem;
		}
	}
</style>
