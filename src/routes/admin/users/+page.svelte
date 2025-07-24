<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let { users } = $derived(data);

	// Track editing states and values for each user
	let editingStates = $state<Record<string, boolean>>({});
	let editingValues = $state<Record<string, any>>({});

	const availableRoles = ['admin', 'moderator', 'user'];

	function startEditing(user: any) {
		editingStates[user.id] = true;
		editingValues[user.id] = {
			name: user.name || '',
			roles: [...(user.roles || [])]
		};
	}

	function cancelEditing(userId: string) {
		editingStates[userId] = false;
		delete editingValues[userId];
	}

	function handleRoleChange(userId: string, role: string, checked: boolean) {
		if (!editingValues[userId]) return;

		const roles = editingValues[userId].roles;
		if (checked && !roles.includes(role)) {
			roles.push(role);
		} else if (!checked && roles.includes(role)) {
			const index = roles.indexOf(role);
			roles.splice(index, 1);
		}
	}

	function formatDate(dateString: string | null): string {
		if (!dateString) return 'Never';
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getRoleBadgeClass(role: string): string {
		switch (role) {
			case 'admin':
				return 'role-admin';
			case 'moderator':
				return 'role-moderator';
			default:
				return 'role-user';
		}
	}

	function confirmDelete(user: any): boolean {
		return confirm(
			`Are you sure you want to delete ${user.name || user.email}? This action cannot be undone.`
		);
	}
</script>

<div class="users-page">
	<div class="page-header">
		<h1>User Management</h1>
		<p>Manage user accounts, roles, and permissions</p>
	</div>

	<div class="users-table-container">
		<table class="users-table">
			<thead>
				<tr>
					<th>User</th>
					<th>Email</th>
					<th>Roles</th>
					<th>Created</th>
					<th>Last Sign In</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each users as user (user.id)}
					<tr class="user-row">
						<td class="user-info">
							{#if editingStates[user.id]}
								<input
									type="text"
									bind:value={editingValues[user.id].name}
									placeholder="Enter name"
									class="name-input"
								/>
							{:else}
								<div class="user-details">
									<div class="user-name">{user.name || 'No name set'}</div>
									<div class="user-id">ID: {user.id.substring(0, 8)}...</div>
								</div>
							{/if}
						</td>
						<td class="user-email">{user.email}</td>
						<td class="user-roles">
							{#if editingStates[user.id]}
								<div class="role-checkboxes">
									{#each availableRoles as role}
										<label class="role-checkbox">
											<input
												type="checkbox"
												checked={editingValues[user.id].roles.includes(role)}
												onchange={(e) => handleRoleChange(user.id, role, e.target.checked)}
											/>
											<span class="role-label">{role}</span>
										</label>
									{/each}
								</div>
							{:else}
								<div class="role-badges">
									{#each user.roles as role}
										<span class="role-badge {getRoleBadgeClass(role)}">{role}</span>
									{:else}
										<span class="no-roles">No roles assigned</span>
									{/each}
								</div>
							{/if}
						</td>
						<td class="user-created">{formatDate(user.createdAt)}</td>
						<td class="user-last-signin">{formatDate(user.lastSignInAt)}</td>
						<td class="user-actions">
							{#if editingStates[user.id]}
								<form
									method="POST"
									action="?/updateUser"
									use:enhance={() => {
										return async ({ result }) => {
											if (result.type === 'success') {
												cancelEditing(user.id);
												await invalidateAll();
											} else if (result.type === 'failure') {
												console.error('Form submission failed:', result.data);
												alert('Failed to update user: ' + (result.data?.error || 'Unknown error'));
											}
										};
									}}
								>
									<input type="hidden" name="userId" value={user.id} />
									<input type="hidden" name="name" value={editingValues[user.id].name} />
									{#each editingValues[user.id].roles as role}
										<input type="hidden" name="roles" value={role} />
									{/each}

									<div class="action-buttons">
										<button type="submit" class="save-btn">Save</button>
										<button type="button" class="cancel-btn" onclick={() => cancelEditing(user.id)}>
											Cancel
										</button>
									</div>
								</form>
							{:else}
								<div class="action-buttons">
									<button class="edit-btn" onclick={() => startEditing(user)}>Edit</button>
									<form
										method="POST"
										action="?/deleteUser"
										style="display: inline;"
										use:enhance={() => {
											if (!confirmDelete(user)) {
												return () => {};
											}
											return async ({ result }) => {
												if (result.type === 'success') {
													await invalidateAll();
												} else if (result.type === 'failure') {
													console.error('Delete failed:', result.data);
													alert(
														'Failed to delete user: ' + (result.data?.error || 'Unknown error')
													);
												}
											};
										}}
									>
										<input type="hidden" name="userId" value={user.id} />
										<button type="submit" class="delete-btn">Delete</button>
									</form>
								</div>
							{/if}
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="6" class="no-users">No users found.</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.users-page {
		max-width: 1400px;
		margin: 0 auto;
	}

	.page-header {
		margin-bottom: 2rem;
	}

	.page-header h1 {
		font-size: 2rem;
		font-weight: 700;
		color: #1e293b;
		margin: 0 0 0.5rem 0;
	}

	.page-header p {
		color: #64748b;
		margin: 0;
	}

	.users-table-container {
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 0.75rem;
		overflow: hidden;
		box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
	}

	.users-table {
		width: 100%;
		border-collapse: collapse;
	}

	.users-table th {
		background: #f8fafc;
		color: #374151;
		font-weight: 600;
		font-size: 0.875rem;
		text-align: left;
		padding: 1rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.users-table td {
		padding: 1rem;
		border-bottom: 1px solid #f1f5f9;
		vertical-align: top;
	}

	.user-row:hover {
		background: #f8fafc;
	}

	.user-info {
		min-width: 200px;
	}

	.user-details {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.user-name {
		font-weight: 600;
		color: #1e293b;
	}

	.user-id {
		font-size: 0.75rem;
		color: #64748b;
		font-family: monospace;
	}

	.name-input {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		font-size: 0.875rem;
	}

	.name-input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
	}

	.user-email {
		color: #1e293b;
		font-size: 0.875rem;
	}

	.user-roles {
		min-width: 200px;
	}

	.role-badges {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.role-badge {
		padding: 0.25rem 0.75rem;
		border-radius: 0.375rem;
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: uppercase;
	}

	.role-admin {
		background: #fef2f2;
		color: #dc2626;
		border: 1px solid #fecaca;
	}

	.role-moderator {
		background: #fff7ed;
		color: #ea580c;
		border: 1px solid #fed7aa;
	}

	.role-user {
		background: #f0f9ff;
		color: #0284c7;
		border: 1px solid #bae6fd;
	}

	.no-roles {
		color: #9ca3af;
		font-style: italic;
		font-size: 0.875rem;
	}

	.role-checkboxes {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.role-checkbox {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		cursor: pointer;
	}

	.role-checkbox input[type='checkbox'] {
		width: 1rem;
		height: 1rem;
	}

	.role-label {
		text-transform: capitalize;
	}

	.user-created,
	.user-last-signin {
		font-size: 0.875rem;
		color: #64748b;
		white-space: nowrap;
	}

	.action-buttons {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.edit-btn,
	.save-btn {
		background: #3b82f6;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.edit-btn:hover,
	.save-btn:hover {
		background: #2563eb;
	}

	.cancel-btn {
		background: #6b7280;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.cancel-btn:hover {
		background: #4b5563;
	}

	.delete-btn {
		background: #ef4444;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.delete-btn:hover {
		background: #dc2626;
	}

	.no-users {
		text-align: center;
		color: #9ca3af;
		padding: 3rem;
		font-style: italic;
	}

	@media (max-width: 1024px) {
		.users-table-container {
			overflow-x: auto;
		}

		.users-table {
			min-width: 800px;
		}
	}

	@media (max-width: 768px) {
		.action-buttons {
			flex-direction: column;
		}

		.users-table th,
		.users-table td {
			padding: 0.75rem 0.5rem;
		}
	}
</style>
