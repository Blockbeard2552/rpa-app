import { createServerClient } from '@supabase/ssr';
import { type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '$components/types/database.types';

const supabase: Handle = async ({ event, resolve }) => {
	/**
	 * Creates a Supabase client specific to this server request.
	 *
	 * The Supabase client gets the Auth token from the request cookies.
	 */
	event.locals.supabase = createServerClient<Database>(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				getAll: () => event.cookies.getAll(),
				/**
				 * SvelteKit's cookies API requires `path` to be explicitly set in
				 * the cookie options. Setting `path` to `/` replicates previous/
				 * standard behavior.
				 */
				setAll: (cookiesToSet) => {
					cookiesToSet.forEach(({ name, value, options }) => {
						event.cookies.set(name, value, { ...options, path: '/' });
					});
				}
			}
		}
	);

	/**
	 * Unlike `supabase.auth.getSession()`, which returns the session _without_
	 * validating the JWT, this function also calls `getUser()` to validate the
	 * JWT before returning the session.
	 */
	event.locals.safeGetSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		if (!session) {
			return { session: null, user: null };
		}

		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();
		if (error) {
			// JWT validation has failed
			return { session: null, user: null };
		}

		return { session, user };
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			/**
			 * Supabase libraries use the `content-range` and `x-supabase-api-version`
			 * headers, so we need to tell SvelteKit to pass it through.
			 */
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};

const authGuard: Handle = async ({ event, resolve }) => {
	const { session, user } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = user;

	if (!event.locals.session && event.url.pathname.startsWith('/private')) {
		redirect(303, '/login');
	}

	if (event.locals.session && ['/register', '/login'].includes(event.url.pathname)) {
		redirect(303, '/private/dashboard');
	}

	return resolve(event);
};

const adminGuard: Handle = async ({ event, resolve }) => {
	// Only check admin routes
	if (!event.url.pathname.startsWith('/admin')) {
		return resolve(event);
	}

	// Must be authenticated to access admin routes
	if (!event.locals.session || !event.locals.user) {
		redirect(303, '/login');
	}

	// Check user roles
	const { data: userRoles, error } = await event.locals.supabase
		.from('user_roles')
		.select('role')
		.eq('user_id', event.locals.user.id);

	if (error) {
		console.error('Error fetching user roles:', error);
		redirect(303, '/access-denied');
	}

	// If no roles found, user doesn't have admin access
	const roles = userRoles?.map((row) => row.role) || [];

	// Check if route requires admin-only access
	const adminOnlyRoutes = ['/admin/models', '/admin/users'];
	const isAdminOnlyRoute = adminOnlyRoutes.some((route) => event.url.pathname.startsWith(route));

	let hasAccess = false;
	if (isAdminOnlyRoute) {
		// Admin-only routes: only admins can access
		hasAccess = roles.includes('admin');
	} else {
		// Other admin routes: both admins and moderators can access
		hasAccess = roles.length > 0 && (roles.includes('admin') || roles.includes('moderator'));
	}

	if (!hasAccess) {
		redirect(303, '/access-denied');
	}

	return resolve(event);
};

export const handle: Handle = sequence(supabase, authGuard, adminGuard);
