<script lang="ts">
	import { House, Users, Settings, BarChart3, Shield } from '@lucide/svelte';
</script>

<nav class="admin-side-navigation">
	<div class="nav-header">
		<Shield size={24} />
		<h3>Admin Panel</h3>
	</div>
	<ul>
		<li>
			<a href="/admin/dashboard" title="Dashboard">
				<BarChart3 size={20} />
				<span class="nav-label">Dashboard</span>
			</a>
		</li>
		<li>
			<a href="/admin/users" title="Users">
				<Users size={20} />
				<span class="nav-label">Users</span>
			</a>
		</li>
		<li>
			<a href="/admin/orders" title="Orders">
				<House size={20} />
				<span class="nav-label">Orders</span>
			</a>
		</li>
		<li>
			<a href="/admin/new-order" title="New Order">
				<span class="material-symbols-outlined">construction</span>
				<span class="nav-label">New Order</span>
			</a>
		</li>
		<li>
			<a href="/admin/settings" title="Settings">
				<Settings size={20} />
				<span class="nav-label">Settings</span>
			</a>
		</li>
	</ul>
</nav>

<style>
	.admin-side-navigation {
		display: flex;
		flex-direction: column;
		height: 100%;
		border-right: 1px solid #e2e8f0;
		background-color: #f8fafc;
		padding: 2rem 0;
		flex: 0 0 240px;
		position: sticky;
		top: 0;
	}

	.nav-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0 1.5rem;
		margin-bottom: 2rem;
		color: #1e293b;
	}

	.nav-header h3 {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0;
	}

	.admin-side-navigation ul {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0 1rem;
		list-style: none;
		margin: 0;
	}

	.admin-side-navigation li {
		margin: 0;
	}

	.admin-side-navigation a {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		color: #64748b;
		text-decoration: none;
		border-radius: 0.5rem;
		transition: all 0.2s ease;
		font-weight: 500;
	}

	.admin-side-navigation a:hover {
		background-color: #e2e8f0;
		color: #1e293b;
	}

	.material-symbols-outlined {
		font-variation-settings:
			'FILL' 0,
			'wght' 400,
			'GRAD' 0,
			'opsz' 24;
	}

	.admin-side-navigation a[aria-current='page'] {
		background-color: #3b82f6;
		color: black;
	}

	.nav-label {
		font-size: 0.875rem;
		white-space: nowrap;
	}

	@media (max-width: 768px) {
		.admin-side-navigation {
			flex: 0 0 60px;
		}

		.nav-header {
			display: none;
		}

		.admin-side-navigation a {
			justify-content: center;
			padding: 0.75rem;
		}

		.nav-label {
			display: none;
		}
	}
</style>
