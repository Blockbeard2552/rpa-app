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
export class UserState {
	session = $state<Session | null>(null);
	supabase = $state<SupabaseClient<Database> | null>(null);
	user = $state<User | null>(null);
	allOrders = $state<Order[]>([]);
	userName = $state<string | null>(null);

	async fetchUserData() {
		if (!this.user || !this.supabase) {
			return;
		}

		const userId = this.user.id;

		const [ordersResponse, userNamesResponse] = await Promise.all([
			this.supabase.from('orders').select('*').eq('user_id', userId),
			this.supabase.from('user_names').select('name').eq('user_id', userId).single()
		]);

		if (
			ordersResponse.error ||
			!ordersResponse.data ||
			userNamesResponse.error ||
			!userNamesResponse.data
		) {
			console.log('Error fetching all orders for user');
			console.log({ ordersError: ordersResponse.error, userNamesError: userNamesResponse.error });
			return;
		}

		this.allOrders = ordersResponse.data;
		this.userName = userNamesResponse.data.name;
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
