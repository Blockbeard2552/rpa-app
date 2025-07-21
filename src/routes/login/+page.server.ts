import { fail, redirect } from '@sveltejs/kit';

interface ReturnObject {
	success: boolean;
	email: string;
	password: string;
	confirmPassword?: never;
	name?: never;
	errors: string[];
}

export const actions = {
	signInWithPassword: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		const returnObject: ReturnObject = {
			success: true,
			email,
			password,
			errors: []
		};

		if (!email.length) {
			returnObject.errors.push('Email must be at least 3 characters long');
		}
		if (!password.length) {
			returnObject.errors.push('Password must be at least 3 characters long');
		}
		if (returnObject.errors.length) {
			returnObject.success = false;
		}

		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		if (error || !data.user) {
			returnObject.success = false;
			return fail(400, returnObject as any);
		}

		redirect(303, '/private/dashboard');
	},
	googleLogin: async ({ locals: { supabase } }) => {
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: '${PUBLIC_FRONTEND_URL}/auth/callback'
			}
		});
		if (error) {
			return fail(400, { message: 'Something went wrong with Google login.' });
		}
		throw redirect(303, data.url);
	}
};
