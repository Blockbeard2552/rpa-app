import type { Actions } from './$types';

interface ReturnObject {
    success: boolean;
    errors: string[];
}

export const actions = {
    default: async ({ request }) => {
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

        return returnObject;
    },
}