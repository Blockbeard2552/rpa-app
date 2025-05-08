import type { Actions } from './$types';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { fail, redirect } from '@sveltejs/kit';

interface ReturnObject {
    success: boolean;
    errors: string[];
}

export const actions = {
    default: async ({ request, locals: {supabase} }) => {
        const formData = await request.formData();
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;
        const name = formData.get('name') as string;

        const returnObject: ReturnObject = {
            success: true,
            errors: [],
        };

        if (name.length < 3) {
           returnObject.errors.push("Name must be at least 3 characters long");
        }
        if (!email.length) {
            returnObject.errors.push("Email must be at least 3 characters long");
        }
         if (!password.length) {
           returnObject.errors.push("Password must be at least 3 characters long");
        }
        if (password !== confirmPassword) {
            returnObject.errors.push("Passwords do not match");
        }
        if (returnObject.errors.length) {
            returnObject.success = false;
        }

        // Registration Flow

        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });

        if (error || !data.user) {
            console.log("There has been an error")
            console.log(error);
            returnObject.success = true;
            return fail(400, returnObject as any);
        }

        redirect(303, "/private/dashboard")
    },
}