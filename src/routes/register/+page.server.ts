
import { fail, redirect } from '@sveltejs/kit';

interface ReturnObject {
    success: boolean;
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
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
            email,
            password,
            confirmPassword,
            name,
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

        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });

        if (error || !data.user) {
            console.log("There has been an error")
            console.log(error);
            returnObject.success = false;
            return fail(400, returnObject as any);
        }

        const userId = data.user.id;

        await supabase.from('user_names').insert({
            user_id: userId,
            name: name,
        })

        redirect(303, "/private/dashboard")
    },
}