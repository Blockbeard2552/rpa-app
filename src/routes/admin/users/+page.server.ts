import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	try {
		// Use supabase.auth.admin to get users (requires service role key)
		// For now, let's get users from user_names and user_roles tables
		const { data: userNames, error: userNamesError } = await supabase
			.from('user_names')
			.select('user_id, name');

		const { data: userRoles, error: userRolesError } = await supabase
			.from('user_roles')
			.select('user_id, role');

		if (userNamesError || userRolesError) {
			console.error('Error fetching user data:', { userNamesError, userRolesError });
		}

		// For demonstration, let's create a basic users list
		// In production, you'd need to use Supabase Admin API or a database function
		const userMap = new Map();

		// Add users from user_names
		userNames?.forEach((un) => {
			if (!userMap.has(un.user_id)) {
				userMap.set(un.user_id, {
					id: un.user_id,
					email: `user-${un.user_id.substring(0, 8)}@example.com`, // Placeholder
					name: un.name,
					roles: [],
					createdAt: new Date().toISOString(),
					emailConfirmedAt: new Date().toISOString(),
					lastSignInAt: new Date().toISOString()
				});
			} else {
				userMap.get(un.user_id).name = un.name;
			}
		});

		// Add roles
		userRoles?.forEach((ur) => {
			if (userMap.has(ur.user_id)) {
				userMap.get(ur.user_id).roles.push(ur.role);
			} else {
				userMap.set(ur.user_id, {
					id: ur.user_id,
					email: `user-${ur.user_id.substring(0, 8)}@example.com`, // Placeholder
					name: null,
					roles: [ur.role],
					createdAt: new Date().toISOString(),
					emailConfirmedAt: new Date().toISOString(),
					lastSignInAt: new Date().toISOString()
				});
			}
		});

		const users = Array.from(userMap.values()).sort(
			(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		);

		return {
			users
		};
	} catch (error) {
		console.error('Error in users load function:', error);
		return {
			users: []
		};
	}
};

export const actions: Actions = {
	updateUser: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const userId = formData.get('userId') as string;
		const name = formData.get('name') as string;
		const roles = formData.getAll('roles') as string[];

		console.log('Updating user:', userId, { name, roles });

		try {
			// Get current user data to compare
			const [currentNameResponse, currentRolesResponse] = await Promise.all([
				supabase.from('user_names').select('name').eq('user_id', userId).maybeSingle(),
				supabase.from('user_roles').select('role').eq('user_id', userId)
			]);

			const currentName = currentNameResponse.data?.name || '';
			const currentRoles = currentRolesResponse.data?.map((r) => r.role) || [];

			// Check if name changed
			const nameChanged = name !== currentName;

			// Check if roles changed (compare sorted arrays)
			const sortedNewRoles = [...roles].sort();
			const sortedCurrentRoles = [...currentRoles].sort();
			const rolesChanged = JSON.stringify(sortedNewRoles) !== JSON.stringify(sortedCurrentRoles);

			console.log('Data comparison:', {
				nameChanged,
				rolesChanged,
				currentName,
				newName: name,
				currentRoles,
				newRoles: roles
			});

			// Update name only if changed
			if (nameChanged) {
				if (name && name.trim() !== '') {
					// Insert or update name
					const { error: nameError } = await supabase.from('user_names').upsert({
						user_id: userId,
						name: name.trim()
					});

					if (nameError) {
						console.error('Error updating user name:', nameError);
						return fail(400, {
							error: 'Failed to update user name: ' + nameError.message
						});
					}
				} else if (currentName) {
					// Remove name if empty
					const { error: deleteNameError } = await supabase
						.from('user_names')
						.delete()
						.eq('user_id', userId);

					if (deleteNameError) {
						console.error('Error deleting user name:', deleteNameError);
						return fail(400, {
							error: 'Failed to delete user name: ' + deleteNameError.message
						});
					}
				}
			}

			// Update roles only if changed
			if (rolesChanged) {
				// Delete existing roles
				const { error: deleteRolesError } = await supabase
					.from('user_roles')
					.delete()
					.eq('user_id', userId);

				if (deleteRolesError) {
					console.error('Error deleting user roles:', deleteRolesError);
					return fail(400, {
						error: 'Failed to update user roles: ' + deleteRolesError.message
					});
				}

				// Insert new roles if any
				if (roles.length > 0) {
					const roleInserts = roles.map((role) => ({
						user_id: userId,
						role: role
					}));

					const { error: insertRolesError } = await supabase.from('user_roles').insert(roleInserts);

					if (insertRolesError) {
						console.error('Error inserting user roles:', insertRolesError);
						return fail(400, {
							error: 'Failed to update user roles: ' + insertRolesError.message
						});
					}
				}
			}

			const message =
				!nameChanged && !rolesChanged
					? 'No changes detected - data already up to date'
					: 'User updated successfully';

			return {
				success: true,
				message
			};
		} catch (error) {
			console.error('Error updating user:', error);
			return fail(500, {
				error: 'An unexpected error occurred'
			});
		}
	},

	deleteUser: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const userId = formData.get('userId') as string;

		console.log('Deleting user:', userId);

		try {
			// Delete user roles
			await supabase.from('user_roles').delete().eq('user_id', userId);

			// Delete user names
			await supabase.from('user_names').delete().eq('user_id', userId);

			// Note: We can't delete from auth.users directly through the client
			// This would need to be done via Supabase Admin API or database functions
			// For now, we'll just remove the user's data

			return {
				success: true,
				message: 'User data removed successfully'
			};
		} catch (error) {
			console.error('Error deleting user:', error);
			return fail(500, {
				error: 'Failed to delete user: ' + (error as Error).message
			});
		}
	}
};
