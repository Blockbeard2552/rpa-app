import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	// Fetch all models
	const { data: models, error: modelsError } = await supabase
		.from('models')
		.select('*')
		.order('width', { ascending: true })
		.order('length', { ascending: true });

	// Fetch all categories with subcategories
	const { data: categories, error: categoriesError } = await supabase
		.from('categories')
		.select(
			`
			*,
			subcategories (*)
		`
		)
		.order('name');

	// Fetch all options
	const { data: options, error: optionsError } = await supabase
		.from('options')
		.select('*')
		.order('name');

	if (modelsError) {
		console.error('Error fetching models:', modelsError);
		return {
			models: [],
			categories: [],
			options: []
		};
	}

	if (categoriesError) {
		console.error('Error fetching categories:', categoriesError);
	}

	if (optionsError) {
		console.error('Error fetching options:', optionsError);
	}

	return {
		models: models || [],
		categories: categories || [],
		options: options || []
	};
};
