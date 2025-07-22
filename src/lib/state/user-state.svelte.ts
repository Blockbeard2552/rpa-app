import { goto } from '$app/navigation';
import type { Database } from '$components/types/database.types';
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import { getContext, setContext } from 'svelte';

interface UserStateProps {
	session: Session | null;
	supabase: SupabaseClient | null;
	user: User | null;
}

interface Order {
	created_at: string;
	delivery_charge: number | null;
	id: number;
	model: string;
	options: string | null;
	order_closed_on: string | null;
	sales_tax: number | null;
	started_processing_on: string | null;
	sub_total: number;
	total: number;
	user_id: string;
}

type UserRole = Database['public']['Enums']['app_role'];

export class UserState {
	session = $state<Session | null>(null);
	supabase = $state<SupabaseClient<Database> | null>(null);
	user = $state<User | null>(null);
	allOrders = $state<Order[]>([]);
	userName = $state<string | null>(null);
	userRoles = $state<UserRole[]>([]);

	async fetchUserData() {
		if (!this.user || !this.supabase) {
			return;
		}

		const userId = this.user.id;

		const [ordersResponse, userNamesResponse, userRolesResponse] = await Promise.all([
			this.supabase.from('orders').select('*').eq('user_id', userId),
			this.supabase.from('user_names').select('name').eq('user_id', userId).single(),
			this.supabase.from('user_roles').select('role').eq('user_id', userId)
		]);

		// Handle orders (optional data)
		if (ordersResponse.error) {
			console.log('Error fetching orders for user:', ordersResponse.error);
			this.allOrders = [];
		} else {
			this.allOrders = ordersResponse.data || [];
		}

		// Handle user name (optional data)
		if (userNamesResponse.error) {
			console.log('Error fetching user name:', userNamesResponse.error);
			// Fallback to email if no user name exists
			this.userName = this.user.email?.split('@')[0] || 'User';
		} else {
			this.userName = userNamesResponse.data?.name || this.user.email?.split('@')[0] || 'User';
		}

		// Handle user roles (may not exist for all users)
		if (userRolesResponse.error) {
			console.log('Error fetching user roles:', userRolesResponse.error);
			this.userRoles = [];
		} else if (!userRolesResponse.data || userRolesResponse.data.length === 0) {
			// No roles assigned to this user - this is normal for regular users
			this.userRoles = [];
		} else {
			this.userRoles = userRolesResponse.data.map((row) => row.role);
		}
	}

	get isAdmin() {
		return this.userRoles.includes('admin');
	}

	get isModerator() {
		return this.userRoles.includes('moderator');
	}

	get hasAdminAccess() {
		return this.isAdmin || this.isModerator;
	}

	constructor(data: UserStateProps) {
		this.updateState(data);
	}
	updateState(data: UserStateProps) {
		this.session = data.session;
		this.supabase = data.supabase;
		this.user = data.user;
		this.fetchUserData();
	}
	async logout() {
		await this.supabase?.auth.signOut();
		goto('/login');
	}
}

const USER_STATE_KEY = Symbol('USER_STATE');

export function setUserState(data: UserStateProps) {
	return setContext(USER_STATE_KEY, new UserState(data));
}

export function getUserState() {
	return getContext<ReturnType<typeof setUserState>>(USER_STATE_KEY);
}
