<script lang="ts">
	import { getUserState } from '$lib/state/user-state.svelte';

	let userContext = getUserState();
	let { allOrders, isAdmin, isModerator } = $derived(userContext);
</script>

<div class="admin-dashboard">
	<div class="stats-grid">
		<div class="stat-card">
			<h3>Total Orders</h3>
			<p class="stat-number">{allOrders.length}</p>
		</div>
		<div class="stat-card">
			<h3>Active Orders</h3>
			<p class="stat-number">{allOrders.filter((order) => !order.order_closed_on).length}</p>
		</div>
		<div class="stat-card">
			<h3>Completed Orders</h3>
			<p class="stat-number">{allOrders.filter((order) => order.order_closed_on).length}</p>
		</div>
		<div class="stat-card">
			<h3>Total Revenue</h3>
			<p class="stat-number">
				${allOrders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}
			</p>
		</div>
	</div>

	<div class="admin-sections">
		<section class="recent-orders">
			<h2>Recent Orders</h2>
			<div class="table-container">
				<table>
					<thead>
						<tr>
							<th>Order ID</th>
							<th>Model</th>
							<th>Total</th>
							<th>Status</th>
							<th>Created</th>
						</tr>
					</thead>
					<tbody>
						{#each allOrders.slice(0, 10) as order}
							<tr>
								<td>#{order.id}</td>
								<td>{order.model}</td>
								<td>${order.total.toLocaleString()}</td>
								<td>
									<span class="status-badge {order.order_closed_on ? 'completed' : 'active'}">
										{order.order_closed_on ? 'Completed' : 'Active'}
									</span>
								</td>
								<td>{new Date(order.created_at).toLocaleDateString()}</td>
							</tr>
						{:else}
							<tr>
								<td colspan="5" class="no-data">No orders found</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>

		{#if isAdmin}
			<section class="admin-actions">
				<h2>Admin Actions</h2>
				<div class="action-grid">
					<a href="/admin/users" class="action-button">
						<h4>Manage Users</h4>
						<p>Add, edit, or remove user accounts and permissions</p>
					</a>
					<a href="/admin/orders" class="action-button">
						<h4>All Orders</h4>
						<p>View and manage all system orders</p>
					</a>
					<a href="/admin/settings" class="action-button">
						<h4>System Settings</h4>
						<p>Configure application settings and preferences</p>
					</a>
				</div>
			</section>
		{/if}
	</div>
</div>

<style>
	.admin-dashboard {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
	}

	.stat-card {
		background: white;
		padding: 1.5rem;
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
		border: 1px solid #e2e8f0;
	}

	.stat-card h3 {
		font-size: 0.875rem;
		color: #64748b;
		margin: 0 0 0.5rem 0;
		font-weight: 500;
	}

	.stat-number {
		font-size: 2rem;
		font-weight: 700;
		color: #1e293b;
		margin: 0;
	}

	.admin-sections {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.recent-orders,
	.admin-actions {
		background: white;
		padding: 2rem;
		border-radius: 0.5rem;
		box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
		border: 1px solid #e2e8f0;
	}

	.recent-orders h2,
	.admin-actions h2 {
		font-size: 1.5rem;
		color: #1e293b;
		margin: 0 0 1.5rem 0;
		font-weight: 600;
	}

	.table-container {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th,
	td {
		text-align: left;
		padding: 0.75rem;
		border-bottom: 1px solid #e2e8f0;
	}

	th {
		font-weight: 600;
		color: #374151;
		background-color: #f9fafb;
	}

	.status-badge {
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.status-badge.active {
		background-color: #dbeafe;
		color: #1e40af;
	}

	.status-badge.completed {
		background-color: #dcfce7;
		color: #166534;
	}

	.no-data {
		text-align: center;
		color: #64748b;
		font-style: italic;
	}

	.action-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
	}

	.action-button {
		display: block;
		padding: 1.5rem;
		border: 2px solid #e2e8f0;
		border-radius: 0.5rem;
		text-decoration: none;
		transition: all 0.2s ease;
		color: inherit;
	}

	.action-button:hover {
		border-color: #3b82f6;
		background-color: #f8fafc;
	}

	.action-button h4 {
		font-size: 1.125rem;
		color: #1e293b;
		margin: 0 0 0.5rem 0;
		font-weight: 600;
	}

	.action-button p {
		color: #64748b;
		margin: 0;
		font-size: 0.875rem;
	}

	@media (max-width: 768px) {
		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.stat-card {
			padding: 1rem;
		}

		.stat-number {
			font-size: 1.5rem;
		}

		.recent-orders,
		.admin-actions {
			padding: 1rem;
		}

		.action-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
